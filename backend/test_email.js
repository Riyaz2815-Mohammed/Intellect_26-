// Test EmailJS Configuration
// Run this in backend directory: node test_email.js

require('dotenv').config();

console.log('=== EmailJS Configuration Test ===\n');

console.log('EMAILJS_SERVICE_ID:', process.env.EMAILJS_SERVICE_ID || '❌ NOT LOADED');
console.log('EMAILJS_TEMPLATE_ID:', process.env.EMAILJS_TEMPLATE_ID || '❌ NOT LOADED');
console.log('EMAILJS_PUBLIC_KEY:', process.env.EMAILJS_PUBLIC_KEY || '❌ NOT LOADED');
console.log('EMAILJS_PRIVATE_KEY:', process.env.EMAILJS_PRIVATE_KEY ? '✅ LOADED (hidden)' : '❌ NOT LOADED');

console.log('\n=== Test Email Sending ===\n');

async function testEmail() {
    try {
        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                service_id: process.env.EMAILJS_SERVICE_ID,
                template_id: process.env.EMAILJS_TEMPLATE_ID,
                user_id: process.env.EMAILJS_PUBLIC_KEY,
                accessToken: process.env.EMAILJS_PRIVATE_KEY,
                template_params: {
                    to_email: 'test@example.com', // Change this to your email
                    team_name: 'Test Team',
                    code: 'TEST-1234',
                    round: 4,
                    subject: '🎁 TEST EMAIL - Advantage Code',
                    message: 'This is a test email from CODECRYPT system.'
                }
            })
        });

        if (response.ok) {
            console.log('✅ Email sent successfully!');
            console.log('Check your inbox (and spam folder)');
        } else {
            const error = await response.text();
            console.error('❌ Email failed:', response.status, error);
        }
    } catch (error) {
        console.error('❌ Network error:', error.message);
    }
}

testEmail();
