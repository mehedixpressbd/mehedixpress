/* =========================================================
   MEHEDI XPRESS — HERO SLIDER
   FINAL STANDALONE VERSION
========================================================= */

(function () {
  "use strict";

  function initHeroSlider() {

    const hero = document.getElementById("home");
    const track = document.getElementById("bannerTrack");
    const slides = Array.from(
      document.querySelectorAll("#bannerTrack .mx-banner-slide")
    );

    const prevBtn = document.getElementById("bannerPrev");
    const nextBtn = document.getElementById("bannerNext");
    const dotsBox = document.getElementById("bannerDots");

    /* -----------------------------------------
       CHECK
    ----------------------------------------- */

    if (!hero || !track || slides.length === 0) {
      console.error("Mehedi Xpress Hero Slider: elements not found.");
      return;
    }

    console.log(
      "Mehedi Xpress Hero Slider:",
      slides.length,
      "slides found"
    );

    let currentIndex = 0;
    let autoTimer = null;
    let touchStartX = 0;
    let touchEndX = 0;

    const AUTO_TIME = 5000;


    /* =========================================
       PREPARE SLIDES
    ========================================= */

    track.style.position = "relative";
    track.style.overflow = "hidden";

    slides.forEach(function (slide, index) {

      slide.style.position = "absolute";
      slide.style.top = "0";
      slide.style.left = "0";
      slide.style.width = "100%";
      slide.style.height = "100%";

      slide.style.transition =
        "opacity 0.65s ease-in-out";

      if (index === 0) {

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


    /* =========================================
       CREATE DOTS
    ========================================= */

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

        if (index === 0) {
          dot.classList.add("active");
        }

        dot.addEventListener("click", function (event) {

          event.preventDefault();
          event.stopPropagation();

          showSlide(index);
          restartAutoSlide();

        });

        dotsBox.appendChild(dot);
      });
    }


    /* =========================================
       GET DOTS
    ========================================= */

    function getDots() {

      if (!dotsBox) {
        return [];
      }

      return Array.from(
        dotsBox.querySelectorAll(".mx-banner-dot")
      );
    }


    /* =========================================
       SHOW SLIDE
    ========================================= */

    function showSlide(index) {

      if (index >= slides.length) {
        index = 0;
      }

      if (index < 0) {
        index = slides.length - 1;
      }

      currentIndex = index;

      slides.forEach(function (slide, slideIndex) {

        const isActive =
          slideIndex === currentIndex;

        if (isActive) {

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

      dots.forEach(function (dot, dotIndex) {

        if (dotIndex === currentIndex) {
          dot.classList.add("active");
        } else {
          dot.classList.remove("active");
        }

      });


      console.log(
        "Hero slide:",
        currentIndex + 1,
        "/",
        slides.length
      );
    }


    /* =========================================
       NEXT
    ========================================= */

    function nextSlide() {

      let nextIndex =
        currentIndex + 1;

      if (nextIndex >= slides.length) {
        nextIndex = 0;
      }

      showSlide(nextIndex);
    }


    /* =========================================
       PREVIOUS
    ========================================= */

    function previousSlide() {

      let previousIndex =
        currentIndex - 1;

      if (previousIndex < 0) {
        previousIndex =
          slides.length - 1;
      }

      showSlide(previousIndex);
    }


    /* =========================================
       AUTO SLIDER
    ========================================= */

    function stopAutoSlide() {

      if (autoTimer !== null) {

        clearInterval(autoTimer);
        autoTimer = null;
      }
    }


    function startAutoSlide() {

      stopAutoSlide();

      if (slides.length <= 1) {
        return;
      }

      autoTimer = window.setInterval(
        function () {

          nextSlide();

        },
        AUTO_TIME
      );
    }


    function restartAutoSlide() {

      stopAutoSlide();
      startAutoSlide();
    }


    /* =========================================
       NEXT BUTTON
    ========================================= */

    if (nextBtn) {

      nextBtn.onclick = function (event) {

        event.preventDefault();
        event.stopPropagation();

        nextSlide();
        restartAutoSlide();

        return false;
      };
    }


    /* =========================================
       PREVIOUS BUTTON
    ========================================= */

    if (prevBtn) {

      prevBtn.onclick = function (event) {

        event.preventDefault();
        event.stopPropagation();

        previousSlide();
        restartAutoSlide();

        return false;
      };
    }


    /* =========================================
       KEYBOARD
    ========================================= */

    document.addEventListener(
      "keydown",
      function (event) {

        if (event.key === "ArrowRight") {

          nextSlide();
          restartAutoSlide();

        }

        if (event.key === "ArrowLeft") {

          previousSlide();
          restartAutoSlide();

        }
      }
    );


    /* =========================================
       MOBILE SWIPE
    ========================================= */

    hero.addEventListener(
      "touchstart",
      function (event) {

        if (!event.changedTouches.length) {
          return;
        }

        touchStartX =
          event.changedTouches[0].screenX;

      },
      {
        passive: true
      }
    );


    hero.addEventListener(
      "touchend",
      function (event) {

        if (!event.changedTouches.length) {
          return;
        }

        touchEndX =
          event.changedTouches[0].screenX;

        const distance =
          touchStartX - touchEndX;


        if (Math.abs(distance) < 50) {
          return;
        }


        if (distance > 0) {

          nextSlide();

        } else {

          previousSlide();
        }


        restartAutoSlide();

      },
      {
        passive: true
      }
    );


    /* =========================================
       PAGE VISIBILITY
    ========================================= */

    document.addEventListener(
      "visibilitychange",
      function () {

        if (document.hidden) {

          stopAutoSlide();

        } else {

          startAutoSlide();
        }
      }
    );


    /* =========================================
       IMAGE ERROR CHECK
    ========================================= */

    slides.forEach(function (slide, index) {

      const image =
        slide.querySelector(
          ".mx-hero-banner-image"
        );

      if (!image) {
        return;
      }

      image.addEventListener(
        "error",
        function () {

          console.error(
            "Hero image failed:",
            index + 1,
            image.src
          );
        }
      );

      image.addEventListener(
        "load",
        function () {

          console.log(
            "Hero image loaded:",
            index + 1
          );
        }
      );
    });


    /* =========================================
       START
    ========================================= */

    showSlide(0);

    startAutoSlide();


    /* =========================================
       DEBUG ACCESS
    ========================================= */

    window.MehediHeroSlider = {

      next: nextSlide,

      prev: previousSlide,

      show: showSlide,

      start: startAutoSlide,

      stop: stopAutoSlide

    };


    console.log(
      "MEHEDI XPRESS HERO SLIDER READY"
    );
  }


  /* ===========================================
     RUN
  =========================================== */

  if (document.readyState === "loading") {

    document.addEventListener(
      "DOMContentLoaded",
      initHeroSlider,
      {
        once: true
      }
    );

  } else {

    initHeroSlider();
  }

})();
