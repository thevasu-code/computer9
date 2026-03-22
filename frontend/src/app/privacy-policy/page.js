export const metadata = {
  title: "Privacy Policy | Computer9",
  description: "Privacy policy for Computer9 website and services.",
};

export default function PrivacyPolicyPage() {
  return (
    <main style={{ maxWidth: "980px", margin: "0 auto", padding: "28px 16px 36px", color: "#1f2a37" }}>
      <h1 style={{ fontSize: "30px", fontWeight: 800, marginBottom: "10px" }}>Privacy Policy</h1>
      <p style={{ color: "#5b6675", fontSize: "14px", marginBottom: "20px" }}>Last updated: March 22, 2026</p>

      <section style={{ background: "#fff", border: "1px solid #e6edf8", borderRadius: "12px", padding: "18px", lineHeight: 1.75 }}>
        <p>
          Computer9 respects your privacy and is committed to protecting your personal information.
          This policy explains what information we collect, how we use it, and your choices.
        </p>
        <h2 style={{ fontSize: "19px", marginTop: "18px", marginBottom: "8px" }}>Information We Collect</h2>
        <p>
          We may collect your name, email address, phone number, billing and shipping details,
          order history, and payment-related metadata required to process purchases.
        </p>
        <h2 style={{ fontSize: "19px", marginTop: "18px", marginBottom: "8px" }}>How We Use Information</h2>
        <p>
          We use your information to process orders, provide customer support, send order updates,
          improve our website, and prevent fraud.
        </p>
        <h2 style={{ fontSize: "19px", marginTop: "18px", marginBottom: "8px" }}>Data Sharing</h2>
        <p>
          We do not sell your personal data. We may share limited data with logistics partners,
          payment providers, and service providers only as needed to operate our ecommerce services.
        </p>
        <h2 style={{ fontSize: "19px", marginTop: "18px", marginBottom: "8px" }}>Your Rights</h2>
        <p>
          You may request to update or delete your account information by contacting us at info@computer9.in.
        </p>
      </section>
    </main>
  );
}
