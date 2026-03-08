import "./globals.css";
import Providers from "./providers";

export const metadata = {
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
