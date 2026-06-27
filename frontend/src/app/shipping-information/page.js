export const metadata = {
  title: "Shipping Information",
  description: "Shipping and delivery information for Computer9.",
};

export default function ShippingInfoPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Shipping Information</h1>
      <p className="text-sm text-gray-400 mb-8">Last updated: March 22, 2026</p>

      <article className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 prose prose-sm prose-gray max-w-none">
        <h2>Order Processing</h2>
        <p>
          Orders are typically processed within 1-2 business days after payment confirmation.
          Orders placed on Sundays or holidays are processed on the next business day.
        </p>
        <h2>Delivery Timeline</h2>
        <p>
          Standard delivery usually takes 3-7 business days, depending on location and courier availability.
          Remote area deliveries may require additional time.
        </p>
        <h2>Shipping Charges</h2>
        <p>
          Shipping charges, if applicable, are displayed at checkout before payment.
          Promotional free-shipping offers may apply to selected orders.
        </p>
        <h2>Tracking and Support</h2>
        <p>
          You can track order status from your account dashboard. For shipping assistance,
          contact info@computer9.in or +91 97519 78686.
        </p>
      </article>
    </main>
  );
}
