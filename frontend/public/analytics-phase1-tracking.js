/**
 * Analytics Phase 1: Interaction Tracking Script (OPTIMIZED WITH REQUEST BATCHING)
 * Tracks user interactions (clicks, scrolls, form inputs) for engagement metrics
 * 
 * OPTIMIZATION: Batch requests to reduce network calls from 1000+/min to ~50/min
 * - Collects interactions in a queue
 * - Sends when queue reaches 10 items OR every 5 seconds
 * - Uses navigator.sendBeacon on page unload for guaranteed delivery
 */

(function () {
  // Generate or retrieve session ID
  const getSessionId = () => {
    let sessionId = sessionStorage.getItem('analytics_sessionId');
    if (!sessionId) {
      sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('analytics_sessionId', sessionId);
    }
    return sessionId;
  };

  // Get current page
  const getPageName = () => {
    return window.location.pathname;
  };

  // Detect traffic source from referrer (CRITICAL FIX)
  const detectSource = () => {
    const referrer = document.referrer || '';
    
    // Check for paid ad platforms (highest priority)
    if (referrer.includes('facebook.com') || referrer.includes('m.facebook.com')) {
      return 'facebook';
    }
    if (referrer.includes('instagram.com') || referrer.includes('m.instagram.com')) {
      return 'instagram';
    }
    if (referrer.includes('l.facebook.com')) {
      // Facebook click tracking URL
      return 'facebook';
    }
    if (referrer.includes('google.') || referrer.includes('google.com')) {
      return 'google';
    }
    if (referrer.includes('linkedin')) {
      return 'linkedin';
    }
    if (referrer.includes('twitter') || referrer.includes('x.com')) {
      return 'twitter';
    }
    
    // Check UTM parameters
    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get('utm_source');
    if (utmSource) {
      return utmSource.toLowerCase().replace('_', '-');
    }
    
    // Default
    return referrer ? 'referral' : 'direct';
  };

  let scrollDepth = 0;
  let interactions = 0;
  const sessionId = getSessionId();
  const page = getPageName();
  const source = detectSource();
  const referrer = document.referrer;

  console.log('📊 Analytics initialized:', { sessionId, page, source, referrer });

  // ==================== REQUEST BATCHING IMPLEMENTATION ====================
  
  // Analytics queue to batch interactions
  const analyticsQueue = [];
  const BATCH_SIZE = 10;           // Send when queue reaches this size
  const BATCH_INTERVAL = 5000;     // Send every 5 seconds (5000ms)
  let batchTimer = null;

  /**
   * Send batched analytics data to backend
   * Uses POST for normal sends, sendBeacon for page unload
   */
  const sendBatch = (useBeacon = false) => {
    if (analyticsQueue.length === 0) {
      return;
    }

    const batchData = {
      events: [...analyticsQueue],
      batchSize: analyticsQueue.length,
      sessionId,
      page,
      source,
      timestamp: new Date().toISOString(),
    };

    if (useBeacon && navigator.sendBeacon) {
      // Use sendBeacon for page unload (guaranteed delivery, no blocking)
      const beaconData = new Blob(
        [JSON.stringify(batchData)],
        { type: 'application/json' }
      );
      const success = navigator.sendBeacon(
        '/api/analytics/phase1/track-batch',
        beaconData
      );
      if (success) {
        console.log('📤 Beacon sent, events:', batchData.batchSize);
        analyticsQueue.length = 0;
      } else {
        console.warn('⚠️ Beacon failed, retrying with fetch');
        // Fallback to fetch with keepalive
        fetch('/api/analytics/phase1/track-batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(batchData),
          keepalive: true,
        }).catch((err) => console.error('Final analytics batch error:', err));
        analyticsQueue.length = 0;
      }
    } else {
      // Use fetch for normal batch sends
      fetch('/api/analytics/phase1/track-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batchData),
      })
        .then((res) => {
          if (res.ok) {
            console.log('📤 Batch sent successfully, events:', batchData.batchSize);
            analyticsQueue.length = 0;
          } else {
            console.warn('⚠️ Batch send failed:', res.status);
          }
        })
        .catch((err) => console.error('Analytics batch error:', err));
    }
  };

  /**
   * Start or restart the batch timer
   */
  const startBatchTimer = () => {
    if (batchTimer) {
      clearTimeout(batchTimer);
    }
    batchTimer = setTimeout(() => {
      if (analyticsQueue.length > 0) {
        console.log('⏱️ Batch timer triggered, sending', analyticsQueue.length, 'events');
        sendBatch(false);
      }
      // Restart timer
      startBatchTimer();
    }, BATCH_INTERVAL);
  };

  // ==================== EXISTING TRACKING LOGIC (UNCHANGED) ====================

  // Track scroll depth
  window.addEventListener('scroll', () => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = window.scrollY;
    scrollDepth = scrollHeight > 0 ? Math.round((scrolled / scrollHeight) * 100) : 0;
  });

  /**
   * Queue an interaction (instead of sending immediately)
   * MODIFIED: Now adds to queue instead of fetching immediately
   */
  const trackInteraction = () => {
    interactions++;

    // Add to queue
    analyticsQueue.push({
      type: 'interaction',
      scrollDepth,
      interactions,
      timestamp: Date.now(),
    });

    // Send if queue is full
    if (analyticsQueue.length >= BATCH_SIZE) {
      console.log('📦 Queue full, sending batch of', BATCH_SIZE, 'events');
      sendBatch(false);
    }
  };

  // Click tracking
  document.addEventListener('click', trackInteraction, { passive: true });

  // Scroll tracking (debounced to 1 second)
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(trackInteraction, 1000);
  });

  // Form input tracking
  document.addEventListener('input', trackInteraction, { passive: true });
  document.addEventListener('change', trackInteraction, { passive: true });

  // ==================== PAGE UNLOAD - FLUSH QUEUE ====================

  window.addEventListener('beforeunload', () => {
    // Cancel the batch timer to prevent race conditions
    if (batchTimer) {
      clearTimeout(batchTimer);
    }

    // Add session end event
    analyticsQueue.push({
      type: 'session_end',
      scrollDepth,
      interactions,
      timestamp: Date.now(),
    });

    // Send all remaining events with sendBeacon (guaranteed delivery)
    console.log('🔴 Page unloading, sending final batch of', analyticsQueue.length, 'events');
    sendBatch(true);
  });

  // ==================== INITIALIZATION ====================

  // Start batch timer (sends every 5 seconds if queue has events)
  startBatchTimer();

  console.log('✅ Analytics Phase 1 tracking initialized (BATCHED MODE - ' + BATCH_SIZE + ' events per batch, ' + (BATCH_INTERVAL / 1000) + 's timeout)');
  console.log('📊 Expected reduction: 1000+/min → ~50/min requests');
})();
