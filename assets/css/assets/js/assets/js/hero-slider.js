/* ==========================================
   MEHEDI XPRESS — STANDALONE HERO SLIDER
   ========================================== */

document.addEventListener("DOMContentLoaded", function () {

  const slides = document.querySelectorAll(".mx-banner-slide");
  const prevBtn = document.getElementById("bannerPrev");
  const nextBtn = document.getElementById("bannerNext");
  const dotsBox = document.getElementById("bannerDots");
  const hero = document.querySelector(".mx-hero");

  if (!slides.length) {
    console.log("Hero slides not found");
    return;
  }

  let current = 0;
  let timer = null;
  let startX = 0;

  /* ---------------------------
     CREATE DOTS
     --------------------------- */

  if (dotsBox) {
    dotsBox.innerHTML = "";

    slides.forEach(function (_, index) {
      const dot = document.createElement("button");

      dot.type = "button";
      dot.className = "mx-banner-dot";
      dot.setAttribute(
        "aria-label",
        "Banner " + (index + 1)
      );

      dot.addEventListener("click", function () {
        showSlide(index);
        restart();
      });

      dotsBox.appendChild(dot);
    });
  }

  function getDots() {
    return dotsBox
      ? dotsBox.querySelectorAll(".mx-banner-dot")
      : [];
  }

  /* ---------------------------
     SHOW SLIDE
     --------------------------- */

  function showSlide(index) {

    if (index >= slides.length) {
      index = 0;
    }

    if (index < 0) {
      index = slides.length - 1;
    }

    current = index;

    slides.forEach(function (slide, i) {

      if (i === current) {
        slide.classList.add("active");

        slide.style.opacity = "1";
        slide.style.visibility = "visible";
        slide.style.pointerEvents = "auto";
        slide.style.zIndex = "2";

      } else {
        slide.classList.remove("active");

        slide.style.opacity = "0";
        slide.style.visibility = "hidden";
        slide.style.pointerEvents = "none";
        slide.style.zIndex = "1";
      }

    });

    const dots = getDots();

    dots.forEach(function (dot, i) {
      dot.classList.toggle(
        "active",
        i === current
      );
    });
  }

  /* ---------------------------
     NEXT / PREVIOUS
     --------------------------- */

  function nextSlide() {
    showSlide(current + 1);
  }

  function previousSlide() {
    showSlide(current - 1);
  }

  /* ---------------------------
     AUTO PLAY
     --------------------------- */

  function start() {

    stop();

    if (slides.length <= 1) {
      return;
    }

    timer = setInterval(function () {
      nextSlide();
    }, 5000);
  }

  function stop() {

    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function restart() {
    stop();
    start();
  }

  /* ---------------------------
     ARROWS
     --------------------------- */

  if (nextBtn) {
    nextBtn.addEventListener(
      "click",
      function (event) {
        event.preventDefault();

        nextSlide();
        restart();
      }
    );
  }

  if (prevBtn) {
    prevBtn.addEventListener(
      "click",
      function (event) {
        event.preventDefault();

        previousSlide();
        restart();
      }
    );
  }

  /* ---------------------------
     PAUSE ON HOVER
     --------------------------- */

  if (hero) {

    hero.addEventListener(
      "mouseenter",
      stop
    );

    hero.addEventListener(
      "mouseleave",
      start
    );

    /* -------------------------
       MOBILE SWIPE
       ------------------------- */

    hero.addEventListener(
      "touchstart",
      function (event) {

        startX =
          event.touches[0].clientX;

      },
      { passive: true }
    );

    hero.addEventListener(
      "touchend",
      function (event) {

        const endX =
          event.changedTouches[0].clientX;

        const difference =
          startX - endX;

        if (Math.abs(difference) < 50) {
          return;
        }

        if (difference > 0) {
          nextSlide();
        } else {
          previousSlide();
        }

        restart();

      },
      { passive: true }
    );
  }

  /* ---------------------------
     TAB VISIBILITY
     --------------------------- */

  document.addEventListener(
    "visibilitychange",
    function () {

      if (document.hidden) {
        stop();
      } else {
        start();
      }

    }
  );

  /* ---------------------------
     START
     --------------------------- */

  showSlide(0);
  start();

  console.log(
    "Mehedi Xpress Hero Slider:",
    slides.length,
    "slides ready"
  );

});
