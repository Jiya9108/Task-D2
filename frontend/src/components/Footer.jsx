import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-column">
          <Link to="/" className="footer-brand">
            DEV@Deakin
          </Link>
          <p>
            A place to learn, share ideas and connect with developers.
          </p>
        </div>

        <div className="footer-column">
          <h4>Explore</h4>
          <Link to="/">Home</Link>
          <Link to="/posts">Browse Posts</Link>
          <Link to="/post">Create a Post</Link>
        </div>

        <div className="footer-column">
          <h4>Account</h4>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
          <Link to="/pricing">Pricing</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 DEV@Deakin. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;