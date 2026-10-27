import { domainToASCII } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const fallbackDomains = require("disposable-email-domains");

const DEFAULT_SOURCE_URL =
  process.env.DISPOSABLE_DOMAINS_URL ||
  "https://disposable.github.io/disposable-email-domains/domains.json";
const DEFAULT_REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000;

let disposableDomains = parseDomainPayload(fallbackDomains);
let hasLoaded = disposableDomains.size > 0;
let refreshTimer = null;
let refreshInFlight = null;

function normalizeDomain(domain) {
  const value = String(domain ?? "").trim().toLowerCase().replace(/\.+$/, "");

  if (!value) {
    return null;
  }

  const ascii = domainToASCII(value);
  if (!ascii || ascii.includes(" ")) {
    return null;
  }

  return ascii;
}

function parseDomainPayload(payload) {
  const sourceDomains = Array.isArray(payload)
    ? payload
    : payload && typeof payload === "object"
      ? Object.keys(payload)
      : [];

  const nextDomains = new Set();
  for (const domain of sourceDomains) {
    const normalized = normalizeDomain(domain);
    if (normalized) {
      nextDomains.add(normalized);
    }
  }

  return nextDomains;
}

export async function refreshDisposableDomains({
  fetchImpl = fetch,
  sourceUrl = DEFAULT_SOURCE_URL,
} = {}) {
  const response = await fetchImpl(sourceUrl);

  if (!response.ok) {
    throw new Error(`Could not download disposable domain list: ${response.status}`);
  }

  const payload = await response.json();
  const nextDomains = parseDomainPayload(payload);

  if (nextDomains.size === 0) {
    throw new Error("Disposable domain list is empty");
  }

  disposableDomains = nextDomains;
  hasLoaded = true;

  return disposableDomains;
}

export async function ensureDisposableDomainsReady(options) {
  if (hasLoaded) {
    return true;
  }

  if (!refreshInFlight) {
    refreshInFlight = refreshDisposableDomains(options)
      .catch(() => null)
      .finally(() => {
        refreshInFlight = null;
      });
  }

  await refreshInFlight;
  return hasLoaded;
}

export function startDisposableDomainRefresh({
  intervalMs = DEFAULT_REFRESH_INTERVAL_MS,
  fetchImpl = fetch,
  sourceUrl = DEFAULT_SOURCE_URL,
} = {}) {
  const refreshOptions = { fetchImpl, sourceUrl };

  ensureDisposableDomainsReady(refreshOptions);

  if (refreshTimer) {
    clearInterval(refreshTimer);
  }

  refreshTimer = setInterval(() => {
    refreshDisposableDomains(refreshOptions).catch(() => {
      // Keep last known good data; endpoint will continue to enforce checks.
    });
  }, intervalMs);

  if (typeof refreshTimer.unref === "function") {
    refreshTimer.unref();
  }

  return () => {
    if (refreshTimer) {
      clearInterval(refreshTimer);
      refreshTimer = null;
    }
  };
}

export function isDisposableDomain(domain) {
  const normalized = normalizeDomain(domain);

  if (!normalized) {
    return false;
  }

  return disposableDomains.has(normalized);
}

export function resetDisposableDomainsForTests() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }

  refreshInFlight = null;
  hasLoaded = false;
  disposableDomains = new Set();
}
