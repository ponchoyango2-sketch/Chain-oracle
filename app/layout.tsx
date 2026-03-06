import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "Chain Oracle",
  description: "Prediction powered by blockchain",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}