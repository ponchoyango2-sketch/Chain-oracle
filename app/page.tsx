"use client";

import { useEffect, useMemo, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { sdk } from "@farcaster/miniapp-sdk";
import { useAccount } from "wagmi";

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

const QUICK_TICKERS = ["BTC", "ETH", "SOL", "BASE"];

export default function Home() {
  const { address, isConnected } = useAccount();
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

  const freeRemaining = Math.max(FREE_LIMIT - freeUsed, 0);
const freeBlocked = freeUsed >= FREE_LIMIT;

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
                disabled={loading}
                style={{
                  padding: "16px 22px",
                  borderRadius: 16,
                  border: "1px solid rgba(80,255,170,0.35)",
                  background: "linear-gradient(180deg, #27d17f, #159a5d)",
                  color: "white",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.8 : 1,
                  fontWeight: 800,
                  fontSize: 16,
                  boxShadow: "0 12px 30px rgba(39,209,127,0.25)",
                }}
              >
                {loading ? "Consultando..." : "🔮 Predecir"}
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
    : Predicciones gratis restantes: ${freeRemaining} / ${FREE_LIMIT}}
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
  </h2>

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
      Buy CLX
    </a>

    <p style={{ marginTop: 16, opacity: 0.7 }}>
      Purchase COLLECTIVEX directly on Base using ETH or USDC.
    </p>
  </div>
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
