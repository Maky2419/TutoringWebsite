import type { Metadata } from "next";
import "./globals.css";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: {
    default: "K-Cubed Tutoring",
    template: "%s | K-Cubed Tutoring",
  },
  description:
    "K-Cubed Tutoring provides personalized academic support for high school and university students worldwide.",
  icons: {
    icon: "/favicon.png",
  },
  keywords: [
    "K-Cubed Tutoring",
    "K Cubed Tutoring",
    "Kcubed Tutoring",
    "KcubedTutoring",
    "online tutoring",
    "private tutoring",
    "university tutoring",
    "high school tutoring",
    "Kelowna tutoring",
    "Canada tutoring",
  ],
  metadataBase: new URL("https://kcubed.ca"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <NavBar />
        <main className="min-h-[70vh]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}