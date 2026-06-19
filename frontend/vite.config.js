import process from "node:process";

import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);

function getHostname(url) {
  return url.hostname.toLowerCase().replace(/^\[(.*)\]$/, "$1");
}

function validateProductionApiBaseUrl(rawValue) {
  const value = String(rawValue || "").trim();

  if (!value) {
    throw new Error(
      "[vite] VITE_API_BASE_URL é obrigatória no build de produção.",
    );
  }

  let parsedUrl;

  try {
    parsedUrl = new URL(value);
  } catch {
    throw new Error("[vite] VITE_API_BASE_URL deve ser uma URL válida.");
  }

  if (parsedUrl.protocol !== "https:") {
    throw new Error(
      "[vite] VITE_API_BASE_URL deve usar HTTPS no build de produção.",
    );
  }

  if (LOCAL_HOSTNAMES.has(getHostname(parsedUrl))) {
    throw new Error(
      "[vite] VITE_API_BASE_URL não pode apontar para localhost no build de produção.",
    );
  }

  if (parsedUrl.search || parsedUrl.hash) {
    throw new Error(
      "[vite] VITE_API_BASE_URL não pode conter query string nem fragmento.",
    );
  }

  const normalizedPath = parsedUrl.pathname.replace(/\/+$/, "");

  if (normalizedPath !== "/api") {
    throw new Error(
      "[vite] VITE_API_BASE_URL deve terminar exatamente em /api.",
    );
  }
}

export default defineConfig(({ command, mode }) => {
  const fileEnv = loadEnv(mode, process.cwd(), "VITE_");

  const apiBaseUrl = process.env.VITE_API_BASE_URL || fileEnv.VITE_API_BASE_URL;

  if (command === "build") {
    validateProductionApiBaseUrl(apiBaseUrl);
  }

  return {
    plugins: [react()],
  };
});
