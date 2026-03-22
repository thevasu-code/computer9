export const metadata = {
  title: "Return and Refund Policy | Computer9",
  description: "Return and refund policy for Computer9 orders.",
};

export default function ReturnRefundPage() {
  return (
    <main style={{ maxWidth: "980px", margin: "0 auto", padding: "28px 16px 36px", color: "#1f2a37" }}>
      <h1 style={{ fontSize: "30px", fontWeight: 800, marginBottom: "10px" }}>Return and Refund Policy</h1>
      <p style={{ color: "#5b6675", fontSize: "14px", marginBottom: "20px" }}>Last updated: March 22, 2026</p>

      <section style={{ background: "#fff", border: "1px solid #e6edf8", borderRadius: "12px", padding: "18px", lineHeight: 1.75 }}>
        <h2 style={{ fontSize: "19px", marginBottom: "8px" }}>Return Window</h2>
        <p>
          You may request a return within 7 days of delivery for eligible products that are unused,
          in original packaging, and include all accessories.
        </p>
        <h2 style={{ fontSize: "19px", marginTop: "18px", marginBottom: "8px" }}>Non-Returnable Items</h2>
        <p>
          Products damaged due to misuse, missing serial labels, or incomplete packaging may not be accepted.
          Customized, special-order, and software-license products may be non-returnable.
        </p>
        <h2 style={{ fontSize: "19px", marginTop: "18px", marginBottom: "8px" }}>Refund Process</h2>
        <p>
          After item inspection, approved refunds are processed to the original payment method.
          Refund timelines typically range from 5 to 10 business days based on payment provider policies.
        </p>
        <h2 style={{ fontSize: "19px", marginTop: "18px", marginBottom: "8px" }}>Support Contact</h2>
        <p>
          For return/refund requests, contact us at info@computer9.in or +91 97519 78686 with your order ID.
        </p>
      </section>
    </main>
  );
}
