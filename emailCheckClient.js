export async function checkEmailAddress(email, fetchImpl = fetch) {
  const response = await fetchImpl("/api/email/check", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  const payload = await response.json().catch(() => ({}));

  if (response.ok) {
    return {
      allowed: Boolean(payload.allowed),
      disposable: Boolean(payload.disposable),
      error: null,
    };
  }

  return {
    allowed: false,
    disposable: Boolean(payload.disposable),
    error: payload.error || "Unable to validate email address",
  };
}
