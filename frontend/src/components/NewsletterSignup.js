"use client";
import { useState } from "react";
import { Mail, CheckCircle } from "lucide-react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    // In production, POST to /api/newsletter
    setSubmitted(true);
    setEmail("");
  };

  return (
    <section className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white">
      <div className="max-w-xl mx-auto text-center">
        <Mail size={28} className="mx-auto mb-3 text-blue-200" />
        <h3 className="text-lg sm:text-xl font-bold">Get 10% Off Your First Order</h3>
        <p className="text-sm text-blue-100 mt-1 mb-5">
          Subscribe to our newsletter for exclusive deals, new arrivals & tech tips.
        </p>

        {submitted ? (
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-green-200">
            <CheckCircle size={18} />
            You&apos;re subscribed! Check your inbox.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-blue-200 focus:outline-none focus:bg-white/20 focus:border-white/40 backdrop-blur-sm"
            />
            <button
              type="submit"
              className="px-5 py-3 bg-white text-blue-700 font-semibold rounded-lg text-sm hover:bg-gray-50 transition-colors shrink-0"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
