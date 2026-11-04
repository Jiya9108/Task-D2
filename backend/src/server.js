import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { db, FieldValue } from "./firebaseAdmin.js";
import {
  optionalAuth,
  requireAuth,
  getUserProfile
} from "./middleware.js";

const app = express();
const PORT = process.env.PORT || 5000;

// -------------------- MIDDLEWARE --------------------

app.use(helmet());

const allowedOrigins = (
  process.env.CLIENT_ORIGIN ||
  process.env.FRONTEND_URL ||
  "http://localhost:5173"
)
  .split(",")
  .map(origin => origin.trim());

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json({ limit: "100kb" }));

app.use("/api", rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false
}));

// -------------------- HELPER FUNCTIONS --------------------

const clean = value =>
  typeof value === "string" ? value.trim() : "";

const validTags = tags => {
  if (!Array.isArray(tags)) return [];

  return [
    ...new Set(
      tags.map(tag => clean(tag).toLowerCase()).filter(Boolean)
    )
  ].slice(0, 3);
};

const serializePost = doc => {
  const data = doc.data();

  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt?.toDate
      ? data.createdAt.toDate().toISOString()
      : data.createdAt || null
  };
};

const normalizePlan = value => {
  const plan = clean(value).toLowerCase();

  if (plan === "free") return "Free";
  if (plan === "paid") return "Paid";

  return "";
};

// -------------------- ROOT ROUTE --------------------

app.get("/", (req, res) => {
  res.status(200).send("DEV@Deakin D2 API is running.");
});

// -------------------- HEALTH CHECK --------------------

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "DEV@Deakin D2 API"
  });
});

// -------------------- USER PROFILE --------------------

app.post("/api/users/me", requireAuth, async (req, res) => {
  try {
    const uid = req.user.uid;

    const userRef = db.collection("users").doc(uid);
    const snapshot = await userRef.get();

    const existing = snapshot.exists ? snapshot.data() : {};

    const existingPlan = normalizePlan(
      existing.plan || existing.subscriptionPlan || "Free"
    );

    const profile = {
      uid,
      email: req.user.email || existing.email || "",
      name: clean(req.body.name) || existing.name || "",
      plan: existingPlan || "Free",
      updatedAt: FieldValue.serverTimestamp()
    };

    await userRef.set(profile, { merge: true });

    return res.status(200).json({
      message: "User profile updated successfully.",
      user: {
        ...profile,
        plan: profile.plan
      }
    });

  } catch (error) {
    console.error("Profile error:", error);

    return res.status(500).json({
      message: "Unable to update user profile."
    });
  }
});

// -------------------- CREATE POST --------------------

app.post("/api/posts", requireAuth, async (req, res) => {
  try {
    const uid = req.user.uid;

    const title = clean(req.body.title);

    const postType = clean(
      req.body.postType || req.body.type
    ).toLowerCase();

    const plan = normalizePlan(req.body.plan || "Free");

    const description = clean(req.body.description);
    const abstract = clean(req.body.abstract);
    const articleText = clean(req.body.articleText);

    const tags = validTags(req.body.tags);

    // Validate title
    if (title.length < 5 || title.length > 120) {
      return res.status(400).json({
        message: "Title must be between 5 and 120 characters."
      });
    }

    // Validate post type
    if (!["question", "article"].includes(postType)) {
      return res.status(400).json({
        message: "Post type must be question or article."
      });
    }

    // Validate visibility
    if (!plan) {
      return res.status(400).json({
        message: "Invalid post visibility."
      });
    }

    // Validate tags
    if (Array.isArray(req.body.tags) && req.body.tags.length > 3) {
      return res.status(400).json({
        message: "You can add a maximum of 3 tags."
      });
    }

    // Validate question
    if (postType === "question" && description.length < 10) {
      return res.status(400).json({
        message: "Question description must contain at least 10 characters."
      });
    }

    // Validate article
    if (postType === "article") {
      if (abstract.length < 10 || abstract.length > 1000) {
        return res.status(400).json({
          message: "Article abstract must be between 10 and 1000 characters."
        });
      }

      if (articleText.length < 30 || articleText.length > 20000) {
        return res.status(400).json({
          message: "Article text must be between 30 and 20000 characters."
        });
      }
    }

    // Check membership
    const profile = await getUserProfile(uid);

    const userPlan = normalizePlan(
      profile?.plan || profile?.subscriptionPlan || "Free"
    ) || "Free";

    // Only Paid members can publish Paid posts
    if (plan === "Paid" && userPlan !== "Paid") {
      return res.status(403).json({
        message: "Upgrade to the Paid plan to publish Paid posts."
      });
    }

    // Create post document
    const post = {
      title,
      postType,
      plan,

      description: postType === "question"
        ? description
        : "",

      abstract: postType === "article"
        ? abstract
        : "",

      articleText: postType === "article"
        ? articleText
        : "",

      tags,
      authorId: uid,

      authorName:
        profile?.name ||
        req.user.name ||
        req.user.email ||
        "Anonymous",

      createdAt: FieldValue.serverTimestamp()
    };

    const docRef = await db.collection("posts").add(post);

    const savedPost = await docRef.get();

    return res.status(201).json({
      message: "Post published successfully.",
      post: serializePost(savedPost)
    });

  } catch (error) {
    console.error("Create post error:", error);

    return res.status(500).json({
      message: "Unable to publish post."
    });
  }
});

// -------------------- BROWSE POSTS --------------------

app.get("/api/posts", optionalAuth, async (req, res) => {
  try {
    const snapshot = await db.collection("posts")
      .orderBy("createdAt", "desc")
      .limit(300)
      .get();

    const profile = req.user
      ? await getUserProfile(req.user.uid)
      : null;

    const userPlan = normalizePlan(
      profile?.plan || profile?.subscriptionPlan || "Free"
    ) || "Free";

    let posts = snapshot.docs.map(serializePost);

    // Free members see Free posts only.
    // Paid members see both Free and Paid posts.
    if (userPlan !== "Paid") {
      posts = posts.filter(
        post => normalizePlan(post.plan) !== "Paid"
      );
    }

    // Search filter
    const search = clean(req.query.search).toLowerCase();

    if (search) {
      posts = posts.filter(post =>
        [
          post.title,
          post.description,
          post.abstract,
          post.articleText,
          ...(post.tags || [])
        ]
          .join(" ")
          .toLowerCase()
          .includes(search)
      );
    }

    // Post type filter
    const type = clean(req.query.type).toLowerCase();

    if (type) {
      posts = posts.filter(post => post.postType === type);
    }

    // Visibility filter
    const requestedPlan = normalizePlan(req.query.plan);

    if (requestedPlan) {
      posts = posts.filter(post =>
        normalizePlan(post.plan) === requestedPlan
      );
    }

    // Tag filter
    const tag = clean(req.query.tag).toLowerCase();

    if (tag) {
      posts = posts.filter(post =>
        (post.tags || []).includes(tag)
      );
    }

    return res.status(200).json({
      posts,
      accessPlan: userPlan,
      count: posts.length
    });

  } catch (error) {
    console.error("Fetch posts error:", error);

    return res.status(500).json({
      message: "Unable to fetch posts."
    });
  }
});

// -------------------- ADMIN UPGRADE --------------------

app.post("/api/admin/upgrade-me", requireAuth, async (req, res) => {
  try {
    const expected = process.env.ADMIN_UPGRADE_KEY;
    const supplied = req.body.key;

    if (!expected || supplied !== expected) {
      return res.status(403).json({
        message: "Invalid admin upgrade key."
      });
    }

    const uid = req.user.uid;

    await db.collection("users").doc(uid).set({
      uid,
      email: req.user.email || "",
      plan: "Paid",
      subscriptionPlan: "Paid",
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });

    return res.status(200).json({
      message: "Your account has been upgraded to Paid."
    });

  } catch (error) {
    console.error("Upgrade error:", error);

    return res.status(500).json({
      message: "Unable to upgrade account."
    });
  }
});

// -------------------- UNKNOWN ROUTES --------------------

app.use((req, res) => {
  return res.status(404).json({
    message: "Route not found."
  });
});

// -------------------- ERROR HANDLER --------------------

app.use((error, req, res, next) => {
  console.error("Server error:", error);

  return res.status(500).json({
    message: "Internal server error."
  });
});

// -------------------- START SERVER --------------------

app.listen(PORT, () => {
  console.log("------------------------------------");
  console.log("DEV@Deakin D2 Backend");
  console.log(`Server running at http://localhost:${PORT}`);
  console.log("------------------------------------");
});
