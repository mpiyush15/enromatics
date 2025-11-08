import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Pixels Digital",
  description: "Privacy Policy for Pixels Digital platform",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
      <p className="text-sm text-gray-600 mb-8">
        <strong>Effective Date:</strong> November 1, 2025<br />
        <strong>Last Updated:</strong> November 1, 2025
      </p>

      <div className="prose prose-lg max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
          <p>
            Welcome to Pixels Digital (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;). We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform and services.
          </p>
          <p>
            By using our services, you agree to the collection and use of information in accordance with this Privacy Policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
          
          <h3 className="text-xl font-semibold mb-3">1.1 Information You Provide</h3>
          
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Account Information:</h4>
            <ul className="list-disc ml-6">
              <li>Username and email address</li>
              <li>Business name and details</li>
              <li>Password (encrypted and securely stored)</li>
              <li>Contact information</li>
            </ul>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold mb-2">Facebook Business Connection:</h4>
            <ul className="list-disc ml-6">
              <li>Facebook account information (name, email, user ID)</li>
              <li>Business Manager account details</li>
              <li>WhatsApp Business Account information</li>
              <li>Meta Ads account information</li>
              <li>Permissions and access tokens</li>
            </ul>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold mb-2">WhatsApp Data:</h4>
            <ul className="list-disc ml-6">
              <li>WhatsApp Business phone number</li>
              <li>Contact lists and customer information</li>
              <li>Message content (sent and received)</li>
              <li>Message templates and campaigns</li>
              <li>Delivery and read receipts</li>
            </ul>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold mb-2">Meta Ads Data:</h4>
            <ul className="list-disc ml-6">
              <li>Ad account information</li>
              <li>Campaign data and performance metrics</li>
              <li>Ad spend and budget information</li>
              <li>Audience insights and demographics</li>
            </ul>
          </div>

          <h3 className="text-xl font-semibold mb-3 mt-6">1.2 Automatically Collected Information</h3>
          <p>We automatically collect certain information when you use our platform, including:</p>
          <ul className="list-disc ml-6">
            <li>IP address and browser type</li>
            <li>Device information</li>
            <li>Pages visited and features used</li>
            <li>Time and date of access</li>
            <li>Session cookies for authentication</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
          
          <h3 className="text-xl font-semibold mb-3">2.1 Service Delivery</h3>
          <ul className="list-disc ml-6">
            <li>Provide and maintain our platform services</li>
            <li>Enable WhatsApp messaging functionality</li>
            <li>Display Meta Ads campaign data and insights</li>
            <li>Process and deliver notifications</li>
            <li>Manage your account and subscriptions</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">2.2 Communication</h3>
          <ul className="list-disc ml-6">
            <li>Send transactional emails and notifications</li>
            <li>Provide customer support</li>
            <li>Respond to your inquiries</li>
            <li>Send important service updates</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">2.3 Security and Compliance</h3>
          <ul className="list-disc ml-6">
            <li>Prevent fraud and unauthorized access</li>
            <li>Enforce our Terms of Service</li>
            <li>Comply with legal obligations</li>
            <li>Protect user rights and safety</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Data Storage and Security</h2>
          
          <h3 className="text-xl font-semibold mb-3">3.1 Security Measures</h3>
          <ul className="list-disc ml-6">
            <li>Industry-standard encryption (SSL/TLS)</li>
            <li>Secure authentication with NextAuth.js</li>
            <li>Password hashing using bcrypt</li>
            <li>Multi-tenant data isolation</li>
            <li>Regular security audits and updates</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">3.2 Data Retention</h3>
          <ul className="list-disc ml-6">
            <li>Account data retained while your account is active</li>
            <li>WhatsApp message data retained for 90 days (configurable)</li>
            <li>Meta Ads data cached for 30 days</li>
            <li>Deleted account data purged within 30 days</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Third-Party Services</h2>
          
          <h3 className="text-xl font-semibold mb-3">4.1 Facebook/Meta Integration</h3>
          <p>We integrate with Facebook/Meta services to provide WhatsApp and Ads management functionality. Your use of these features is subject to:</p>
          <ul className="list-disc ml-6">
            <li><a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Facebook&apos;s Data Policy</a></li>
            <li><a href="https://business.whatsapp.com/policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">WhatsApp Business Policy</a></li>
            <li><a href="https://www.facebook.com/terms.php" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Meta Terms of Service</a></li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Data Sharing and Disclosure</h2>
          
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
            <p className="font-semibold">We Do NOT Sell Your Data</p>
            <p className="text-sm">We do not sell, rent, or trade your personal information to third parties for marketing purposes.</p>
          </div>

          <h3 className="text-xl font-semibold mb-3">We May Share Information With:</h3>
          <ul className="list-disc ml-6">
            <li><strong>Service Providers:</strong> Cloud hosting (Vercel, MongoDB), email services, analytics</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            <li><strong>With Your Consent:</strong> When you explicitly authorize data sharing</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Your Rights and Choices</h2>
          
          <p className="mb-4">You have the right to:</p>
          <ul className="list-disc ml-6">
            <li>Access your personal data</li>
            <li>Update or correct your information</li>
            <li>Delete your account and data</li>
            <li>Export your data (data portability)</li>
            <li>Opt-out of non-essential communications</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">How to Exercise Your Rights:</h3>
          <ul className="list-disc ml-6">
            <li><strong>Account Settings:</strong> Update information in your dashboard</li>
            <li><strong>Contact Us:</strong> Email info@pixelsdigital.com</li>
            <li><strong>Delete Account:</strong> Use account deletion feature or contact support</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Multi-Tenant Data Isolation</h2>
          <p>We operate a multi-tenant platform where:</p>
          <ul className="list-disc ml-6">
            <li>Each business account (tenant) has isolated data</li>
            <li>Tenant data is segregated using unique identifiers</li>
            <li>No tenant can access another tenant&apos;s data</li>
            <li>Administrative access is strictly controlled</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated effective date. We encourage you to review this policy periodically.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
          <p>If you have questions, concerns, or requests regarding this Privacy Policy:</p>
          <div className="bg-gray-50 p-4 rounded-lg mt-4">
            <p><strong>Email:</strong> info@pixelsdigital.com</p>
            <p><strong>Website:</strong> <a href="https://pixelsagency.vercel.app" className="text-primary hover:underline">https://pixelsagency.vercel.app</a></p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Legal Compliance</h2>
          
          <h3 className="text-xl font-semibold mb-3">GDPR Compliance (EU Users)</h3>
          <p>Under GDPR, you have rights to access, rectify, erase, restrict processing, data portability, object to processing, and withdraw consent.</p>

          <h3 className="text-xl font-semibold mb-3 mt-6">CCPA Compliance (California Users)</h3>
          <p>California residents have rights to know what data is collected, opt-out of sale, access data, and request deletion.</p>

          <h3 className="text-xl font-semibold mb-3 mt-6">India IT Rules Compliance</h3>
          <p>We comply with Information Technology Act, 2000 and associated rules for Indian users.</p>
        </section>

        <div className="border-t pt-6 mt-12">
          <p className="text-sm text-gray-600">
            <strong>Last Updated:</strong> November 1, 2025<br />
            <strong>Version:</strong> 1.0
          </p>
          <p className="text-sm text-gray-600 mt-4">
            © 2025 Pixels Digital. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
