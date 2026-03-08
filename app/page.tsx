"use client";

import { useEffect, useMemo, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { sdk } from "@farcaster/miniapp-sdk";
import { useAccount, useBalance } from "wagmi";

type PredictionResponse = {
  ok: boolean;
  asset?: string;
  prediction?: string;
  summary?: string;
  signal?: "bullish" | "bearish" | "neutral" | "mystical";
  signalLabel?: string;
  confidence?: number;
  horizon?: "short" | "medium" | "long";
  horizonLabel?: string;
  warning?: string;
  timestamp?: string;
  error?: string;
};

const CLX_TOKEN_ADDRESS = "0xebb08e5b88789be6fe2d16c14826e1ef82f0139d";
const CLX_DECIMALS = 18; 

const QUICK_TICKERS = ["BTC", "ETH", "SOL", "BASE"];
type WheelRewardType = "clx" | "prediction" | "badge" | "boost";

type WheelPrize = {
  id: string;
  label: string;
  weight: number;
  rewardType: WheelRewardType;
  amount?: number;
  color: string;
};

const SPIN_COST_CLX = 100;

const WHEEL_PRIZES: WheelPrize[] = [
  { id: "p1", label: "40 CLX", weight: 550, rewardType: "clx", amount: 40, color: "#4ade80" },
  { id: "p2", label: "60 CLX", weight: 200, rewardType: "clx", amount: 60, color: "#22c55e" },
  { id: "p3", label: "3 Predicciones", weight: 120, rewardType: "prediction", amount: 3, color: "#60a5fa" },
  { id: "p4", label: "100 CLX", weight: 80, rewardType: "clx", amount: 100, color: "#facc15" },
  { id: "p5", label: "Boost Oracle", weight: 40, rewardType: "boost", amount: 1, color: "#a78bfa" },
  { id: "p6", label: "Badge Legendario", weight: 10, rewardType: "badge", amount: 1, color: "#f472b6" },
];

function pickWeightedPrize(items: WheelPrize[]) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * total;

  for (const item of items) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }

  return items[items.length - 1];
}

export default function Home() {
  
  const [spinning, setSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [wheelResult, setWheelResult] = useState<WheelPrize | null>(null);
  const [extraPredictions, setExtraPredictions] = useState(0);
  const [boostCount, setBoostCount] = useState(0);
  const [badges, setBadges] = useState<string[]>([]);
  const [clxRewardsWon, setClxRewardsWon] = useState(0);
  const { address, isConnected } = useAccount();
  const { data: clxBalanceData } = useBalance({
  address,
  token: CLX_TOKEN_ADDRESS as `0x${string}`,
});

  const clxBalance = clxBalanceData
  ? Number(formatUnits(clxBalanceData.value, CLX_DECIMALS))
  : 0;

  const canSpin = isConnected && clxBalance >= SPIN_COST_CLX;
  const [freeUsed, setFreeUsed] = useState(0);
  const FREE_LIMIT = 3;
  const FREE_STORAGE_KEY = "chain_oracle_free_predictions_used";
  const [crypto, setCrypto] = useState("ETH");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [history, setHistory] = useState<PredictionResponse[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  
useEffect(() => {
  try {
    const saved = window.localStorage.getItem(FREE_STORAGE_KEY);
    const used = saved ? Number(saved) : 0;
    setFreeUsed(Number.isFinite(used) ? used : 0);
  } catch (error) {
    console.error("No se pudo leer freeUsed:", error);
  }
}, []);

useEffect(() => {
  const initMiniApp = async () => {
    try {
      await sdk.actions.ready();
    } catch (error) {
      console.error("Mini App SDK no disponible:", error);
    }
  };

  initMiniApp();
}, []);

  const totalAvailablePredictions = FREE_LIMIT + extraPredictions;
const freeRemaining = Math.max(totalAvailablePredictions - freeUsed, 0);
const freeBlocked = freeUsed >= totalAvailablePredictions;

const signalStyle = useMemo(() => {
  switch (result?.signal) {
    case "bullish":
      return {
        label: "Bullish",
          bg: "rgba(39, 209, 127, 0.14)",
          border: "1px solid rgba(39, 209, 127, 0.35)",
          color: "#8affc1",
        };
      case "bearish":
        return {
          label: "Bearish",
          bg: "rgba(255, 92, 92, 0.14)",
          border: "1px solid rgba(255, 92, 92, 0.35)",
          color: "#ff9b9b",
        };
      case "neutral":
        return {
          label: "Neutral",
          bg: "rgba(255, 255, 255, 0.08)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          color: "#dcdcdc",
        };
      case "mystical":
        return {
          label: "Oracle",
          bg: "rgba(168, 85, 247, 0.16)",
          border: "1px solid rgba(168, 85, 247, 0.35)",
          color: "#d7b4ff",
        };
      default:
        return {
          label: "Signal",
          bg: "rgba(255, 255, 255, 0.08)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          color: "#dcdcdc",
        };
    }
  }, [result?.signal]);

  function formatTime(iso?: string) {
    if (!iso) return "Sin hora";
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  }

  async function doPredict() {
    if (freeBlocked) {
  setErrorMessage(
    "Ya usaste tus 3 predicciones gratis. Compra CLX para desbloquear más consultas."
  );
  return;
}
    const q = crypto.trim().toUpperCase();

    if (!q) {
      setErrorMessage("Escribe un ticker válido.");
      setResult(null);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      setResult({
        ok: true,
        asset: q,
        prediction: "Consultando el oráculo...",
        summary: "El sistema está procesando la lectura de mercado.",
      });

      const res = await fetch(`/api/predict?q=${encodeURIComponent(q)}`, {
        cache: "no-store",
      });

      const data: PredictionResponse = await res.json();

      if (!res.ok || !data?.ok) {
        const message = data?.error || "Error al consultar el oráculo.";
        setErrorMessage(message);
        setResult(null);
        return;
      }

      setResult(data);
      setHistory((prev) => [data, ...prev].slice(0, 5));
      const nextUsed = freeUsed + 1;
setFreeUsed(nextUsed);

try {
  window.localStorage.setItem(FREE_STORAGE_KEY, String(nextUsed));
} catch (error) {
  console.error("No se pudo guardar freeUsed:", error);
}
    } catch (e: any) {
      setErrorMessage(e?.message || "Error inesperado.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }
  function spinWheel() {
  if (spinning) return;

  if (!isConnected) {
    setErrorMessage("Conecta tu wallet para jugar la ruleta con CLX.");
    return;
  }

  if (!canSpin) {
    setErrorMessage(`Necesitas al menos ${SPIN_COST_CLX} CLX para girar.`);
    return;
  }

  setErrorMessage("");
  setSpinning(true);

  const prize = pickWeightedPrize(WHEEL_PRIZES);

  const fullSpins = 5;
  const segmentAngle = 360 / WHEEL_PRIZES.length;
  const prizeIndex = WHEEL_PRIZES.findIndex((item) => item.id === prize.id);
  const targetAngle = 360 - prizeIndex * segmentAngle - segmentAngle / 2;
  const newRotation = wheelRotation + fullSpins * 360 + targetAngle;

  setWheelRotation(newRotation);

  window.setTimeout(() => {
    setWheelResult(prize);

    if (prize.rewardType === "prediction" && prize.amount) {
      setExtraPredictions((prev) => prev + (prize.amount ?? 0));
    }

    if (prize.rewardType === "boost" && prize.amount) {
      setBoostCount((prev) => prev + (prize.amount ?? 0));
    }

    if (prize.rewardType === "badge") {
      setBadges((prev) =>
        prev.includes(prize.label) ? prev : [...prev, prize.label]
      );
    }

    if (prize.rewardType === "clx") {
  setClxRewardsWon((prev) => prev + (prize.amount ?? 0));
}
    

    setSpinning(false);
  }, 3200);
}

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "32px 20px",
        background:
          "radial-gradient(circle at top, rgba(30,120,80,0.35), transparent 30%), linear-gradient(180deg, #07110d 0%, #0b1410 45%, #050806 100%)",
        color: "white",
        fontFamily:
          'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            marginBottom: 28,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-block",
                padding: "6px 12px",
                borderRadius: 999,
                background: "rgba(80,255,170,0.12)",
                border: "1px solid rgba(80,255,170,0.22)",
                color: "#8affc1",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              ☛ Live on Base
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "clamp(38px, 7vw, 72px)",
                lineHeight: 1,
                fontWeight: 900,
                letterSpacing: -2,
              }}
            >
              《 Chain Oracle 》
            </h1>

            <p
              style={{
                marginTop: 14,
                marginBottom: 0,
                maxWidth: 680,
                fontSize: 18,
                lineHeight: 1.5,
                color: "rgba(255,255,255,0.78)",
              }}
            >
              ☛ Predicciones exclusivas con lectura de mercado, señal, confianza
              y horizonte operativo.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <ConnectButton.Custom>
  {({
    account,
    chain,
    openAccountModal,
    openChainModal,
    openConnectModal,
    mounted,
    authenticationStatus,
  }) => {
    const ready = mounted && authenticationStatus !== "loading";
    const connected =
      ready &&
      account &&
      chain &&
      (!authenticationStatus || authenticationStatus === "authenticated");

    return (
      <div
        {...(!ready && {
          "aria-hidden": true,
          style: {
            opacity: 0,
            pointerEvents: "none",
            userSelect: "none",
          },
        })}
      >
        {!connected ? (
          <button
            type="button"
            onClick={() => {
              console.log("openConnectModal fired");
              openConnectModal?.();
            }}
            style={{
              padding: "12px 16px",
              borderRadius: 14,
              border: "1px solid rgba(80,255,170,0.35)",
              background: "linear-gradient(180deg, #27d17f, #159a5d)",
              color: "white",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Connect Wallet
          </button>
        ) : chain.unsupported ? (
          <button type="button" onClick={openChainModal}>
            Wrong network
          </button>
        ) : (
          <div style={{ display: "flex", gap: 12 }}>
            <button type="button" onClick={openChainModal}>
              {chain.name}
            </button>
            <button type="button" onClick={openAccountModal}>
              {account.displayName}
            </button>
          </div>
        )}
      </div>
    );
  }}
</ConnectButton.Custom>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 22,
          }}
        >
          <section
            style={{
              position: "relative",
              overflow: "hidden",
              borderRadius: 28,
              border: "1px solid rgba(255,255,255,0.10)",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))",
              boxShadow: "0 25px 80px rgba(0,0,0,0.35)",
              backdropFilter: "blur(14px)",
              padding: 26,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: "#63ffb2",
                  boxShadow: "0 0 16px rgba(99,255,178,0.7)",
                }}
              />
              <span
                style={{
                  fontSize: 13,
                  color: "#9bffd0",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  fontWeight: 700,
                }}
              >
                Oráculo activo
              </span>
            </div>

            <h2
              style={{
                margin: 0,
                fontSize: 28,
                lineHeight: 1.1,
                fontWeight: 800,
              }}
            >
              Consulta una predicción
            </h2>

            <p
              style={{
                marginTop: 10,
                marginBottom: 22,
                color: "rgba(255,255,255,0.72)",
                lineHeight: 1.6,
              }}
            >
              Escribe un ticker como BTC, ETH, SOL, BASE o cualquier otro token
              y recibe una lectura instantánea.
            </p>

            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              {QUICK_TICKERS.map((item) => (
                <button
                  key={item}
                  onClick={() => setCrypto(item)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 12,
                    border:
                      crypto === item
                        ? "1px solid rgba(80,255,170,0.45)"
                        : "1px solid rgba(255,255,255,0.10)",
                    background:
                      crypto === item
                        ? "rgba(80,255,170,0.14)"
                        : "rgba(255,255,255,0.04)",
                    color: "white",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  {item}
                </button>
              ))}
            </div>

            <div
              style={{
                marginTop: 18,
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <input
                value={crypto}
                onChange={(e) => setCrypto(e.target.value.toUpperCase())}
                placeholder="BTC / ETH / SOL / BASE"
                style={{
                  flex: 1,
                  minWidth: 220,
                  padding: "16px 18px",
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(255,255,255,0.05)",
                  color: "white",
                  outline: "none",
                  fontSize: 16,
                }}
              />

             <button
  onClick={doPredict}
  disabled={loading || freeBlocked}
  style={{
    padding: "16px 22px",
    borderRadius: 16,
    border: "1px solid rgba(80,255,170,0.35)",
    background: "linear-gradient(180deg, #27d17f, #159a5d)",
    color: "white",
    cursor: loading || freeBlocked ? "not-allowed" : "pointer",
    opacity: loading || freeBlocked ? 0.8 : 1,
    fontWeight: 800,
    fontSize: 16,
    boxShadow: "0 12px 30px rgba(39,209,127,0.25)",
  }}
>
  {loading ? "Consultando..." : freeBlocked ? "Límite alcanzado" : "🔮 Predecir"}
</button>
            </div>
            <div
  style={{
    marginTop: 12,
    fontSize: 14,
    color: freeBlocked ? "#ffb3b3" : "rgba(255,255,255,0.75)",
    fontWeight: 700,
  }}
>
  {freeBlocked
    ? "Tus 3 predicciones gratis ya fueron usadas."
    : `Predicciones gratis restantes: ${freeRemaining} / ${FREE_LIMIT}`}
</div>

            {errorMessage ? (
              <div
                style={{
                  marginTop: 18,
                  padding: 16,
                  borderRadius: 16,
                  border: "1px solid rgba(255,92,92,0.25)",
                  background: "rgba(255,92,92,0.10)",
                  color: "#ffb3b3",
                  lineHeight: 1.5,
                }}
              >
                {errorMessage}
              </div>
            ) : null}

            <div
              style={{
                marginTop: 18,
                padding: 20,
                borderRadius: 20,
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(255,255,255,0.04)",
                minHeight: 220,
                color: "rgba(255,255,255,0.95)",
              }}
            >
              {result ? (
                <div style={{ display: "grid", gap: 16 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 12,
                          opacity: 0.7,
                          textTransform: "uppercase",
                          letterSpacing: 1,
                        }}
                      >
                        Activo consultado
                      </div>
                      <div
                        style={{
                          marginTop: 4,
                          fontSize: 28,
                          fontWeight: 900,
                          letterSpacing: 1,
                        }}
                      >
                        {result.asset || crypto}
                      </div>
                    </div>

                    <div
                      style={{
                        padding: "8px 12px",
                        borderRadius: 999,
                        background: signalStyle.bg,
                        border: signalStyle.border,
                        color: signalStyle.color,
                        fontWeight: 800,
                        fontSize: 13,
                        letterSpacing: 0.5,
                        textTransform: "uppercase",
                      }}
                    >
                      {result.signalLabel || signalStyle.label}
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: 18,
                      lineHeight: 1.7,
                      color: "rgba(255,255,255,0.95)",
                    }}
                  >
                    {result.prediction || "Aquí aparecerá la respuesta del oráculo."}
                  </div>

                  {result.summary ? (
                    <div
                      style={{
                        padding: 14,
                        borderRadius: 14,
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "rgba(255,255,255,0.78)",
                        lineHeight: 1.6,
                        fontSize: 14,
                      }}
                    >
                      {result.summary}
                    </div>
                  ) : null}

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(140px, 1fr))",
                      gap: 12,
                    }}
                  >
                    <MetricCard
                      label="Confianza"
                      value={
                        typeof result.confidence === "number"
                          ? result.confidence + "%"
                          : "--"
                      }
                    />
                    <MetricCard
                      label="Horizonte"
                      value={result.horizonLabel || "--"}
                    />
                    <MetricCard
                      label="Hora"
                      value={formatTime(result.timestamp)}
                    />
                  </div>

                  {result.warning ? (
                    <div
                      style={{
                        padding: 14,
                        borderRadius: 14,
                        border: "1px solid rgba(255,255,255,0.08)",
                        background: "rgba(255,255,255,0.03)",
                        color: "rgba(255,255,255,0.72)",
                        fontSize: 14,
                        lineHeight: 1.6,
                      }}
                    >
                      <strong style={{ color: "white" }}>Advertencia:</strong>{" "}
                      {result.warning}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div
                  style={{
                    color: "rgba(255,255,255,0.72)",
                    lineHeight: 1.7,
                    fontSize: 16,
                  }}
                >
                  Aquí aparecerá la lectura del oráculo con su señal, confianza,
                  horizonte y advertencia operativa.
                </div>
              )}
            </div>
          </section>

          <aside
            style={{
              display: "grid",
              gap: 22,
            }}
          >
            <div
              style={{
                borderRadius: 28,
                border: "1px solid rgba(255,255,255,0.10)",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))",
                boxShadow: "0 25px 80px rgba(0,0,0,0.35)",
                backdropFilter: "blur(14px)",
                padding: 26,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: "#9bffd0",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  fontWeight: 700,
                  marginBottom: 16,
                }}
              >
                Estado del proyecto
              </div>

              <div style={{ display: "grid", gap: 14 }}>
                <MetricCard label="Red" value="Base" />
                <MetricCard label="Estado" value="En línea" />
                <MetricCard label="Acceso" value="Premium" />
              </div>

              <p
                style={{
                  fontSize: 13,
                  opacity: 0.7,
                  marginTop: 18,
                  lineHeight: 1.6,
                }}
              >
                ☛ desarrollado por Alfonso Medina
              </p>
            </div>

            <div
              style={{
                borderRadius: 28,
                border: "1px solid rgba(255,255,255,0.10)",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))",
                boxShadow: "0 25px 80px rgba(0,0,0,0.35)",
                backdropFilter: "blur(14px)",
                padding: 26,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: "#9bffd0",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  fontWeight: 700,
                  marginBottom: 16,
                }}
              >
                Historial reciente
              </div>

              {history.length === 0 ? (
                <div
                  style={{
                    color: "rgba(255,255,255,0.70)",
                    lineHeight: 1.6,
                    fontSize: 14,
                  }}
                >
                  Aún no hay consultas guardadas. Haz una predicción para ver el
                  historial.
                </div>
              ) : (
                <div style={{ display: "grid", gap: 12 }}>
                  {history.map((item, index) => (
                    <div
                      key={`${item.asset}-${item.timestamp}-${index}`}
                      style={{
                        padding: 14,
                        borderRadius: 16,
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 12,
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <strong style={{ fontSize: 16 }}>
                          {item.asset || "TOKEN"}
                        </strong>
                        <span
                          style={{
                            fontSize: 12,
                            opacity: 0.65,
                          }}
                        >
                          {formatTime(item.timestamp)}
                        </span>
                      </div>

                      <div
                        style={{
                          marginTop: 8,
                          color: "rgba(255,255,255,0.82)",
                          lineHeight: 1.5,
                          fontSize: 14,
                        }}
                      >
                        {item.prediction}
                      </div>

                      <div
                        style={{
                          marginTop: 10,
                          display: "flex",
                          gap: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        <MiniTag text={item.signalLabel || "Signal"} />
                        <MiniTag
                          text={
                            typeof item.confidence === "number"
                              ? item.confidence + "%"
                              : "--"
                          }
                        />
                        <MiniTag text={item.horizonLabel || "--"} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>

        <div
          style={{
            marginTop: 40,
            width: "100%",
            maxWidth: 1100,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <h2
            style={{
              fontSize: 28,
              fontWeight: 800,
              marginBottom: 16,
              color: "white",
              textAlign: "center",
            }}
          >
            Token Chart
          </h2>

          <div
            style={{
              borderRadius: 20,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <iframe
              src="https://dexscreener.com/base/0xEBb08e5b88789BE6FE2d16C14826e1ef82F0139D?embed=1&theme=dark"
              width="100%"
              height="500"
              style={{ border: "none" }}
            />
          </div>
        </div>
        <div
  style={{
    marginTop: 40,
    width: "100%",
    maxWidth: 1100,
    marginLeft: "auto",
    marginRight: "auto",
  }}
>
  <h2
    style={{
      fontSize: 28,
      fontWeight: 800,
      marginBottom: 16,
      color: "white",
      textAlign: "center",
    }}
  >
    Buy COLLECTIVEX (CLX)
    <div
  style={{
    marginTop: 40,
    width: "100%",
    maxWidth: 1100,
    marginLeft: "auto",
    marginRight: "auto",
  }}
>
  <h2
    style={{
      fontSize: 28,
      fontWeight: 800,
      marginBottom: 16,
      color: "white",
      textAlign: "center",
    }}
  >
    CLX Reward Wheel
  </h2>

  <div
    style={{
      borderRadius: 20,
      border: "1px solid rgba(255,255,255,0.1)",
      padding: 24,
      background: "rgba(255,255,255,0.03)",
    }}
  >
    <p
      style={{
        textAlign: "center",
        color: "rgba(255,255,255,0.8)",
        marginTop: 0,
        marginBottom: 20,
        fontWeight: 700,
      }}
    >
      Cada giro cuesta {SPIN_COST_CLX} CLX. Premios públicos, utilidad real y diversión.
    </p>

    <div
      style={{
        display: "flex",
        justifyContent: "center",
        marginBottom: 20,
      }}
    >
      <div style={{ position: "relative", width: 280, height: 280 }}>
        <div
          style={{
            position: "absolute",
            top: -10,
            left: "50%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "14px solid transparent",
            borderRight: "14px solid transparent",
            borderTop: "24px solid #ffffff",
            zIndex: 2,
          }}
        />

        <div
          style={{
            width: 280,
            height: 280,
            borderRadius: "50%",
            border: "8px solid rgba(255,255,255,0.12)",
            position: "relative",
            overflow: "hidden",
            transform: `rotate(${wheelRotation}deg)`,
            transition: spinning
              ? "transform 3.2s cubic-bezier(0.18, 0.89, 0.32, 1.28)"
              : "transform 0.4s ease",
            background:
              "conic-gradient(#4ade80 0deg 60deg, #22c55e 60deg 120deg, #60a5fa 120deg 180deg, #facc15 180deg 240deg, #a78bfa 240deg 300deg, #f472b6 300deg 360deg)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
          }}
        >
          {WHEEL_PRIZES.map((prize, index) => {
            const angle = index * (360 / WHEEL_PRIZES.length) + 30;
            return (
              <div
                key={prize.id}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-98px)`,
                  transformOrigin: "center center",
                  color: "white",
                  fontWeight: 800,
                  fontSize: 12,
                  textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                  textAlign: "center",
                  width: 100,
                }}
              >
                {prize.label}
              </div>
            );
          })}

          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 74,
              height: 74,
              borderRadius: "50%",
              background: "#08110d",
              border: "3px solid rgba(255,255,255,0.18)",
              transform: "translate(-50%, -50%)",
              zIndex: 2,
            }}
          />
        </div>
      </div>
    </div>

    <div style={{ textAlign: "center" }}>
      <button
        onClick={spinWheel}
        disabled={spinning || !isConnected}
        style={{
          padding: "16px 28px",
          borderRadius: 16,
          background: "linear-gradient(180deg, #27d17f, #159a5d)",
          color: "white",
          fontWeight: 800,
          fontSize: 18,
          border: "1px solid rgba(80,255,170,0.35)",
          cursor: spinning || !isConnected ? "not-allowed" : "pointer",
          opacity: spinning || !isConnected ? 0.7 : 1,
          boxShadow: "0 12px 30px rgba(39,209,127,0.25)",
        }}
      >
        <button
  onClick={spinWheel}
  disabled={spinning || !canSpin}
  style={{
    padding: "16px 28px",
    borderRadius: 16,
    background: "linear-gradient(180deg, #27d17f, #159a5d)",
    color: "white",
    fontWeight: 800,
    fontSize: 18,
    border: "1px solid rgba(80,255,170,0.35)",
    cursor: spinning || !canSpin ? "not-allowed" : "pointer",
    opacity: spinning || !canSpin ? 0.7 : 1,
    boxShadow: "0 12px 30px rgba(39,209,127,0.25)",
  }}
>
  {spinning
    ? "Girando..."
    : canSpin
    ? `Spin for ${SPIN_COST_CLX} CLX`
    : `Necesitas ${SPIN_COST_CLX} CLX`}
</button>
        <div
  style={{
    marginTop: 12,
    textAlign: "center",
    color: "rgba(255,255,255,0.78)",
    fontSize: 14,
    fontWeight: 700,
  }}
>
  Balance CLX: {clxBalance.toFixed(2)}
  
</div>

    <div
      style={{
        marginTop: 22,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 12,
      }}
    >
      <div
        style={{
          padding: 14,
          borderRadius: 16,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ opacity: 0.7, fontSize: 13 }}>CLX ganado</div>
        <div style={{ marginTop: 6, fontSize: 20, fontWeight: 800 }}>
          {clxRewardsWon} CLX
        </div>
      </div>

      <div
        style={{
          padding: 14,
          borderRadius: 16,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ opacity: 0.7, fontSize: 13 }}>Predicciones extra</div>
        <div style={{ marginTop: 6, fontSize: 20, fontWeight: 800 }}>
          {extraPredictions}
        </div>
      </div>

      <div
        style={{
          padding: 14,
          borderRadius: 16,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ opacity: 0.7, fontSize: 13 }}>Boosts</div>
        <div style={{ marginTop: 6, fontSize: 20, fontWeight: 800 }}>
          {boostCount}
        </div>
      </div>

      <div
        style={{
          padding: 14,
          borderRadius: 16,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ opacity: 0.7, fontSize: 13 }}>Badges</div>
        <div style={{ marginTop: 6, fontSize: 20, fontWeight: 800 }}>
          {badges.length}
        </div>
      </div>
    </div>

    {wheelResult ? (
      <div
        style={{
          marginTop: 18,
          padding: 16,
          borderRadius: 16,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          textAlign: "center",
          color: "white",
          fontWeight: 700,
          lineHeight: 1.6,
        }}
      >
        Premio obtenido: {wheelResult.label}
      </div>
    ) : null}

    <div
      style={{
        marginTop: 18,
        padding: 16,
        borderRadius: 16,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        color: "rgba(255,255,255,0.72)",
        fontSize: 14,
        lineHeight: 1.7,
      }}
    >
      <strong style={{ color: "white" }}>Probabilidades públicas:</strong>{" "}
      40 CLX (55%), 60 CLX (20%), 3 predicciones (12%), 100 CLX (8%), Boost
      Oracle (4%), Badge Legendario (1%).
    </div>

  <div
    style={{
      borderRadius: 20,
      overflow: "hidden",
      border: "1px solid rgba(255,255,255,0.1)",
      padding: 20,
      background: "rgba(255,255,255,0.03)",
      textAlign: "center",
    }}
  >
    <a
      href="https://app.uniswap.org/#/swap?outputCurrency=0xebb08e5b88789be6fe2d16c14826e1ef82f0139d&chain=base"
      target="_blank"
      style={{
        padding: "16px 28px",
        borderRadius: 16,
        background: "linear-gradient(180deg, #27d17f, #159a5d)",
        color: "white",
        fontWeight: 800,
        fontSize: 18,
        textDecoration: "none",
        display: "inline-block",
      }}
    >
<p
  style={{
    marginTop: 0,
    marginBottom: 16,
    textAlign: "center",
    color: "rgba(255,255,255,0.82)",
    fontWeight: 700,
  }}
>
  3 predicciones gratis. Después, compra CLX para desbloquear más.
</p>

<a
  href="https://app.uniswap.org/#/swap?outputCurrency=0xebb08e5b88789be6fe2d16c14826e1ef82f0139d&chain=base"
  target="_blank"
  rel="noopener noreferrer"
  style={{
    padding: "16px 28px",
    borderRadius: 16,
    background: "linear-gradient(180deg, #27d17f, #159a5d)",
    color: "white",
    fontWeight: 800,
    fontSize: 18,
    textDecoration: "none",
    display: "inline-block",
  }}
>
  Buy CLX
</a>

<p style={{ marginTop: 16, opacity: 0.7 }}>
  Purchase COLLECTIVEX directly on Base using ETH or USDC.
</p>
      </div>
    </div>
</main>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 18,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div style={{ opacity: 0.7, fontSize: 13 }}>{label}</div>
      <div
        style={{
          marginTop: 6,
          fontSize: 20,
          fontWeight: 800,
          lineHeight: 1.2,
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function MiniTag({ text }: { text: string }) {
  return (
    <span
      style={{
        padding: "6px 10px",
        borderRadius: 999,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.10)",
        fontSize: 12,
        color: "rgba(255,255,255,0.86)",
      }}
    >
      {text}
    </span>
  );
}
