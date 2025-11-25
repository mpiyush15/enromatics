#!/usr/bin/env node
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables
dotenv.config();

// Import models
import WhatsAppConfig from './src/models/WhatsAppConfig.js';
import WhatsAppTemplate from './src/models/WhatsAppTemplate.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/enromatics';

async function testProperTemplates() {
    try {
        console.log('🧪 TESTING WITH PROPER APPROVED TEMPLATES');
        console.log('==========================================\n');

        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Get the WABA config
        const config = await WhatsAppConfig.findOne({ tenantId: 'global' });
        
        if (!config) {
            console.log('❌ No global WABA config found');
            return;
        }

        // Get approved templates (excluding hello_world)
        const templates = await WhatsAppTemplate.find({ 
            tenantId: 'global',
            status: 'approved',
            name: { $ne: 'hello_world' } // Exclude hello_world
        });

        console.log(`📋 Found ${templates.length} approved templates (excluding hello_world):\n`);

        for (const template of templates) {
            console.log(`🔹 Testing template: ${template.name}`);
            console.log(`   Category: ${template.category}`);
            console.log(`   Content: ${template.content.substring(0, 50)}...`);
            console.log(`   Variables: [${template.variables.join(', ')}]`);

            // Prepare test payload
            const testPayload = {
                messaging_product: 'whatsapp',
                to: '918087131777', // Your test number
                type: 'template',
                template: {
                    name: template.name,
                    language: { code: 'en' }
                }
            };

            // Add parameters if template has variables
            if (template.variables && template.variables.length > 0) {
                testPayload.template.components = [{
                    type: 'body',
                    parameters: template.variables.map(v => ({ type: 'text', text: 'TEST_VALUE' }))
                }];
            }

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

                console.log(`   ✅ SUCCESS: Message sent!`);
                console.log(`   📱 WhatsApp Message ID: ${testResponse.data.messages[0].id}`);
                
            } catch (error) {
                console.log(`   ❌ FAILED: ${error.response?.data?.error?.message || error.message}`);
                console.log(`   🔢 Error Code: ${error.response?.data?.error?.code}`);
                console.log(`   📝 Error Type: ${error.response?.data?.error?.type}`);
                
                // Log specific error details
                if (error.response?.data?.error?.code === 131058) {
                    console.log(`   💡 This is a Meta restriction - template might not be properly approved for your business`);
                } else if (error.response?.data?.error?.code === 131047) {
                    console.log(`   💡 This is a business eligibility issue`);
                } else if (error.response?.data?.error?.code === 132000) {
                    console.log(`   💡 Template parameter mismatch`);
                }
            }
            
            console.log(''); // Add spacing
        }

        // Test 2: Check marketing messages onboarding
        console.log('\n🚀 CHECKING MARKETING MESSAGES ONBOARDING:');
        console.log('-'.repeat(50));
        
        try {
            const wabaResponse = await axios.get(
                `https://graph.facebook.com/v18.0/${config.wabaId}?fields=owner_business_info`,
                {
                    headers: {
                        'Authorization': `Bearer ${config.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const marketingStatus = wabaResponse.data.owner_business_info?.marketing_messages_onboarding_status?.status;
            
            console.log(`📈 Marketing Messages Status: ${marketingStatus}`);
            
            if (marketingStatus === 'NOT_STARTED') {
                console.log('\n🎯 SOLUTION REQUIRED:');
                console.log('1. Go to Meta Business Manager');
                console.log('2. Navigate to WhatsApp Manager');
                console.log('3. Complete Marketing Messages onboarding');
                console.log('4. This enables promotional template messages');
                console.log('\n💡 Until onboarding is complete, you can only send:');
                console.log('   - Customer service messages');
                console.log('   - Utility templates (non-promotional)');
            } else if (marketingStatus === 'COMPLETED') {
                console.log('✅ Marketing messages onboarding is complete!');
            }

        } catch (error) {
            console.log('❌ Could not check marketing onboarding status');
        }

        // Test 3: Try sending a simple text message (should work)
        console.log('\n📝 TESTING SIMPLE TEXT MESSAGE:');
        console.log('-'.repeat(40));
        
        const textPayload = {
            messaging_product: 'whatsapp',
            to: '918087131777',
            type: 'text',
            text: {
                body: 'Test message from Enromatics - this should work!'
            }
        };

        try {
            const textResponse = await axios.post(
                `https://graph.facebook.com/v18.0/${config.phoneNumberId}/messages`,
                textPayload,
                {
                    headers: {
                        'Authorization': `Bearer ${config.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('✅ Text message sent successfully!');
            console.log(`📱 Message ID: ${textResponse.data.messages[0].id}`);
        } catch (error) {
            console.log('❌ Text message failed:');
            console.log(`Error: ${error.response?.data?.error?.message || error.message}`);
        }

        console.log('\n✅ TEMPLATE TESTING COMPLETE!\n');

    } catch (error) {
        console.error('❌ Testing error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

// Run the test
testProperTemplates().catch(console.error);