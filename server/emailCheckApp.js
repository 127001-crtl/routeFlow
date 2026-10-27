import express from "express";
import { domainToASCII } from "node:url";
import {
  ensureDisposableDomainsReady,
  isDisposableDomain,
} from "./disposableDomains.js";

function hasWhitespace(value) {
  for (let i = 0; i < value.length; i += 1) {
    if (/\s/.test(value[i])) {
      return true;
    }
  }

  return false;
}

export function normalizeEmailDomain(email) {
  const value = String(email ?? "").trim().toLowerCase();

  const atIndex = value.lastIndexOf("@");
  if (atIndex <= 0 || atIndex !== value.indexOf("@") || atIndex === value.length - 1) {
    return null;
  }

  const local = value.slice(0, atIndex);
  let domain = value.slice(atIndex + 1);

  if (!local || !domain || hasWhitespace(local) || hasWhitespace(domain)) {
    return null;
  }

  while (domain.endsWith(".")) {
    domain = domain.slice(0, -1);
  }

  if (
    !domain ||
    domain.startsWith(".") ||
    domain.endsWith(".") ||
    domain.includes("..") ||
    !domain.includes(".")
  ) {
    return null;
  }

  const asciiDomain = domainToASCII(domain);

  if (!asciiDomain || asciiDomain.includes(" ")) {
    return null;
  }

  return asciiDomain;
}

export function createEmailCheckApp({
  ensureReady = ensureDisposableDomainsReady,
  checkDomain = isDisposableDomain,
} = {}) {
  const app = express();

  app.use(express.json({ limit: "10kb" }));

  app.post("/api/email/check", async (req, res) => {
    const domain = normalizeEmailDomain(req.body?.email);

    if (!domain) {
      return res.status(400).json({
        allowed: false,
        disposable: false,
        error: "Invalid email address",
      });
    }

    const ready = await ensureReady();

    if (!ready) {
      return res.status(503).json({
        allowed: false,
        disposable: false,
        error: "Email validation is temporarily unavailable",
      });
    }

    const disposable = checkDomain(domain);

    return res.json({
      allowed: !disposable,
      disposable,
      domain,
    });
  });

  return app;
}
