import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim().toUpperCase();

  const predictions: Record<string, string> = {
    ETH: "ETH muestra fuerza y podría seguir alcista si mantiene soporte.",
    BTC: "BTC está en zona clave. Puede romper al alza si entra volumen.",
    SOL: "SOL tiene momentum positivo, pero ojo con la volatilidad.",
    BASE: "El ecosistema Base sigue creciendo con buena actividad.",
  };

  const text =
    predictions[q] ||
    No tengo predicción exacta para ${q} todavía.;

  return NextResponse.json({
    ok: true,
    text,
    asset: q,
    time: new Date().toISOString(),
  });
}