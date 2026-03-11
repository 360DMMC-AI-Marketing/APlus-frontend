import React from 'react';
import { FileText, AlertCircle, ShieldCheck, CreditCard } from 'lucide-react';

const TermsOfServicePage = () => {
  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-secondary" />
          </div>
          <h1 className="text-4xl font-display text-secondary mb-4">Terms of Service</h1>
          <p className="text-gray-600">Last updated: December 2024</p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          
          {/* Introduction */}
          <section className="mb-8">
            <p className="text-gray-700 leading-relaxed">
              Welcome to APlusMedDepot. By accessing or using our website and services, you agree to be bound by these Terms of Service. 
              Please read them carefully before using our platform.
            </p>
          </section>

          {/* Acceptance of Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-secondary mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700">
              By creating an account, placing an order, or otherwise using APlusMedDepot's services, you acknowledge that you have read, 
              understood, and agree to be bound by these Terms of Service and our Privacy Policy.
            </p>
          </section>

          {/* Eligibility */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-secondary mb-4">2. Eligibility</h2>
            <p className="text-gray-700 mb-3">To use our services, you must:</p>
            <ul className="text-gray-700 space-y-2">
              <li>Be at least 18 years of age</li>
              <li>Have the legal authority to enter into binding contracts</li>
              <li>Not be prohibited from using our services under applicable law</li>
              <li>Provide accurate and complete registration information</li>
            </ul>
          </section>

          {/* Account Responsibilities */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-secondary mb-4">3. Account Responsibilities</h2>
            <p className="text-gray-700 mb-3">You are responsible for:</p>
            <ul className="text-gray-700 space-y-2">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized access</li>
              <li>Providing accurate and current information</li>
              <li>Complying with all applicable laws and regulations</li>
            </ul>
          </section>

          {/* Product Information */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold text-secondary m-0">4. Product Information and Orders</h2>
            </div>
            
            <h3 className="text-xl font-semibold text-secondary mt-6 mb-3">Product Accuracy</h3>
            <p className="text-gray-700">
              We strive to provide accurate product descriptions, images, and pricing. However, we do not warrant that product descriptions, 
              images, pricing, or other content is accurate, complete, reliable, current, or error-free.
            </p>

            <h3 className="text-xl font-semibold text-secondary mt-6 mb-3">Order Acceptance</h3>
            <p className="text-gray-700 mb-3">
              We reserve the right to:
            </p>
            <ul className="text-gray-700 space-y-2">
              <li>Refuse or cancel any order for any reason</li>
              <li>Limit quantities purchased per person or order</li>
              <li>Verify information before processing orders</li>
              <li>Correct pricing errors at any time</li>
            </ul>
          </section>

          {/* Pricing and Payment */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold text-secondary m-0">5. Pricing and Payment</h2>
            </div>
            <p className="text-gray-700 mb-3">All prices are in USD and subject to change without notice. You agree to:</p>
            <ul className="text-gray-700 space-y-2">
              <li>Pay all charges at the prices in effect when you place your order</li>
              <li>Provide current, complete, and accurate payment information</li>
              <li>Pay applicable taxes and shipping fees</li>
              <li>Authorize us to charge your payment method for all purchases</li>
            </ul>
          </section>

          {/* Shipping and Delivery */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-secondary mb-4">6. Shipping and Delivery</h2>
            <p className="text-gray-700">
              Shipping times are estimates only and may vary. We are not responsible for delays caused by shipping carriers, 
              customs, or events beyond our control. Title and risk of loss pass to you upon delivery to the carrier.
            </p>
          </section>

          {/* Returns and Refunds */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-secondary mb-4">7. Returns and Refunds</h2>
            <p className="text-gray-700 mb-3">
              Our return policy allows for returns within 30 days of delivery for most products. Medical supplies may have 
              specific return restrictions due to health and safety regulations.
            </p>
            <ul className="text-gray-700 space-y-2">
              <li>Products must be unused and in original packaging</li>
              <li>Some items may be non-returnable for safety reasons</li>
              <li>Refunds will be issued to the original payment method</li>
              <li>Shipping costs are non-refundable unless the return is due to our error</li>
            </ul>
          </section>

          {/* Vendor Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-secondary mb-4">8. Vendor Terms</h2>
            <p className="text-gray-700 mb-3">If you register as a vendor, you additionally agree to:</p>
            <ul className="text-gray-700 space-y-2">
              <li>Provide accurate business and tax information</li>
              <li>Comply with all applicable medical supply regulations</li>
              <li>Maintain appropriate licenses and certifications</li>
              <li>Fulfill orders promptly and professionally</li>
              <li>Pay commission fees as outlined in the vendor agreement</li>
              <li>Provide quality products that match your listings</li>
            </ul>
          </section>

          {/* Prohibited Uses */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold text-secondary m-0">9. Prohibited Uses</h2>
            </div>
            <p className="text-gray-700 mb-3">You may not:</p>
            <ul className="text-gray-700 space-y-2">
              <li>Use our services for any illegal purpose</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Transmit harmful code, viruses, or malware</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Engage in fraudulent activities</li>
              <li>Harass, abuse, or harm others</li>
              <li>Scrape or copy content without permission</li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-secondary mb-4">10. Intellectual Property</h2>
            <p className="text-gray-700">
              All content on APlusMedDepot, including text, graphics, logos, images, and software, is the property of APlusMedDepot 
              or its licensors and is protected by copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-secondary mb-4">11. Limitation of Liability</h2>
            <p className="text-gray-700">
              To the fullest extent permitted by law, APlusMedDepot shall not be liable for any indirect, incidental, special, 
              consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly.
            </p>
          </section>

          {/* Indemnification */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-secondary mb-4">12. Indemnification</h2>
            <p className="text-gray-700">
              You agree to indemnify and hold harmless APlusMedDepot and its affiliates, officers, directors, employees, and agents 
              from any claims, damages, losses, liabilities, and expenses arising from your use of our services or violation of these Terms.
            </p>
          </section>

          {/* Modifications */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-secondary mb-4">13. Modifications to Terms</h2>
            <p className="text-gray-700">
              We reserve the right to modify these Terms at any time. We will notify users of material changes. 
              Your continued use of our services after changes constitutes acceptance of the modified Terms.
            </p>
          </section>

          {/* Governing Law */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-secondary mb-4">14. Governing Law</h2>
            <p className="text-gray-700">
              These Terms shall be governed by and construed in accordance with the laws of the State of Illinois, 
              without regard to its conflict of law provisions.
            </p>
          </section>

          {/* Dispute Resolution */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-secondary mb-4">15. Dispute Resolution</h2>
            <p className="text-gray-700">
              Any disputes arising from these Terms or your use of our services shall be resolved through binding arbitration, 
              except where prohibited by law.
            </p>
          </section>

          {/* Contact */}
          <section className="mb-8 bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
            <h2 className="text-2xl font-semibold text-secondary mb-4">16. Contact Information</h2>
            <p className="text-gray-700 mb-3">
              For questions about these Terms of Service, please contact us:
            </p>
            <div className="text-gray-700 space-y-2">
              <p><strong>Email:</strong> <a href="mailto:legal@aplusmeddepot.com" className="text-primary hover:underline">legal@aplusmeddepot.com</a></p>
              <p><strong>Phone:</strong> <a href="tel:1-800-555-0199" className="text-primary hover:underline">1-800-555-0199</a></p>
              <p><strong>Address:</strong> 123 Medical Plaza, Suite 100, Chicago, IL 60007</p>
            </div>
          </section>

          {/* Acceptance */}
          <section className="mb-8 bg-secondary/5 rounded-xl p-6 border-2 border-secondary/20">
            <p className="text-gray-700 m-0">
              <strong>By using APlusMedDepot, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</strong>
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
