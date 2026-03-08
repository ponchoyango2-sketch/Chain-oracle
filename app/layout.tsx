import "./globals.css";
import Providers from "./providers";
import type { Metadata } from "next";

const miniAppEmbed = {
  version: "1",
  imageUrl: "https://chain-oracle.vercel.app/preview.png",
  button: {
    title: "Open App",
    action: {
      type: "launch_frame",
      name: "Chain Oracle",
      url: "https://chain-oracle.vercel.app",
      splashImageUrl: "https://chain-oracle.vercel.app/preview.png",
      splashBackgroundColor: "#ffffff",
    },
  },
};

export const metadata: Metadata = {
  metadataBase: new URL("https://chain-oracle.vercel.app"),
  title: "Chain Oracle",
  description: "Prediction powered by blockchain",
  openGraph: {
    title: "Chain Oracle",
    description: "Prediction powered by blockchain",
    url: "https://chain-oracle.vercel.app",
    siteName: "Chain Oracle",
    images: [
      {
        url: "/preview.png",
        width: 1200,
        height: 630,
        alt: "Chain Oracle",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chain Oracle",
    description: "Prediction powered by blockchain",
    images: ["/preview.png"],
  },
  other: {
    "fc:miniapp": JSON.stringify(miniAppEmbed),
    "fc:frame": JSON.stringify(miniAppEmbed),
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
