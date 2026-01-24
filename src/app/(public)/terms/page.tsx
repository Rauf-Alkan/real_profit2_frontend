import React from 'react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#f1f2f3] py-12 px-4 sm:px-6 font-sans text-gray-900">

      <div className="max-w-2xl mx-auto">

        {/* BAŞLIK ALANI */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-bold tracking-tight text-black">Terms of Service</h1>
          <p className="mt-2 text-sm text-gray-500">
            Last updated: January 20, 2026
          </p>
        </div>

        {/* KART YAPISI */}
        <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden">

          <div className="p-8 space-y-10">

            {/* 1. Acceptance of Terms */}
            <section>
              <h2 className="text-lg font-bold text-black mb-4">1. Acceptance of Terms</h2>
              <div className="text-sm leading-7 text-gray-700 space-y-4">
                <p>
                  By installing and using the <strong>RealProfit</strong> application ("App") from the Shopify App Store, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you must uninstall the App immediately.
                </p>
                <p>
                  These Terms apply to all merchants, users, and others who access or use the financial analytics service provided by RealProfit.
                </p>
              </div>
            </section>

            <hr className="border-gray-200" />

            {/* 2. Description of Service */}
            <section>
              <h2 className="text-lg font-bold text-black mb-4">2. Description of Service</h2>
              <p className="text-sm text-gray-700 mb-4">
                RealProfit is a financial analytics SaaS tool designed to help Shopify merchants track their net profitability. Our services include:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-2 ml-2">
                <li><span className="font-semibold text-black">Profit Tracking:</span> Real-time calculation of Net Profit and margins via Shopify API.</li>
                <li><span className="font-semibold text-black">Expense Management:</span> Tools for uploading COGS (Cost of Goods Sold) and tracking ad spend.</li>
                <li><span className="font-semibold text-black">Global Dashboard:</span> Consolidating financial data across multiple linked Shopify stores.</li>
              </ul>
            </section>

            <hr className="border-gray-200" />

            {/* 3. Billing & Payments */}
            <section>
              <h2 className="text-lg font-bold text-black mb-4">3. Billing & Payments</h2>
              <div className="text-sm leading-7 text-gray-700 space-y-4">
                <p>
                  <strong>Subscription:</strong> Access to premium analytics requires a recurring subscription. All billing is handled directly by Shopify via the Shopify Billing API.
                </p>
                <p>
                  <strong>No Refunds:</strong> As we provide a digital service with a free trial period, we generally do not offer refunds once a billing cycle has started. Disputes are handled in accordance with Shopify's billing policies.
                </p>
                <p>
                  <strong>Cancellation:</strong> You may cancel your subscription at any time by uninstalling the App. Shopify will automatically stop further billing cycles.
                </p>
              </div>
            </section>

            <hr className="border-gray-200" />

            {/* 4. Limitation of Liability */}
            <section>
              <h2 className="text-lg font-bold text-black mb-4">4. Limitation of Liability</h2>
              <div className="p-4 border border-gray-200 rounded bg-gray-50 text-sm text-gray-700 leading-6">
                <p>
                  The Service is provided on an "AS IS" basis. <strong>RealProfit</strong> shall not be held liable for any financial decisions made based on the data provided by the App, nor for damages resulting from:
                </p>
                <ul className="list-disc list-inside mt-2 ml-1">
                  <li>Inaccurate data entry (e.g., incorrect COGS or ad spend values).</li>
                  <li>Delays in Shopify Webhook delivery or API downtimes.</li>
                  <li>Any discrepancies between RealProfit reports and official tax or bank statements.</li>
                </ul>
              </div>
            </section>

            <hr className="border-gray-200" />

            {/* 5. Intellectual Property */}
            <section>
              <h2 className="text-lg font-bold text-black mb-4">5. Intellectual Property</h2>
              <p className="text-sm text-gray-700">
                The Service, its financial algorithms, and its original content are the exclusive property of <strong>Alkan Systems</strong>. The App is protected by copyright and intellectual property laws of both Turkey and international jurisdictions.
              </p>
            </section>

            <hr className="border-gray-200" />

            {/* 6. Changes to Terms */}
            <section>
              <h2 className="text-lg font-bold text-black mb-4">6. Changes to Terms</h2>
              <p className="text-sm text-gray-700">
                We reserve the right to modify these Terms at any time. Material changes will be notified at least 30 days in advance via the App dashboard or email. Continued use of the service constitutes acceptance of the new terms.
              </p>
            </section>

            <hr className="border-gray-200" />

            {/* Contact */}
            <section>
              <h2 className="text-lg font-bold text-black mb-4">7. Contact Us</h2>
              <p className="text-sm text-gray-700 mb-6">
                If you have any questions regarding these Terms or our financial logic, please contact us:
              </p>

              <a
                href="mailto:support@alkansystems.com"
                className="inline-block bg-black text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
              >
                support@alkansystems.com
              </a>
            </section>

          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-8 text-center border-t border-gray-300 pt-6">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} RealProfit. All rights reserved.
          </p>
        </div>

      </div>
    </div>
  );
}