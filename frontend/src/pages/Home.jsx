import React, { useState } from "react";
import emailjs from "@emailjs/browser";

import {
  articles,
  tutorials,
  projects,
  galleryImages,
  deakin,
} from "../data";

/* =========================================================
   HERO
========================================================= */

function Hero() {
  return (
    <section className="main" id="home">
      <div className="main-content">
        <p className="main-label">
          WELCOME TO DEV@DEAKIN
        </p>

        <p>
          Explore web development, programming, data analysis,
          university projects, articles, and tutorials through
          my DEV@Deakin learning journey.
        </p>

        <a href="#about" className="main-button">
          About Me
        </a>
      </div>

      <div className="hero-image">
        <img
          src={deakin}
          alt="Deakin University"
        />
      </div>

      <div className="code-card">
        <div className="code-header">
          <span></span>
          <span></span>
          <span></span>
        </div>

        <pre>
          <code>{`function developer() {
  return "Keep Learning!";
}`}</code>
        </pre>
      </div>
    </section>
  );
}

/* =========================================================
   INTRO
========================================================= */

function Intro() {
  return (
    <section className="intro">
      <p className="section-label">
        LEARN & BUILD
      </p>

      <h2>
        Develop Your Skills
      </h2>

      <p>
        Discover useful articles, practical tutorials,
        university projects, and my learning journey
        through programming, data analysis, AI,
        and web development.
      </p>
    </section>
  );
}

/* =========================================================
   ABOUT
========================================================= */

function About() {
  return (
    <section
      className="about-section"
      id="about"
    >
      <div className="about-content">
        <p className="section-label">
          ABOUT ME
        </p>

        <h2>
          Hi, I'm Jiya Kataria
        </h2>

        <p>
          I am an AI and Machine Learning student interested
          in programming, data analysis, and intelligent
          technologies.
        </p>

        <p>
          Through my university studies, I have developed
          skills in programming, problem solving, data analysis,
          web development, and mathematical concepts.
        </p>

        <p>
          This DEV@Deakin website showcases my learning journey,
          university coursework, projects, articles, tutorials,
          and interests.
        </p>
      </div>
    </section>
  );
}

/* =========================================================
   ARTICLE CARD
========================================================= */

function ArticleCard({ article }) {
  return (
    <article className="card">
      <img
        src={article.image}
        alt={article.title}
      />

      <div className="card-content">
        <span className="card-category">
          ARTICLE
        </span>

        <h3>
          {article.title}
        </h3>

        <p>
          {article.description}
        </p>

        <div className="card-footer">
          <span>
            By {article.author}
          </span>

          <span>
            ⭐ {article.rating}
          </span>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   TUTORIAL CARD
========================================================= */

function TutorialCard({ tutorial }) {
  return (
    <article className="card">
      <img
        src={tutorial.image}
        alt={tutorial.title}
      />

      <div className="card-content">
        <span className="card-category">
          TUTORIAL
        </span>

        <h3>
          {tutorial.title}
        </h3>

        <p>
          {tutorial.description}
        </p>

        <div className="card-footer">
          <span>
            By {tutorial.author}
          </span>

          <span>
            ⭐ {tutorial.rating}
          </span>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   PROJECT CARD
========================================================= */

function ProjectCard({ project }) {
  return (
    <article className="card">
      <img
        src={project.image}
        alt={project.title}
      />

      <div className="card-content">
        <span className="card-category">
          PROJECT
        </span>

        <h3>
          {project.title}
        </h3>

        <p>
          {project.description}
        </p>

        <div className="card-footer">
          <span>
            University Coursework
          </span>

          <span>
            DEV@Deakin
          </span>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   GENERAL SECTION
========================================================= */

function Section({ id, title, children }) {
  return (
    <section
      className="content-section"
      id={id}
    >
      <div className="section-heading">
        <h2>
          {title}
        </h2>

        <a href={`#${id}`}>
          View All →
        </a>
      </div>

      <div className="card-grid">
        {children}
      </div>
    </section>
  );
}

/* =========================================================
   GALLERY
========================================================= */

function Gallery() {
  return (
    <section
      className="gallery-section"
      id="gallery"
    >
      <div className="gallery-heading">
        <p className="section-label">
          MY GALLERY
        </p>

        <h2>
          Projects & Interests
        </h2>

        <p>
          A collection of images related to my interests,
          projects, university work, and development journey.
        </p>
      </div>

      <div className="gallery-grid">
        {galleryImages.map((item) => (
          <div
            className="gallery-item"
            key={item.id}
          >
            <img
              src={item.image}
              alt={item.alt}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

/* =========================================================
   CONTACT
========================================================= */

function Contact() {
  return (
    <section
      className="contact-section"
      id="contact"
    >
      <div className="contact-content">
        <p className="section-label">
          CONTACT
        </p>

        <h2>
          Get In Touch
        </h2>

        <p>
          If you would like to connect with me regarding
          my projects, university work, or development
          interests, feel free to get in touch.
        </p>

        <a
          className="contact-email"
          href="mailto:jiya9108.ai25@chitkara.edu.in"
        >
          jiya9108.ai25@chitkara.edu.in
        </a>
      </div>
    </section>
  );
}

/* =========================================================
   NEWSLETTER
========================================================= */

function Newsletter() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setMessage("Please enter your email address.");
      return;
    }

    if (!event.currentTarget.checkValidity()) {
      setMessage("Please enter a valid email address.");
      return;
    }

    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          subscriber_email: trimmedEmail,
        },
        {
          publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
        }
      );

      setMessage("Subscription successful! Check your email.");
      setEmail("");
    } catch (error) {
      console.error("EmailJS error:", error);
      setMessage("Subscription failed. Please try again.");
    }
  }

  return (
    <section
      className="newsletter"
      id="subscribe"
    >
      <div>
        <p className="section-label">
          STAY UPDATED
        </p>

        <h2>
          Stay Connected
        </h2>

        <p>
          Get the latest developer articles,
          tutorials, and updates delivered to you.
        </p>
      </div>

      <form
        className="newsletter-form"
        onSubmit={handleSubmit}
      >
        <input
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          placeholder="Enter your email address"
          aria-label="Email address"
          required
        />

        <button type="submit">
          Subscribe
        </button>

        <p
          className="newsletter-message"
          aria-live="polite"
        >
          {message}
        </p>
      </form>
    </section>
  );
}

/* =========================================================
   HOME PAGE
   Sequence:
   Hero
   Intro
   About
   Work
   Articles
   Tutorials
   Gallery
   Contact
   Newsletter
========================================================= */

function Home() {
  return (
    <div className="app">

      {/* 1. HERO */}
      <Hero />

      {/* 2. INTRODUCTION */}
      <Intro />

      {/* 3. ABOUT */}
      <About />

      {/* 4. MY WORK */}
      <Section
        id="work"
        title="My Work"
      >
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
          />
        ))}
      </Section>

      {/* 5. ARTICLES */}
      <Section
        id="articles"
        title="Featured Articles"
      >
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
          />
        ))}
      </Section>

      {/* 6. TUTORIALS */}
      <Section
        id="tutorials"
        title="Featured Tutorials"
      >
        {tutorials.map((tutorial) => (
          <TutorialCard
            key={tutorial.id}
            tutorial={tutorial}
          />
        ))}
      </Section>

      {/* 7. GALLERY */}
      <Gallery />

      {/* 8. CONTACT */}
      <Contact />

      {/* 9. NEWSLETTER */}
      <Newsletter />

    </div>
  );
}

export default Home;