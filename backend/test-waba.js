#!/usr/bin/env node
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import models
import WhatsAppConfig from './src/models/WhatsAppConfig.js';
import WhatsAppTemplate from './src/models/WhatsAppTemplate.js';
import WhatsAppContact from './src/models/WhatsAppContact.js';
import WhatsAppMessage from './src/models/WhatsAppMessage.js';
import User from './src/models/User.js';
import Student from './src/models/Student.js';
import Tenant from './src/models/Tenant.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/enromatics';

async function checkWABASetup() {
    try {
        console.log('🚀 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        console.log('\n📋 WHATSAPP BUSINESS API AUDIT REPORT');
        console.log('=====================================\n');

        // 1. Check all WABA configurations
        console.log('1️⃣ CHECKING WABA CONFIGURATIONS:');
        console.log('-'.repeat(40));
        const configs = await WhatsAppConfig.find({});
        
        if (configs.length === 0) {
            console.log('❌ No WhatsApp configurations found');
        } else {
            for (const config of configs) {
                console.log(`\n📱 Tenant: ${config.tenantId}`);
                console.log(`   Phone Number ID: ${config.phoneNumberId}`);
                console.log(`   WABA ID: ${config.wabaId}`);
                console.log(`   Business Name: ${config.businessName || 'Not Set'}`);
                console.log(`   Active: ${config.isActive ? '✅' : '❌'}`);
                console.log(`   Verified: ${config.verifiedAt ? '✅ ' + config.verifiedAt : '❌ Not verified'}`);
                console.log(`   Last Tested: ${config.lastTestedAt || 'Never'}`);
                console.log(`   Message Count: ${JSON.stringify(config.messageCount)}`);
            }
        }

        // 2. Check approved templates
        console.log('\n\n2️⃣ CHECKING APPROVED TEMPLATES:');
        console.log('-'.repeat(40));
        const templates = await WhatsAppTemplate.find({ status: 'approved' });
        
        if (templates.length === 0) {
            console.log('❌ No approved templates found');
            console.log('💡 You need approved templates to send WhatsApp messages');
        } else {
            console.log(`✅ Found ${templates.length} approved templates:`);
            for (const template of templates) {
                console.log(`   - ${template.name} (${template.category}) - Tenant: ${template.tenantId}`);
                console.log(`     Content: ${template.content.substring(0, 50)}...`);
                console.log(`     Variables: [${template.variables.join(', ')}]`);
            }
        }

        // 3. Check ALL templates (including pending/rejected)
        console.log('\n\n3️⃣ CHECKING ALL TEMPLATES:');
        console.log('-'.repeat(40));
        const allTemplates = await WhatsAppTemplate.find({});
        const templatesByStatus = {};
        
        for (const template of allTemplates) {
            if (!templatesByStatus[template.status]) {
                templatesByStatus[template.status] = [];
            }
            templatesByStatus[template.status].push(template);
        }
        
        for (const [status, temps] of Object.entries(templatesByStatus)) {
            console.log(`   ${status.toUpperCase()}: ${temps.length} templates`);
            if (status === 'rejected' || status === 'pending') {
                temps.forEach(t => {
                    console.log(`     - ${t.name} (Tenant: ${t.tenantId})`);
                });
            }
        }

        // 4. Check consenting contacts
        console.log('\n\n4️⃣ CHECKING CONSENT STATUS:');
        console.log('-'.repeat(40));
        
        // Check users with WhatsApp opt-in
        const consentingUsers = await User.find({ 
            whatsappOptIn: true,
            phone: { $exists: true, $ne: null, $ne: "" }
        });
        console.log(`👥 Users who opted in to WhatsApp: ${consentingUsers.length}`);
        
        // Check students with WhatsApp opt-in
        const consentingStudents = await Student.find({ 
            whatsappOptIn: true,
            phone: { $exists: true, $ne: null, $ne: "" }
        });
        console.log(`🎓 Students who opted in to WhatsApp: ${consentingStudents.length}`);
        
        // Check WhatsApp contacts
        const contacts = await WhatsAppContact.find({ isOptedIn: true });
        console.log(`📞 WhatsApp contacts (opted in): ${contacts.length}`);
        
        // Group contacts by tenant
        const contactsByTenant = {};
        for (const contact of contacts) {
            if (!contactsByTenant[contact.tenantId]) {
                contactsByTenant[contact.tenantId] = [];
            }
            contactsByTenant[contact.tenantId].push(contact);
        }
        
        console.log('\n📊 Contacts by Tenant:');
        for (const [tenantId, tenantContacts] of Object.entries(contactsByTenant)) {
            console.log(`   ${tenantId}: ${tenantContacts.length} contacts`);
        }

        // 5. Check recent message attempts
        console.log('\n\n5️⃣ CHECKING RECENT MESSAGE ATTEMPTS:');
        console.log('-'.repeat(40));
        const recentMessages = await WhatsAppMessage.find({})
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('sentBy', 'name email');
            
        if (recentMessages.length === 0) {
            console.log('📭 No messages sent recently');
        } else {
            console.log(`📨 Last ${recentMessages.length} message attempts:`);
            for (const msg of recentMessages) {
                const sentBy = msg.sentBy ? `${msg.sentBy.name} (${msg.sentBy.email})` : 'Unknown';
                console.log(`   ${msg.createdAt.toLocaleString()} - ${msg.messageType} to ${msg.recipientPhone}`);
                console.log(`     Status: ${msg.status} | Campaign: ${msg.campaign} | Sent by: ${sentBy}`);
                if (msg.statusUpdates && msg.statusUpdates.length > 0) {
                    const lastUpdate = msg.statusUpdates[msg.statusUpdates.length - 1];
                    console.log(`     Last update: ${lastUpdate.status} ${lastUpdate.errorMessage ? '- ' + lastUpdate.errorMessage : ''}`);
                }
            }
        }

        // 6. Check for specific tenant if provided
        const softwareSquareTenant = await Tenant.findOne({ 
            $or: [
                { name: { $regex: /software.*square/i } },
                { instituteName: { $regex: /software.*square/i } },
                { tenantId: { $regex: /software.*square/i } }
            ]
        });
        
        if (softwareSquareTenant) {
            console.log('\n\n6️⃣ SOFTWARE SQUARE ACADEMY SPECIFIC CHECK:');
            console.log('-'.repeat(40));
            console.log(`✅ Found tenant: ${softwareSquareTenant.name}`);
            console.log(`   Tenant ID: ${softwareSquareTenant.tenantId}`);
            console.log(`   Institute: ${softwareSquareTenant.instituteName}`);
            console.log(`   Plan: ${softwareSquareTenant.plan}`);
            console.log(`   Contact: ${JSON.stringify(softwareSquareTenant.contact)}`);
            
            // Check specific config for this tenant
            const tenantConfig = await WhatsAppConfig.findOne({ tenantId: softwareSquareTenant.tenantId });
            if (tenantConfig) {
                console.log(`   ✅ WABA Config exists`);
                console.log(`   Phone ID: ${tenantConfig.phoneNumberId}`);
                console.log(`   Active: ${tenantConfig.isActive}`);
            } else {
                console.log(`   ❌ No WABA configuration found for this tenant`);
            }
            
            // Check contacts for this tenant
            const tenantContacts = await WhatsAppContact.find({ tenantId: softwareSquareTenant.tenantId });
            console.log(`   📞 WhatsApp contacts: ${tenantContacts.length}`);
            
            // Check templates for this tenant
            const tenantTemplates = await WhatsAppTemplate.find({ tenantId: softwareSquareTenant.tenantId });
            console.log(`   📄 Templates: ${tenantTemplates.length}`);
            const approvedTemplates = tenantTemplates.filter(t => t.status === 'approved');
            console.log(`   ✅ Approved templates: ${approvedTemplates.length}`);
        } else {
            console.log('\n\n6️⃣ SOFTWARE SQUARE ACADEMY: Not found');
            console.log('💡 Searching all tenants for similar names...');
            const allTenants = await Tenant.find({}).select('name instituteName tenantId');
            for (const tenant of allTenants) {
                console.log(`   - ${tenant.name} | ${tenant.instituteName} | ${tenant.tenantId}`);
            }
        }

        console.log('\n\n✅ AUDIT COMPLETE!');
        console.log('\n📝 RECOMMENDATIONS:');
        console.log('==================');
        
        if (configs.length === 0) {
            console.log('❌ 1. Set up WhatsApp Business API configuration first');
        }
        
        if (templates.filter(t => t.status === 'approved').length === 0) {
            console.log('❌ 2. Create and get templates approved by Meta');
        }
        
        if (contacts.length === 0) {
            console.log('❌ 3. Import contacts who have opted in to WhatsApp');
        }
        
        console.log('✅ 4. Ensure all recipients have explicitly opted in to WhatsApp messages');
        console.log('✅ 5. Only use approved templates for promotional messages');
        console.log('✅ 6. Test with your own number first');
        
    } catch (error) {
        console.error('❌ Error during audit:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

// Run the audit
checkWABASetup().catch(console.error);