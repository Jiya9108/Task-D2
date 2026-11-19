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

  const [hiddenPosts, setHiddenPosts] = useState([]);
  const [expandedPosts, setExpandedPosts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isPaidMember = plan?.toLowerCase() === "paid";

  // Keep search input synchronized with browser URL changes
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";

    setSearch(urlSearch);
    setAppliedSearch(urlSearch);
  }, [searchParams]);

  // Fetch posts whenever search or visibility changes
  useEffect(() => {
    let cancelled = false;

    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();

        if (appliedSearch.trim()) {
          params.set("search", appliedSearch.trim());
        }

        if (!user) {
          params.set("plan", "Free");
        } else if (visibility !== "All") {
          params.set("plan", visibility);
        }

        const token = user
          ? await user.getIdToken()
          : null;

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
          throw new Error(
            data.message || "Unable to load posts."
          );
        }

        if (!cancelled) {
          setPosts(
            Array.isArray(data.posts) ? data.posts : []
          );
        }

      } catch (err) {
        if (!cancelled) {
          setError(
            err.message === "Failed to fetch"
              ? "Cannot connect to the server. Check whether your backend is running."
              : err.message
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchPosts();

    return () => {
      cancelled = true;
    };
  }, [user, appliedSearch, visibility]);

  // Search posts
  const handleSearch = (e) => {
    e.preventDefault();

    const value = search.trim();

    setAppliedSearch(value);

    if (value) {
      setSearchParams({ search: value });
    } else {
      setSearchParams({});
    }
  };

  // Hide an individual post
  const handleHide = (postId) => {
    setHiddenPosts((previous) =>
      previous.includes(postId)
        ? previous
        : [...previous, postId]
    );

    setExpandedPosts((previous) =>
      previous.filter((id) => id !== postId)
    );
  };

  // Expand or collapse a post
  const handleExpand = (postId) => {
    setExpandedPosts((previous) =>
      previous.includes(postId)
        ? previous.filter((id) => id !== postId)
        : [...previous, postId]
    );
  };

  // Reset all controls and restore hidden posts
  const handleReset = () => {
    setHiddenPosts([]);
    setExpandedPosts([]);

    setSearch("");
    setAppliedSearch("");
    setVisibility("All");

    setSearchParams({});
  };

  // Filter out hidden posts
  const visiblePosts = posts.filter(
    (post) => !hiddenPosts.includes(post.id)
  );

  return (
    <section className="page-wrap browse-page">

      <div className="browse-heading">
        <p className="eyebrow">
          DEV@DEAKIN COMMUNITY
        </p>

        <h1>Browse Posts</h1>

        <p className="muted">
          Explore questions and articles shared by the community.
        </p>
      </div>

      <div className="browse-toolbar">

        <form
          className="browse-search"
          onSubmit={handleSearch}
        >
          <input
            type="search"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            type="submit"
            className="button button-primary"
          >
            Search
          </button>
        </form>

        <div className="visibility-filter">

          <label htmlFor="postVisibility">
            Post Visibility
          </label>

          <select
            id="postVisibility"
            value={!user ? "Free" : visibility}
            onChange={(e) => setVisibility(e.target.value)}
          >
            {!user ? (
              <option value="Free">Free Posts</option>
            ) : (
              <>
                <option value="All">All Posts</option>
                <option value="Free">Free Posts</option>
                <option value="Paid">Paid Posts</option>
              </>
            )}
          </select>

        </div>

      </div>

      <div className="browse-actions">

        <button
          type="button"
          className="button button-secondary"
          onClick={handleReset}
        >
          Reset
        </button>

      </div>

      {user && visibility === "Paid" && !isPaidMember && (
        <p className="filter-notice">
          Paid posts are available to Paid members only.
        </p>
      )}

      {loading && (
        <p className="muted loading-message">
          Loading posts...
        </p>
      )}

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {!loading && !error && visiblePosts.length === 0 && (
        <div className="empty-posts">
          <h3>
            {posts.length > 0
              ? "All posts are hidden"
              : "No posts found"}
          </h3>

          <p className="muted">
            {posts.length > 0
              ? "Click Reset to show all posts again."
              : "Try another search or visibility filter."}
          </p>
        </div>
      )}

      {!loading && !error && visiblePosts.length > 0 && (

        <div className="posts-grid">

          {visiblePosts.map((post) => {

            const isExpanded = expandedPosts.includes(post.id);

            const isArticle =
              post.postType?.toLowerCase() === "article";

            const postContent = isArticle
              ? post.articleText || post.abstract
              : post.description || "";

            const previewContent = isArticle
              ? post.abstract || post.articleText
              : post.description || "";

            return (

              <article
                className="post-card"
                key={post.id}
              >

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

                <p
                  className={`post-description ${
                    isExpanded ? "is-expanded" : ""
                  }`}
                >
                  {isExpanded
                    ? postContent
                    : previewContent}
                </p>

                {post.tags?.length > 0 && (

                  <div className="post-tags">
                    {post.tags.map((tag, index) => (
                      <span key={index}>
                        #{tag}
                      </span>
                    ))}
                  </div>

                )}

                <div className="post-card-footer">

                  <span>
                    By {post.authorName || "Anonymous"}
                  </span>

                  <span>
                    {post.createdAt
                      ? new Date(
                          post.createdAt
                        ).toLocaleDateString()
                      : ""}
                  </span>

                </div>

                <div className="post-card-actions">

                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => handleExpand(post.id)}
                  >
                    {isExpanded ? "Collapse" : "Expand"}
                  </button>

                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => handleHide(post.id)}
                  >
                    Hide
                  </button>

                </div>

              </article>

            );
          })}

        </div>

      )}

    </section>
  );
}
