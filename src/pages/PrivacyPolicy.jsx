import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-25 to-yellow-50 py-12 px-6 sm:px-8 lg:px-16">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg border border-amber-100 p-8 sm:p-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-800">
            <span className="text-divine-orange">Privacy Policy</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Your privacy is very important to us at <span className="text-divine-orange font-semibold">Lion Bidi</span>. 
            This policy explains how we collect, use, and safeguard your information when you interact with our website and services.
          </p>
        </div>

        {/* Policy Sections */}
        <div className="space-y-8 text-gray-700 leading-relaxed">
          {/* Information We Collect */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              1. Information We Collect
            </h2>
            <p>
              We may collect the following types of personal information:
            </p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>Name, email address, and contact number</li>
              <li>Billing and shipping details</li>
              <li>Payment information (processed securely via third-party providers)</li>
              <li>Messages or inquiries submitted via our contact forms</li>
            </ul>
          </section>

          {/* How We Use Information */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              2. How We Use Your Information
            </h2>
            <p>We use the information collected to:</p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>Process and deliver your orders</li>
              <li>Provide customer support and respond to inquiries</li>
              <li>Improve our website, services, and product offerings</li>
              <li>Send promotional offers and updates (only if you opt-in)</li>
            </ul>
          </section>

          {/* Sharing Information */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              3. Sharing of Information
            </h2>
            <p>
              We do not sell or rent your personal information. However, we may
              share it with trusted third parties only when necessary to:
            </p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>Complete payment transactions</li>
              <li>Deliver orders through courier partners</li>
              <li>Comply with legal obligations or protect against fraud</li>
            </ul>
          </section>

          {/* Data Protection */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              4. Data Security
            </h2>
            <p>
              We take appropriate measures to secure your personal data,
              including encrypted payment gateways and secure servers. 
              However, please note that no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              5. Cookies and Tracking
            </h2>
            <p>
              Our website uses cookies to improve user experience, analyze site
              traffic, and remember your preferences. You may disable cookies in
              your browser settings if you prefer.
            </p>
          </section>

          {/* User Rights */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              6. Your Rights
            </h2>
            <p>
              You have the right to access, update, or delete your personal
              information. To exercise these rights, please contact us at{" "}
               <a
                    href="mailto:lionbidicompany@gmail.com"
                    className="text-divine-orange font-medium hover:underline"
                >
                    lionbidicompany@gmail.com
                </a>
            </p>
          </section>

          {/* Policy Updates */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              7. Policy Updates
            </h2>
            <p>
              We may update this Privacy Policy from time to time. Any changes
              will be posted on this page with a revised "Last Updated" date.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              8. Contact Us
            </h2>
            <p>
              If you have any questions or concerns about this Privacy Policy,
              feel free to reach out:
            </p>
            <ul className="list-disc list-inside ml-4 mt-2">
              <li>
                    Email:{" "}
                    <a
                        href="mailto:lionbidicompany@gmail.com"
                        className="text-text-600 font-medium hover:underline hover:text-divine-orange"
                    >
                        lionbidicompany@gmail.com
                    </a>
                </li>
                <li>
                    Phone:{" "}
                    <a
                        href="tel:+919589773525"
                        className="text-text-600 font-medium hover:underline hover:text-divine-orange"
                    >
                        +91-9589773525
                    </a>
                </li>
                <li>
                    Address:{" "}
                    <a
                        href="https://maps.google.com/?q=Chhatarpur, Madhya Pradesh, India"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-text-600 font-medium hover:underline hover:text-divine-orange"
                    >
                        Chhatarpur, Madhya Pradesh, India
                    </a>
                </li>
            </ul>
          </section>
        </div>

        {/* Last Updated */}
        <div className="text-center mt-12">
          <p className="text-sm text-gray-500">
            Last Updated: January 2025
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
