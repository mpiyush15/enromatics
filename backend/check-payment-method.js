#!/usr/bin/env node
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables
dotenv.config();

// Import models
import WhatsAppConfig from './src/models/WhatsAppConfig.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/enromatics';

async function checkPaymentMethod() {
    try {
        console.log('💳 CHECKING PAYMENT METHOD REQUIREMENTS');
        console.log('======================================\n');

        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const config = await WhatsAppConfig.findOne({ tenantId: 'global' });
        
        if (!config) {
            console.log('❌ No WABA config found');
            return;
        }

        // Check business payment status
        console.log('🏢 CHECKING BUSINESS PAYMENT STATUS:');
        console.log('-'.repeat(40));
        
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

            const businessInfo = wabaResponse.data.owner_business_info;
            console.log('📊 Business Information:');
            console.log(`   Business ID: ${businessInfo.id}`);
            console.log(`   Business Name: ${businessInfo.name}`);
            
            const marketingStatus = businessInfo.marketing_messages_onboarding_status?.status;
            console.log(`   Marketing Messages Status: ${marketingStatus}`);
            
            // Try to get more detailed payment info
            try {
                const businessResponse = await axios.get(
                    `https://graph.facebook.com/v18.0/${businessInfo.id}?fields=verification_status,name`,
                    {
                        headers: {
                            'Authorization': `Bearer ${config.accessToken}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                
                console.log(`   Verification Status: ${businessResponse.data.verification_status || 'Unknown'}`);
            } catch (error) {
                console.log('   Could not get detailed business info');
            }

        } catch (error) {
            console.log('❌ Could not check business payment status');
            console.log(`Error: ${error.response?.data?.error?.message || error.message}`);
        }

        // Test with a template that requires payment
        console.log('\n🧪 TESTING TEMPLATE WITH PAYMENT REQUIREMENT:');
        console.log('-'.repeat(50));
        
        const testPayload = {
            messaging_product: 'whatsapp',
            to: '918087131777',
            type: 'template',
            template: {
                name: 'best_saas_solution', // Marketing template
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

            console.log('✅ Template sent successfully');
            console.log(`📱 Message ID: ${testResponse.data.messages[0].id}`);
            console.log('💡 Payment method seems to be working');
            
        } catch (error) {
            console.log('❌ Template send failed');
            console.log(`📧 Error Code: ${error.response?.data?.error?.code}`);
            console.log(`📝 Error Message: ${error.response?.data?.error?.message}`);
            
            // Check for specific payment-related errors
            const errorCode = error.response?.data?.error?.code;
            const errorMessage = error.response?.data?.error?.message || '';
            
            if (errorCode === 131047 || errorMessage.includes('payment') || errorMessage.includes('billing')) {
                console.log('\n🚨 PAYMENT METHOD ISSUE CONFIRMED!');
                console.log('💡 This error indicates payment method problems');
            } else if (errorMessage.includes('marketing') || errorCode === 131058) {
                console.log('\n💳 LIKELY CREDIT CARD REQUIREMENT!');
                console.log('💡 Marketing messages need valid payment method');
            }
        }

        // Check for recent successful vs failed messages pattern
        console.log('\n📊 ANALYZING MESSAGE PATTERN:');
        console.log('-'.repeat(40));
        
        const WhatsAppMessage = (await import('./src/models/WhatsAppMessage.js')).default;
        
        const recentMessages = await WhatsAppMessage.find({})
            .sort({ createdAt: -1 })
            .limit(20);
            
        let successCount = 0;
        let failedCount = 0;
        let paymentErrors = 0;
        
        for (const msg of recentMessages) {
            if (msg.status === 'sent' || msg.status === 'delivered') {
                successCount++;
            } else if (msg.status === 'failed') {
                failedCount++;
                
                // Check if failure was payment-related
                const lastUpdate = msg.statusUpdates[msg.statusUpdates.length - 1];
                if (lastUpdate && lastUpdate.errorMessage && 
                    (lastUpdate.errorMessage.includes('payment') || 
                     lastUpdate.errorMessage.includes('billing') ||
                     lastUpdate.errorMessage.includes('eligibility'))) {
                    paymentErrors++;
                }
            }
        }
        
        console.log(`📈 Recent Messages Analysis (last 20):`);
        console.log(`   ✅ Successful: ${successCount}`);
        console.log(`   ❌ Failed: ${failedCount}`);
        console.log(`   💳 Payment-related failures: ${paymentErrors}`);
        
        if (paymentErrors > 0) {
            console.log('\n🎯 CONCLUSION: PAYMENT METHOD ISSUE CONFIRMED');
            console.log('💡 Most failures are payment/billing related');
            console.log('🔧 Solution: Add valid credit card to Meta Business Manager');
        }

        console.log('\n✅ PAYMENT METHOD CHECK COMPLETE!\n');

    } catch (error) {
        console.error('❌ Check error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

// Run the check
checkPaymentMethod().catch(console.error);