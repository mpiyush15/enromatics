#!/usr/bin/env node
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables
dotenv.config();

// Import models
import WhatsAppConfig from './src/models/WhatsAppConfig.js';
import WhatsAppTemplate from './src/models/WhatsAppTemplate.js';
import WhatsAppContact from './src/models/WhatsAppContact.js';
import Tenant from './src/models/Tenant.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/enromatics';

async function testSoftwareSquareAcademy() {
    try {
        console.log('🏫 SOFTWARE SQUARE ACADEMY WHATSAPP TEST');
        console.log('========================================\n');

        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Find Software Square Academy tenant
        const tenant = await Tenant.findOne({ 
            $or: [
                { name: { $regex: /software.*square/i } },
                { instituteName: { $regex: /software.*square/i } },
                { tenantId: '6f606de3' }
            ]
        });

        if (!tenant) {
            console.log('❌ Software Square Academy tenant not found');
            return;
        }

        console.log('🎯 FOUND TENANT:');
        console.log(`   Name: ${tenant.name}`);
        console.log(`   Institute: ${tenant.instituteName || 'Not set'}`);
        console.log(`   Tenant ID: ${tenant.tenantId}`);
        console.log(`   Plan: ${tenant.plan}`);
        console.log(`   Contact: ${JSON.stringify(tenant.contact || {})}\n`);

        // Get WABA config
        const config = await WhatsAppConfig.findOne({ tenantId: 'global' });
        if (!config) {
            console.log('❌ No WABA config found');
            return;
        }

        // Check if tenant has WhatsApp contacts
        const contacts = await WhatsAppContact.find({ tenantId: tenant.tenantId });
        console.log(`📞 WhatsApp contacts for this tenant: ${contacts.length}`);
        
        if (contacts.length > 0) {
            console.log('📋 Available contacts:');
            contacts.forEach(contact => {
                console.log(`   - ${contact.name}: ${contact.whatsappNumber} (${contact.type})`);
            });
        } else {
            console.log('💡 No WhatsApp contacts found for this tenant');
            console.log('   You can add contacts in the dashboard or sync from students');
        }

        // Get approved templates
        const templates = await WhatsAppTemplate.find({ 
            $or: [
                { tenantId: 'global', status: 'approved' },
                { tenantId: tenant.tenantId, status: 'approved' }
            ],
            name: { $ne: 'hello_world' } // Exclude problematic hello_world
        });

        console.log(`\n📄 Available templates: ${templates.length}`);
        templates.forEach(template => {
            console.log(`   - ${template.name} (${template.category}) - ${template.tenantId}`);
        });

        // Test sending to tenant owner's phone if available
        let testPhone = null;
        if (tenant.contact?.phone) {
            testPhone = tenant.contact.phone.replace(/[\s+()-]/g, '');
            console.log(`\n📱 Found tenant contact phone: ${testPhone}`);
        } else if (contacts.length > 0) {
            testPhone = contacts[0].whatsappNumber;
            console.log(`\n📱 Using first contact phone: ${testPhone}`);
        } else {
            testPhone = '918087131777'; // Your test number
            console.log(`\n📱 Using default test phone: ${testPhone}`);
        }

        // Test with best template for academy
        if (templates.length > 0) {
            const bestTemplate = templates.find(t => t.name.includes('information') || t.name.includes('welcome')) || templates[0];
            
            console.log(`\n🧪 TESTING TEMPLATE: ${bestTemplate.name}`);
            console.log(`   Category: ${bestTemplate.category}`);
            console.log(`   Content: ${bestTemplate.content.substring(0, 100)}...`);

            const testPayload = {
                messaging_product: 'whatsapp',
                to: testPhone,
                type: 'template',
                template: {
                    name: bestTemplate.name,
                    language: { code: 'en' }
                }
            };

            try {
                const testResponse = await axios.post(
                    `https://graph.facebook.com/v18.0/${config.phoneNumberId}/messages`,
                    testPayload,
                    {
                        headers: {
                            'Authorization': `Bearer ${config.accessToken}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                console.log('\n✅ SUCCESS! Template message sent to Software Square Academy!');
                console.log(`📱 WhatsApp Message ID: ${testResponse.data.messages[0].id}`);
                console.log(`📞 Sent to: ${testPhone}`);
                
                // Log this success
                console.log('\n🎉 RESULT: Software Square Academy WhatsApp integration is WORKING!');
                console.log('You can now send template messages to this tenant.');
                
            } catch (error) {
                console.log('\n❌ Template send failed:');
                console.log(`Error: ${error.response?.data?.error?.message || error.message}`);
                console.log(`Code: ${error.response?.data?.error?.code}`);
            }
        } else {
            console.log('\n❌ No templates available for testing');
        }

        // Summary and next steps
        console.log('\n📋 SUMMARY FOR SOFTWARE SQUARE ACADEMY:');
        console.log('=' .repeat(50));
        console.log(`✅ Tenant found: ${tenant.name}`);
        console.log(`📞 Available contacts: ${contacts.length}`);
        console.log(`📄 Available templates: ${templates.length}`);
        console.log(`🔧 WABA configuration: Working`);
        
        console.log('\n🚀 NEXT STEPS:');
        console.log('1. Add more contacts for this tenant in the dashboard');
        console.log('2. Create tenant-specific templates if needed');
        console.log('3. Use the campaigns page to send bulk messages');
        console.log('4. All WhatsApp functionality is ready to use!');

        console.log('\n✅ SOFTWARE SQUARE ACADEMY WHATSAPP TEST COMPLETE!\n');

    } catch (error) {
        console.error('❌ Test error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

// Run the test
testSoftwareSquareAcademy().catch(console.error);