
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
).replace(/\/$/, "");

export default function BrowsePosts() {
  const { user, plan } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState(
    searchParams.get("search") || ""
  );
  const [appliedSearch, setAppliedSearch] = useState(
    searchParams.get("search") || ""
  );
  const [visibility, setVisibility] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isPaidMember = plan?.toLowerCase() === "paid";

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();

        if (appliedSearch.trim()) {
          params.set("search", appliedSearch.trim());
        }

        if (visibility !== "All") {
          params.set("plan", visibility);
        }

        const token = user ? await user.getIdToken() : null;

        const response = await fetch(
          `${API_URL}/api/posts?${params.toString()}`,
          {
            headers: token
              ? { Authorization: `Bearer ${token}` }
              : {}
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load posts.");
        }

        setPosts(Array.isArray(data.posts) ? data.posts : []);

      } catch (err) {
        setError(
          err.message === "Failed to fetch"
            ? "Cannot connect to the server. Check whether your backend is running."
            : err.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [user, appliedSearch, visibility]);

  const handleSearch = (e) => {
    e.preventDefault();

    setAppliedSearch(search.trim());

    if (search.trim()) {
      setSearchParams({ search: search.trim() });
    } else {
      setSearchParams({});
    }
  };

  return (
    <section className="page-wrap browse-page">

      <div className="browse-heading">
        <p className="eyebrow">DEV@DEAKIN COMMUNITY</p>

        <h1>Browse Posts</h1>

        <p className="muted">
          Explore questions and articles shared by the community.
        </p>
      </div>

      <div className="browse-toolbar">

        <form className="browse-search" onSubmit={handleSearch}>
          <input
            type="search"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button type="submit" className="button button-primary">
            Search
          </button>
        </form>

        <div className="visibility-filter">
          <label htmlFor="postVisibility">
            Post Visibility
          </label>

          <select
            id="postVisibility"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
          >
            <option value="All">All Posts</option>
            <option value="Free">Free Posts</option>
            <option value="Paid">Paid Posts</option>
          </select>
        </div>

      </div>

      {visibility === "Paid" && !isPaidMember && (
        <p className="filter-notice">
          Paid posts are available to Paid members only.
        </p>
      )}

      {loading && (
        <p className="muted loading-message">Loading posts...</p>
      )}

      {error && (
        <div className="alert alert-error">{error}</div>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="empty-posts">
          <h3>No posts found</h3>
          <p className="muted">
            Try another search or visibility filter.
          </p>
        </div>
      )}

      {!loading && !error && posts.length > 0 && (
        <div className="posts-grid">

          {posts.map((post) => (
            <article className="post-card" key={post.id}>

              <div className="post-card-top">
                <span className="post-type-label">
                  {post.postType || "Post"}
                </span>

                <span
                  className={`post-visibility ${
                    post.plan?.toLowerCase() === "paid"
                      ? "paid"
                      : "free"
                  }`}
                >
                  {post.plan || "Free"}
                </span>
              </div>

              <h2 className="post-card-title">
                {post.title}
              </h2>

              <p className="post-description">
                {post.postType === "article"
                  ? post.abstract
                  : post.description}
              </p>

              {post.tags?.length > 0 && (
                <div className="post-tags">
                  {post.tags.map((tag, index) => (
                    <span key={index}>#{tag}</span>
                  ))}
                </div>
              )}

              <div className="post-card-footer">
                <span>
                  By {post.authorName || "Anonymous"}
                </span>

                <span>
                  {post.createdAt
                    ? new Date(post.createdAt).toLocaleDateString()
                    : ""}
                </span>
              </div>

            </article>
          ))}

        </div>
      )}

    </section>
  );
}
