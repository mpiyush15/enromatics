#!/usr/bin/env node
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

async function testEmail() {
    console.log('📧 TESTING ZEPTOMAIL SMTP CONNECTION');
    console.log('=====================================\n');

    console.log('📋 SMTP Configuration:');
    console.log(`   Host: ${process.env.SMTP_HOST}`);
    console.log(`   Port: ${process.env.SMTP_PORT}`);
    console.log(`   User: ${process.env.SMTP_USER}`);
    console.log(`   From: ${process.env.EMAIL_FROM}`);
    console.log(`   Password: ${process.env.SMTP_PASSWORD ? '***' + process.env.SMTP_PASSWORD.slice(-10) : 'NOT SET'}\n`);

    try {
        // Create transporter
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT),
            secure: false, // Use TLS
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        console.log('🔌 Testing SMTP connection...');
        await transporter.verify();
        console.log('✅ SMTP connection successful!\n');

        // Send test email
        console.log('📤 Sending test email...');
        const info = await transporter.sendMail({
            from: `"Enromatics Test" <${process.env.EMAIL_FROM}>`,
            to: process.env.SUPER_ADMIN_EMAIL || 'piyush@pixelsdigital.tech',
            subject: '✅ Enromatics SMTP Test - Success',
            text: 'This is a test email from Enromatics backend to verify Zeptomail SMTP configuration.',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
                    <div style="background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <h1 style="color: #2563eb; margin-bottom: 20px;">✅ SMTP Configuration Successful!</h1>
                        <p style="color: #333; font-size: 16px; line-height: 1.6;">
                            Your Zeptomail SMTP configuration is working correctly.
                        </p>
                        <div style="background-color: #f0f9ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;">
                            <h3 style="color: #1e40af; margin: 0 0 10px 0;">Configuration Details:</h3>
                            <ul style="color: #333; margin: 0; padding-left: 20px;">
                                <li>Host: ${process.env.SMTP_HOST}</li>
                                <li>Port: ${process.env.SMTP_PORT}</li>
                                <li>From Email: ${process.env.EMAIL_FROM}</li>
                            </ul>
                        </div>
                        <p style="color: #666; font-size: 14px; margin-top: 30px;">
                            This is an automated test email from Enromatics Backend.
                        </p>
                    </div>
                </div>
            `
        });

        console.log('✅ Test email sent successfully!');
        console.log(`   Message ID: ${info.messageId}`);
        console.log(`   Recipient: ${process.env.SUPER_ADMIN_EMAIL || 'piyush@pixelsdigital.tech'}`);
        console.log('\n🎉 SMTP CONFIGURATION IS WORKING CORRECTLY!\n');

    } catch (error) {
        console.error('❌ SMTP TEST FAILED:');
        console.error(`   Error: ${error.message}`);
        
        if (error.code === 'EAUTH') {
            console.error('\n💡 Authentication failed. Please check:');
            console.error('   1. SMTP_USER is correct (should be "emailapikey")');
            console.error('   2. SMTP_PASSWORD is the correct API key from Zeptomail');
            console.error('   3. The API key has not been revoked');
        } else if (error.code === 'ECONNECTION') {
            console.error('\n💡 Connection failed. Please check:');
            console.error('   1. SMTP_HOST is correct (smtp.zeptomail.in)');
            console.error('   2. SMTP_PORT is correct (587)');
            console.error('   3. Your network allows outbound SMTP connections');
        } else if (error.responseCode === 550) {
            console.error('\n💡 Email rejected. Please check:');
            console.error('   1. EMAIL_FROM domain is verified in Zeptomail');
            console.error('   2. The sender email is authorized');
        }
        
        console.error('\n📝 Full error details:');
        console.error(error);
        process.exit(1);
    }
}

testEmail();
