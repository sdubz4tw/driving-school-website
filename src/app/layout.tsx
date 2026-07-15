import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Michael Wong Driving School | San Francisco Bay Area",
    template: "%s | Michael Wong Driving School"
  },
  description: "Patient behind-the-wheel driving instruction in the SF Bay Area. DMV permit prep, anxious driver training, and free pickup/drop-off. Book today!",
  keywords: [
    "driving instruction San Francisco",
    "Bay Area driving school",
    "patient driving instructors",
    "behind the wheel training",
    "DMV road test preparation",
    "complimentary pickup drop-off",
    "San Francisco driving lessons",
    "anxious teen driver training"
  ],
  metadataBase: new URL("https://www.michaelwongdrivingschool.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.michaelwongdrivingschool.com",
    title: "Michael Wong Driving School | San Francisco Bay Area",
    description: "Patient behind-the-wheel driving instruction in the SF Bay Area. DMV permit prep, anxious driver training, and free pickup/drop-off. Book today!",
    siteName: "Michael Wong Driving School",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Michael Wong Driving School - San Francisco Bay Area"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Michael Wong Driving School | San Francisco Bay Area",
    description: "Patient behind-the-wheel driving instruction in the SF Bay Area. DMV permit prep, anxious driver training, and free pickup/drop-off.",
    images: ["/og-image.jpg"]
  }
};

import { Providers } from "./providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
