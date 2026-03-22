export const metadata = {
  title: "Terms and Conditions | Computer9",
  description: "Terms and conditions for shopping on Computer9.",
};

export default function TermsPage() {
  return (
    <main style={{ maxWidth: "980px", margin: "0 auto", padding: "28px 16px 36px", color: "#1f2a37" }}>
      <h1 style={{ fontSize: "30px", fontWeight: 800, marginBottom: "10px" }}>Terms and Conditions</h1>
      <p style={{ color: "#5b6675", fontSize: "14px", marginBottom: "20px" }}>Last updated: March 22, 2026</p>

      <section style={{ background: "#fff", border: "1px solid #e6edf8", borderRadius: "12px", padding: "18px", lineHeight: 1.75 }}>
        <p>
          By using Computer9, you agree to these terms. Please read them carefully before placing an order.
        </p>
        <h2 style={{ fontSize: "19px", marginTop: "18px", marginBottom: "8px" }}>Product Information</h2>
        <p>
          We aim to keep product details and pricing accurate, but occasional errors may occur.
          Computer9 reserves the right to correct any errors and cancel affected orders when required.
        </p>
        <h2 style={{ fontSize: "19px", marginTop: "18px", marginBottom: "8px" }}>Orders and Payments</h2>
        <p>
          Orders are confirmed only after successful payment and internal verification.
          We may decline or cancel orders due to stock issues, pricing errors, or suspected fraud.
        </p>
        <h2 style={{ fontSize: "19px", marginTop: "18px", marginBottom: "8px" }}>User Responsibilities</h2>
        <p>
          You are responsible for providing accurate account and delivery details.
          Any misuse of the website, payment abuse, or illegal activity is strictly prohibited.
        </p>
        <h2 style={{ fontSize: "19px", marginTop: "18px", marginBottom: "8px" }}>Limitation of Liability</h2>
        <p>
          Computer9 is not liable for indirect or consequential damages arising from website use,
          service disruptions, or delayed deliveries beyond reasonable control.
        </p>
      </section>
    </main>
  );
}
