import React from 'react';

export default function PrivacyPage() {
  return (
    // 1. ZEMİN: Shopify Admin zeminiyle uyumlu açık gri
    <div className="min-h-screen bg-[#f1f2f3] py-12 px-4 sm:px-6 font-sans text-gray-900">

      {/* 2. GENİŞLİK: Okuma kolaylığı için daraltılmış alan */}
      <div className="max-w-2xl mx-auto">

        {/* BAŞLIK ALANI */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-bold tracking-tight text-black">Privacy Policy</h1>
          <p className="mt-2 text-sm text-gray-500">
            Last updated: January 20, 2026
          </p>
        </div>

        {/* 3. KART YAPISI */}
        <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden">

          <div className="p-8 space-y-10">

            {/* Introduction */}
            <section>
              <h2 className="text-lg font-bold text-black mb-4">1. Introduction</h2>
              <div className="text-sm leading-7 text-gray-700 space-y-4">
                <p>
                  Welcome to <strong>RealProfit</strong>. We are committed to protecting your financial information and your right to privacy. This Privacy Policy explains how we collect, use, and safeguard your data when you use our Profit Analytics Application.
                </p>
                <p>
                  By installing the App, you agree to the collection and use of financial metadata in accordance with this policy to enable accurate profit calculations.
                </p>
              </div>
            </section>

            <hr className="border-gray-200" />

            {/* Information We Collect */}
            <section>
              <h2 className="text-lg font-bold text-black mb-4">2. Information We Collect</h2>
              <p className="text-sm text-gray-700 mb-4">
                To calculate your net profitability, we access specific data from your Shopify store via the official Shopify API:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-2 ml-2">
                <li><span className="font-semibold text-black">Merchant Info:</span> Store name, email, and base currency settings.</li>
                <li><span className="font-semibold text-black">Financial Data:</span> Orders, refunds, taxes, and shipping costs.</li>
                <li><span className="font-semibold text-black">Payout Data:</span> Transaction fees and gateway costs for bank reconciliation.</li>
                <li><span className="font-semibold text-black">Manual Inputs:</span> COGS (Cost of Goods Sold) and marketing expenses provided by you.</li>
              </ul>
            </section>

            <hr className="border-gray-200" />

            {/* How We Use Information */}
            <section>
              <h2 className="text-lg font-bold text-black mb-4">3. How We Use Your Information</h2>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="mr-3 text-black">•</span>
                  Generating real-time net profit and margin analytics dashboards.
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-black">•</span>
                  Reconciling estimated transaction fees with actual Shopify Payouts.
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-black">•</span>
                  Consolidating financial data across multiple stores in your portfolio.
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-black">•</span>
                  Processing secure billing and subscription tiers via Shopify.
                </li>
              </ul>
            </section>

            <hr className="border-gray-200" />

            {/* Data Sharing */}
            <section>
              <h2 className="text-lg font-bold text-black mb-4">4. Sharing Your Information</h2>
              <p className="text-sm text-gray-700 mb-4">
                We <strong>never</strong> sell your financial or personal data. Data is shared only with providers necessary for app operation:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 rounded bg-gray-50">
                  <p className="text-sm font-bold text-black">Shopify</p>
                  <p className="text-xs text-gray-500 mt-1">Hosting & API Infrastructure</p>
                </div>
                <div className="p-4 border border-gray-200 rounded bg-gray-50">
                  <p className="text-sm font-bold text-black">Database Providers</p>
                  <p className="text-xs text-gray-500 mt-1">Encrypted Ledger Storage</p>
                </div>
              </div>
            </section>

            <hr className="border-gray-200" />

            {/* Retention & Rights */}
            <section>
              <h2 className="text-lg font-bold text-black mb-4">5. Data Retention & Rights</h2>
              <div className="text-sm leading-7 text-gray-700 space-y-4">
                <p>
                  Upon uninstallation, we comply with Shopify's GDPR mandates and delete all store-related financial data within <strong>48 hours</strong>.
                </p>
                <p>
                  You have the right to request access to the financial logs we store or ask for manual deletion by contacting our support team.
                </p>
              </div>
            </section>

            <hr className="border-gray-200" />

            {/* Contact */}
            <section>
              <h2 className="text-lg font-bold text-black mb-4">6. Contact Us</h2>
              <p className="text-sm text-gray-700 mb-6">
                If you have any questions about how we handle your financial data, please reach out:
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