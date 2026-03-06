"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";

import {
  RainbowKitProvider,
  getDefaultConfig,
} from "@rainbow-me/rainbowkit";

import { base } from "wagmi/chains";

const config = getDefaultConfig({
  appName: "Chain Oracle",
  projectId: "c72acb0517b84dde28476773e31de1da",
  chains: [base],
  ssr: false, // ESTA LINEA ES LA CLAVE
});

const queryClient = new QueryClient();

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
