import dotenv from 'dotenv';

dotenv.config();

console.log('🧪 Testing ZeptoMail API...\n');

const testEmail = async () => {
    try {
        const response = await fetch('https://api.zeptomail.in/v1.1/email', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': process.env.ZEPTOMAIL_API_TOKEN
            },
            body: JSON.stringify({
                from: {
                    address: process.env.EMAIL_FROM,
                    name: 'Enromatics Test'
                },
                to: [
                    {
                        email_address: {
                            address: 'mpiyush2727@gmail.com',
                            name: 'Test User'
                        }
                    }
                ],
                subject: '🎉 ZeptoMail API Test - Railway Compatible!',
                htmlbody: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #10b981;">✅ Success! ZeptoMail API is Working</h2>
                        <p>This email was sent using ZeptoMail's HTTP API, which works perfectly on:</p>
                        <ul>
                            <li>✅ Railway</li>
                            <li>✅ Vercel</li>
                            <li>✅ AWS Lambda</li>
                            <li>✅ Any serverless platform</li>
                        </ul>
                        <p><strong>No more SMTP port blocking issues!</strong></p>
                        <p>Sent at: ${new Date().toLocaleString()}</p>
                    </div>
                `
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('❌ API Error:', data);
            console.error('Status:', response.status);
            throw new Error(data.message || 'Failed to send email');
        }

        console.log('✅ Email sent successfully!');
        console.log('📧 Response:', data);
        console.log('\n🎯 Check your inbox: mpiyush2727@gmail.com');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('\n💡 Make sure:');
        console.error('   1. ZEPTOMAIL_API_TOKEN is set in .env');
        console.error('   2. Token format: Zoho-enczapikey YOUR_KEY');
        console.error('   3. Domain is verified in ZeptoMail dashboard');
    }
};

testEmail();
