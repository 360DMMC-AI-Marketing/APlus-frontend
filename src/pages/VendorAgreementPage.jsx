import React from 'react';
import { FileText, Handshake } from 'lucide-react';

const VendorAgreementPage = () => {
  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Handshake className="w-8 h-8 text-secondary" />
          </div>
          <h1 className="text-4xl font-display text-secondary mb-4">Vendor Agreement</h1>
          <p className="text-gray-600">Last updated: December 2024</p>
        </div>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <p className="text-gray-700 leading-relaxed">
              This Vendor Agreement ("Agreement") is entered into between APlusMedDepot ("Platform", "we", "us") and the vendor ("Vendor", "you") accessing our B2B medical supply marketplace.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-secondary mb-4">1. Vendor Qualification</h2>
            <p className="text-gray-700 mb-3">To become an approved vendor, you must:</p>
            <ul className="text-gray-700 space-y-2">
              <li>Maintain valid business licenses and certifications</li>
              <li>Provide accurate Tax ID/EIN information</li>
              <li>Meet FDA registration requirements (where applicable)</li>
              <li>Pass our AI-powered verification process</li>
              <li>Comply with OIG LEIE and GSA exclusion screenings</li>
              <li>Maintain appropriate insurance coverage</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-secondary mb-4">2. Product Listings</h2>
            <p className="text-gray-700 mb-3">Vendors agree to:</p>
            <ul className="text-gray-700 space-y-2">
              <li>Provide accurate product descriptions, images, and specifications</li>
              <li>Maintain current inventory levels in the system</li>
              <li>Display correct pricing and availability</li>
              <li>Include all required FDA registration numbers and compliance information</li>
              <li>Ensure products meet all applicable regulatory standards</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-secondary mb-4">3. Order Fulfillment</h2>
            <p className="text-gray-700 mb-3">Vendors must:</p>
            <ul className="text-gray-700 space-y-2">
              <li>Ship orders within the timeframe specified in product listings</li>
              <li>Use appropriate packaging for medical supplies</li>
              <li>Provide tracking information for all shipments</li>
              <li>Handle returns and refunds according to our return policy</li>
              <li>Maintain quality standards for all products shipped</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-secondary mb-4">4. Commission Structure</h2>
            <p className="text-gray-700 mb-3">
              Vendors agree to pay commission fees as outlined in our Commission Policy (see separate document). Standard rates apply unless a custom agreement has been negotiated.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-secondary mb-4">5. Payment Terms</h2>
            <p className="text-gray-700 mb-3">
              Platform will remit payment to vendors on a bi-weekly basis for completed transactions, minus applicable commission fees and any chargebacks or returns.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-secondary mb-4">6. Quality Control</h2>
            <p className="text-gray-700">
              APlusMedDepot reserves the right to remove or deactivate product listings that do not meet quality standards, violate regulations, or receive customer complaints, without prior notice to the vendor.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-secondary mb-4">7. Compliance</h2>
            <p className="text-gray-700 mb-3">Vendors must:</p>
            <ul className="text-gray-700 space-y-2">
              <li>Maintain all required licenses and certifications</li>
              <li>Notify Platform immediately of any compliance issues</li>
              <li>Undergo periodic re-verification as required</li>
              <li>Comply with all applicable federal, state, and local regulations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-secondary mb-4">8. Termination</h2>
            <p className="text-gray-700">
              Either party may terminate this agreement with 30 days written notice. Platform may immediately terminate vendor access for violations of this agreement, compliance failures, or fraudulent activity.
            </p>
          </section>

          <section className="mb-8 bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold text-secondary m-0">Contact</h2>
            </div>
            <p className="text-gray-700 mb-3">For questions about this Vendor Agreement:</p>
            <div className="text-gray-700 space-y-2">
              <p><strong>Email:</strong> <a href="mailto:vendors@aplusmeddepot.com" className="text-primary hover:underline">vendors@aplusmeddepot.com</a></p>
              <p><strong>Phone:</strong> <a href="tel:1-800-555-0199" className="text-primary hover:underline">1-800-555-0199</a></p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default VendorAgreementPage;
