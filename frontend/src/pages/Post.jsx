
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
).replace(/\/$/, "");

export default function Post() {
  const { user, plan } = useAuth();
  const navigate = useNavigate();

  const isPaidMember = plan?.toLowerCase() === "paid";

  const [postType, setPostType] = useState("question");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [abstract, setAbstract] = useState("");
  const [articleText, setArticleText] = useState("");
  const [tags, setTags] = useState("");
  const [visibility, setVisibility] = useState("Free");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!user) {
      setError("Please log in before publishing a post.");
      return;
    }

    if (title.trim().length < 5 || title.trim().length > 120) {
      setError("Title must be between 5 and 120 characters.");
      return;
    }

    const tagList = tags
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);

    if (tagList.length > 3) {
      setError("You can add a maximum of 3 tags.");
      return;
    }

    if (postType === "question" && description.trim().length < 10) {
      setError("Question description must contain at least 10 characters.");
      return;
    }

    if (postType === "article") {
      if (abstract.trim().length < 10 || abstract.trim().length > 1000) {
        setError("Abstract must contain 10 to 1000 characters.");
        return;
      }

      if (articleText.trim().length < 30 || articleText.trim().length > 20000) {
        setError("Article content must contain 30 to 20000 characters.");
        return;
      }
    }

    if (visibility === "Paid" && !isPaidMember) {
      setError("You need a Paid membership to publish Paid posts.");
      return;
    }

    try {
      setLoading(true);

      const token = await user.getIdToken();

      const response = await fetch(`${API_URL}/api/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          postType,
          plan: visibility,
          description: postType === "question" ? description.trim() : "",
          abstract: postType === "article" ? abstract.trim() : "",
          articleText: postType === "article" ? articleText.trim() : "",
          tags: tagList,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to publish post.");
      }

      setSuccess("Your post has been published successfully!");

      setTitle("");
      setDescription("");
      setAbstract("");
      setArticleText("");
      setTags("");
      setVisibility("Free");

      setTimeout(() => {
        navigate("/posts");
      }, 1200);
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the server. Please check your backend."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-wrap narrow post-page">
      <div className="browse-heading">
        <p className="eyebrow">COMMUNITY CONTRIBUTION</p>
        <h1>Create a Post</h1>
        <p className="muted">
          Ask a question or share an article with the community.
        </p>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        {/* Post type selection */}
        <div className="form-group post-type-options post-type-row">
          <span className="post-type-title">Select post type</span>

          <label className="radio-label">
            <input
              type="radio"
              name="postType"
              value="question"
              checked={postType === "question"}
              onChange={() => setPostType("question")}
            />
            <span>Question</span>
          </label>

          <label className="radio-label">
            <input
              type="radio"
              name="postType"
              value="article"
              checked={postType === "article"}
              onChange={() => setPostType("article")}
            />
            <span>Article</span>
          </label>
        </div>

        {/* Title */}
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            placeholder="Enter your post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            minLength={5}
            maxLength={120}
          />
        </div>

        {/* Question or Article fields */}
        {postType === "question" ? (
          <div className="form-group">
            <label htmlFor="description">Describe your problem</label>
            <textarea
              id="description"
              placeholder="Explain your question..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="6"
              required
            />
          </div>
        ) : (
          <>
            <div className="form-group">
              <label htmlFor="abstract">Article Abstract</label>
              <textarea
                id="abstract"
                placeholder="Write a short abstract..."
                value={abstract}
                onChange={(e) => setAbstract(e.target.value)}
                rows="3"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="articleText">Article Content</label>
              <textarea
                id="articleText"
                placeholder="Write your complete article..."
                value={articleText}
                onChange={(e) => setArticleText(e.target.value)}
                rows="8"
                required
              />
            </div>
          </>
        )}

        {/* Tags */}
        <div className="form-group">
          <label htmlFor="tags">Tags</label>
          <input
            id="tags"
            type="text"
            placeholder="java, python, react"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          <small className="muted">
            Enter up to 3 tags separated by commas.
          </small>
        </div>

        {/* Visibility */}
        <div className="form-group">
          <label htmlFor="visibility">Post visibility</label>
          <select
            id="visibility"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
          >
            <option value="Free">Free</option>
            <option value="Paid" disabled={!isPaidMember}>
              Paid {!isPaidMember ? "(Upgrade required)" : ""}
            </option>
          </select>

          {!isPaidMember && (
            <small className="muted">
              Free members can publish Free posts. Upgrade your membership to
              publish Paid posts.
            </small>
          )}

          {isPaidMember && (
            <small className="muted">
              Your Paid membership allows you to publish both Free and Paid
              posts.
            </small>
          )}
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <button
          type="submit"
          className="button button-primary"
          disabled={loading}
        >
          {loading ? "Publishing..." : "Publish Post"}
        </button>
      </form>
    </section>
  );
}
