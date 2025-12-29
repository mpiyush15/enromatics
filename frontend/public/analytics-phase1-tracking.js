/**
 * Analytics Phase 1: Interaction Tracking Script
 * Tracks user interactions (clicks, scrolls, form inputs) for engagement metrics
 * 
 * FIXED: Properly detects traffic source from referrer
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

  // Track scroll depth
  window.addEventListener('scroll', () => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = window.scrollY;
    scrollDepth = scrollHeight > 0 ? Math.round((scrolled / scrollHeight) * 100) : 0;
  });

  // Track interactions
  const trackInteraction = () => {
    interactions++;
    
    fetch('/api/analytics/phase1/track-interaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        page,
        source,
        referrer,
        type: 'interaction',
        scrollDepth,
        interactions,
      }),
    }).catch((err) => console.error('Analytics tracking error:', err));
  };

  // Click tracking
  document.addEventListener('click', trackInteraction, { passive: true });

  // Scroll tracking (debounced)
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(trackInteraction, 1000);
  });

  // Form input tracking
  document.addEventListener('input', trackInteraction, { passive: true });
  document.addEventListener('change', trackInteraction, { passive: true });

  // Track on unload
  window.addEventListener('beforeunload', () => {
    // Final tracking
    fetch('/api/analytics/phase1/track-interaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        page,
        source,
        referrer,
        type: 'session_end',
        scrollDepth,
        interactions,
      }),
      keepalive: true, // Ensure it completes even if page unloads
    }).catch((err) => console.error('Final analytics tracking error:', err));
  });

  console.log('✅ Analytics Phase 1 tracking initialized');
})();
