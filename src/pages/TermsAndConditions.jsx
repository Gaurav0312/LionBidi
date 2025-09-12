// src/pages/TermsAndConditions.jsx
import React from "react";

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-25 to-yellow-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-8 sm:p-12 border border-amber-200">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6">
          Terms & Conditions
        </h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Welcome to <span className="font-semibold text-amber-600">Lion Bidi</span>.
          By accessing and using our website, you agree to comply with and be
          bound by the following Terms & Conditions. Please read them carefully.
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              1. Eligibility
            </h2>
            <p className="text-gray-600 leading-relaxed">
              You must be at least 18 years old to purchase tobacco products
              from our website. By placing an order, you confirm that you meet
              the legal age requirements in your jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              2. Product Information
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We strive to provide accurate product descriptions and images.
              However, slight variations may occur. All products are intended
              for personal use only and not for resale without prior written
              consent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              3. Orders & Payments
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Orders are confirmed only after successful payment. We accept
              major payment methods including UPI, cards, and wallets. Prices
              are inclusive of applicable taxes unless stated otherwise.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              4. Shipping & Delivery
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We offer nationwide delivery across India. Delivery times may vary
              depending on location. Lion Bidi is not responsible for delays
              caused by courier services or unforeseen events.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              5. Returns & Refunds
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Due to the nature of tobacco products, returns are only accepted
              if you receive damaged or incorrect items. Please refer to our{" "}
              <a href="/refund-policy" className="text-amber-600 hover:underline">
                Refund Policy
              </a>{" "}
              for details.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              6. Prohibited Use
            </h2>
            <p className="text-gray-600 leading-relaxed">
              You agree not to misuse our website for fraudulent, illegal, or
              harmful activities. Violation of these terms may result in account
              suspension or legal action.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              7. Limitation of Liability
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Lion Bidi is not liable for any indirect, incidental, or
              consequential damages arising from the use of our products or
              website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              8. Changes to Terms
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We reserve the right to update these Terms & Conditions at any
              time. Changes will be effective once posted on this page.
            </p>
          </section>
        </div>

        <p className="text-gray-600 mt-10 text-sm">
          If you have any questions regarding these Terms & Conditions, please{" "}
          <a href="/contact" className="text-amber-600 hover:underline">
            contact us
          </a>.
        </p>
      </div>
    </div>
  );
};

export default TermsAndConditions;
