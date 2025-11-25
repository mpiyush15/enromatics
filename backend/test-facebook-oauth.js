#!/usr/bin/env node
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables
dotenv.config();

// Import models
import User from './src/models/User.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/enromatics';

async function testFacebookOAuthSetup() {
    try {
        console.log('🔍 FACEBOOK OAUTH SETUP VERIFICATION');
        console.log('=====================================\n');

        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // 1. Check environment variables
        console.log('1️⃣ CHECKING ENVIRONMENT VARIABLES:');
        console.log('-'.repeat(40));
        
        const requiredVars = {
            'FACEBOOK_APP_ID': process.env.FACEBOOK_APP_ID,
            'FACEBOOK_APP_SECRET': process.env.FACEBOOK_APP_SECRET,
            'BACKEND_URL': process.env.BACKEND_URL,
            'FRONTEND_URL': process.env.FRONTEND_URL
        };

        for (const [key, value] of Object.entries(requiredVars)) {
            if (value) {
                console.log(`✅ ${key}: ${key.includes('SECRET') ? '***HIDDEN***' : value}`);
            } else {
                console.log(`❌ ${key}: NOT SET`);
            }
        }

        // 2. Check users with Facebook connections
        console.log('\n2️⃣ CHECKING FACEBOOK CONNECTIONS:');
        console.log('-'.repeat(40));
        
        const usersWithFacebook = await User.find({ 
            'facebookBusiness.connected': true 
        }).select('name email facebookBusiness role tenantId');

        console.log(`📊 Users with Facebook connections: ${usersWithFacebook.length}`);
        
        if (usersWithFacebook.length > 0) {
            for (const user of usersWithFacebook) {
                console.log(`\n👤 User: ${user.name} (${user.email})`);
                console.log(`   Role: ${user.role}`);
                console.log(`   Tenant: ${user.tenantId}`);
                console.log(`   Facebook User ID: ${user.facebookBusiness.facebookUserId}`);
                console.log(`   Connected At: ${user.facebookBusiness.connectedAt}`);
                console.log(`   Token Expiry: ${user.facebookBusiness.tokenExpiry || 'No expiry set'}`);
                console.log(`   Permissions: [${(user.facebookBusiness.permissions || []).join(', ')}]`);
                
                // Test if token is still valid
                if (user.facebookBusiness.accessToken) {
                    try {
                        const testResponse = await axios.get(
                            `https://graph.facebook.com/v19.0/me?access_token=${user.facebookBusiness.accessToken}`
                        );
                        console.log(`   ✅ Token Status: VALID - Facebook ID: ${testResponse.data.id}`);
                        
                        // Check permissions
                        const permsResponse = await axios.get(
                            `https://graph.facebook.com/v19.0/me/permissions?access_token=${user.facebookBusiness.accessToken}`
                        );
                        
                        const grantedPerms = permsResponse.data.data
                            .filter(p => p.status === 'granted')
                            .map(p => p.permission);
                        
                        console.log(`   📜 Active Permissions: [${grantedPerms.join(', ')}]`);
                        
                        // Test ad accounts access
                        try {
                            const adAccountsResponse = await axios.get(
                                `https://graph.facebook.com/v19.0/me/adaccounts?fields=id,name,account_status&access_token=${user.facebookBusiness.accessToken}`
                            );
                            console.log(`   💼 Ad Accounts: ${adAccountsResponse.data.data.length} accessible`);
                            
                            adAccountsResponse.data.data.forEach(account => {
                                console.log(`     - ${account.name} (${account.id}) - Status: ${account.account_status}`);
                            });
                        } catch (adError) {
                            console.log(`   ❌ Ad Accounts Error: ${adError.response?.data?.error?.message || adError.message}`);
                        }
                        
                        // Test pages access
                        try {
                            const pagesResponse = await axios.get(
                                `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,category&access_token=${user.facebookBusiness.accessToken}`
                            );
                            console.log(`   📄 Pages: ${pagesResponse.data.data.length} accessible`);
                            
                            pagesResponse.data.data.forEach(page => {
                                console.log(`     - ${page.name} (${page.id}) - ${page.category}`);
                            });
                        } catch (pageError) {
                            console.log(`   ❌ Pages Error: ${pageError.response?.data?.error?.message || pageError.message}`);
                        }
                        
                    } catch (error) {
                        console.log(`   ❌ Token Status: INVALID - ${error.response?.data?.error?.message || error.message}`);
                        
                        // Mark as disconnected
                        user.facebookBusiness.connected = false;
                        await user.save();
                        console.log(`   🔄 Marked user as disconnected`);
                    }
                }
            }
        } else {
            console.log('❌ No users have connected Facebook accounts yet');
        }

        // 3. Test OAuth URLs
        console.log('\n3️⃣ TESTING OAUTH URLS:');
        console.log('-'.repeat(40));
        
        const backendUrl = process.env.BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';
        const frontendUrl = process.env.FRONTEND_URL || 'https://enromatics.com';
        
        console.log(`🔗 Connect URL: ${backendUrl}/api/facebook/connect`);
        console.log(`🔄 Callback URL: ${backendUrl}/api/facebook/callback`);
        console.log(`🏠 Frontend Redirect: ${frontendUrl}/dashboard/settings/facebook`);
        
        // Test if backend is reachable
        try {
            const healthCheck = await axios.get(`${backendUrl}/health`, { timeout: 5000 });
            console.log('✅ Backend is reachable');
        } catch (error) {
            try {
                // Try alternative health check endpoints
                const statusCheck = await axios.get(`${backendUrl}/api/facebook/status`, { 
                    headers: { 'Cookie': 'fake=test' },
                    timeout: 5000,
                    validateStatus: () => true // Accept any status
                });
                console.log(`✅ Facebook API endpoint reachable (Status: ${statusCheck.status})`);
            } catch (error2) {
                console.log('❌ Backend not reachable - check Railway deployment');
            }
        }

        // 4. Create OAuth URL for testing
        console.log('\n4️⃣ OAUTH CONFIGURATION:');
        console.log('-'.repeat(40));
        
        const oauthParams = new URLSearchParams({
            client_id: process.env.FACEBOOK_APP_ID,
            redirect_uri: `${backendUrl}/api/facebook/callback`,
            scope: [
                'public_profile',
                'email',
                'business_management',
                'ads_management',
                'ads_read',
                'whatsapp_business_management',
                'whatsapp_business_messaging',
            ].join(','),
            response_type: 'code',
            auth_type: 'rerequest',
        });

        const oauthUrl = `https://www.facebook.com/v17.0/dialog/oauth?${oauthParams.toString()}`;
        console.log('📱 Test OAuth URL:');
        console.log(oauthUrl);
        
        // 5. Check app configuration recommendations
        console.log('\n5️⃣ CONFIGURATION RECOMMENDATIONS:');
        console.log('-'.repeat(40));
        
        console.log('Meta App Dashboard Settings Required:');
        console.log(`✅ App ID: ${process.env.FACEBOOK_APP_ID}`);
        console.log('✅ Valid OAuth Redirect URIs should include:');
        console.log(`   - ${backendUrl}/api/facebook/callback`);
        console.log(`   - ${frontendUrl}/dashboard/settings/facebook`);
        console.log(`   - https://enromatics.com/dashboard/settings/facebook`);
        console.log(`   - https://www.enromatics.com/dashboard/settings/facebook`);
        
        console.log('\n✅ App Domains should include:');
        console.log('   - enromatics.com');
        console.log('   - www.enromatics.com'); 
        console.log('   - endearing-blessing-production-c61f.up.railway.app');
        
        console.log('\n🎯 NEXT STEPS TO TEST:');
        console.log('='.repeat(50));
        console.log('1. Login as SuperAdmin in your dashboard');
        console.log('2. Go to Settings → Facebook');
        console.log('3. Click "Connect Facebook Business"');
        console.log('4. Complete OAuth flow');
        console.log('5. Check if connection appears in this script');
        
        console.log('\n✅ FACEBOOK OAUTH SETUP VERIFICATION COMPLETE!\n');

    } catch (error) {
        console.error('❌ Verification error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

// Run the verification
testFacebookOAuthSetup().catch(console.error);