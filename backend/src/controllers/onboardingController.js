// Onboarding wizard controller
// Guides new tenants through initial setup: branding, classes, students, fees

import Tenant from '../models/Tenant.js';
import Batch from '../models/Batch.js';
import User from '../models/User.js';

/**
 * GET /api/onboarding/status
 * Check if tenant has completed onboarding
 */
export const getOnboardingStatus = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: 'Tenant ID missing' });

    const tenant = await Tenant.findOne({ tenantId })
      .select('branding subdomain')
      .lean();

    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

    // Determine completion: branding + at least one batch + subdomain set
    const hasBranding = tenant.branding?.logoUrl || tenant.branding?.appName;
    const hasSubdomain = !!tenant.subdomain;
    const batches = await Batch.countDocuments({ tenantId });
    const isComplete = hasBranding && hasSubdomain && batches > 0;

    res.status(200).json({
      success: true,
      isComplete,
      steps: {
        branding: hasBranding,
        subdomain: hasSubdomain,
        classes: batches > 0,
      },
      progress: [
        { step: 'Branding', complete: hasBranding },
        { step: 'Subdomain', complete: hasSubdomain },
        { step: 'Classes', complete: batches > 0 },
      ],
    });
  } catch (err) {
    console.error('Onboarding status error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * PUT /api/onboarding/branding
 * Step 1: Update tenant branding (logo, theme, app name)
 */
export const updateBranding = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: 'Tenant ID missing' });

    const { logoUrl, themeColor, appName } = req.body;

    const tenant = await Tenant.findOneAndUpdate(
      { tenantId },
      {
        branding: {
          logoUrl: logoUrl || null,
          themeColor: themeColor || '#2F6CE5',
          appName: appName || null,
        },
      },
      { new: true }
    ).select('branding');

    res.status(200).json({
      success: true,
      message: 'Branding updated',
      branding: tenant.branding,
    });
  } catch (err) {
    console.error('Update branding error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * POST /api/onboarding/classes
 * Step 2: Create initial classes/batches
 */
export const createInitialClasses = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: 'Tenant ID missing' });

    const { classes } = req.body; // Array of { name, section }
    if (!Array.isArray(classes) || !classes.length) {
      return res.status(400).json({ message: 'Classes array required' });
    }

    const created = [];
    for (const cls of classes) {
      const batch = await Batch.create({
        tenantId,
        name: cls.name,
        section: cls.section || '',
        enrolledCount: 0,
      });
      created.push(batch);
    }

    res.status(201).json({
      success: true,
      message: `Created ${created.length} classes`,
      classes: created.map(c => ({ _id: c._id, name: c.name, section: c.section })),
    });
  } catch (err) {
    console.error('Create classes error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * POST /api/onboarding/complete
 * Mark onboarding as complete
 * Redirect user to main dashboard after this
 */
export const completeOnboarding = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: 'Tenant ID missing' });

    const tenant = await Tenant.findOne({ tenantId });
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

    // Check minimum requirements
    const hasBranding = tenant.branding?.logoUrl || tenant.branding?.appName;
    const hasSubdomain = !!tenant.subdomain;
    const batches = await Batch.countDocuments({ tenantId });

    if (!hasBranding || !hasSubdomain || batches === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please complete all onboarding steps',
        missing: {
          branding: !hasBranding,
          subdomain: !hasSubdomain,
          classes: batches === 0,
        },
      });
    }

    // Mark as onboarded (set a flag or just return success)
    // You can add an onboardingComplete flag to Tenant model if needed
    console.log(`Tenant ${tenantId} completed onboarding`);

    res.status(200).json({
      success: true,
      message: 'Onboarding complete!',
      redirectUrl: '/dashboard',
    });
  } catch (err) {
    console.error('Complete onboarding error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
