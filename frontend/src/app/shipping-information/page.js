export const metadata = {
  title: "Shipping Information | Computer9",
  description: "Shipping and delivery information for Computer9.",
};

export default function ShippingInfoPage() {
  return (
    <main style={{ maxWidth: "980px", margin: "0 auto", padding: "28px 16px 36px", color: "#1f2a37" }}>
      <h1 style={{ fontSize: "30px", fontWeight: 800, marginBottom: "10px" }}>Shipping Information</h1>
      <p style={{ color: "#5b6675", fontSize: "14px", marginBottom: "20px" }}>Last updated: March 22, 2026</p>

      <section style={{ background: "#fff", border: "1px solid #e6edf8", borderRadius: "12px", padding: "18px", lineHeight: 1.75 }}>
        <h2 style={{ fontSize: "19px", marginBottom: "8px" }}>Order Processing</h2>
        <p>
          Orders are typically processed within 1-2 business days after payment confirmation.
          Orders placed on Sundays or holidays are processed on the next business day.
        </p>
        <h2 style={{ fontSize: "19px", marginTop: "18px", marginBottom: "8px" }}>Delivery Timeline</h2>
        <p>
          Standard delivery usually takes 3-7 business days, depending on location and courier availability.
          Remote area deliveries may require additional time.
        </p>
        <h2 style={{ fontSize: "19px", marginTop: "18px", marginBottom: "8px" }}>Shipping Charges</h2>
        <p>
          Shipping charges, if applicable, are displayed at checkout before payment.
          Promotional free-shipping offers may apply to selected orders.
        </p>
        <h2 style={{ fontSize: "19px", marginTop: "18px", marginBottom: "8px" }}>Tracking and Support</h2>
        <p>
          You can track order status from your account dashboard. For shipping assistance,
          contact info@computer9.in or +91 97519 78686.
        </p>
      </section>
    </main>
  );
}
