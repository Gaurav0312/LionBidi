import React from "react";
import { Leaf, Award, Users } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-25 to-yellow-50">
      {/* Hero Section */}
      <section className="relative w-full py-20 px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-800">
            <span className="text-divine-orange">About Lion Bidi</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
            Rooted in tradition, inspired by quality — Lion Bidi brings you the
            authentic taste of handcrafted tobacco products, trusted by
            generations and loved across India.
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
            For decades, Lion Bidi has stood as a symbol of authenticity and
            premium craftsmanship in the bidi industry. Each bidi is carefully
            rolled using the finest quality tobacco leaves, ensuring a natural,
            smooth, and satisfying smoking experience.
          </p>
          <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
            What started as a humble initiative has now grown into a trusted
            brand, delivering excellence while preserving the traditional
            essence of tobacco. Our mission is simple — to provide our community
            with the best tobacco products that balance heritage and quality.
          </p>
        </div>

        {/* Image */}
        <div className="rounded-2xl overflow-hidden shadow-lg border border-orange-200">
          <img
            src="https://res.cloudinary.com/dxqerqng1/image/upload/v1757644152/LionBidi_z4lirw.jpg"
            alt="Lion Bidi Pack"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Values Section */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-12">
          Why Choose Us?
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
              Handcrafted with the finest natural tobacco leaves for a pure and
              traditional smoking experience.
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
              A brand that has built its reputation on trust, consistency, and
              commitment to quality over the years.
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
              Loved by thousands across India, Lion Bidi continues to be the
              choice of loyal customers who value quality and tradition.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
