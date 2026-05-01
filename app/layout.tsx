import type { Metadata } from "next";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

// ✅ FORCE ENTIRE APP TO BE DYNAMIC (NO STATIC GENERATION)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
