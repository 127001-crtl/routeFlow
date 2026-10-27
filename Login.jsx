import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

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

export default function Login({ onLogin, onSignUp, onGoogle, onApple, onOldLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin?.({ email, password });
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
              onSignUp?.();
              navigate("/signup");
            }}
          >
            Sign up
          </button>
        </header>

        <form className="rf-body" onSubmit={handleSubmit}>
          <h1 className="rf-title">Log in</h1>

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
            <label htmlFor="rf-email">
              Email <span className="rf-required">*</span>
            </label>
            <input
              id="rf-email"
              type="email"
              placeholder="admin@mybusiness.com"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="rf-field">
            <label htmlFor="rf-password">
              Password <span className="rf-required">*</span>
            </label>
            <div className="rf-input-wrap">
              <input
                id="rf-password"
                type={showPassword ? "text" : "password"}
                placeholder="*******"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="rf-eye"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((s) => !s)}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M1 8s2.5-4.5 7-4.5S15 8 15 8s-2.5 4.5-7 4.5S1 8 1 8Z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                  <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.2" />
                  {showPassword && (
                    <path d="M2 14 14 2" stroke="currentColor" strokeWidth="1.2" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          <a className="rf-link rf-forgot" href="#forgot">
            Forgot password?
          </a>

          <div className="rf-banner">
            <p>
              Looking for the old <strong>Routeflow</strong>?
            </p>
            <button type="button" className="rf-link" onClick={onOldLogin}>
              Log in here
            </button>
          </div>

          <button type="submit" className="rf-btn rf-btn--primary">
            Log in
          </button>
        </form>
      </div>
    </main>
  );
}
