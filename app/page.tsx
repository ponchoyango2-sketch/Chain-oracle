"use client";

import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Home() {
  const [crypto, setCrypto] = useState("ETH");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function doPredict() {
    try {
      setLoading(true);
      setResult("Consultando el oráculo...");
      const q = crypto.trim();
      const res = await fetch(`/api/predict?q=${encodeURIComponent(q)}`);
      const data = await res.json();

      if (!res.ok) {
        setResult(data?.error || "Error al consultar");
        return;
      }

      setResult(data?.prediction || "Sin respuesta");
    } catch (e: any) {
      setResult(e?.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
     
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
        return (
  <main
    style={{
      minHeight: "100vh",
      padding: "32px 20px",
      background:
        "radial-gradient(circle at top, rgba(30,120,80,0.35), transparent 30%), linear-gradient(180deg, #07110d 0%, #0b1410 45%, #050806 100%)",
      color: "white",
      fontFamily:
        "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}
  >
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>

      <div style={{ marginTop: 40 }}>
        <h2>Token oficial</h2>

        <iframe
          src="https://dexscreener.com/base/0xEBb08e5b88789BE6FE2d16C14826e1ef82F0139D?embed=1&theme=dark"
          width="100%"
          height="420"
          frameBorder="0"
        ></iframe>

        <div style={{ marginTop: 20 }}>
          <a
            href="https://dexscreener.com/base/0xEBb08e5b88789BE6FE2d16C14826e1ef82F0139D"
            target="_blank"
            style={{
              padding: "12px 20px",
              background: "#3b82f6",
              color: "white",
              borderRadius: "10px",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Buy Token
          </a>
        </div>
      </div>
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
                maxWidth: 650,
                fontSize: 18,
                lineHeight: 1.5,
                color: "rgba(255,255,255,0.78)",
              }}
            >
             ☛ Predicciones exclusivas para holders que buscan ventaja real.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <ConnectButton />
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
              Escribe un ticker como BTC, ETH, SOL o BASE y obtén una respuesta instantánea.
            </p>

            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              {["BTC", "ETH", "SOL", "BASE"].map((item) => (
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
                onChange={(e) => setCrypto(e.target.value)}
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
                  cursor: "pointer",
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
                marginTop: 18,
                padding: 18,
                borderRadius: 18,
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(255,255,255,0.04)",
                minHeight: 90,
                color: "rgba(255,255,255,0.9)",
                lineHeight: 1.6,
              }}
            >
              {result || "Aquí aparecerá la respuesta del oráculo."}
            </div>
          </section>

          <aside
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
              <div
                style={{
                  padding: 16,
                  borderRadius: 18,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div style={{ opacity: 0.7, fontSize: 13 }}>Red</div>
                <div style={{ marginTop: 6, fontSize: 22, fontWeight: 800 }}>
                  Base
                </div>
              </div>

              <div
                style={{
                  padding: 16,
                  borderRadius: 18,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div style={{ opacity: 0.7, fontSize: 13 }}>Estado</div>
                <div style={{ marginTop: 6, fontSize: 22, fontWeight: 800 }}>
                  En línea
                </div>
              </div>

              <div
                style={{
                  padding: 16,
                  borderRadius: 18,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div style={{ opacity: 0.7, fontSize: 13 }}>Acceso</div>
                <div style={{ marginTop: 6, fontSize: 22, fontWeight: 800 }}>
                  Premium
                </div>
              </div>
            </div>

            <p
              style={{
                fontSize: 13,
                opacity: 0.7,
                marginTop: 18,
                lineHeight: 1.6,
              }}
            >
             ☛ desarrollado por Alfonso Medina 🔍
              <p
  style={{
    fontSize: 13,
    opacity: 0.7,
    marginTop: 18,
    lineHeight: 1.6,
  }}
>
  Creado por Alfonso Medina
</p>

{/* Token Chart */}

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
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
