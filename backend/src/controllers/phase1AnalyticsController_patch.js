/**
 * PATCHED trackInteraction - Creates PageView if missing
 * This fixes the issue where ad clicks were rejected due to missing parent PageView
 */

export const trackInteraction = async (req, res) => {
  try {
    const { sessionId, page, type, element, scrollDepth, source, referrer, interactions } = req.body;

    if (!sessionId || !page) {
      return res.status(400).json({ success: false, message: "sessionId and page required" });
    }

    // CRITICAL FIX: Try to find pageview, create if missing
    let pageView = await PageView.findOne({
      sessionId,
      page,
      createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
    });

    // If no pageview exists, CREATE it
    if (!pageView) {
      console.log(`📝 Creating missing PageView for: ${sessionId}/${page}`);
      
      pageView = await PageView.create({
        sessionId,
        page,
        source: source || 'direct',
        referrer: referrer || '',
        device: 'unknown',
        interactions: interactions || 1,
        scrollDepth: scrollDepth || 0,
        bounced: false,
        entryPage: true,
        exitPage: false
      });
    } else {
      // Update existing pageview
      pageView = await PageView.findOneAndUpdate(
        { sessionId, page, createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) } },
        {
          $inc: { interactions: 1 },
          $set: { 
            bounced: false, // Not bounced anymore
            scrollDepth: scrollDepth || 0,
            source: source || pageView.source,
            referrer: referrer || pageView.referrer
          }
        },
        { new: true }
      );
    }

    res.status(200).json({ 
      success: true, 
      created: !pageView || pageView.isNew,
      pageView: {
        sessionId: pageView.sessionId,
        page: pageView.page,
        source: pageView.source,
        interactions: pageView.interactions
      }
    });
  } catch (error) {
    console.error("❌ Track interaction error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export default trackInteraction;
