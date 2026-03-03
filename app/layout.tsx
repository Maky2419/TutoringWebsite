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
  alternates: {
    canonical: "https://kcubed.ca/",
  },
  openGraph: {
    title: "K-Cubed Tutoring",
    description:
      "K-Cubed Tutoring provides personalized academic support for high school and university students worldwide.",
    url: "https://kcubed.ca/",
    siteName: "K-Cubed Tutoring",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "K-Cubed Tutoring",
    description:
      "K-Cubed Tutoring provides personalized academic support for high school and university students worldwide.",
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

        {/* Structured Data for Brand SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              name: "K-Cubed Tutoring",
              alternateName: [
                "K Cubed Tutoring",
                "Kcubed Tutoring",
                "KcubedTutoring"
              ],
              url: "https://kcubed.ca",
            }),
          }}
        />
      </body>
    </html>
  );
}