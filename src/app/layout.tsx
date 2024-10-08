import type { Metadata } from "next";
import { IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Layout from "@/components/layout";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
const font = JetBrains_Mono({
  subsets: ["latin", "greek"],
});

export const metadata: Metadata = {
  title: "Λογοτεχνικές διαδρομές στην ιστορία",
  description: `ετήσιο πρόγραμμα φιλαναγνωσίας`,
  authors: [{ name: "Αλεξάνδρα Μητσιάλη" }, { name: "Στράτος Ιλερής" }],
  creator: "Στράτος Ιλερής",
  metadataBase: new URL("https://logotexnikes-diadromes.gr"),
  openGraph: {
    emails: [
      "info@logotexnikes-diadromes.gr",
      "support@logotexnikes-diadromes.gr",
    ],
    title: "Λογοτεχνικές διαδρομές στην ιστορία",
    url: "https://logotexnikes-diadromes.gr",
    description: `ετήσιο πρόγραμμα φιλαναγνωσίας`,
    images: "/og-image.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${font.className} `}>
        <Layout>{children}</Layout>
        <SpeedInsights
          //@ts-ignore
          beforeSend={async (data) => {
            "use server";
            if (data.url.includes("/announcements/s")) {
              return null;
            }
            return data;
          }}
        />
        <Analytics />
      </body>
    </html>
  );
}
