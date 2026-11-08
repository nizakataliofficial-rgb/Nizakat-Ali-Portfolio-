(() => {
  const root = document.documentElement;
  const themeToggle = document.querySelector(".theme-toggle");
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");
  const form = document.querySelector("#contact-form");
  const formStatus = document.querySelector("#form-status");
  const toast = document.querySelector("#toast");
  let toastTimer;

  function setTheme(theme, save = true) {
    root.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      "content",
      theme === "light" ? "#f8fafc" : "#0f172a"
    );
    themeToggle?.setAttribute(
      "aria-label",
      theme === "light" ? "Switch to dark theme" : "Switch to light theme"
    );
    if (save) {
      try {
        localStorage.setItem("nizakat-portfolio-theme", theme);
      } catch (error) {
        console.warn("Theme preference could not be saved.", error);
      }
    }
  }

  try {
    const savedTheme = localStorage.getItem("nizakat-portfolio-theme");
    if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme, false);
  } catch (error) {
    console.warn("Saved theme preference could not be read.", error);
  }

  themeToggle?.addEventListener("click", () => {
    setTheme(root.dataset.theme === "dark" ? "light" : "dark");
  });

  function closeMenu() {
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Open navigation menu");
    navLinks?.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  }

  menuToggle?.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Open navigation menu" : "Close navigation menu");
    navLinks?.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("menu-open", !isOpen);
  });

  navLinks?.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  const roleElement = document.querySelector(".typing-text");
  const roles = ["Frontend Web Developer", "WordPress Specialist", "UI/UX Enthusiast"];
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const reducedMotion = motionPreference.matches;
  if (roleElement && !reducedMotion) {
    let roleIndex = 0;
    let characterIndex = roles[0].length;
    let deleting = true;

    function typeRole() {
      const currentRole = roles[roleIndex];
      characterIndex += deleting ? -1 : 1;
      roleElement.textContent = currentRole.slice(0, characterIndex);
      roleElement.setAttribute("aria-label", currentRole);

      let delay = deleting ? 45 : 85;
      if (deleting && characterIndex <= 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        delay = 380;
      } else if (!deleting && characterIndex >= roles[roleIndex].length) {
        deleting = true;
        delay = 1700;
      }
      window.setTimeout(typeRole, delay);
    }

    window.setTimeout(typeRole, 2200);
  }

  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  const sections = document.querySelectorAll("main section[id]");
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      document.querySelectorAll(".nav-link").forEach((link) => {
        const isCurrent = link.getAttribute("href") === `#${entry.target.id}`;
        link.classList.toggle("active", isCurrent);
        if (isCurrent) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    });
  }, { rootMargin: "-30% 0px -60% 0px" });
  sections.forEach((section) => sectionObserver.observe(section));

  const progressBar = document.querySelector("#scroll-progress");
  let progressFrame = false;
  function updateScrollProgress() {
    if (progressFrame) return;
    progressFrame = true;
    window.requestAnimationFrame(() => {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
      if (progressBar) progressBar.style.width = `${Math.min(progress, 100)}%`;
      progressFrame = false;
    });
  }
  window.addEventListener("scroll", updateScrollProgress, { passive: true });
  updateScrollProgress();

  let wheelTargetY = window.scrollY;
  let wheelStartY = window.scrollY;
  let wheelStartedAt = 0;
  let wheelFrame = 0;
  let wheelScrollActive = false;
  let previousScrollBehavior = "";

  function canScrollInside(target, deltaY) {
    let element = target instanceof Element ? target : null;
    while (element && element !== document.body && element !== root) {
      const overflowY = window.getComputedStyle(element).overflowY;
      const scrollable = /auto|scroll|overlay/.test(overflowY)
        && element.scrollHeight > element.clientHeight;
      if (scrollable) {
        const canScrollDown = element.scrollTop + element.clientHeight < element.scrollHeight - 1;
        const canScrollUp = element.scrollTop > 0;
        if ((deltaY > 0 && canScrollDown) || (deltaY < 0 && canScrollUp)) return true;
      }
      element = element.parentElement;
    }
    return false;
  }

  function animateWheelScroll(timestamp) {
    const progress = Math.min((timestamp - wheelStartedAt) / 320, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    window.scrollTo(0, wheelStartY + (wheelTargetY - wheelStartY) * easedProgress);
    if (progress === 1) {
      window.scrollTo(0, wheelTargetY);
      root.style.scrollBehavior = previousScrollBehavior;
      wheelFrame = 0;
      wheelScrollActive = false;
      return;
    }
    wheelFrame = window.requestAnimationFrame(animateWheelScroll);
  }

  window.addEventListener("wheel", (event) => {
    if (motionPreference.matches || event.defaultPrevented || event.ctrlKey || event.shiftKey
      || document.body.classList.contains("menu-open")
      || Math.abs(event.deltaY) <= Math.abs(event.deltaX)
      || canScrollInside(event.target, event.deltaY)) return;

    const maxScrollY = root.scrollHeight - window.innerHeight;
    if (!wheelScrollActive) {
      previousScrollBehavior = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";
      wheelTargetY = window.scrollY;
      wheelScrollActive = true;
    }
    wheelTargetY = Math.max(0, Math.min(maxScrollY, wheelTargetY + event.deltaY));
    if ((event.deltaY < 0 && wheelTargetY === 0)
      || (event.deltaY > 0 && wheelTargetY === maxScrollY)) return;

    event.preventDefault();
    wheelStartY = window.scrollY;
    wheelStartedAt = performance.now();
    if (!wheelFrame) wheelFrame = window.requestAnimationFrame(animateWheelScroll);
  }, { passive: false });

  document.querySelectorAll(".filter-button").forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      document.querySelectorAll(".filter-button").forEach((item) => {
        const isActive = item === button;
        item.classList.toggle("active", isActive);
        item.setAttribute("aria-pressed", String(isActive));
      });
      document.querySelectorAll(".project-card").forEach((card) => {
        const visible = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("is-hidden", !visible);
        if (visible) card.classList.add("is-visible");
      });
    });
  });

  function showToast(message, isError = false) {
    if (!toast) return;
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.toggle("is-error", isError);
    toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 4500);
  }

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    formStatus.textContent = "";
    if (!form.reportValidity()) return;

    const accessKey = form.elements.namedItem("access_key").value.trim();
    if (!accessKey) {
      const message = "The contact form is not configured. Please try again later.";
      formStatus.textContent = message;
      showToast(message, true);
      return;
    }

    const submitButton = form.querySelector('[type="submit"]');
    submitButton.disabled = true;
    submitButton.innerHTML = "Sending…";
    try {
      const response = await fetch(form.action, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form)))
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "The message could not be sent. Please try again.");
      }
      form.reset();
      const successMessage = "Thanks for reaching out! Your message has been sent.";
      formStatus.textContent = successMessage;
      showToast(successMessage);
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : "A network error prevented your message from being sent. Please try again.";
      formStatus.textContent = errorMessage;
      showToast(errorMessage, true);
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = 'Send message <span aria-hidden="true">↗</span>';
    }
  });

  const year = document.querySelector("#current-year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
