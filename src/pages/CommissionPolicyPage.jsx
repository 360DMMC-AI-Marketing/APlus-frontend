import React from 'react';
import { DollarSign, TrendingUp } from 'lucide-react';

const CommissionPolicyPage = () => {
  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-display text-secondary mb-4">Commission Policy</h1>
          <p className="text-gray-600">Last updated: December 2024</p>
        </div>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <p className="text-gray-700 leading-relaxed">
              This Commission Policy outlines the fee structure for vendors selling on the APlusMedDepot platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-secondary mb-4">Standard Commission Rates</h2>
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-4">
              <p className="text-lg font-semibold text-secondary mb-3">Default Rate: 10%</p>
              <p className="text-gray-700 text-sm">
                All vendors are charged a 10% commission on gross sales (excluding shipping fees and sales tax) unless otherwise specified in a custom agreement.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-secondary mb-4">Category-Specific Rates</h2>
            <p className="text-gray-700 mb-4">Commission rates may vary by product category:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-2 border-gray-200 rounded-lg p-4">
                <p className="font-semibold text-secondary">Consumables & PPE</p>
                <p className="text-2xl font-bold text-primary">10%</p>
              </div>
              <div className="border-2 border-gray-200 rounded-lg p-4">
                <p className="font-semibold text-secondary">Diagnostic Equipment</p>
                <p className="text-2xl font-bold text-primary">12%</p>
              </div>
              <div className="border-2 border-gray-200 rounded-lg p-4">
                <p className="font-semibold text-secondary">Surgical Supplies</p>
                <p className="text-2xl font-bold text-primary">10%</p>
              </div>
              <div className="border-2 border-gray-200 rounded-lg p-4">
                <p className="font-semibold text-secondary">Laboratory Equipment</p>
                <p className="text-2xl font-bold text-primary">12%</p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-secondary mb-4">Founding Partner Program</h2>
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <p className="text-lg font-semibold text-secondary m-0">Reduced Rate: 5%</p>
              </div>
              <p className="text-gray-700 text-sm mb-3">
                Early vendors who join during our launch phase qualify for a reduced 5% commission rate for the first 12 months.
              </p>
              <p className="text-xs text-gray-600">
                Subject to approval and specific terms outlined in individual vendor agreements.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-secondary mb-4">Payment Schedule</h2>
            <p className="text-gray-700 mb-3">Commission calculations and payments:</p>
            <ul className="text-gray-700 space-y-2">
              <li><strong>Calculation:</strong> Commission is calculated on gross sales minus returns and chargebacks</li>
              <li><strong>Payment Frequency:</strong> Bi-weekly (every two weeks)</li>
              <li><strong>Payment Method:</strong> Direct deposit to vendor's bank account</li>
              <li><strong>Reporting:</strong> Detailed commission statements provided with each payment</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-secondary mb-4">What's Included in Commission</h2>
            <p className="text-gray-700 mb-3">Our commission covers:</p>
            <ul className="text-gray-700 space-y-2">
              <li>Platform hosting and maintenance</li>
              <li>Payment processing</li>
              <li>Marketing and promotion</li>
              <li>Customer support</li>
              <li>Compliance monitoring and verification</li>
              <li>Analytics and reporting tools</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-secondary mb-4">Exclusions</h2>
            <p className="text-gray-700 mb-3">Commission is NOT charged on:</p>
            <ul className="text-gray-700 space-y-2">
              <li>Shipping fees (if separately itemized)</li>
              <li>Sales tax</li>
              <li>Refunded orders</li>
              <li>Cancelled orders (before shipment)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-secondary mb-4">Custom Agreements</h2>
            <p className="text-gray-700">
              High-volume vendors or vendors with specialized product lines may qualify for custom commission rates. Contact our vendor relations team to discuss custom agreements.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-secondary mb-4">Rate Changes</h2>
            <p className="text-gray-700">
              APlusMedDepot reserves the right to adjust commission rates with 60 days advance notice to vendors. Current vendors will be grandfathered into existing rates for a minimum of 12 months from the date of rate change notification.
            </p>
          </section>

          <section className="mb-8 bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
            <h2 className="text-2xl font-semibold text-secondary mb-4">Questions?</h2>
            <p className="text-gray-700 mb-3">For commission inquiries:</p>
            <div className="text-gray-700 space-y-2">
              <p><strong>Email:</strong> <a href="mailto:finance@aplusmeddepot.com" className="text-primary hover:underline">finance@aplusmeddepot.com</a></p>
              <p><strong>Phone:</strong> <a href="tel:1-800-555-0199" className="text-primary hover:underline">1-800-555-0199</a></p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CommissionPolicyPage;
