import { useState } from "react";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setBusy(true);

    try {
      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      setError("Incorrect email or password. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setBusy(true);

    try {
      const provider = new GoogleAuthProvider();

      await signInWithPopup(auth, provider);

      navigate("/");
    } catch (err) {
      console.error("Google sign-in error:", err);
      setError("Google sign-in failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="page-heading">
          <p className="eyebrow">DEV@DEAKIN COMMUNITY</p>
          <h1>Welcome Back</h1>
          <p className="muted">
            Log in to connect, explore and share with the community.
          </p>
        </div>

        <form onSubmit={handleLogin}>

          <label htmlFor="loginEmail">
            Email
            <input
              id="loginEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              required
            />
          </label>

          <label htmlFor="loginPassword">
            Password
            <input
              id="loginPassword"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </label>

          {error && (
            <div className="alert alert-error" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="button button-primary button-full"
            disabled={busy}
          >
            {busy ? "Logging in..." : "Login"}
          </button>

        </form>

        <div className="login-divider">
          <span>OR</span>
        </div>

        <button
          type="button"
          className="button button-outline button-full google-login-button"
          onClick={handleGoogleLogin}
          disabled={busy}
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt=""
            width="18"
            height="18"
          />
          {busy ? "Please wait..." : "Sign in with Google"}
        </button>

        <div className="auth-bottom">
          <p>
            Don't have an account?{" "}
            <Link to="/register">Sign up</Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Login;
