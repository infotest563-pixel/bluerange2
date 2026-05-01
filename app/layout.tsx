import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

// ✅ ISR with on-demand revalidation (not force-dynamic)
export const revalidate = 0; // Only revalidate via webhook

export const metadata: Metadata = {
  title: "Bluerange",
  description: "Swedish Cloud Services",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
