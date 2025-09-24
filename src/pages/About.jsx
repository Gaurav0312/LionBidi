import React from "react";
import { Helmet } from "react-helmet";
import { Leaf, Award, Users } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-25 to-yellow-50">
      {/* ✅ SEO Meta + OpenGraph + Schema */}
      <Helmet>
        <title>About Lion Bidi | Premium Bidi Manufacturer from Madhya Pradesh</title>
        <meta
          name="description"
          content="Learn about Lion Bidi – a trusted bidi manufacturer from Madhya Pradesh. Hand-rolled premium bidi made from natural tobacco leaves, available online across India."
        />
        <meta
          name="keywords"
          content="about lion bidi, bidi manufacturer Madhya Pradesh, hand-rolled bidi, premium tobacco India, buy bidi online"
        />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="About Lion Bidi | Premium Bidi Online" />
        <meta property="og:description" content="Discover the story of Lion Bidi – trusted bidi brand from Madhya Pradesh, delivering authentic taste nationwide." />
        <meta property="og:image" content="https://www.lionbidi.shop/og-image.jpg" />
        <meta property="og:url" content="https://www.lionbidi.shop/about" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About Lion Bidi | Premium Bidi Online" />
        <meta name="twitter:description" content="Discover the heritage of Lion Bidi – premium bidi crafted with natural tobacco leaves." />
        <meta name="twitter:image" content="https://www.lionbidi.shop/og-image.jpg" />

        {/* Breadcrumb Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://www.lionbidi.shop"
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "About",
                item: "https://www.lionbidi.shop/about"
              }
            ]
          })}
        </script>
      </Helmet>

      {/* Hero Section */}
      <section className="relative w-full py-20 px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-800">
            <span className="text-divine-orange">About Lion Bidi</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
            Lion Bidi is India’s trusted{" "}
            <a href="/products" className="text-divine-orange underline">
              bidi manufacturer
            </a>{" "}
            from Madhya Pradesh. Known for premium hand-rolled bidi made from
            natural tobacco leaves, we bring an authentic taste loved by
            generations of smokers across India.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid gap-12 md:grid-cols-2 items-center">
        {/* Text */}
        <div className="space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">
            Our Story
          </h2>
          <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
            For decades, Lion Bidi has been recognized as a symbol of{" "}
            <strong>authentic Indian bidi</strong> and traditional tobacco
            craftsmanship. Every bidi is carefully hand-rolled using the finest
            quality leaves, ensuring a smooth and natural smoking experience.
          </p>
          <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
            What started as a small initiative in Madhya Pradesh has grown into
            a{" "}
            <a
              href="/products"
              className="text-divine-orange underline"
            >
              trusted bidi brand
            </a>{" "}
            across India. Our mission is simple — to preserve heritage while
            delivering premium quality tobacco products online and offline.
          </p>
        </div>

        {/* Image */}
        <div className="rounded-2xl overflow-hidden shadow-lg border border-orange-200">
          <img
            src="https://res.cloudinary.com/dxqerqng1/image/upload/v1757644152/LionBidi_z4lirw.jpg"
            alt="Lion Bidi Pack - Premium Handcrafted Bidi"
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Values Section */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-12">
          Why Choose Lion Bidi?
        </h2>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Natural Quality */}
          <div className="text-center bg-gray-50 border border-orange-200 rounded-xl p-8 shadow hover:shadow-md transition-all">
            <div className="w-16 h-16 bg-divine-orange rounded-full flex items-center justify-center mx-auto mb-4">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Authentic Taste
            </h3>
            <p className="text-gray-600">
              Handcrafted with the finest natural tobacco leaves for a{" "}
              <strong>traditional bidi experience</strong>.
            </p>
          </div>

          {/* Heritage */}
          <div className="text-center bg-gray-50 border border-orange-200 rounded-xl p-8 shadow hover:shadow-md transition-all">
            <div className="w-16 h-16 bg-divine-orange rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Trusted Heritage
            </h3>
            <p className="text-gray-600">
              A brand built on decades of trust, consistency, and commitment to
              <strong> premium bidi manufacturing</strong>.
            </p>
          </div>

          {/* Community */}
          <div className="text-center bg-gray-50 border border-orange-200 rounded-xl p-8 shadow hover:shadow-md transition-all">
            <div className="w-16 h-16 bg-divine-orange rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Community First
            </h3>
            <p className="text-gray-600">
              Loved by thousands across India, Lion Bidi remains the preferred
              choice for smokers who value{" "}
              <a href="/about" className="underline text-divine-orange">
                quality and tradition
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
