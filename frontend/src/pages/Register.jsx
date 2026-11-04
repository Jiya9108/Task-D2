import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";

function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim() || !email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setBusy(true);

    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      await updateProfile(credential.user, {
        displayName: fullName.trim(),
      });

      await credential.user.getIdToken(true);
      navigate("/");
    } catch (err) {
      setError(
        err.code === "auth/email-already-in-use"
          ? "An account with this email already exists."
          : err.message
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="page-heading">
          <p className="eyebrow">DEV@DEAKIN COMMUNITY</p>
          <h1>Create an Account</h1>
          <p className="muted">Join the community to explore and share posts.</p>
        </div>

        <form onSubmit={handleRegister}>
          <label htmlFor="fullName">
            Full Name
            <input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              autoComplete="name"
              required
            />
          </label>

          <label htmlFor="registerEmail">
            Email
            <input
              id="registerEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              required
            />
          </label>

          <label htmlFor="registerPassword">
            Password
            <input
              id="registerPassword"
              type="password"
              minLength="6"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              autoComplete="new-password"
              required
            />
          </label>

          {error && <div className="alert alert-error" role="alert">{error}</div>}

          <button className="button button-primary button-full" type="submit" disabled={busy}>
            {busy ? "Creating account..." : "Register"}
          </button>
        </form>

        <div className="auth-bottom">
          <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Register;