/**
 * Migration Script: Convert Old Role System to 3-Base + Dynamic Tenant Roles
 * 
 * This script:
 * 1. Identifies all users with custom roles (not superadmin/tenantadmin/student)
 * 2. Creates corresponding TenantRole entries for each custom role
 * 3. Creates UserRole mappings linking users to their custom roles
 * 4. Keeps User.role as one of 3 base roles for backward compatibility
 * 5. Logs all changes for audit trail
 * 
 * Run with: node backend/scripts/migrate-to-dynamic-roles.js
 */

import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Staff from '../src/models/Staff.js';
import TenantRole from '../src/models/TenantRole.js';
import UserRole from '../src/models/UserRole.js';

const SYSTEM_ROLES = ['superadmin', 'tenantadmin', 'student'];

const main = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/enromatics';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Statistics
    let stats = {
      totalUsers: 0,
      systemRoleUsers: 0,
      customRoleUsers: 0,
      tenanRolesCreated: 0,
      userRolesMapped: 0,
      errors: []
    };

    // ============ STEP 1: Migrate Staff model users to TenantRole system ============
    console.log('\n📋 STEP 1: Analyzing existing Staff records...');
    
    const staffRecords = await Staff.find({}).lean();
    console.log(`Found ${staffRecords.length} staff records`);

    for (const staff of staffRecords) {
      try {
        // Get the associated user
        const user = await User.findById(staff.userId);
        if (!user) {
          stats.errors.push(`Staff ${staff._id}: User not found`);
          continue;
        }

        // Custom role from staff record
        const customRole = staff.role?.toLowerCase();
        
        // Skip if already a system role
        if (SYSTEM_ROLES.includes(customRole)) {
          stats.systemRoleUsers++;
          continue;
        }

        stats.customRoleUsers++;

        // ============ STEP 2: Create TenantRole if not exists ============
        let tenantRole = await TenantRole.findOne({
          tenantId: staff.tenantId,
          roleName: customRole
        });

        if (!tenantRole) {
          console.log(`  Creating TenantRole: ${customRole} in tenant ${staff.tenantId}`);
          tenantRole = await TenantRole.create({
            tenantId: staff.tenantId,
            roleName: customRole,
            description: `Auto-migrated from Staff model - ${customRole}`,
            permissions: getDefaultPermissions(customRole),
            isSystemRole: false,
            isActive: true,
            userCount: 0,
            metadata: {
              icon: getIconForRole(customRole),
              color: getColorForRole(customRole),
            }
          });
          stats.tenanRolesCreated++;
        }

        // ============ STEP 3: Create UserRole mapping ============
        // Check if UserRole already exists
        const existingUserRole = await UserRole.findOne({
          userId: user._id,
          tenantId: staff.tenantId,
          isActive: true
        });

        if (!existingUserRole) {
          console.log(`  Mapping user ${user._id} to role ${customRole}`);
          await UserRole.create({
            userId: user._id,
            tenantId: staff.tenantId,
            tenantRoleId: tenantRole._id,
            roleDisplayName: customRole,
            isActive: true,
            assignedAt: staff.createdAt || new Date(),
            assignedBy: null, // Migration system
            notes: 'Auto-migrated from Staff model'
          });
          stats.userRolesMapped++;
        }

        // ============ STEP 4: Keep User.role as 'tenantadmin' for system roles ============
        // Users who were staff/teachers/etc now become 'tenantadmin' in User model
        // Actual permissions come from TenantRole
        if (!SYSTEM_ROLES.includes(user.role?.toLowerCase())) {
          user.role = 'tenantadmin'; // Default tenant admin (permissions controlled by TenantRole)
          await user.save();
          console.log(`  Updated User.role to tenantadmin for migration`);
        }

      } catch (err) {
        stats.errors.push(`Staff ${staff._id}: ${err.message}`);
        console.error(`❌ Error processing staff ${staff._id}:`, err.message);
      }
    }

    // ============ STEP 5: Summary Report ============
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION COMPLETE - Summary Report');
    console.log('='.repeat(60));
    console.log(`Total Staff Records Processed: ${stats.totalUsers + stats.systemRoleUsers + stats.customRoleUsers}`);
    console.log(`  System Role Users: ${stats.systemRoleUsers}`);
    console.log(`  Custom Role Users: ${stats.customRoleUsers}`);
    console.log(`TenantRoles Created: ${stats.tenanRolesCreated}`);
    console.log(`UserRole Mappings Created: ${stats.userRolesMapped}`);
    
    if (stats.errors.length > 0) {
      console.log(`\n❌ Errors (${stats.errors.length}):`);
      stats.errors.forEach(err => console.log(`  - ${err}`));
    }

    console.log('\n✅ Migration complete! System is ready to use dynamic tenant roles.');
    console.log('💡 Tip: Users now authenticate with 3 base roles, but permissions come from TenantRole.');

  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
};

// Helper function to get default permissions for a role
function getDefaultPermissions(roleName) {
  const permissions = {
    'teacher': [
      'academics:read', 'academics:create', 'academics:update',
      'students:read', 'students:view-progress',
      'tests:create', 'tests:manage'
    ],
    'staff': [
      'academics:read', 'students:read', 'attendance:manage'
    ],
    'counsellor': [
      'students:read', 'students:update', 'reports:read'
    ],
    'accountant': [
      'payments:read', 'payments:manage', 'invoices:read', 'invoices:create'
    ],
    'manager': [
      'academics:read', 'students:read', 'staff:read', 'reports:read'
    ],
    'receptionist': [
      'students:read', 'admissions:manage', 'inquiries:manage'
    ]
  };

  return permissions[roleName] || ['basic:read'];
}

// Helper function to get icon for role
function getIconForRole(roleName) {
  const icons = {
    'teacher': '👨‍🏫',
    'staff': '👨‍💼',
    'counsellor': '🤝',
    'accountant': '💰',
    'manager': '📊',
    'receptionist': '📞',
  };
  return icons[roleName] || '👤';
}

// Helper function to get color for role
function getColorForRole(roleName) {
  const colors = {
    'teacher': '#3b82f6',
    'staff': '#10b981',
    'counsellor': '#f59e0b',
    'accountant': '#8b5cf6',
    'manager': '#ef4444',
    'receptionist': '#06b6d4',
  };
  return colors[roleName] || '#6b7280';
}

// Run migration
main();
