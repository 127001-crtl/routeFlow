import express from "express";
import { domainToASCII } from "node:url";
import {
  ensureDisposableDomainsReady,
  isDisposableDomain,
} from "./disposableDomains.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmailDomain(email) {
  const value = String(email ?? "").trim().toLowerCase();

  if (!EMAIL_RE.test(value)) {
    return null;
  }

  const atIndex = value.lastIndexOf("@");
  if (atIndex <= 0 || atIndex === value.length - 1) {
    return null;
  }

  const domain = value.slice(atIndex + 1).replace(/\.+$/, "");
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
