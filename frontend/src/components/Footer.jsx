
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">

        {/* Explore Column */}
        <div className="footer-column">
          <h4>Explore</h4>
          <a href="#home">Home</a>
          <a href="#about">About Me</a>
          <a href="#work">My Work</a>
          <a href="#articles">Articles</a>
          <a href="#tutorials">Tutorials</a>
          <a href="#gallery">Gallery</a>
        </div>

        {/* Support Column */}
        <div className="footer-column">
          <h4>Support</h4>
          <a href="#contact">Contact Me</a>
          <a href="mailto:jiya9108.ai25@chitkara.edu.in">
            Email Support
          </a>
          <a href="#subscribe">Newsletter</a>
        </div>

        {/* Stay Connected Column */}
        <div className="footer-column">
          <h4>Stay Connected</h4>
          <p>
            Stay updated with my latest projects, articles,
            tutorials, and web development learning journey.
          </p>
          <a href="#subscribe">Subscribe to Updates</a>
          <a href="mailto:jiya9108.ai25@chitkara.edu.in">
            Get in Touch
          </a>
        </div>

      </div>

      <div className="footer-bottom">
        <p>
          © 2026 Jiya Kataria. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;