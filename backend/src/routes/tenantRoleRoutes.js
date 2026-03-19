/**
 * TenantRole Routes
 * 
 * API endpoints for managing custom roles per tenant
 * Only tenantadmin can create/modify/delete roles
 * 
 * GET    /api/roles - Get all roles for tenant
 * GET    /api/roles/:roleId - Get specific role details
 * POST   /api/roles - Create new custom role
 * PATCH  /api/roles/:roleId - Update role (name, permissions)
 * DELETE /api/roles/:roleId - Delete custom role
 */

import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { tenantProtect } from '../middleware/tenantProtect.js';
import TenantRole from '../models/TenantRole.js';
import UserRole from '../models/UserRole.js';

const router = express.Router();

// ============ GET ROUTES ============

/**
 * GET /api/roles
 * Get all custom roles for the current tenant
 * Only tenantadmin can view
 */
router.get('/', protect, tenantProtect, authorizeRoles('tenantadmin'), async (req, res) => {
  try {
    const tenantId = req.tenantId;

    const roles = await TenantRole.find({ tenantId, isActive: true })
      .select('roleName description permissions userCount isActive metadata createdAt')
      .sort({ createdAt: -1 });

    console.log(`✅ Fetched ${roles.length} roles for tenant ${tenantId}`);

    res.json({
      success: true,
      data: roles,
      count: roles.length,
    });
  } catch (err) {
    console.error('❌ Error fetching roles:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch roles', error: err.message });
  }
});

/**
 * GET /api/roles/:roleId
 * Get detailed information about a specific role
 */
router.get('/:roleId', protect, tenantProtect, authorizeRoles('tenantadmin'), async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { roleId } = req.params;

    const role = await TenantRole.findOne({
      _id: roleId,
      tenantId,
      isActive: true,
    }).populate('metadata.createdBy', 'name email');

    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    // Get user count for this role
    const userCount = await UserRole.countDocuments({
      tenantRoleId: roleId,
      isActive: true,
    });

    console.log(`✅ Fetched role details: ${role.roleName}`);

    res.json({
      success: true,
      data: {
        ...role.toObject(),
        userCount,
      },
    });
  } catch (err) {
    console.error('❌ Error fetching role:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch role', error: err.message });
  }
});

// ============ POST ROUTES ============

/**
 * POST /api/roles
 * Create new custom role for tenant
 * Body: { roleName, description, permissions, metadata }
 */
router.post('/', protect, tenantProtect, authorizeRoles('tenantadmin'), async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const user = req.user;
    const { roleName, description = '', permissions = [], metadata = {} } = req.body;

    // Validate input
    if (!roleName || typeof roleName !== 'string') {
      return res.status(400).json({ success: false, message: 'Role name is required and must be a string' });
    }

    // Check for system role name conflicts
    const systemRoles = ['superadmin', 'tenantadmin', 'student'];
    if (systemRoles.includes(roleName.toLowerCase())) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot create role with reserved name: ${roleName}` 
      });
    }

    // Check if role already exists for this tenant
    const existing = await TenantRole.findOne({
      tenantId,
      roleName: roleName.toLowerCase(),
    });

    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: `Role "${roleName}" already exists in this tenant` 
      });
    }

    // Create new role
    const newRole = await TenantRole.create({
      tenantId,
      roleName: roleName.toLowerCase(),
      description,
      permissions: Array.isArray(permissions) ? permissions : [],
      isSystemRole: false,
      isActive: true,
      userCount: 0,
      metadata: {
        ...metadata,
        createdBy: user._id,
      },
    });

    console.log(`✅ Role created: ${newRole.roleName} (ID: ${newRole._id})`);

    res.status(201).json({
      success: true,
      message: `Role "${roleName}" created successfully`,
      data: newRole,
    });
  } catch (err) {
    console.error('❌ Error creating role:', err.message);
    res.status(500).json({ success: false, message: 'Failed to create role', error: err.message });
  }
});

// ============ PATCH ROUTES ============

/**
 * PATCH /api/roles/:roleId
 * Update role details (description, permissions)
 * Cannot change roleName - must delete and recreate
 */
router.patch('/:roleId', protect, tenantProtect, authorizeRoles('tenantadmin'), async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { roleId } = req.params;
    const { description, permissions, metadata } = req.body;

    const role = await TenantRole.findOne({
      _id: roleId,
      tenantId,
      isActive: true,
    });

    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    // Update allowed fields only
    if (description !== undefined) {
      role.description = description;
    }

    if (Array.isArray(permissions)) {
      role.permissions = permissions;
    }

    if (metadata !== undefined) {
      role.metadata = { ...role.metadata, ...metadata };
    }

    await role.save();

    console.log(`✅ Role updated: ${role.roleName}`);

    res.json({
      success: true,
      message: 'Role updated successfully',
      data: role,
    });
  } catch (err) {
    console.error('❌ Error updating role:', err.message);
    res.status(500).json({ success: false, message: 'Failed to update role', error: err.message });
  }
});

// ============ DELETE ROUTES ============

/**
 * DELETE /api/roles/:roleId
 * Soft delete custom role (mark as inactive)
 * Cannot delete if users are still assigned
 */
router.delete('/:roleId', protect, tenantProtect, authorizeRoles('tenantadmin'), async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { roleId } = req.params;

    const role = await TenantRole.findOne({
      _id: roleId,
      tenantId,
      isActive: true,
    });

    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    // Check if any users still have this role
    const userCount = await UserRole.countDocuments({
      tenantRoleId: roleId,
      isActive: true,
    });

    if (userCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete role with ${userCount} active user assignment(s). Reassign users first.`,
      });
    }

    // Soft delete
    role.isActive = false;
    await role.save();

    console.log(`✅ Role deleted (soft): ${role.roleName}`);

    res.json({
      success: true,
      message: 'Role deleted successfully',
      data: { roleId, roleName: role.roleName },
    });
  } catch (err) {
    console.error('❌ Error deleting role:', err.message);
    res.status(500).json({ success: false, message: 'Failed to delete role', error: err.message });
  }
});

export default router;
