import Link from "next/link";

const FOOTER_LINKS = {
  shop: [
    { label: "All Products", href: "/shop" },
    { label: "Laptops", href: "/shop" },
    { label: "Components", href: "/shop" },
    { label: "Accessories", href: "/shop" },
  ],
  support: [
    { label: "My Account", href: "/account/dashboard" },
    { label: "Track Orders", href: "/account/dashboard" },
    { label: "Wishlist", href: "/account/dashboard" },
    { label: "Help Center", href: "/account" },
  ],
  policy: [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms and Conditions", href: "/terms-and-conditions" },
    { label: "Return and Refund", href: "/return-and-refund" },
    { label: "Shipping Information", href: "/shipping-information" },
  ],
};

function FooterLinkGroup({ title, items }) {
  return (
    <div>
      <h3 style={{ color: "#fff", fontSize: "14px", fontWeight: 700, marginBottom: "12px", letterSpacing: "0.2px" }}>
        {title}
      </h3>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "8px" }}>
        {items.map((item) => (
          <li key={item.label}>
            <Link href={item.href} style={{ color: "#d4def0", textDecoration: "none", fontSize: "13px" }}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer style={{ background: "linear-gradient(130deg, #0f2c5d 0%, #133e7f 60%, #0d5e8c 100%)", color: "#fff", marginTop: "28px" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "26px 16px 14px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr 1fr", gap: "24px" }}>
          <div>
            <h2 style={{ fontSize: "22px", margin: 0, fontWeight: 800 }}>
              Computer9
            </h2>
            <p style={{ marginTop: "10px", color: "#d4def0", fontSize: "13px", lineHeight: 1.6, maxWidth: "360px" }}>
              Trusted electronics and computer store for desktops, laptops, components, and accessories with secure checkout and fast delivery.
            </p>
            <div style={{ marginTop: "14px", fontSize: "13px", color: "#e5edfb", lineHeight: 1.75 }}>
              <div><strong>Contact:</strong> +91 97519 78686</div>
              <div><strong>Email:</strong> info@computer9.in</div>
              <div>
                <strong>Office:</strong> Located in Luciya City Centre, 5th floor, 29,
                Shop no 509, 30, Sadar Patrappa Rd, Halsurpete, Nagarathpete,
                Bengaluru, Karnataka 560002
              </div>
            </div>
          </div>

          <FooterLinkGroup title="Shop" items={FOOTER_LINKS.shop} />
          <FooterLinkGroup title="Customer Support" items={FOOTER_LINKS.support} />
          <FooterLinkGroup title="Policy" items={FOOTER_LINKS.policy} />
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.2)", marginTop: "20px", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <p style={{ margin: 0, fontSize: "12px", color: "#d4def0" }}>
            Copyright {new Date().getFullYear()} Computer9. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: "12px", fontSize: "12px", color: "#d4def0", flexWrap: "wrap" }}>
            <span>Secure Payments</span>
            <span>Easy Returns</span>
            <span>Fast Shipping</span>
            <span>24x7 Support</span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 980px) {
          footer > div > div:first-child {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 620px) {
          footer > div {
            padding: 22px 12px 14px;
          }
          footer > div > div:first-child {
            grid-template-columns: 1fr;
            gap: 18px;
          }
        }
      `}</style>
    </footer>
  );
}
