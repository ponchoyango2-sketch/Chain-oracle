"use client";

import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  useReadContract,
  useChainId,
  useSwitchChain,
} from "wagmi";
import { base } from "wagmi/chains";
import { formatUnits } from "viem";

const TOKEN_ADDRESS = "0xEBb08e5b88789BE6FE2d16C14826e1ef82F0139D";
const TOKEN_DECIMALS = 18;
const MIN_TOKENS = 1;

const BUY_URL = `https://app.uniswap.org/#/swap?chain=base&outputCurrency=${TOKEN_ADDRESS}`;
const DEX_URL = `https://dexscreener.com/base?q=${TOKEN_ADDRESS}`;

const ERC20_ABI = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export default function Home() {
  const [crypto, setCrypto] = useState("ETH");
  const [result, setResult] = useState("");

  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const { data: balance } = useReadContract({
    address: TOKEN_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address ?? "0x0000000000000000000000000000000000000000"],
    query: { enabled: Boolean(address), refetchInterval: 10_000 },
  });

  const minRaw = MIN_TOKENS * Math.pow(10, TOKEN_DECIMALS);
  const hasToken = true;
  const balHuman =
    typeof balance === "bigint" ? formatUnits(balance, TOKEN_DECIMALS) : "0";

  const wrongNetwork = isConnected && chainId !== base.id;

  async function doPredict() {
    try {
      setResult("Cargando...");
      const q = crypto.trim();
      const res = await fetch(/api/predict?q=${encodeURIComponent(q)});
      const data = await res.json();

      if (!res.ok) {
        setResult(data?.error || "Error");
        return;
      }

      setResult(data?.prediction || "Sin respuesta");
    } catch (e: any) {
      setResult(e?.message || "Error");
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "radial-gradient(circle at 20% 20%, #1d5f3b, #0b0f12)",
        color: "white",
        fontFamily: "system-ui, Arial",
      }}
    >
      <div style={{ width: 520, maxWidth: "100%" }}>
        <h1 style={{ margin: 0, fontSize: 40, textAlign: "center" }}>
          Oráculo de cadenas
        </h1>

        <p style={{ marginTop: 8, opacity: 0.8, textAlign: "center" }}>
          Predicciones + Ruleta (Base)
        </p>

        <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
          <ConnectButton />
        </div>

        <div
          style={{
            marginTop: 18,
            padding: 14,
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,.12)",
            background: "rgba(255,255,255,.05)",
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 12, opacity: 0.75 }}>Red</div>
            <div style={{ fontWeight: 700 }}>{base.name}</div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, opacity: 0.75 }}>Balance token</div>
            <div style={{ fontWeight: 700 }}>{balHuman}</div>
          </div>
        </div>

        {wrongNetwork && (
          <div
            style={{
              marginTop: 12,
              padding: 12,
              borderRadius: 12,
              background: "rgba(255,120,120,.12)",
              border: "1px solid rgba(255,120,120,.25)",
            }}
          >
            Estás en otra red.
            <button
              onClick={() => switchChain({ chainId: base.id })}
              style={{
                marginLeft: 8,
                padding: "8px 10px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,.2)",
                background: "rgba(255,255,255,.06)",
                color: "white",
                cursor: "pointer",
              }}
            >
              Cambiar a Base
            </button>
          </div>
        )}

        <div
          style={{
            marginTop: 14,
            padding: 16,
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,.12)",
            background: "rgba(0,0,0,.15)",
          }}
        >
          {hasToken ? (
            <>
              <div style={{ fontWeight: 800, color: "#8affb3" }}>
                ✅ Acceso desbloqueado
              </div>

              <div style={{ opacity: 0.8, marginTop: 6 }}>
                Bienvenido holder. Predicciones activas.
              </div>

              <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
                <input
                  value={crypto}
                  onChange={(e) => setCrypto(e.target.value)}
                  placeholder="BTC / ETH / SOL / BASE o contrato 0x..."
                  style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,.18)",
                    background: "rgba(255,255,255,.06)",
                    color: "white",
                    outline: "none",
                  }}
                />

                <button
                  onClick={doPredict}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 10,
                    border: "1px solid rgba(100,255,160,.25)",
                    background: "rgba(100,255,160,.16)",
                    color: "white",
                    cursor: "pointer",
                    fontWeight: 800,
                  }}
                >
                  🔮 Predecir
                </button>
              </div>

              <div
                style={{
                  marginTop: 12,
                  padding: 12,
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,.12)",
                  background: "rgba(255,255,255,.04)",
                  whiteSpace: "pre-wrap",
                  minHeight: 52,
                }}
              >
                {result || "Escribe una cripto y dale Predecir."}
              </div>

              <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
                <a
                  href={BUY_URL}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#8affb3", textDecoration: "underline" }}
                >
                  Comprar token (Uniswap)
                </a>

                <a
                  href={DEX_URL}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#8affb3", textDecoration: "underline" }}
                >
                  Ver en Dexscreener
                </a>
              </div>
            </>
          ) : (
            <>
              <div style={{ fontWeight: 800 }}>🔒 Acceso bloqueado</div>
              <div style={{ opacity: 0.8, marginTop: 6 }}>
                Necesitas al menos {String(MIN_TOKENS)} token para activar
                predicciones.
              </div>
            </>
          )}
        </div>

        <p style={{ fontSize: 12, opacity: 0.6, textAlign: "center" }}>
          Esta app solo lee tu balance del token (no pide permisos raros).
        </p>
      </div>
    </main>
  );
}
