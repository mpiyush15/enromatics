// Simple provisioning stub: create subdomain slug, seed branding/settings
// Integrate with DNS/SSL automation and Next.js routing later.

const crypto = require('crypto');

function slugify(name) {
  return (name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 50) || `institute-${crypto.randomBytes(3).toString('hex')}`;
}

async function provisionTenant({ tenantId, instituteName, branding = {} }) {
  const slug = slugify(instituteName || tenantId);
  const subdomain = `${slug}.enromatics.com`;

  // Persist into Tenant model
  const Tenant = require('../src/models/Tenant.js').default || require('../src/models/Tenant.js');
  const tenant = await Tenant.findOne({ tenantId });
  if (tenant) {
    tenant.subdomain = subdomain;
    tenant.branding = {
      logoUrl: branding.logoUrl || tenant.branding?.logoUrl || null,
      themeColor: branding.themeColor || tenant.branding?.themeColor || '#2F6CE5',
      appName: branding.appName || tenant.branding?.appName || (tenant.instituteName || tenant.name),
    };
    await tenant.save();
  }

  console.log(`Provisioned tenant ${tenantId} -> ${subdomain}`);
  return { tenantId, subdomain, brandingApplied: true };
}

module.exports = { provisionTenant };
