import { sidebarLinks} from "../config/sidebarConfig.js";
import Tenant from "../models/Tenant.js";

export const getSidebar = async (req, res) => {
  try {
    // Accept either admin/user or student principal
    const principal = req.user || req.student;
    if (!principal) return res.status(401).json({ message: "Unauthorized" });

    const { role, tenantId } = principal;
    let tenantModules = [];

    // 🏢 If tenant user, fetch their allowed modules
    if (tenantId) {
      const tenant = await Tenant.findOne({ tenantId });
      if (tenant) tenantModules = tenant.modules || [];
    }

    // 🧠 Filter top-level links
    const filteredLinks = sidebarLinks.filter(link => {
      // Skip if user's role not allowed
      if (!link.roles.includes(role)) return false;

      // Optional: limit modules for tenants (but don't filter if no modules set)
      if (tenantId && link.href && tenantModules.length > 0) {
        const moduleKey = link.href.split("/dashboard/")[1]?.split("/")[0];
        if (!tenantModules.includes(moduleKey))
          return false;
      }

      return true;
    });

    // 🔁 Filter children recursively and handle routing for SuperAdmin vs tenant users
    const processed = filteredLinks.map(link => {
      // Replace [tenantId] in parent link href for non-SuperAdmin
      const processedLink = { ...link };
      if (processedLink.href && tenantId && role !== 'SuperAdmin') {
        processedLink.href = processedLink.href.replace('[tenantId]', tenantId);
      }

      if (link.children) {
        // For tenant users with modules, filter children; otherwise include all
        const allowedChildren = link.children.filter(child => {
          // If a child has a roles property, ensure current user role is allowed
          if (child.roles && !child.roles.includes(role)) return false;

          if (!child.href) return true;
          if (tenantId && tenantModules.length > 0 && role !== 'SuperAdmin') {
            const moduleKey = child.href.split("/dashboard/")[1]?.split("/")[0];
            return tenantModules.includes(moduleKey);
          }
          return true; // Include all children if no module restrictions or SuperAdmin
        }).map(child => {
          // Handle SuperAdmin vs tenant routing
          if (role === 'SuperAdmin') {
            // Use superAdminHref if available, otherwise use regular href
            return { 
              ...child, 
              href: child.superAdminHref || child.href 
            };
          } else if (child.href && tenantId) {
            // Replace [tenantId] in child href for tenant users
            return { ...child, href: child.href.replace('[tenantId]', tenantId) };
          }
          return child;
        });
        return { ...processedLink, children: allowedChildren };
      }
      return processedLink;
    });

    console.log("📌 Sidebar returned for role:", role, "tenantId:", tenantId, "links count:", processed.length);
    
    res.status(200).json({
      success: true,
      role,
      tenantId,
      sidebar: processed,
    });
  } catch (err) {
    console.error("Sidebar fetch error:", err);
    res.status(500).json({ message: "Failed to load sidebar links" });
  }
};
