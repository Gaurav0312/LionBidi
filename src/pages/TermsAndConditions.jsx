// src/pages/TermsAndConditions.jsx
import React, { useEffect } from "react";

const TermsAndConditions = () => {
  // Add SEO meta tags
  useEffect(() => {
    document.title = "Terms & Conditions - Lion Bidi | Legal Information";
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Lion Bidi Terms & Conditions - Legal terms for purchasing premium hand-rolled tobacco products. Age verification, shipping, returns, and usage policies.");
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Lion Bidi Terms & Conditions - Legal terms for purchasing premium hand-rolled tobacco products. Age verification, shipping, returns, and usage policies.';
      document.head.appendChild(meta);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-25 to-yellow-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-8 sm:p-12 border border-amber-200">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6">
          Terms & Conditions
        </h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Welcome to <span className="font-semibold text-divine-orange">Lion Bidi</span>.
          By accessing and using our website, you agree to comply with and be
          bound by the following Terms & Conditions. Please read them carefully.
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              1. Eligibility & Age Verification
            </h2>
            <p className="text-gray-600 leading-relaxed">
              You must be at least 18 years old to purchase tobacco products
              from our website. By placing an order, you confirm that you meet
              the legal age requirements in your jurisdiction. Lion Bidi reserves
              the right to request age verification documents before processing orders.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              2. Product Information & Authenticity
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We strive to provide accurate product descriptions and images of our
              premium hand-rolled Lion Bidi products. However, slight variations may 
              occur due to the handcrafted nature of our tobacco products. All products 
              are intended for personal use only and not for resale without prior 
              written consent from Lion Bidi.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              3. Orders & Payments
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Orders are confirmed only after successful payment verification. We accept
              major payment methods including UPI, debit/credit cards, and digital wallets. 
              All prices displayed are in Indian Rupees (₹) and are inclusive of applicable 
              taxes unless stated otherwise. Bulk pricing discounts apply automatically 
              for qualifying quantities.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              4. Shipping & Delivery Policy
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We offer delivery across India where legally permitted. Delivery times may vary
              depending on location and local regulations regarding tobacco products. Lion Bidi 
              is not responsible for delays caused by courier services, weather conditions, or 
              regulatory restrictions. Free delivery is available on orders above ₹1000.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              5. Returns & Refunds Policy
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Due to the consumable nature of tobacco products and health regulations, returns 
              are only accepted if you receive damaged, defective, or incorrect items. Claims 
              must be made within 24 hours of delivery with photographic evidence. Please refer 
              to our detailed{" "}
              <a href="/refund-policy" className="text-divine-orange hover:underline">
                Refund Policy
              </a>{" "}
              for complete terms and procedures.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              6. Intellectual Property & Image Rights
            </h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              All content on this website, including but not limited to product images, 
              logos, text, and design elements, are the exclusive property of Lion Bidi 
              and are protected by copyright laws.
            </p>
            <ul className="text-gray-600 leading-relaxed space-y-2 ml-4">
              <li>• Product images may not be reproduced without written permission</li>
              <li>• The "Lion Bidi" brand name and logo are registered trademarks</li>
              <li>• Unauthorized use of our intellectual property may result in legal action</li>
              <li>• Licensed use of images is permitted for legitimate review and editorial purposes with proper attribution</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              7. Prohibited Use & Legal Compliance
            </h2>
            <p className="text-gray-600 leading-relaxed">
              You agree not to misuse our website for fraudulent, illegal, or
              harmful activities. This includes but is not limited to: purchasing 
              products for minors, reselling without authorization, or violating 
              local tobacco regulations. Violation of these terms may result in 
              account suspension, order cancellation, or legal action.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              8. Health Warnings & Disclaimers
            </h2>
            <p className="text-gray-600 leading-relaxed">
              <strong>Warning:</strong> Tobacco products are harmful to health and may cause 
              cancer, heart disease, and other serious health conditions. Lion Bidi does not 
              make any health claims about our products. Use of tobacco products is at your 
              own risk and discretion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              9. Limitation of Liability
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Lion Bidi's liability is limited to the purchase price of products ordered. 
              We are not liable for any indirect, incidental, consequential, or punitive 
              damages arising from the use of our products or website, including but not 
              limited to health effects, loss of profits, or data loss.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              10. Privacy & Data Protection
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Your personal information is protected according to our{" "}
              <a href="/privacy-policy" className="text-divine-orange hover:underline">
                Privacy Policy
              </a>. We collect minimal necessary data for order processing and comply 
              with applicable data protection regulations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              11. Modifications to Terms
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Lion Bidi reserves the right to update these Terms & Conditions at any
              time without prior notice. Changes will be effective immediately upon posting 
              on this page. Your continued use of the website after changes constitutes 
              acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              12. Governing Law & Jurisdiction
            </h2>
            <p className="text-gray-600 leading-relaxed">
              These terms are governed by the laws of India. Any disputes arising from 
              these terms or your use of our website shall be subject to the exclusive 
              jurisdiction of the courts in [Your City/State], India.
            </p>
          </section>
        </div>

        <div className="mt-12 p-6 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-gray-800 font-medium mb-2">Contact Information</p>
          <p className="text-gray-600 text-sm">
            If you have any questions regarding these Terms & Conditions, please{" "}
            <a href="/contact" className="text-divine-orange hover:underline font-medium">
              contact us
            </a> or call us at{" "}
            <a href="tel:+919589773525" className="text-divine-orange hover:underline font-medium">
              +91 9589773525
            </a>.
          </p>
          <p className="text-gray-500 text-xs mt-3">
            Last updated: September 28, 2025
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;