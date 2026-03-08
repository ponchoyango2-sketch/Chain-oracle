import { NextResponse } from "next/server";

type Signal = "bullish" | "bearish" | "neutral" | "mystical";
type Horizon = "short" | "medium" | "long";

type PredictionEntry = {
  text: string;
  signal: Signal;
  minConfidence: number;
  maxConfidence: number;
  horizon: Horizon;
};

const TOKEN_LIBRARY: Record<string, PredictionEntry[]> = {
  BTC: [
    {
      text: "BTC está defendiendo una zona importante y podría intentar un nuevo impulso.",
      signal: "bullish",
      minConfidence: 68,
      maxConfidence: 88,
      horizon: "short",
    },
    {
      text: "BTC muestra compresión de precio; un movimiento fuerte podría estar cerca.",
      signal: "neutral",
      minConfidence: 60,
      maxConfidence: 79,
      horizon: "short",
    },
    {
      text: "BTC enfrenta presión cerca de resistencia y podría retroceder antes de continuar.",
      signal: "bearish",
      minConfidence: 62,
      maxConfidence: 81,
      horizon: "short",
    },
    {
      text: "El oráculo detecta fuerza estructural en BTC mientras el mercado observa el volumen.",
      signal: "mystical",
      minConfidence: 70,
      maxConfidence: 90,
      horizon: "medium",
    },
    {
      text: "BTC podría entrar en consolidación antes de definir su próximo tramo direccional.",
      signal: "neutral",
      minConfidence: 58,
      maxConfidence: 77,
      horizon: "medium",
    },
  ],

  ETH: [
    {
      text: "ETH mantiene un sesgo alcista si conserva soporte y liquidez compradora.",
      signal: "bullish",
      minConfidence: 67,
      maxConfidence: 87,
      horizon: "short",
    },
    {
      text: "ETH podría desacelerar momentáneamente antes de retomar fuerza.",
      signal: "neutral",
      minConfidence: 59,
      maxConfidence: 78,
      horizon: "short",
    },
    {
      text: "ETH enfrenta una zona de decisión técnica; el mercado pide confirmación.",
      signal: "neutral",
      minConfidence: 60,
      maxConfidence: 80,
      horizon: "medium",
    },
    {
      text: "La energía de ETH sugiere que aún no ha revelado todo su potencial.",
      signal: "mystical",
      minConfidence: 71,
      maxConfidence: 91,
      horizon: "long",
    },
    {
      text: "Si el impulso se enfría, ETH podría corregir antes de una nueva expansión.",
      signal: "bearish",
      minConfidence: 61,
      maxConfidence: 80,
      horizon: "short",
    },
  ],

  SOL: [
    {
      text: "SOL conserva dinamismo y podría sorprender con un movimiento veloz.",
      signal: "bullish",
      minConfidence: 69,
      maxConfidence: 89,
      horizon: "short",
    },
    {
      text: "SOL sigue mostrando alto interés especulativo y volatilidad elevada.",
      signal: "neutral",
      minConfidence: 63,
      maxConfidence: 82,
      horizon: "short",
    },
    {
      text: "SOL podría pausar su avance si el mercado reduce apetito por riesgo.",
      signal: "bearish",
      minConfidence: 60,
      maxConfidence: 79,
      horizon: "short",
    },
    {
      text: "El oráculo percibe aceleración latente en SOL dentro de su ecosistema.",
      signal: "mystical",
      minConfidence: 72,
      maxConfidence: 92,
      horizon: "medium",
    },
    {
      text: "SOL se mantiene como activo de reacción rápida, pero exige prudencia.",
      signal: "neutral",
      minConfidence: 64,
      maxConfidence: 83,
      horizon: "medium",
    },
  ],

  BASE: [
    {
      text: "Base sigue atrayendo atención y podría impulsar activos de su ecosistema.",
      signal: "bullish",
      minConfidence: 68,
      maxConfidence: 88,
      horizon: "medium",
    },
    {
      text: "La actividad en Base sugiere expansión, aunque con rotación rápida de narrativa.",
      signal: "neutral",
      minConfidence: 61,
      maxConfidence: 80,
      horizon: "short",
    },
    {
      text: "Base podría entrar en una pausa natural antes de una nueva ola de interés.",
      signal: "neutral",
      minConfidence: 59,
      maxConfidence: 78,
      horizon: "medium",
    },
    {
      text: "El oráculo ve una puerta abierta para que Base gane más tracción.",
      signal: "mystical",
      minConfidence: 73,
      maxConfidence: 93,
      horizon: "long",
    },
    {
      text: "Si el flujo especulativo se enfría, Base podría perder velocidad temporalmente.",
      signal: "bearish",
      minConfidence: 60,
      maxConfidence: 79,
      horizon: "short",
    },
  ],
};

const GENERIC_LIBRARY: PredictionEntry[] = [
  {
    text: "El activo muestra una energía cambiante; la confirmación del mercado será clave.",
    signal: "neutral",
    minConfidence: 55,
    maxConfidence: 76,
    horizon: "short",
  },
  {
    text: "La estructura sugiere posibilidad de impulso si entra volumen comprador.",
    signal: "bullish",
    minConfidence: 62,
    maxConfidence: 84,
    horizon: "short",
  },
  {
    text: "Existe riesgo de retroceso si el activo no sostiene la atención del mercado.",
    signal: "bearish",
    minConfidence: 58,
    maxConfidence: 79,
    horizon: "short",
  },
  {
    text: "El oráculo percibe que aún no se ha revelado la verdadera intención de este token.",
    signal: "mystical",
    minConfidence: 68,
    maxConfidence: 90,
    horizon: "medium",
  },
  {
    text: "Podría entrar en una fase de observación antes de mostrar dirección real.",
    signal: "neutral",
    minConfidence: 57,
    maxConfidence: 77,
    horizon: "medium",
  },
  {
    text: "Si la narrativa se fortalece, este activo podría reaccionar mejor de lo esperado.",
    signal: "bullish",
    minConfidence: 63,
    maxConfidence: 85,
    horizon: "medium",
  },
];

const SIGNAL_LABELS: Record<Signal, string> = {
  bullish: "Bullish",
  bearish: "Bearish",
  neutral: "Neutral",
  mystical: "Oracle",
};

const HORIZON_LABELS: Record<Horizon, string> = {
  short: "Corto plazo",
  medium: "Medio plazo",
  long: "Largo plazo",
};

function normalizeTicker(input: string): string {
  return input.trim().replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 12);
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildOracleFlavor(asset: string): string[] {
  return [
    La cadena observa a ${asset} con atención.,
    Los flujos de ${asset} todavía esconden intención.,
    ${asset} entra en una zona donde la paciencia vale más que la prisa.,
    El pulso de ${asset} sugiere que el mercado aún no decide todo.,
    ${asset} podría sorprender si la narrativa se fortalece.
  ];
}

function getLibraryForAsset(asset: string): PredictionEntry[] {
  const exact = TOKEN_LIBRARY[asset];
  if (exact) return exact;

  const dynamicFlavor = buildOracleFlavor(asset).map((text, i) => ({
    text,
    signal: (["neutral", "bullish", "mystical", "neutral", "bullish"][
      i
    ] ?? "neutral") as Signal,
    minConfidence: [56, 63, 70, 58, 64][i] ?? 60,
    maxConfidence: [77, 84, 91, 78, 86][i] ?? 80,
    horizon: (["short", "short", "medium", "medium", "long"][i] ??
      "medium") as Horizon,
  }));

  return [...GENERIC_LIBRARY, ...dynamicFlavor];
}

function buildSummary(asset: string, entry: PredictionEntry, confidence: number): string {
  const signalText = SIGNAL_LABELS[entry.signal];
  const horizonText = HORIZON_LABELS[entry.horizon];

  return ${asset}: ${entry.text} Señal ${signalText} con confianza estimada de ${confidence}% para ${horizonText.toLowerCase()}.;
}

function buildWarning(signal: Signal): string {
  switch (signal) {
    case "bullish":
      return "Las señales alcistas pueden invalidarse si cae el volumen o falla el soporte.";
    case "bearish":
      return "Las señales bajistas pueden revertirse con entrada fuerte de compradores.";
    case "neutral":
      return "La indecisión del mercado puede romperse rápido en cualquier dirección.";
    case "mystical":
      return "La lectura del oráculo es narrativa y debe confirmarse con precio y volumen.";
    default:
      return "Confirma siempre con tu propio análisis.";
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawQuery = searchParams.get("q") || "";
    const asset = normalizeTicker(rawQuery);

    if (!asset) {
      return NextResponse.json(
        {
          ok: false,
          error: "Debes enviar un ticker. Ejemplo: BTC, ETH, SOL o BASE.",
        },
        { status: 400 }
      );
    }

    const library = getLibraryForAsset(asset);
    const selected = pickRandom(library);
    const confidence = randomInt(selected.minConfidence, selected.maxConfidence);

    const response = {
      ok: true,
      asset,
      prediction: selected.text,
      summary: buildSummary(asset, selected, confidence),
      signal: selected.signal,
      signalLabel: SIGNAL_LABELS[selected.signal],
      confidence,
      horizon: selected.horizon,
      horizonLabel: HORIZON_LABELS[selected.horizon],
      warning: buildWarning(selected.signal),
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Prediction API error:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "No se pudo consultar el oráculo en este momento.",
      },
      { status: 500 }
    );
  }
}
