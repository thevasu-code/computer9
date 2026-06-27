export const metadata = {
  title: "Return and Refund Policy",
  description: "Return and refund policy for Computer9 orders.",
};

export default function ReturnRefundPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Return and Refund Policy</h1>
      <p className="text-sm text-gray-400 mb-8">Last updated: March 22, 2026</p>

      <article className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 prose prose-sm prose-gray max-w-none">
        <h2>Return Window</h2>
        <p>
          You may request a return within 7 days of delivery for eligible products that are unused,
          in original packaging, and include all accessories.
        </p>
        <h2>Non-Returnable Items</h2>
        <p>
          Products damaged due to misuse, missing serial labels, or incomplete packaging may not be accepted.
          Customized, special-order, and software-license products may be non-returnable.
        </p>
        <h2>Refund Process</h2>
        <p>
          After item inspection, approved refunds are processed to the original payment method.
          Refund timelines typically range from 5 to 10 business days based on payment provider policies.
        </p>
        <h2>Support Contact</h2>
        <p>
          For return/refund requests, contact us at info@computer9.in or +91 97519 78686 with your order ID.
        </p>
      </article>
    </main>
  );
}
