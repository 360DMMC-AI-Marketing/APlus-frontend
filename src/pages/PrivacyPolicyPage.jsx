import React from 'react';
import { Shield, Lock, Eye, Database, Mail } from 'lucide-react';

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-display text-secondary mb-4">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: December 2024</p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          
          {/* Introduction */}
          <section className="mb-8">
            <p className="text-gray-700 leading-relaxed">
              At APlusMedDepot, we are committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website 
              and use our services.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold text-secondary m-0">Information We Collect</h2>
            </div>
            
            <h3 className="text-xl font-semibold text-secondary mt-6 mb-3">Personal Information</h3>
            <p className="text-gray-700 mb-3">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="text-gray-700 space-y-2">
              <li>Name, email address, and phone number</li>
              <li>Billing and shipping addresses</li>
              <li>Payment information (processed securely through our payment providers)</li>
              <li>Account credentials (username and password)</li>
              <li>Business information (for vendor accounts)</li>
            </ul>

            <h3 className="text-xl font-semibold text-secondary mt-6 mb-3">Automatically Collected Information</h3>
            <ul className="text-gray-700 space-y-2">
              <li>Device and browser information</li>
              <li>IP address and location data</li>
              <li>Cookies and similar tracking technologies</li>
              <li>Usage data and analytics</li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold text-secondary m-0">How We Use Your Information</h2>
            </div>
            <p className="text-gray-700 mb-3">We use the information we collect to:</p>
            <ul className="text-gray-700 space-y-2">
              <li>Process and fulfill your orders</li>
              <li>Communicate with you about your orders and account</li>
              <li>Provide customer support and respond to inquiries</li>
              <li>Improve our website and services</li>
              <li>Send marketing communications (with your consent)</li>
              <li>Detect and prevent fraud and security threats</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          {/* Information Sharing */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-secondary mb-4">Information Sharing and Disclosure</h2>
            <p className="text-gray-700 mb-3">
              We do not sell your personal information. We may share your information with:
            </p>
            <ul className="text-gray-700 space-y-2">
              <li><strong>Vendors:</strong> To fulfill your orders</li>
              <li><strong>Service Providers:</strong> Payment processors, shipping companies, and analytics providers</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, sale, or acquisition</li>
            </ul>
          </section>

          {/* Data Security */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold text-secondary m-0">Data Security</h2>
            </div>
            <p className="text-gray-700">
              We implement appropriate technical and organizational security measures to protect your personal information, including:
            </p>
            <ul className="text-gray-700 space-y-2 mt-3">
              <li>SSL/TLS encryption for data transmission</li>
              <li>Secure payment processing through trusted providers</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and authentication</li>
              <li>Employee training on data protection</li>
            </ul>
          </section>

          {/* Your Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-secondary mb-4">Your Privacy Rights</h2>
            <p className="text-gray-700 mb-3">Depending on your location, you may have the following rights:</p>
            <ul className="text-gray-700 space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal information</li>
              <li><strong>Correction:</strong> Request corrections to inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Data Portability:</strong> Receive your data in a portable format</li>
            </ul>
            <p className="text-gray-700 mt-4">
              To exercise these rights, please contact us at{' '}
              <a href="mailto:privacy@aplusmeddepot.com" className="text-primary hover:underline">
                privacy@aplusmeddepot.com
              </a>
            </p>
          </section>

          {/* Cookies */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-secondary mb-4">Cookies and Tracking</h2>
            <p className="text-gray-700">
              We use cookies and similar technologies to enhance your experience, analyze usage, and deliver personalized content. 
              You can manage cookie preferences through your browser settings.
            </p>
          </section>

          {/* Third-Party Links */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-secondary mb-4">Third-Party Links</h2>
            <p className="text-gray-700">
              Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. 
              We encourage you to review their privacy policies.
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-secondary mb-4">Children's Privacy</h2>
            <p className="text-gray-700">
              Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. 
              If you believe we have collected information from a child, please contact us immediately.
            </p>
          </section>

          {/* Changes to Policy */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-secondary mb-4">Changes to This Policy</h2>
            <p className="text-gray-700">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page 
              and updating the "Last updated" date.
            </p>
          </section>

          {/* Contact */}
          <section className="mb-8 bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold text-secondary m-0">Contact Us</h2>
            </div>
            <p className="text-gray-700 mb-3">
              If you have questions or concerns about this Privacy Policy, please contact us:
            </p>
            <div className="text-gray-700 space-y-2">
              <p><strong>Email:</strong> <a href="mailto:privacy@aplusmeddepot.com" className="text-primary hover:underline">privacy@aplusmeddepot.com</a></p>
              <p><strong>Phone:</strong> <a href="tel:1-800-555-0199" className="text-primary hover:underline">1-800-555-0199</a></p>
              <p><strong>Address:</strong> 123 Medical Plaza, Suite 100, Chicago, IL 60007</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
