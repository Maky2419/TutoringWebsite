import type { Metadata } from "next";
import "./globals.css";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: {
    default: "K-Cube Tutoring",
    template: "%s | K-Cube Tutoring",
  },
  description:
    "K-Cube Tutoring offers personalized tutoring for students all around the world.",
  keywords: [
    "K-Cube Tutoring",
    "Kcube Tutoring",
    "KcubedTutoring",
    "K Cubed Tutoring",
    "online tutoring",
    "tutoring",
    "private tutoring",
    "university tutoring",
    "high school tutoring",
    "Kelowna tutoring",
    "Canada tutoring",
  ],
  metadataBase: new URL("https://kcubed.ca"),
  alternates: {
    canonical: "https://kcubed.ca/",
  },
  openGraph: {
    title: "K-Cube Tutoring",
    description:
      "K-Cube Tutoring offers personalized tutoring for students all around the world.",
    url: "https://kcubed.ca/",
    siteName: "K-Cube Tutoring",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "K-Cube Tutoring",
    description:
      "K-Cube Tutoring offers personalized tutoring for students all around the world.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
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