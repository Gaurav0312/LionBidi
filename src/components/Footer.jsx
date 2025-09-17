import React from "react";
import { Mail, Phone, MapPin, Shield, Truck, Star } from "lucide-react";

import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer
      className="relative bg-gradient-to-br from-[#cc3300] via-[#ff4500] to-[#cc3300]
 text-white"
    >
      {/* Glowing Top Border */}
      <div className="h-1 bg-gradient-to-r from-transparent via-amber-400/70 to-transparent shadow-lg shadow-amber-500/30"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div>
            <div className="flex items-center mb-6">
              <div className="relative">
                <img
                  src="https://res.cloudinary.com/dxqerqng1/image/upload/v1754660338/campaign_covers/brixv4aazfsuzq27kfbc.png"
                  alt="Lion Bidi"
                  className="h-10 w-auto sm:h-12 lg:h-14 transition-all duration-300 group-hover:scale-[1.02]"
                />
              </div>
              <div className="ml-2">
                <span className="text-white text-2xl font-bold bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
                  LION BIDI
                </span>
                {/* <p className="text-amber-400/80 text-xs">Premium Quality</p> */}
              </div>
            </div>

            <p className="text-gray-200 mb-6 text-sm leading-relaxed">
              Handcrafted with care,{" "}
              <strong className="text-white">Lion Bidi</strong> represents the
              authentic spirit of Indian tradition. Our premium tobacco ensures
              a smooth and natural experience — trusted by generations.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-bold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/about"
                  className="text-white hover:text-gray-200 font-semibold transition-colors text-sm"
                >
                  About Us
                </Link>
              </li>

              <li>
                <Link
                  to="/contact"
                  className="text-white hover:text-gray-200 font-semibold transition-colors text-sm"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-white hover:text-gray-200 font-semibold transition-colors text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-white hover:text-gray-200 font-semibold transition-colors text-sm"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  to="/refund-policy"
                  className="text-white hover:text-gray-200 font-semibold transition-colors text-sm"
                >
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Product Categories */}
          {/* <div>
            <h3 className="text-white text-lg font-bold mb-6">Our Products</h3>
            <ul className="space-y-3">
              {[
                "Premium Lion Bidi",
                "Traditional Tobacco",
                "Rolling Papers",
                "Bidi Accessories",
                "Gift Collections",
              ].map((item) => (
                <li key={item}>
                  <span className="text-gray-400 hover:text-amber-400 transition-colors text-sm cursor-pointer">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div> */}

          {/* Customer Service */}
          {/* <div>
            <h3 className="text-white text-lg font-bold mb-6">Customer Care</h3>
            <ul className="space-y-3">
              {[
                "Help Center",
                "Fast Delivery",
                "Quality Guarantee",
                "Track Your Order",
                
              ].map((item) => (
                <li key={item}>
                  <span className="text-white hover:text-gray-400 transition-colors text-sm cursor-pointer">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div> */}

          {/* Customer Service */}
          <div>
            <h3 className="text-white text-lg font-bold mb-6">Contact Us</h3>
            <div className="space-y-4">
              {/* Email */}
              <div className="flex items-center text-gray-300">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg flex items-center justify-center mr-3 shadow-md">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <a
                  href="mailto:lionbidicompany@gmail.com"
                  className="text-white text-sm hover:text-gray-200 font-semibold transition-colors"
                >
                  lionbidicompany@gmail.com
                </a>
              </div>

              {/* Phone */}
              <div className="flex items-center text-gray-300">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3 shadow-md">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                <a
                  href="tel:+919589773525"
                  className=" text-white text-sm hover:text-gray-200 font-semibold transition-colors"
                >
                  +91-9589773525
                </a>
              </div>

              {/* Address */}
              <div className="flex items-center text-gray-300">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3 shadow-md">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-semibold text-sm">
                  Chhatarpur, Madhya Pradesh
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Service Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          <div className="bg-transparent rounded-xl p-5 border border-gray-500/10 hover:border-gray-500/40 transition-all">
            <div className="flex items-center">
              <Truck className="w-8 h-8 text-amber-400 mr-3" />
              <div>
                <h4 className="text-white font-semibold text-sm">
                  Fast Delivery
                </h4>
                <p className="text-gray-200 text-xs">
                  Same day delivery available
                </p>
              </div>
            </div>
          </div>

          <div className="bg-transparent rounded-xl p-5 border border-gray-500/10 hover:border-gray-500/40 transition-all">
            <div className="flex items-center">
              <Star className="w-8 h-8 text-amber-400 mr-3" />
              <div>
                <h4 className="text-white font-semibold text-sm">
                  Premium Quality
                </h4>
                <p className="text-gray-200 text-xs">
                  100% authentic tobacco products
                </p>
              </div>
            </div>
          </div>

          <div className="bg-transparent rounded-xl p-5 border border-gray-500/10 hover:border-gray-500/40 transition-all">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-amber-400 mr-3" />
              <div>
                <h4 className="text-white font-semibold text-sm">
                  Secure Shopping
                </h4>
                <p className="text-gray-200 text-xs">
                  Safe & encrypted payments
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800/30 mt-12 pt-8 flex flex-col lg:flex-row justify-between items-center gap-6 bg-black/15 rounded-lg p-4">
          <p className="text-gray-200 text-sm text-center lg:text-left">
            © 2025 <span className="text-white font-semibold">Lion Bidi</span>.
            All rights reserved. <br />
            <span className="text-gray-200 text-xs">
              Crafted with tradition, delivered with care
            </span>
          </p>

          <div className="flex flex-wrap gap-2 justify-center">
            {["UPI", "PayTM", "PhonePe", "Google Pay"].map((pm) => (
              <div
                key={pm}
                className="bg-black/20 rounded-lg px-3 py-2 text-xs font-bold text-white border border-gray-500/40 shadow-sm hover:bg-black/30 transition-all cursor-pointer"
              >
                {pm}
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
