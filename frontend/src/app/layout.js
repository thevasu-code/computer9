

import "./globals.css";
import Header from "../components/Header";
import { CartProvider } from "../context/CartContext";

export const metadata = {
  title: "Computer9 - Computers & Hardware",
  description: "Best deals on computers, hardware and accessories",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily: "Roboto, 'Helvetica Neue', Arial, sans-serif", background: '#f1f3f6', margin: 0 }}>
        <CartProvider>
          <Header />
          <div style={{ minHeight: '100vh', background: '#f1f3f6' }}>
            {children}
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
