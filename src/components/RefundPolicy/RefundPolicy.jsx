import React from "react";

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-25 to-yellow-50">
      {/* Hero Section */}
      <div className="text-center py-12 md:py-16 px-4">
        <h1 className="text-4xl sm:text-5xl font-bold text-divine-orange mb-4">
          Refund Policy
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
          At Lion Bidi, we strive to ensure your experience with our products is
          seamless and trustworthy.
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-6 sm:p-10 md:p-12 border border-amber-200">
        <div className="space-y-10 text-gray-600 text-base sm:text-lg leading-relaxed">
          {/* Intro */}
          <section>
            <p>
              Thank you for shopping at <strong className="text-divine-orange">Lion Bidi</strong>. We truly
              value your business and want to make sure you feel confident in
              every purchase.
            </p>
          </section>

          {/* Physical Goods */}
          <section>
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-3">
              Physical Goods
            </h2>
            <p>
              You have <strong className="text-divine-orange">7 calendar days</strong> from your purchase date
              to request a refund. To be eligible:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Product must be unused and in its original packaging</li>
              <li>Proof of purchase is required</li>
              <li>Items must be in resellable condition</li>
            </ul>
          </section>

          {/* Refund Processing */}
          <section>
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-3">
              Refund Processing
            </h2>
            <p>
              Approved refunds will be processed within 5 business days. The
              refund amount will be credited directly to your original payment
              method.
            </p>
          </section>

          {/* Shipping Returns */}
          <section>
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-3">
              Shipping Returns
            </h2>
            <p>
              Customers are responsible for covering return shipping costs. We
              recommend using a trackable shipping service, as we cannot
              guarantee the receipt of returned items without tracking.
            </p>
          </section>

          {/* Contact Us */}
          <section>
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-3">
              Contact Us
            </h2>
            <p>
              For any questions about our Returns and Refunds Policy, feel free
              to connect with us:
            </p>
            <ul className="mt-3 space-y-2">
              <li>
                Email:{" "}
                <a
                  href="mailto:lionbidicompany@gmail.com"
                  className="text-gray-600 text-sm sm:text-base hover:underline hover:text-divine-orange"
                >
                  lionbidicompany@gmail.com
                </a>
              </li>
              <li>
                Phone:{" "}
                <a
                  href="tel:+919589773525"
                  className="text-gray-600 text-sm sm:text-base hover:underline hover:text-divine-orange"
                >
                  +91-9589773525
                </a>
              </li>
              <li className="text-gray-600">Contact Hours:{" "}
                <span
                  className="text-gray-600 text-sm sm:text-base"
                >
                  Mon–Sat, 10 AM – 7 PM IST
                </span>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
