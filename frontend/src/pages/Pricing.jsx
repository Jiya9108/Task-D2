import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

function PaymentModal({ onClose, onUpgrade }) {
  const [name, setName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    const digits = cardNumber.replace(/\s/g, "");

    if (name.trim().length < 2) {
      setError("Enter the cardholder name.");
      return;
    }

    if (!/^\d{16}$/.test(digits)) {
      setError("Enter a valid 16-digit demo card number.");
      return;
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
      setError("Enter expiry in MM/YY format.");
      return;
    }

    if (!/^\d{3,4}$/.test(cvv)) {
      setError("Enter a valid 3 or 4 digit demo CVV.");
      return;
    }

    setBusy(true);

    try {
      await onUpgrade();
    } catch (err) {
      setError(
        err.message ||
        "Upgrade could not be saved. Please try again."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <section
        className="payment-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-title"
      >
        <div className="modal-heading">
          <div>
            <p className="section-label">SECURE CHECKOUT DEMO</p>
            <h2 id="payment-title">Upgrade to Paid</h2>
          </div>

          <button
            className="modal-close"
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="payment-summary">
          <span>Paid Membership</span>
          <strong>₹999 / month</strong>
        </div>

        <form className="payment-form" onSubmit={submit}>
          <label>
            Cardholder name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name on card"
              autoComplete="cc-name"
              required
            />
          </label>

          <label>
            Demo card number
            <input
              value={cardNumber}
              onChange={(e) =>
                setCardNumber(
                  e.target.value.replace(/[^\d ]/g, "").slice(0, 19)
                )
              }
              placeholder="1234 5678 9012 3456"
              inputMode="numeric"
              autoComplete="off"
              required
            />
          </label>

          <div className="payment-row">
            <label>
              Expiry date
              <input
                value={expiry}
                onChange={(e) =>
                  setExpiry(e.target.value.slice(0, 5))
                }
                placeholder="MM/YY"
                autoComplete="off"
                required
              />
            </label>

            <label>
              CVV
              <input
                value={cvv}
                onChange={(e) =>
                  setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                placeholder="123"
                inputMode="numeric"
                autoComplete="off"
                required
              />
            </label>
          </div>

          {error && (
            <p className="payment-error" role="alert">
              {error}
            </p>
          )}

          <button
            className="plan-action"
            type="submit"
            disabled={busy}
          >
            {busy ? "Updating plan..." : "Confirm Upgrade"}
          </button>

          <p className="payment-disclaimer">
            Academic demonstration only. Use dummy payment details.
            No real payment is processed. Card details are not stored.
          </p>
        </form>
      </section>
    </div>
  );
}

function Pricing() {
  const { user, plan, refreshProfile } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isPaid = plan?.toLowerCase() === "paid";

  const startUpgrade = () => {
    setMessage("");
    setError("");

    if (!user) {
      setError("Please log in before upgrading your plan.");
      return;
    }

    if (isPaid) {
      setMessage("Your account is already on the Paid plan.");
      return;
    }

    setShowModal(true);
  };

  const upgrade = async () => {
    if (!user) {
      throw new Error("Please log in before upgrading.");
    }

    await setDoc(
      doc(db, "users", user.uid),
      {
        uid: user.uid,
        email: user.email || "",
        plan: "Paid",
        subscriptionPlan: "Paid",
        upgradedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    await refreshProfile();

    setShowModal(false);
    setMessage("Your account has successfully been upgraded to Paid!");
    setError("");
  };

  return (
    <div className="page-wrap">
      <section className="page-heading">
        <p className="section-label">MEMBERSHIP PLANS</p>

        <h1>Pricing & Plans</h1>

        <p className="muted">
          Choose the plan that suits your learning and sharing needs.
        </p>
      </section>

      <div className="current-plan-banner">
        <div>
          <span>Current subscription</span>
          <h3>
            {user ? `${plan || "Free"} Plan` : "Guest"}
          </h3>
        </div>

        {!user && (
          <Link to="/login" className="login-button">
            Login
          </Link>
        )}
      </div>

      <section className="plan-columns">
        <article>
          <p className="section-label">GET STARTED</p>

          <h2>Free</h2>

          <p className="price">
            ₹0 <small>/ forever</small>
          </p>

          <ul>
            <li>Browse available posts</li>
            <li>Create Free posts</li>
            <li>Access community features</li>
            <li>Basic profile access</li>
          </ul>

          {user && !isPaid && (
            <p className="plan-status">Your current plan</p>
          )}
        </article>

        <article className="paid-plan">
          <p className="section-label">FOR ACTIVE CREATORS</p>

          <h2>Paid</h2>

          <p className="price">
            ₹999 <small>/ month (demo)</small>
          </p>

          <ul>
            <li>All Free plan features</li>
            <li>Access to Paid posts</li>
            <li>Publish Paid content</li>
            <li>Additional community access</li>
          </ul>

          {isPaid ? (
            <p className="plan-status">Your current plan</p>
          ) : (
            <button
              type="button"
              className="button button-primary"
              onClick={startUpgrade}
            >
              {!user ? "Login to Upgrade" : "Upgrade to Paid"}
            </button>
          )}
        </article>
      </section>

      {message && (
        <p className="alert alert-success" role="status">
          {message}
        </p>
      )}

      {error && (
        <p className="alert alert-error" role="alert">
          {error}
        </p>
      )}

      {!user && (
        <p className="alert alert-info">
          Please <Link to="/login">log in</Link> to upgrade your membership.
        </p>
      )}

      {showModal && (
        <PaymentModal
          onClose={() => setShowModal(false)}
          onUpgrade={upgrade}
        />
      )}
    </div>
  );
}

export default Pricing;
