import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Enromatics",
  description: "Terms of Service for Enromatics social media analytics platform",
};

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
      <p className="text-sm text-gray-600 mb-8">
        <strong>Effective Date:</strong> November 22, 2024<br />
        <strong>Last Updated:</strong> November 22, 2024
      </p>

      <div className="prose prose-lg max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p>
            Welcome to Enromatics. These Terms of Service (&ldquo;Terms&rdquo;) govern your use of our social media analytics platform and services. By accessing or using our services, you agree to be bound by these Terms.
          </p>
          <p>
            If you do not agree to these Terms, please do not use our services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
          <p>Enromatics provides:</p>
          <ul className="list-disc ml-6">
            <li>Social media analytics and reporting dashboard</li>
            <li>Facebook and Instagram campaign management tools</li>
            <li>WhatsApp Business messaging integration</li>
            <li>Marketing API data analysis and insights</li>
            <li>Customer relationship management features</li>
            <li>Multi-tenant business management platform</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. User Accounts and Registration</h2>
          
          <h3 className="text-xl font-semibold mb-3">3.1 Account Creation</h3>
          <ul className="list-disc ml-6">
            <li>You must provide accurate and complete information during registration</li>
            <li>You are responsible for maintaining the confidentiality of your account credentials</li>
            <li>You must notify us immediately of any unauthorized use of your account</li>
            <li>You must be at least 18 years old to create an account</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">3.2 Account Types</h3>
          <ul className="list-disc ml-6">
            <li><strong>Super Admin:</strong> Full platform access and management</li>
            <li><strong>Admin:</strong> Business account management and user oversight</li>
            <li><strong>User:</strong> Standard platform access and features</li>
            <li><strong>Student:</strong> Limited access for educational purposes</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use Policy</h2>
          
          <h3 className="text-xl font-semibold mb-3">4.1 Permitted Uses</h3>
          <ul className="list-disc ml-6">
            <li>Use our services for legitimate business purposes</li>
            <li>Connect your own social media accounts and data</li>
            <li>Generate reports and analytics for your business</li>
            <li>Manage your marketing campaigns and communications</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">4.2 Prohibited Uses</h3>
          <p>You agree NOT to:</p>
          <ul className="list-disc ml-6">
            <li>Use our services for illegal activities or spam</li>
            <li>Attempt to gain unauthorized access to other accounts</li>
            <li>Reverse engineer or attempt to extract our source code</li>
            <li>Use automated tools to scrape or harvest data</li>
            <li>Violate Facebook, Instagram, or WhatsApp terms of service</li>
            <li>Send unsolicited marketing messages without proper consent</li>
            <li>Share or sell access to your account</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Third-Party Integrations</h2>
          
          <h3 className="text-xl font-semibold mb-3">5.1 Facebook/Meta Services</h3>
          <p>Your use of Facebook, Instagram, and WhatsApp integrations is subject to:</p>
          <ul className="list-disc ml-6">
            <li>Meta Terms of Service</li>
            <li>Facebook Platform Policy</li>
            <li>WhatsApp Business API Terms</li>
            <li>Instagram API Terms of Use</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">5.2 API Usage</h3>
          <ul className="list-disc ml-6">
            <li>We use official APIs and comply with rate limits</li>
            <li>API access may be subject to third-party availability</li>
            <li>Changes in third-party APIs may affect service functionality</li>
            <li>You must have proper permissions for connected accounts</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Data and Privacy</h2>
          
          <h3 className="text-xl font-semibold mb-3">6.1 Your Data</h3>
          <ul className="list-disc ml-6">
            <li>You retain ownership of your business data</li>
            <li>We process your data according to our Privacy Policy</li>
            <li>You can export or delete your data at any time</li>
            <li>We implement security measures to protect your data</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">6.2 Data Accuracy</h3>
          <ul className="list-disc ml-6">
            <li>We strive to provide accurate analytics and reporting</li>
            <li>Data accuracy depends on third-party API reliability</li>
            <li>We are not liable for decisions made based on reported data</li>
            <li>You should verify important data independently</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Subscription and Billing</h2>
          
          <h3 className="text-xl font-semibold mb-3">7.1 Service Plans</h3>
          <ul className="list-disc ml-6">
            <li>Various subscription tiers with different features</li>
            <li>Billing cycles: monthly or annual</li>
            <li>Pricing subject to change with notice</li>
            <li>Free trial periods may be available</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">7.2 Payment Terms</h3>
          <ul className="list-disc ml-6">
            <li>Payment due in advance for subscription periods</li>
            <li>Automatic renewal unless cancelled</li>
            <li>No refunds for partial periods or unused features</li>
            <li>Late payments may result in service suspension</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Intellectual Property</h2>
          
          <h3 className="text-xl font-semibold mb-3">8.1 Our Rights</h3>
          <ul className="list-disc ml-6">
            <li>Enromatics platform and software are our proprietary property</li>
            <li>All trademarks, logos, and branding are owned by us</li>
            <li>You receive a limited license to use our services</li>
            <li>No rights are granted beyond what&apos;s specified in these Terms</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">8.2 Your Rights</h3>
          <ul className="list-disc ml-6">
            <li>You retain ownership of your content and data</li>
            <li>You grant us permission to process your data for service delivery</li>
            <li>You represent that you have rights to all content you upload</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Service Availability</h2>
          
          <h3 className="text-xl font-semibold mb-3">9.1 Uptime</h3>
          <ul className="list-disc ml-6">
            <li>We strive for high availability but cannot guarantee 100% uptime</li>
            <li>Scheduled maintenance may temporarily interrupt service</li>
            <li>We will provide notice of planned maintenance when possible</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">9.2 Service Modifications</h3>
          <ul className="list-disc ml-6">
            <li>We may modify or discontinue features with notice</li>
            <li>Major changes will be communicated in advance</li>
            <li>We may add new features to improve the service</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Limitation of Liability</h2>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
            <p className="font-semibold">Important Legal Notice</p>
            <p className="text-sm">Please read this section carefully as it limits our liability to you.</p>
          </div>

          <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</p>
          <ul className="list-disc ml-6">
            <li>Our total liability shall not exceed the amount paid by you in the past 12 months</li>
            <li>We are not liable for indirect, incidental, or consequential damages</li>
            <li>We provide the service &ldquo;as is&rdquo; without warranties</li>
            <li>We are not responsible for third-party service interruptions</li>
            <li>You use our service at your own risk</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">11. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless Enromatics from any claims, damages, or expenses arising from:
          </p>
          <ul className="list-disc ml-6">
            <li>Your violation of these Terms</li>
            <li>Your violation of third-party rights</li>
            <li>Your use of connected social media accounts</li>
            <li>Any content you submit or share through our service</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">12. Termination</h2>
          
          <h3 className="text-xl font-semibold mb-3">12.1 Termination by You</h3>
          <ul className="list-disc ml-6">
            <li>You may terminate your account at any time</li>
            <li>Cancel subscriptions through your account settings</li>
            <li>Data export available before account deletion</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">12.2 Termination by Us</h3>
          <ul className="list-disc ml-6">
            <li>We may suspend or terminate accounts for Terms violations</li>
            <li>Non-payment may result in service suspension</li>
            <li>We will provide reasonable notice when possible</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">13. Changes to Terms</h2>
          <p>
            We may update these Terms from time to time. Material changes will be communicated via:
          </p>
          <ul className="list-disc ml-6">
            <li>Email notification to registered users</li>
            <li>Notice on our website and platform</li>
            <li>In-app notifications</li>
          </ul>
          <p className="mt-4">
            Continued use of our service after changes constitutes acceptance of new Terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">14. Governing Law</h2>
          <p>
            These Terms are governed by and construed in accordance with applicable laws. 
            Any disputes shall be resolved through binding arbitration or in the appropriate courts.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">15. Contact Information</h2>
          <p>For questions about these Terms or our services:</p>
          <div className="bg-gray-50 p-4 rounded-lg mt-4">
            <p><strong>Email:</strong> legal@enromatics.com</p>
            <p><strong>Website:</strong> <a href="https://enromatics.com" className="text-primary hover:underline">https://enromatics.com</a></p>
            <p><strong>Support:</strong> support@enromatics.com</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">16. Miscellaneous</h2>
          
          <h3 className="text-xl font-semibold mb-3">16.1 Severability</h3>
          <p>If any provision of these Terms is found unenforceable, the remaining provisions remain in effect.</p>

          <h3 className="text-xl font-semibold mb-3 mt-6">16.2 Entire Agreement</h3>
          <p>These Terms, along with our Privacy Policy, constitute the entire agreement between you and Enromatics.</p>

          <h3 className="text-xl font-semibold mb-3 mt-6">16.3 Assignment</h3>
          <p>We may assign our rights and obligations under these Terms. You may not assign your rights without our written consent.</p>
        </section>

        <div className="border-t pt-6 mt-12">
          <p className="text-sm text-gray-600">
            <strong>Last Updated:</strong> November 22, 2024<br />
            <strong>Version:</strong> 1.0
          </p>
          <p className="text-sm text-gray-600 mt-4">
            © 2024 Enromatics. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}