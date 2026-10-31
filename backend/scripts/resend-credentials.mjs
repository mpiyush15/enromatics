#!/usr/bin/env node
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/enromatics';

console.log('======================================================');
console.log('       🔄 RESEND LOGIN CREDENTIALS EMAIL TOOL          ');
console.log('======================================================\n');

async function main() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const User = (await import('../src/models/User.js')).default;
        const Tenant = (await import('../src/models/Tenant.js')).default;
        const { sendCredentialsEmail } = await import('../src/services/emailService.js');

        // Parse command line arguments
        const args = process.argv.slice(2);
        let targetIdentifier = null;
        let specifiedPassword = null;
        let isLatest = false;

        for (const arg of args) {
            if (arg === '--latest' || arg === '-l') {
                isLatest = true;
            } else if (arg.startsWith('--password=')) {
                specifiedPassword = arg.split('=')[1].trim();
            } else if (arg.startsWith('--email=')) {
                targetIdentifier = arg.split('=')[1].trim();
            } else if (!arg.startsWith('--')) {
                targetIdentifier = arg.trim();
            }
        }

        let user = null;
        let tenant = null;

        if (isLatest || !targetIdentifier) {
            console.log('🔍 Finding the most recently registered tenant / user...');
            // Exclude superadmin to find the latest client signup
            user = await User.findOne({ 
                role: { $in: ['tenantadmin', 'tenantAdmin', 'student'] } 
            }).sort({ createdAt: -1 });

            if (!user) {
                // If no role match, just find latest non-superadmin
                user = await User.findOne({ email: { $ne: 'mpiyush2727@gmail.com' } }).sort({ createdAt: -1 });
            }
        } else {
            console.log(`🔍 Looking up user by identifier: "${targetIdentifier}"...`);
            user = await User.findOne({
                $or: [
                    { email: targetIdentifier.toLowerCase() },
                    { tenantId: targetIdentifier }
                ]
            });
        }

        if (!user) {
            console.error('❌ User not found in database!');
            console.log('\n💡 Usage examples:');
            console.log('   node scripts/resend-credentials.mjs user@example.com');
            console.log('   node scripts/resend-credentials.mjs --latest');
            console.log('   node scripts/resend-credentials.mjs user@example.com --password=YourNewPassword123\n');
            await mongoose.disconnect();
            process.exit(1);
        }

        console.log(`✅ Found user: ${user.name} (${user.email})`);
        console.log(`   Role:      ${user.role}`);
        console.log(`   TenantId:  ${user.tenantId}`);

        // Lookup tenant details
        if (user.tenantId) {
            tenant = await Tenant.findOne({ tenantId: user.tenantId });
        }
        if (!tenant) {
            tenant = await Tenant.findOne({ email: user.email });
        }

        const instituteName = tenant?.instituteName || tenant?.name || user.name;
        console.log(`   Institute: ${instituteName}`);
        if (tenant?.subdomain) {
            console.log(`   Subdomain: ${tenant.subdomain}`);
        }

        // Set or generate new temporary password so the user can definitely log in
        const newPassword = specifiedPassword || `Enro@${Math.floor(1000 + Math.random() * 9000)}!`;
        user.password = newPassword; // Mongoose pre-save hook will hash this
        user.requirePasswordReset = true;
        await user.save();
        console.log(`🔑 Reset temporary password to: ${newPassword}`);

        // Construct proper login URL (main working domain)
        const frontendBase = (process.env.FRONTEND_URL || 'https://enromatics.com').replace(/\/$/, '');
        const workingLoginUrl = `${frontendBase}/login`;
        console.log(`🌐 Verified Login URL: ${workingLoginUrl}`);

        console.log('\n📧 Sending credentials email via ZeptoMail...');
        const emailResult = await sendCredentialsEmail({
            to: user.email,
            name: user.name,
            instituteName: instituteName,
            email: user.email,
            password: newPassword,
            loginUrl: workingLoginUrl,
            instituteUrl: `${frontendBase}/dashboard/home`,
            tenantId: user.tenantId,
            userId: user._id
        });

        if (emailResult.success) {
            console.log('\n🎉 SUCCESS! Credentials email sent successfully!');
            console.log('------------------------------------------------------');
            console.log(`Recipient:   ${user.email}`);
            console.log(`Username:    ${user.email}`);
            console.log(`Password:    ${newPassword}`);
            console.log(`Login URL:   ${workingLoginUrl}`);
            console.log(`Message ID:  ${emailResult.messageId}`);
            console.log('------------------------------------------------------');
            console.log('👉 The user can now click the link in their email and log in directly!');
        } else {
            console.error('\n❌ Failed to dispatch email via ZeptoMail:');
            console.error(emailResult.error);
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('\n❌ Error:', err.message);
        console.error(err);
        await mongoose.disconnect().catch(() => {});
        process.exit(1);
    }
}

main();
