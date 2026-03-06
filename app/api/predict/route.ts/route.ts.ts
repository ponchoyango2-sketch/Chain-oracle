import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").toUpperCase();

  const predictions: Record<string, string> = {
    ETH: "ETH muestra fuerza alcista si mantiene soporte.",
    BTC: "BTC podría romper resistencia pronto.",
    SOL: "SOL mantiene alto volumen y volatilidad.",
    BASE: "El ecosistema Base sigue creciendo rápidamente."
  };

  return NextResponse.json({
    asset: q,
    prediction: predictions[q] || "Sin datos todavía"
  });
}