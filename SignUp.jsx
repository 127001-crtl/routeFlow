import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css"; // shared tokens, card, header, buttons, fields
import "./SignUp.css"; // sign-up-only styles
import { checkEmailAddress } from "./emailCheckClient";

function Logo() {
  return (
    <div className="rf-logo">
      <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
        <rect x="3.25" y="3.25" width="11.38" height="11.38" fill="#3B4FD6" />
        <rect x="11.38" y="3.25" width="11.38" height="11.38" fill="#F5B400" opacity="0.9" />
        <rect x="7.31" y="11.38" width="11.38" height="11.38" fill="#2F6DF6" opacity="0.9" />
      </svg>
      <span>routeflow</span>
    </div>
  );
}
// This is the code for creating the logo, Instead of saving it as an image it is rendered upon each start.
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); //this uses regex to ensure email is valid.

export default function SignUp({ onSignUp, onLogin, onGoogle, onApple }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const canSubmit = isEmail(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || isChecking) {
      return;
    }

    setIsChecking(true);
    setError("");

    const result = await checkEmailAddress(email).catch(() => ({
      allowed: false,
      disposable: false,
      error: "Unable to validate email address right now. Please try again.",
    }));

    setIsChecking(false);

    if (!result.allowed) {
      if (result.disposable) {
        setError("Disposable email addresses are not allowed.");
      } else {
        setError(result.error || "Please enter a valid email address.");
      }
      return;
    }

    onSignUp?.({ email });
  };

  return (
    <main className="rf-page">
      <div className="rf-card">
        <header className="rf-header">
          <Logo />
          <button
            type="button"
            className="rf-btn rf-btn--outline"
            onClick={() => {
              onLogin?.();
              navigate("/");
            }}
          >
            Log in
          </button>
        </header>

        <form className="rf-body rf-body--signup" onSubmit={handleSubmit}>
          <h1 className="rf-title">Create account</h1>

          <div className="rf-social">
            <button type="button" className="rf-btn rf-btn--social" onClick={onGoogle}>
              <span className="rf-google-g" aria-hidden="true">G</span>
              Google
            </button>
            <button type="button" className="rf-btn rf-btn--social" onClick={onApple}>
              Apple
            </button>
          </div>

          <div className="rf-divider" role="separator">
            <span>or</span>
          </div>

          <div className="rf-field">
            <label htmlFor="rf-signup-email">
              Email <span className="rf-required">*</span>
            </label>
            <input
              id="rf-signup-email"
              type="email"
              placeholder="admin@mybusiness.com"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
            />
          </div>
          {error && <p className="rf-field-error">{error}</p>}

          <button type="submit" className="rf-btn rf-btn--primary" disabled={!canSubmit || isChecking}>
            {isChecking ? "Checking..." : "Sign up"}
          </button>

          <p className="rf-terms">
            by creating an account, you are agreeing to Routeflow’s{" "}
            <a href="#terms">Terms and conditions</a> and{" "}
            <a href="#privacy">Privacy policy</a>
          </p>
        </form>
      </div>
    </main>
  );
}
