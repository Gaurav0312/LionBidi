import React from "react";
import { useState } from "react";
import { MapPin, Mail, Phone } from "lucide-react";
import emailjs from "emailjs-com";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1️⃣ Send email with EmailJS
    emailjs
      .send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID,
        process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
        {
          name: formData.name,
          email: formData.email,
          message: formData.message,
        },
        process.env.REACT_APP_EMAILJS_PUBLIC_KEY
      )
      .then(() => console.log("✅ Email sent!"))
      .catch((err) => console.error("❌ Email error:", err));

    // 2️⃣ Save message to MongoDB
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        console.log("✅ Message saved in MongoDB");
        alert("Message sent successfully!");
        setFormData({ name: "", email: "", message: "" });
      } else {
        console.error("❌ Failed to save message in MongoDB");
      }
    } catch (err) {
      console.error("❌ Error saving message:", err);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-25 to-yellow-50 flex flex-col">
      {/* Hero Section */}
      <div className="text-center py-12 md:py-16 px-4 md:px-6">
        <h1 className="text-2xl md:text-3xl font-bold text-divine-orange mb-3 md:mb-4">
          Contact Us
        </h1>
        <p className="max-w-2xl mx-auto text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed">
          Whether you want to learn more about our products, need support, or
          just want to connect, we’re always happy to hear from you. Reach out
          using any of the methods below or drop us a quick message.
        </p>
      </div>

      {/* Contact Info Section */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-12 md:pb-16">
        <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
          {/* Address */}
          <div className="bg-white border border-purple-100 rounded-2xl shadow-sm p-6 sm:p-8 text-center hover:shadow-md transition-all">
            <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-4 flex items-center justify-center rounded-full bg-orange-100">
              <MapPin size={22} className="text-orange-600" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-divine-orange mb-2">
              Address
            </h3>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              Chhatarpur, Madhya Pradesh
              <br />
              India
            </p>
          </div>

          {/* Email */}
          <div className="bg-white border border-purple-100 rounded-2xl shadow-sm p-6 sm:p-8 text-center hover:shadow-md transition-all">
            <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-4 flex items-center justify-center rounded-full bg-orange-100">
              <Mail size={22} className="text-orange-600" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-divine-orange mb-2">
              Email
            </h3>
            <a
              href="mailto:lionbidicompany@gmail.com"
              className="text-gray-600 text-sm sm:text-base hover:underline"
            >
              lionbidicompany@gmail.com
            </a>
          </div>

          {/* Phone */}
          <div className="bg-white border border-purple-100 rounded-2xl shadow-sm p-6 sm:p-8 text-center hover:shadow-md transition-all">
            <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-4 flex items-center justify-center rounded-full bg-orange-100">
              <Phone size={22} className="text-orange-600" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-divine-orange mb-2">
              Phone
            </h3>
            <a
              className="text-gray-600 text-sm sm:text-base hover:underline"
              href="tel:+919589773525"
            >
              +91 9589773525
            </a>
            <p className="text-xs sm:text-sm text-divine-orange font-medium mt-1">
              Available Hours:
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              10:00 AM – 7:00 PM IST
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="mt-10 sm:mt-12 bg-white border border-orange-200 rounded-2xl shadow p-6 sm:p-8 md:p-10 space-y-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">
            Ask us Anything
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@gmail.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Message
              </label>
              <textarea
                name="message"
                rows="4"
                value={formData.message}
                onChange={handleChange}
                placeholder="Type your message..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 sm:py-4 bg-divine-orange hover:bg-divine-orange/90 text-white font-semibold rounded-xl shadow-lg transition-all text-sm sm:text-base"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
