export const metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for Computer9 website and services.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-400 mb-8">Last updated: March 22, 2026</p>

      <article className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 prose prose-sm prose-gray max-w-none">
        <p>
          Computer9 respects your privacy and is committed to protecting your personal information.
          This policy explains what information we collect, how we use it, and your choices.
        </p>
        <h2>Information We Collect</h2>
        <p>
          We may collect your name, email address, phone number, billing and shipping details,
          order history, and payment-related metadata required to process purchases.
        </p>
        <h2>How We Use Information</h2>
        <p>
          We use your information to process orders, provide customer support, send order updates,
          improve our website, and prevent fraud.
        </p>
        <h2>Data Sharing</h2>
        <p>
          We do not sell your personal data. We may share limited data with logistics partners,
          payment providers, and service providers only as needed to operate our ecommerce services.
        </p>
        <h2>Your Rights</h2>
        <p>
          You may request to update or delete your account information by contacting us at info@computer9.in.
        </p>
      </article>
    </main>
  );
}
