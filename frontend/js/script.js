/* =========================================================
   ANKIT SAHU — PORTFOLIO — main script
   No external JS libraries. Respects prefers-reduced-motion.
   ========================================================= */
(function(){
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Preloader ---------- */
  window.addEventListener("load", () => {
    const pre = document.getElementById("preloader");
    if (pre){
      setTimeout(() => pre.classList.add("hide"), reduceMotion ? 0 : 350);
    }
  });

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Navbar: scrolled state + mobile toggle ---------- */
  const nav = document.getElementById("site-nav");
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");

  const onScroll = () => {
    if (window.scrollY > 30) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");

    const backBtn = document.getElementById("backToTop");
    if (backBtn){
      if (window.scrollY > 500) backBtn.classList.add("show");
      else backBtn.classList.remove("show");
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (navToggle && navLinks){
    navToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("mobile-open");
      navToggle.classList.toggle("open", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
    navLinks.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => {
        navLinks.classList.remove("mobile-open");
        navToggle.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Scrollspy: highlight active nav link ---------- */
  const sections = document.querySelectorAll("section[id]");
  const navAnchors = document.querySelectorAll(".nav-links a");

  if ("IntersectionObserver" in window && sections.length){
    const spy = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          const id = entry.target.getAttribute("id");
          navAnchors.forEach(a => {
            a.classList.toggle("active", a.getAttribute("href") === "#" + id);
          });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

    sections.forEach(s => spy.observe(s));
  }

  /* ---------- Back to top ---------- */
  const backBtn = document.getElementById("backToTop");
  if (backBtn){
    backBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ---------- Hero role cycling text ---------- */
  const roles = ["Full Stack Developer", "Front-End Focused Builder", "Lifelong Learner"];
  const typedEl = document.getElementById("typedRole");

  if (typedEl && !reduceMotion){
    let roleIndex = 0, charIndex = 0, deleting = false;

    const tick = () => {
      const current = roles[roleIndex];
      if (!deleting){
        charIndex++;
        typedEl.textContent = current.slice(0, charIndex);
        if (charIndex === current.length){
          deleting = true;
          setTimeout(tick, 1500);
          return;
        }
      } else {
        charIndex--;
        typedEl.textContent = current.slice(0, charIndex);
        if (charIndex === 0){
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
        }
      }
      setTimeout(tick, deleting ? 35 : 70);
    };
    typedEl.textContent = "";
    setTimeout(tick, 500);
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll(".reveal, .reveal-stagger");
  if ("IntersectionObserver" in window && revealEls.length && !reduceMotion){
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          entry.target.classList.add("in-view");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => revealObserver.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add("in-view"));
  }

  /* ---------- Skill bars fill on scroll ---------- */
  const bars = document.querySelectorAll(".bar-fill");
  if ("IntersectionObserver" in window && bars.length){
    const barObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          const el = entry.target;
          const level = el.getAttribute("data-level") || 0;
          el.style.width = level + "%";
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.4 });
    bars.forEach(b => barObserver.observe(b));
  } else {
    bars.forEach(b => { b.style.width = (b.getAttribute("data-level") || 0) + "%"; });
  }

  /* ---------- Contact form -> backend API ---------- */
  const form = document.getElementById("contactForm");
  const submitBtn = document.getElementById("submitBtn");
  const statusEl = document.getElementById("formStatus");

  const setStatus = (msg, type) => {
    statusEl.textContent = msg;
    statusEl.className = "form-status" + (type ? " " + type : "");
  };

  if (form){
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // honeypot: if this hidden field got filled, silently drop (bot)
      const honeypot = form.querySelector("#website");
      if (honeypot && honeypot.value){
        form.reset();
        setStatus("✅ Message sent successfully!", "success");
        return;
      }

      const name = form.querySelector("#name").value.trim();
      const email = form.querySelector("#email").value.trim();
      const message = form.querySelector("#message").value.trim();

      if (!name || !email || !message){
        setStatus("Please fill in all fields.", "error");
        return;
      }

      submitBtn.classList.add("loading");
      submitBtn.disabled = true;
      setStatus("Sending your message...");

      try{
        const res = await fetch(API_BASE_URL + "/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, message })
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data.success){
          throw new Error(data.error || "Something went wrong. Please try again.");
        }

        setStatus("✅ Message sent successfully! I'll get back to you soon.", "success");
        form.reset();
      } catch (err){
        console.error("Contact form error:", err);
        setStatus("⚠️ Could not send message — backend is probably not running. See README.", "error");
      } finally {
        submitBtn.classList.remove("loading");
        submitBtn.disabled = false;
      }
    });
  }

})();
topBtn.onclick=()=>{

window.scrollTo({

top:0,

behavior:"smooth"

});

};