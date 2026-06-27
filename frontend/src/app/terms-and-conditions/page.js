export const metadata = {
  title: "Terms and Conditions",
  description: "Terms and conditions for shopping on Computer9.",
};

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms and Conditions</h1>
      <p className="text-sm text-gray-400 mb-8">Last updated: March 22, 2026</p>

      <article className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 prose prose-sm prose-gray max-w-none">
        <p>
          By using Computer9, you agree to these terms. Please read them carefully before placing an order.
        </p>
        <h2>Product Information</h2>
        <p>
          We aim to keep product details and pricing accurate, but occasional errors may occur.
          Computer9 reserves the right to correct any errors and cancel affected orders when required.
        </p>
        <h2>Orders and Payments</h2>
        <p>
          Orders are confirmed only after successful payment and internal verification.
          We may decline or cancel orders due to stock issues, pricing errors, or suspected fraud.
        </p>
        <h2>User Responsibilities</h2>
        <p>
          You are responsible for providing accurate account and delivery details.
          Any misuse of the website, payment abuse, or illegal activity is strictly prohibited.
        </p>
        <h2>Limitation of Liability</h2>
        <p>
          Computer9 is not liable for indirect or consequential damages arising from website use,
          service disruptions, or delayed deliveries beyond reasonable control.
        </p>
      </article>
    </main>
  );
}
