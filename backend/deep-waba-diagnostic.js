#!/usr/bin/env node
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables
dotenv.config();

// Import models
import WhatsAppConfig from './src/models/WhatsAppConfig.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/enromatics';

async function deepWABADiagnostic() {
    try {
        console.log('🔍 DEEP WhatsApp Business API DIAGNOSTIC');
        console.log('=========================================\n');

        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Get the WABA config
        const config = await WhatsAppConfig.findOne({ tenantId: 'global' });
        
        if (!config) {
            console.log('❌ No global WABA config found');
            return;
        }

        console.log('📱 CURRENT CONFIGURATION:');
        console.log(`Phone Number ID: ${config.phoneNumberId}`);
        console.log(`WABA ID: ${config.wabaId}`);
        console.log(`Business Name: ${config.businessName}`);
        console.log(`Active: ${config.isActive}`);
        console.log(`Access Token Length: ${config.accessToken ? config.accessToken.length : 0} chars\n`);

        // Test 1: Check phone number status
        console.log('1️⃣ CHECKING PHONE NUMBER STATUS:');
        console.log('-'.repeat(40));
        try {
            const phoneResponse = await axios.get(
                `https://graph.facebook.com/v18.0/${config.phoneNumberId}?fields=status,quality_rating,messaging_limit_tier,name_status,code_verification_status`,
                {
                    headers: {
                        'Authorization': `Bearer ${config.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('📞 Phone Number Details:');
            console.log(JSON.stringify(phoneResponse.data, null, 2));
        } catch (error) {
            console.log('❌ Phone number check failed:');
            console.log('Status:', error.response?.status);
            console.log('Error:', error.response?.data?.error?.message || error.message);
        }

        // Test 2: Check WABA account info
        console.log('\n2️⃣ CHECKING WABA ACCOUNT INFO:');
        console.log('-'.repeat(40));
        try {
            const wabaResponse = await axios.get(
                `https://graph.facebook.com/v18.0/${config.wabaId}?fields=id,name,account_review_status,business_verification_status,restriction_info`,
                {
                    headers: {
                        'Authorization': `Bearer ${config.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('🏢 WABA Account Details:');
            console.log(JSON.stringify(wabaResponse.data, null, 2));
        } catch (error) {
            console.log('❌ WABA account check failed:');
            console.log('Status:', error.response?.status);
            console.log('Error:', error.response?.data?.error?.message || error.message);
        }

        // Test 3: Check business account info
        console.log('\n3️⃣ CHECKING BUSINESS ACCOUNT:');
        console.log('-'.repeat(40));
        try {
            // First get the business ID from WABA
            const wabaBusinessResponse = await axios.get(
                `https://graph.facebook.com/v18.0/${config.wabaId}?fields=owner_business_info`,
                {
                    headers: {
                        'Authorization': `Bearer ${config.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('💼 Business Info:');
            console.log(JSON.stringify(wabaBusinessResponse.data, null, 2));

            if (wabaBusinessResponse.data.owner_business_info?.id) {
                const businessId = wabaBusinessResponse.data.owner_business_info.id;
                
                // Check business verification and payment status
                const businessResponse = await axios.get(
                    `https://graph.facebook.com/v18.0/${businessId}?fields=verification_status,is_published,name,primary_page`,
                    {
                        headers: {
                            'Authorization': `Bearer ${config.accessToken}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                console.log('🏢 Business Account Status:');
                console.log(JSON.stringify(businessResponse.data, null, 2));
            }

        } catch (error) {
            console.log('❌ Business account check failed:');
            console.log('Status:', error.response?.status);
            console.log('Error:', error.response?.data?.error?.message || error.message);
        }

        // Test 4: Try to send a simple test message
        console.log('\n4️⃣ TESTING MESSAGE SEND CAPABILITY:');
        console.log('-'.repeat(40));
        
        const testPayload = {
            messaging_product: 'whatsapp',
            to: '918087131777', // Your test number
            type: 'template',
            template: {
                name: 'hello_world',
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

            console.log('✅ Test message sent successfully:');
            console.log(JSON.stringify(testResponse.data, null, 2));
        } catch (error) {
            console.log('❌ Test message failed:');
            console.log('Status:', error.response?.status);
            console.log('Error Code:', error.response?.data?.error?.code);
            console.log('Error Type:', error.response?.data?.error?.type);
            console.log('Error Message:', error.response?.data?.error?.message);
            console.log('Error Details:', error.response?.data?.error?.error_user_title);
            console.log('Error User Message:', error.response?.data?.error?.error_user_msg);
            console.log('\n🔍 FULL ERROR RESPONSE:');
            console.log(JSON.stringify(error.response?.data, null, 2));
        }

        // Test 5: Check rate limits and quotas
        console.log('\n5️⃣ CHECKING RATE LIMITS & QUOTAS:');
        console.log('-'.repeat(40));
        try {
            const quotaResponse = await axios.get(
                `https://graph.facebook.com/v18.0/${config.wabaId}/message_quota_usage`,
                {
                    headers: {
                        'Authorization': `Bearer ${config.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('📊 Message Quota Usage:');
            console.log(JSON.stringify(quotaResponse.data, null, 2));
        } catch (error) {
            console.log('❌ Quota check failed:');
            console.log('Status:', error.response?.status);
            console.log('Error:', error.response?.data?.error?.message || error.message);
        }

        console.log('\n✅ DEEP DIAGNOSTIC COMPLETE!\n');

    } catch (error) {
        console.error('❌ Diagnostic error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

// Run the diagnostic
deepWABADiagnostic().catch(console.error);