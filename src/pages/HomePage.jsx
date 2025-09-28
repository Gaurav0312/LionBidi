import React, { useState } from "react";
import { Truck, ShoppingCart, Star, Shield, Phone, MapPin } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { sampleProducts } from "../data/sampleProducts";
import ProductCard from "../components/ProductCard";
import { useNavigate } from "react-router-dom";
import SEO from "../components/SEO";

// Enhanced SEO HomePage Component for Lion Bidi
const HomePage = () => {
  const navigate = useNavigate();
  const { setCurrentPage } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const bestsellers = sampleProducts.filter((p) => p.bestseller);

  const handleNavigate = async (path) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 100));
      navigate(path);
    } catch (error) {
      window.location.href = path;
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced FAQ data for SEO
  const faqData = [
    {
      question: "Can I buy bidi online in India?",
      answer:
        "Yes, you can buy premium quality bidi online from Lion Bidi. We are a trusted bidi manufacturer from Madhya Pradesh, delivering authentic handcrafted bidi across India with fast and discreet shipping.",
    },
    {
      question: "What makes Lion Bidi special?",
      answer:
        "Lion Bidi is made from handpicked tobacco leaves from Madhya Pradesh, India's tobacco hub. Our traditional crafting methods ensure authentic natural taste and premium quality that tobacco enthusiasts love.",
    },
    {
      question: "How fast is bidi delivery across India?",
      answer:
        "We provide fast delivery of bidi across all major cities in India including Mumbai, Delhi, Bangalore, Chennai, and Kolkata. All orders come with discreet packaging and real-time tracking.",
    },
    {
      question: "Are Lion Bidi products authentic?",
      answer:
        "Yes, all our bidi products are 100% authentic and made from premium tobacco leaves. We are a verified manufacturer from Madhya Pradesh with decades of experience in tobacco craftsmanship.",
    },
  ];

  return (
    <>
      <SEO
        title="Buy Bidi Online India | Lion Bidi - Premium Tobacco Products"
        description="Buy premium bidi online from Lion Bidi - Madhya Pradesh's trusted bidi manufacturer. Authentic handcrafted bidi with fast delivery."
        keywords="buy bidi online, bidi online india, tobacco products, lion bidi, madhya pradesh bidi"
        canonicalUrl="https://www.lionbidi.shop"
        schema={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Lion Bidi",
          url: "https://www.lionbidi.shop",
          logo: "https://www.lionbidi.shop/logo512.png",
          sameAs: [
            "https://www.facebook.com/yourpage",
            "https://www.instagram.com/yourpage",
            "https://twitter.com/yourpage",
          ],
        }}
      />

      {/* Enhanced Schema Markup for Better SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": "https://www.lionbidi.shop/#organization",
                name: "Lion Bidi",
                url: "https://www.lionbidi.shop",
                logo: "https://www.lionbidi.shop/logo.png",
                description:
                  "Premium bidi and tobacco products manufacturer from Madhya Pradesh, India",
                address: {
                  "@type": "PostalAddress",
                  addressRegion: "Madhya Pradesh",
                  addressCountry: "IN",
                },
                contactPoint: {
                  "@type": "ContactPoint",
                  contactType: "customer service",
                  availableLanguage: ["Hindi", "English"],
                },
              },
              {
                "@type": "WebSite",
                "@id": "https://www.lionbidi.shop/#website",
                url: "https://www.lionbidi.shop",
                name: "Lion Bidi - Buy Bidi Online India",
                description:
                  "Buy premium bidi online from India's trusted tobacco manufacturer",
                potentialAction: {
                  "@type": "SearchAction",
                  target:
                    "https://www.lionbidi.shop/search?q={search_term_string}",
                  "query-input": "required name=search_term_string",
                },
              },
              {
                "@type": "Store",
                name: "Lion Bidi Online Store",
                url: "https://www.lionbidi.shop",
                description:
                  "Premium quality bidi manufacturer from Madhya Pradesh. Buy bidi online with fast delivery.",
                hasOfferCatalog: {
                  "@type": "OfferCatalog",
                  name: "Premium Bidi Collection",
                  itemListElement: bestsellers.map((product) => ({
                    "@type": "Product",
                    name: product.name,
                    image: `https://www.lionbidi.shop/${product.image}`,
                    description: product.description,
                    brand: {
                      "@type": "Brand",
                      name: "Lion Bidi",
                    },
                    offers: {
                      "@type": "Offer",
                      url: `https://www.lionbidi.shop/product/${product.slug}`,
                      priceCurrency: "INR",
                      price: product.price,
                      availability: "https://schema.org/InStock",
                    },
                    aggregateRating: {
                      "@type": "AggregateRating",
                      ratingValue: product.rating || "4.5",
                      reviewCount: product.reviews || "120",
                    },
                  })),
                },
              },
              {
                "@type": "FAQPage",
                mainEntity: faqData.map((faq) => ({
                  "@type": "Question",
                  name: faq.question,
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: faq.answer,
                  },
                })),
              },
            ],
          }),
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-25 to-yellow-50">
        {/* Enhanced Hero Section with Better SEO Content */}
        <section className="hero-section relative w-full min-h-screen overflow-hidden bg-gradient-to-br from-orange-50 via-amber-25 to-yellow-50">
          <div className="relative z-20 flex items-center w-full h-full min-h-screen px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-7xl mx-auto">
              <div className="flex flex-col items-center text-center lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center lg:text-left">
                <div className="w-full space-y-6 sm:space-y-8 pt-20 sm:pt-16 lg:pt-0">
                  <div className="space-y-4 sm:space-y-6">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-gray-800">
                      <span className="text-divine-orange mb-6 font-extrabold block">
                        Buy Bidi Online
                      </span>
                      <span className="text-divine-orange mb-4 font-extrabold block">
                        India | Lion Bidi
                      </span>
                      <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl block mt-2">
                        Premium Lion Bidi from Madhya Pradesh
                      </span>
                    </h1>

                    <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium text-gray-600 tracking-wide px-2 sm:px-0">
                      Authentic Handcrafted Tobacco Products | Fast Delivery
                      Across India
                    </h2>

                    <div className="space-y-4">
                      <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed px-4 sm:px-2 lg:px-0 lg:max-w-xl">
                        <strong>Buy special lion bidi online</strong> from Lion
                        Bidi - India's trusted tobacco manufacturer from Madhya
                        Pradesh. Our handcrafted bidi is made from finest
                        tobacco leaves, delivering the authentic natural taste
                        that smokers across India love.
                      </p>

                      {/* <p className="text-base sm:text-lg text-gray-500 leading-relaxed px-4 sm:px-2 lg:px-0 lg:max-w-xl">
                        Experience traditional tobacco craftsmanship with modern convenience. Order bidi online and get fast delivery to Mumbai, Delhi, Bangalore, Chennai, Pune, and all major Indian cities.
                      </p> */}
                    </div>
                  </div>

                  {/* Enhanced CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 px-4 sm:px-0 lg:justify-start justify-center">
                    <button
                      onClick={() =>
                        handleNavigate("/product/special-lion-bidi-big")
                      }
                      className="group relative bg-divine-orange hover:bg-divine-orange/90 text-white font-semibold py-4 sm:py-4 px-6 sm:px-8 rounded-lg text-base sm:text-lg transition-all duration-300 hover:shadow-lg w-full sm:w-auto"
                      aria-label="Buy Lion Bidi Online Now"
                    >
                      <span className="relative flex items-center justify-center gap-2">
                        Order Bidi Online Now
                        <svg
                          className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                          />
                        </svg>
                      </span>
                    </button>
                  </div>

                  {/* Enhanced Trust Indicators */}
                  <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm text-gray-600">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      100% Natural Tobacco
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Fast India Delivery
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                      Made in Madhya Pradesh
                    </span>
                  </div>
                </div>

                {/* Product Showcase */}
                <div className="w-full flex justify-center mt-6 sm:mt-8 lg:mt-2 px-3 sm:px-4 lg:px-6">
                  <div className="relative group w-max max-w-xs sm:max-w-sm md:max-w-md">
                    <div className="bg-white border border-orange-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="mb-6 flex justify-center">
                        <img
                          src="https://res.cloudinary.com/dxqerqng1/image/upload/v1757644152/LionBidi_z4lirw.jpg"
                          alt="Lion Bidi Pack - Premium Handcrafted Bidi from Madhya Pradesh"
                          className="w-full h-48 sm:h-56 lg:h-64 object-cover rounded-lg"
                          loading="lazy"
                        />
                      </div>
                      <div className="text-center space-y-4">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800 leading-tight">
                          Special Lion Bidi (Big Pack)
                        </h3>
                        <div className="space-y-2">
                          <p className="text-3xl sm:text-3xl font-bold text-divine-orange">
                            ₹280
                          </p>
                          <span className="block text-sm text-gray-600">
                            per pack | Free Shipping on order above ₹999
                          </span>
                        </div>
                        <div className="flex items-center justify-center gap-2 pt-2">
                          {/* <div className="flex text-yellow-500" aria-label="4.5 out of 5 stars">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-current" />
                            ))}
                          </div> */}
                          {/* <span className="text-gray-500 text-sm">(4.5/5) - 150+ Reviews</span> */}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="relative min-h-screen bg-gradient-to-br from-orange-50 via-amber-25 to-yellow-50">
          <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-8 sm:py-12 lg:py-16">
            {/* Enhanced Bestsellers Section */}
            <section className="mb-16 sm:mb-20 lg:mb-24">
              <div className="text-center mb-12 sm:mb-16 lg:mb-20">
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6">
                  Best Selling Bidi Products Online
                </h2>
                <p className="text-gray-600 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed px-4 sm:px-2 lg:px-0">
                  Most loved tobacco products by our community across India -
                  handpicked for exceptional quality, authentic taste, and
                  customer satisfaction. Buy bidi online with confidence.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                {bestsellers.map((product, index) => (
                  <div
                    key={product.id}
                    className="transform hover:scale-[1.02] transition-transform duration-300"
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              <div className="text-center mt-12 sm:mt-16 px-4 sm:px-0">
                <button
                  onClick={() => handleNavigate("/products")}
                  className="bg-divine-orange hover:bg-divine-orange/90 text-white font-semibold py-4 px-8 sm:px-12 rounded-lg text-base sm:text-lg transition-all duration-300 hover:shadow-lg"
                  aria-label="View All Bidi Products Online"
                >
                  View All Bidi Products
                </button>
              </div>
            </section>

            {/* Enhanced About Section */}
            <section className="py-16 bg-white rounded-2xl shadow-lg mb-16">
              <div className="max-w-5xl mx-auto text-center px-4">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6">
                  About Lion Bidi - India's Premium Tobacco Manufacturer
                </h2>
                <div className="text-left max-w-4xl mx-auto space-y-4">
                  <p className="text-gray-600 text-lg leading-relaxed">
                    <strong>Lion Bidi</strong> is a trusted bidi manufacturer
                    from <strong>Madhya Pradesh</strong>, India's heart of
                    tobacco craftsmanship. With decades of tradition and
                    expertise, we specialize in creating premium handcrafted
                    bidi using the finest tobacco leaves sourced locally.
                  </p>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    When you <strong>buy bidi online</strong> from Lion Bidi,
                    you get unmatched quality, authentic natural taste, and the
                    convenience of fast doorstep delivery across all major
                    Indian cities.
                  </p>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Our commitment to traditional tobacco crafting methods
                    combined with modern quality standards makes Lion Bidi the
                    preferred choice for tobacco enthusiasts who value
                    authenticity and premium quality.
                  </p>
                </div>
                <div className="mt-8">
                  <button
                    onClick={() => handleNavigate("/about")}
                    className="bg-divine-orange hover:bg-divine-orange/90 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                    aria-label="Learn More About Lion Bidi"
                  >
                    Learn More About Our Heritage
                  </button>
                </div>
              </div>
            </section>

            {/* Enhanced Trust Badges Section */}
            <section className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8 sm:p-12 mb-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
                  Why Buy Bidi Online from Lion Bidi?
                </h2>
                <p className="text-gray-600 text-base sm:text-lg lg:text-xl max-w-4xl mx-auto leading-relaxed">
                  Experience the perfect blend of traditional Madhya Pradesh
                  tobacco craftsmanship and modern convenience when you buy bidi
                  online from India's trusted manufacturer.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="text-center p-6 bg-gray-50 rounded-xl border">
                  <div className="w-16 h-16 bg-divine-orange rounded-full flex items-center justify-center mx-auto mb-4">
                    <Truck className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    Fast Delivery Across India
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Lightning-fast bidi delivery across all major cities in
                    India with discreet packaging and real-time tracking for
                    your online bidi orders.
                  </p>
                </div>

                <div className="text-center p-6 bg-gray-50 rounded-xl border">
                  <div className="w-16 h-16 bg-divine-orange rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingCart className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    100% Authentic Tobacco Products
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Genuine bidi products made from premium tobacco leaves
                    sourced from Madhya Pradesh. Traditional crafting methods
                    ensure authentic taste and premium quality in every pack.
                  </p>
                </div>

                <div className="text-center p-6 bg-gray-50 rounded-xl border">
                  <div className="w-16 h-16 bg-divine-orange rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    Secure Online Shopping
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Safe and encrypted payments for your online bidi purchases.
                    Multiple payment options including UPI, PayTM, PhonePe,
                    Google Pay and digital wallets for convenient shopping.
                  </p>
                </div>
              </div>
            </section>

            {/* New FAQ Section for SEO */}
            <section className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl shadow-lg p-8 sm:p-12">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6">
                  Frequently Asked Questions - Buy Bidi Online
                </h2>
                <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                  Common questions about buying bidi online from Lion Bidi,
                  India's trusted tobacco manufacturer from Madhya Pradesh.
                </p>
              </div>

              <div className="max-w-4xl mx-auto space-y-6">
                {faqData.map((faq, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm"
                  >
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">
                      {faq.question}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};
export default HomePage;
