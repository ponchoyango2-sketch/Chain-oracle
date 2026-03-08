import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").toUpperCase();

  const predictions: Record<string, string[]> = {
    ETH: [
      "ETH muestra presión alcista.",
      "ETH podría consolidar antes de subir.",
      "ETH se acerca a una zona de decisión.",
      "ETH mantiene estructura positiva.",
      "ETH podría sorprender con un movimiento fuerte."
    ],
    BTC: [
      "BTC está probando una resistencia importante.",
      "BTC podría entrar en fase de acumulación.",
      "BTC muestra señales de volatilidad creciente.",
      "BTC podría romper al alza pronto.",
      "BTC se mantiene fuerte en el mercado."
    ],
    SOL: [
      "SOL mantiene alto volumen.",
      "SOL podría iniciar nuevo impulso.",
      "SOL muestra interés institucional.",
      "SOL podría experimentar volatilidad fuerte.",
      "SOL se mantiene sólido en el ecosistema."
    ],
    BASE: [
      "El ecosistema Base sigue creciendo.",
      "Base podría atraer nuevos proyectos.",
      "Base muestra fuerte adopción.",
      "Base podría sorprender en el corto plazo.",
      "Base sigue ganando tracción."
    ]
  };

  const list = predictions[q] || ["El oráculo aún no tiene datos para este token."];

  const randomPrediction = list[Math.floor(Math.random() * list.length)];

  return NextResponse.json({
    asset: q,
    prediction: randomPrediction
  });
}
