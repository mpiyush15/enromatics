#!/usr/bin/env node
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend directory first, then root if not loaded
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

console.log('======================================================');
console.log('       🔍 ZEPTOMAIL SYSTEM & ENV DIAGNOSTIC CHECK      ');
console.log('======================================================\n');

// 1. Check Environment Variables
const rawToken = process.env.ZEPTO_API_TOKEN || process.env.ZEPTOMAIL_API_TOKEN;
const tokenVarName = process.env.ZEPTO_API_TOKEN ? 'ZEPTO_API_TOKEN' : (process.env.ZEPTOMAIL_API_TOKEN ? 'ZEPTOMAIL_API_TOKEN' : null);
const rawUrl = process.env.ZEPTO_API_URL;
const rawFrom = process.env.ZEPTO_FROM || process.env.EMAIL_FROM;
const fromVarName = process.env.ZEPTO_FROM ? 'ZEPTO_FROM' : (process.env.EMAIL_FROM ? 'EMAIL_FROM' : null);
const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
const zeptoAgent = process.env.ZEPTO_AGENT;

console.log('📋 1. ENVIRONMENT VARIABLES INSPECTION:');
console.log('------------------------------------------------------');

// Token Check
if (!rawToken) {
    console.log('❌ API Token:           MISSING!');
    console.log('   Expected: ZEPTO_API_TOKEN="Zoho-enczapikey <your_send_mail_token>"');
} else {
    const cleanToken = rawToken.replace(/^["']|["']$/g, '').trim();
    const hasPrefix = cleanToken.startsWith('Zoho-enczapikey');
    const masked = cleanToken.length > 25 
        ? `${cleanToken.substring(0, 18)}...${cleanToken.substring(cleanToken.length - 6)}`
        : '***';
    console.log(`✅ API Token:           FOUND (via ${tokenVarName})`);
    console.log(`   Preview:             ${masked}`);
    console.log(`   Has 'Zoho-' prefix:  ${hasPrefix ? 'YES' : 'NO (will be auto-prefixed by emailService)'}`);
    console.log(`   Token length:        ${cleanToken.length} characters`);
}

// API URL Check
const effectiveUrl = (rawUrl || 'https://api.zeptomail.in/v1.1/email').replace(/^["']|["']$/g, '').trim();
console.log(`ℹ️ API URL:             ${rawUrl ? 'CUSTOM SET' : 'DEFAULT (api.zeptomail.in)'}`);
console.log(`   Effective URL:       ${effectiveUrl}`);
if (effectiveUrl.includes('.in')) {
    console.log('   Data Center:         India Data Center (.in)');
} else if (effectiveUrl.includes('.com')) {
    console.log('   Data Center:         US / Global Data Center (.com)');
} else if (effectiveUrl.includes('.eu')) {
    console.log('   Data Center:         EU Data Center (.eu)');
}

// From Address Check
const effectiveFrom = (rawFrom || 'no-reply@enromatics.com').replace(/^["']|["']$/g, '').trim();
console.log(`ℹ️ Sender (From):        ${rawFrom ? `FOUND (via ${fromVarName})` : 'DEFAULT'}`);
console.log(`   Effective Address:   ${effectiveFrom}`);
if (!effectiveFrom.includes('@enromatics.com')) {
    console.log('   ⚠️ WARNING: Sender domain should match your verified ZeptoMail sending domain (e.g. enromatics.com)');
}

// Super Admin Email
console.log(`ℹ️ Super Admin:         ${superAdminEmail || 'NOT SET (default: mpiyush2727@gmail.com)'}`);
if (zeptoAgent) {
    console.log(`ℹ️ Mail Agent:          ${zeptoAgent}`);
}

console.log('------------------------------------------------------\n');

// 2. Check if a test send was requested
const args = process.argv.slice(2);
let targetRecipient = null;

for (const arg of args) {
    if (arg.startsWith('--to=')) {
        targetRecipient = arg.split('=')[1].trim();
    } else if (arg.includes('@')) {
        targetRecipient = arg.trim();
    }
}

if (!targetRecipient && args.includes('--send')) {
    targetRecipient = superAdminEmail || 'mpiyush2727@gmail.com';
}

if (!targetRecipient) {
    console.log('💡 TO SEND A LIVE TEST EMAIL:');
    console.log('   Run: node scripts/diagnose-zepto.mjs your-email@example.com');
    console.log('   Or:  node scripts/diagnose-zepto.mjs --send\n');
    console.log('🏁 Diagnostic environment check completed.');
    process.exit(0);
}

// 3. Perform Live API Call to ZeptoMail
console.log(`🚀 2. TESTING LIVE ZEPTOMAIL API CALL TO: ${targetRecipient}`);
console.log('------------------------------------------------------');

if (!rawToken) {
    console.error('❌ Cannot send live test: API Token is missing in environment variables.');
    process.exit(1);
}

const cleanToken = rawToken.replace(/^["']|["']$/g, '').trim();
const authHeader = cleanToken.startsWith('Zoho-enczapikey') ? cleanToken : `Zoho-enczapikey ${cleanToken}`;

const testPayload = {
    from: {
        address: effectiveFrom,
        name: 'Enromatics System Test'
    },
    to: [
        {
            email_address: {
                address: targetRecipient,
                name: targetRecipient.split('@')[0]
            }
        }
    ],
    subject: `✅ ZeptoMail Verification Test - ${new Date().toLocaleDateString('en-IN')}`,
    htmlbody: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 10px;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; text-align: center; border-radius: 8px;">
                <h2 style="margin: 0;">🎉 ZeptoMail is Working!</h2>
            </div>
            <div style="padding: 20px 0; color: #334155;">
                <p>Hello,</p>
                <p>This email confirms that your <strong>ZeptoMail API integration</strong> on Enromatics is working properly with full HTTP REST capability.</p>
                <div style="background: #f8fafc; border-left: 4px solid #10b981; padding: 12px; margin: 15px 0;">
                    <strong>Configuration Details:</strong>
                    <ul style="margin: 8px 0 0 0; padding-left: 20px;">
                        <li><strong>Sender:</strong> ${effectiveFrom}</li>
                        <li><strong>API URL:</strong> ${effectiveUrl}</li>
                        <li><strong>Sent At:</strong> ${new Date().toISOString()}</li>
                    </ul>
                </div>
                <p>All automated emails (Credentials, OTPs, Registrations, Notifications) will flow through this verified connection.</p>
            </div>
            <div style="text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #f1f5f9; padding-top: 12px;">
                Enromatics System Diagnostic Tool
            </div>
        </div>
    `
};

try {
    console.log(`📡 Sending HTTP POST to ${effectiveUrl}...`);
    const startTime = Date.now();
    const response = await fetch(effectiveUrl, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': authHeader
        },
        body: JSON.stringify(testPayload)
    });
    const duration = Date.now() - startTime;
    const resData = await response.json().catch(() => ({}));

    console.log(`⏱️ Response received in ${duration}ms (HTTP Status: ${response.status} ${response.statusText})`);

    if (response.ok) {
        console.log('\n🎉 SUCCESS! ZEPTOMAIL IS FULLY OPERATIONAL!');
        console.log('------------------------------------------------------');
        console.log('✅ Email successfully dispatched to:', targetRecipient);
        console.log('📋 Zepto Response:', JSON.stringify(resData, null, 2));
        console.log('\n👉 Check your inbox/spam folder for the verification email.');
    } else {
        console.error('\n❌ ZEPTOMAIL API REJECTED THE REQUEST:');
        console.error('------------------------------------------------------');
        console.error('HTTP Status:', response.status);
        console.error('Response Data:', JSON.stringify(resData, null, 2));

        console.error('\n🔍 COMMON REASONS FOR FAILURE:');
        if (response.status === 401) {
            console.error('1. Invalid Token: Make sure you copied the "Send Mail Token" from ZeptoMail, NOT your Zoho account password.');
            console.error('2. Wrong Data Center: If your Zepto account is on zeptomail.zoho.com, change ZEPTO_API_URL to https://api.zeptomail.com/v1.1/email');
        } else if (response.status === 400) {
            console.error(`1. Unverified Domain: "${effectiveFrom}" must belong to a verified domain in your ZeptoMail Mail Agent.`);
            console.error('2. IP Restriction: Check if your ZeptoMail Mail Agent has allowed IP restrictions enabled.');
        }
    }
} catch (fetchErr) {
    console.error('\n❌ NETWORK OR REQUEST ERROR:');
    console.error(fetchErr);
}
