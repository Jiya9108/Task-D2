
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const value = search.trim();

    if (value) {
      navigate(`/posts?search=${encodeURIComponent(value)}`);
    } else {
      navigate("/posts");
    }
  };

  return (
    <header className="site-header">
      <div className="header">
        <Link to="/" className="logo">
          DEV@Deakin
        </Link>

        <form className="search-bar" onSubmit={handleSearch}>
          <span className="search-icon">⌕</span>
          <input
            type="search"
            placeholder="Search posts..."
            aria-label="Search posts"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        <div className="nav-actions">
          <Link to="/post" className="post-button">
            Post
          </Link>

          {user ? (
            <button
              type="button"
              className="logout-button"
              onClick={logout}
            >
              Logout
            </button>
          ) : (
            <Link to="/login" className="login-button">
              Login
            </Link>
          )}
        </div>
      </div>

      <nav className="nav">
        <Link to="/">Home</Link>
        <a href="/#about">About</a>
        <a href="/#work">Work</a>
        <a href="/#articles">Articles</a>
        <a href="/#tutorials">Tutorials</a>
        <Link to="/posts">Browse Posts</Link>
        <Link to="/pricing">Pricing</Link>
        <a href="/#gallery">Gallery</a>
        <a href="/#contact">Contact</a>
      </nav>
    </header>
  );
}

export default Navbar;
