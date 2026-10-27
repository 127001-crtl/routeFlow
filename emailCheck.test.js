import test from "node:test";
import assert from "node:assert/strict";
import { createEmailCheckApp, normalizeEmailDomain } from "./server/emailCheckApp.js";
import { checkEmailAddress } from "./emailCheckClient.js";

function listen(app) {
  return new Promise((resolve) => {
    const server = app.listen(0, "127.0.0.1", () => {
      const address = server.address();
      resolve({
        server,
        baseUrl: `http://127.0.0.1:${address.port}`,
      });
    });
  });
}

test("normalizeEmailDomain handles valid and invalid emails", () => {
  assert.equal(normalizeEmailDomain("User@Gmail.com"), "gmail.com");
  assert.equal(normalizeEmailDomain("not-an-email"), null);
  assert.equal(normalizeEmailDomain("user@"), null);
});

test("email check API allows non-disposable domains", async () => {
  const app = createEmailCheckApp({
    ensureReady: async () => true,
    checkDomain: () => false,
  });
  const { server, baseUrl } = await listen(app);

  try {
    const response = await fetch(`${baseUrl}/api/email/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "person@gmail.com" }),
    });
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.allowed, true);
    assert.equal(payload.disposable, false);
    assert.equal(payload.domain, "gmail.com");
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("email check API rejects disposable domains", async () => {
  const app = createEmailCheckApp({
    ensureReady: async () => true,
    checkDomain: (domain) => domain === "mailinator.com",
  });
  const { server, baseUrl } = await listen(app);

  try {
    const response = await fetch(`${baseUrl}/api/email/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "foo@mailinator.com" }),
    });
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.allowed, false);
    assert.equal(payload.disposable, true);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("email check API returns 400 for malformed input", async () => {
  const app = createEmailCheckApp({
    ensureReady: async () => true,
    checkDomain: () => false,
  });
  const { server, baseUrl } = await listen(app);

  try {
    const response = await fetch(`${baseUrl}/api/email/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "invalid" }),
    });
    const payload = await response.json();

    assert.equal(response.status, 400);
    assert.equal(payload.allowed, false);
    assert.equal(payload.error, "Invalid email address");
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("frontend checkEmailAddress reports disposable responses", async () => {
  const result = await checkEmailAddress("foo@mailinator.com", async () => ({
    ok: true,
    json: async () => ({ allowed: false, disposable: true }),
  }));

  assert.deepEqual(result, {
    allowed: false,
    disposable: true,
    error: null,
  });
});
