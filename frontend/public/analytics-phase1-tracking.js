/**
 * Analytics Phase 1: Interaction Tracking Script
 * Tracks user interactions (clicks, scrolls, form inputs) for engagement metrics
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

  let scrollDepth = 0;
  let interactions = 0;
  const sessionId = getSessionId();
  const page = getPageName();

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
        type: 'interaction',
        scrollDepth,
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
        type: 'session_end',
        scrollDepth,
      }),
      keepalive: true, // Ensure it completes even if page unloads
    }).catch((err) => console.error('Final analytics tracking error:', err));
  });

  console.log('✅ Analytics Phase 1 tracking initialized');
})();
