/**
 * UserRole Routes
 * 
 * API endpoints for assigning/managing roles to users
 * Only tenantadmin can assign/revoke roles
 * 
 * GET    /api/user-roles - Get all user role assignments in tenant
 * GET    /api/user-roles/user/:userId - Get roles assigned to user
 * POST   /api/user-roles - Assign role to user
 * PATCH  /api/user-roles/:userRoleId - Update role assignment
 * DELETE /api/user-roles/:userRoleId - Revoke role from user
 */

import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { tenantProtect } from '../middleware/tenantProtect.js';
import UserRole from '../models/UserRole.js';
import TenantRole from '../models/TenantRole.js';
import User from '../models/User.js';

const router = express.Router();

// ============ GET ROUTES ============

/**
 * GET /api/user-roles
 * Get all user role assignments in the tenant
 */
router.get('/', protect, tenantProtect, authorizeRoles('tenantadmin'), async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { active, roleId, userId } = req.query;

    // Build query
    let query = { tenantId };

    if (active === 'true') {
      query.isActive = true;
      query.$or = [
        { expiresAt: { $gt: new Date() } },
        { expiresAt: null }
      ];
    }

    if (roleId) {
      query.tenantRoleId = roleId;
    }

    if (userId) {
      query.userId = userId;
    }

    const assignments = await UserRole.find(query)
      .populate('userId', 'name email')
      .populate('tenantRoleId', 'roleName permissions')
      .populate('assignedBy', 'name')
      .sort({ createdAt: -1 });

    console.log(`✅ Fetched ${assignments.length} user role assignments for tenant ${tenantId}`);

    res.json({
      success: true,
      data: assignments,
      count: assignments.length,
    });
  } catch (err) {
    console.error('❌ Error fetching user roles:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch user roles', error: err.message });
  }
});

/**
 * GET /api/user-roles/user/:userId
 * Get all active roles assigned to a specific user
 */
router.get('/user/:userId', protect, tenantProtect, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { userId } = req.params;

    const roles = await UserRole.find({
      userId,
      tenantId,
      isActive: true,
      $or: [
        { expiresAt: { $gt: new Date() } },
        { expiresAt: null }
      ]
    })
      .populate('tenantRoleId', 'roleName permissions')
      .sort({ assignedAt: -1 });

    console.log(`✅ Fetched roles for user ${userId}`);

    res.json({
      success: true,
      data: roles,
      count: roles.length,
    });
  } catch (err) {
    console.error('❌ Error fetching user roles:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch user roles', error: err.message });
  }
});

// ============ POST ROUTES ============

/**
 * POST /api/user-roles
 * Assign a custom role to a user
 * Body: { userId, tenantRoleId, expiresAt (optional), notes }
 */
router.post('/', protect, tenantProtect, authorizeRoles('tenantadmin'), async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const assigningUser = req.user;
    const { userId, tenantRoleId, expiresAt, notes = '' } = req.body;

    // Validate input
    if (!userId || !tenantRoleId) {
      return res.status(400).json({
        success: false,
        message: 'userId and tenantRoleId are required',
      });
    }

    // Check if user exists
    const targetUser = await User.findById(userId);
    if (!targetUser || targetUser.tenantId !== tenantId) {
      return res.status(404).json({
        success: false,
        message: 'User not found in this tenant',
      });
    }

    // Check if role exists
    const role = await TenantRole.findOne({
      _id: tenantRoleId,
      tenantId,
      isActive: true,
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found',
      });
    }

    // Check if user already has this role
    const existing = await UserRole.findOne({
      userId,
      tenantRoleId,
      tenantId,
      isActive: true,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `User already has role "${role.roleName}"`,
      });
    }

    // Validate expiresAt if provided
    let expiration = null;
    if (expiresAt) {
      expiration = new Date(expiresAt);
      if (expiration <= new Date()) {
        return res.status(400).json({
          success: false,
          message: 'expiresAt must be in the future',
        });
      }
    }

    // Create assignment
    const assignment = await UserRole.create({
      userId,
      tenantId,
      tenantRoleId,
      roleDisplayName: role.roleName,
      isActive: true,
      assignedAt: new Date(),
      expiresAt: expiration,
      assignedBy: assigningUser._id,
      notes,
    });

    // Update role userCount
    await TenantRole.findByIdAndUpdate(
      tenantRoleId,
      { $inc: { userCount: 1 } },
      { new: true }
    );

    console.log(`✅ Role assigned: User ${userId} → ${role.roleName}`);

    res.status(201).json({
      success: true,
      message: `Role "${role.roleName}" assigned to user`,
      data: await assignment.populate('userId tenantRoleId assignedBy'),
    });
  } catch (err) {
    console.error('❌ Error assigning role:', err.message);
    res.status(500).json({ success: false, message: 'Failed to assign role', error: err.message });
  }
});

// ============ PATCH ROUTES ============

/**
 * PATCH /api/user-roles/:userRoleId
 * Update role assignment (extend expiration, update notes)
 */
router.patch('/:userRoleId', protect, tenantProtect, authorizeRoles('tenantadmin'), async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { userRoleId } = req.params;
    const { expiresAt, notes } = req.body;

    const assignment = await UserRole.findOne({
      _id: userRoleId,
      tenantId,
    });

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    // Update fields
    if (expiresAt !== undefined) {
      const newExpiry = new Date(expiresAt);
      if (newExpiry <= new Date()) {
        return res.status(400).json({
          success: false,
          message: 'expiresAt must be in the future',
        });
      }
      assignment.expiresAt = newExpiry;
    }

    if (notes !== undefined) {
      assignment.notes = notes;
    }

    await assignment.save();

    console.log(`✅ Assignment updated: ${userRoleId}`);

    res.json({
      success: true,
      message: 'Assignment updated',
      data: assignment,
    });
  } catch (err) {
    console.error('❌ Error updating assignment:', err.message);
    res.status(500).json({ success: false, message: 'Failed to update assignment', error: err.message });
  }
});

// ============ DELETE ROUTES ============

/**
 * DELETE /api/user-roles/:userRoleId
 * Revoke role from user (soft delete)
 */
router.delete('/:userRoleId', protect, tenantProtect, authorizeRoles('tenantadmin'), async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { userRoleId } = req.params;

    const assignment = await UserRole.findOne({
      _id: userRoleId,
      tenantId,
    });

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    // Get role for display
    const role = await TenantRole.findById(assignment.tenantRoleId);

    // Soft delete
    assignment.isActive = false;
    await assignment.save();

    // Decrement role userCount
    await TenantRole.findByIdAndUpdate(
      assignment.tenantRoleId,
      { $inc: { userCount: -1 } },
      { new: true }
    );

    console.log(`✅ Role revoked: User ${assignment.userId} ← ${role?.roleName || 'Unknown'}`);

    res.json({
      success: true,
      message: 'Role revoked successfully',
      data: { userRoleId, userId: assignment.userId },
    });
  } catch (err) {
    console.error('❌ Error revoking role:', err.message);
    res.status(500).json({ success: false, message: 'Failed to revoke role', error: err.message });
  }
});

export default router;
