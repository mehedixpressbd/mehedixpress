
(function () {
  "use strict";

  const slides = Array.from(
    document.querySelectorAll("#bannerTrack .mx-banner-slide")
  );

  const prevBtn = document.getElementById("bannerPrev");
  const nextBtn = document.getElementById("bannerNext");
  const dotsBox = document.getElementById("bannerDots");

  if (!slides.length) {
    console.error("Hero Slider: No slides found.");
    return;
  }

  let current = 0;
  let timer = null;

  /* =========================
     CREATE DOTS
  ========================= */

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
        restartSlider();
      });

      dotsBox.appendChild(dot);
    });
  }

  function getDots() {
    return dotsBox
      ? Array.from(
          dotsBox.querySelectorAll(".mx-banner-dot")
        )
      : [];
  }

  /* =========================
     SHOW SLIDE
  ========================= */

  function showSlide(index) {

    current =
      (index + slides.length) % slides.length;

    slides.forEach(function (slide, i) {

      const active = i === current;

      slide.classList.toggle("active", active);

      slide.style.display =
        active ? "block" : "none";

      slide.style.visibility =
        active ? "visible" : "hidden";

      slide.style.opacity =
        active ? "1" : "0";

      slide.style.pointerEvents =
        active ? "auto" : "none";

      slide.style.position =
        active ? "relative" : "absolute";

      slide.style.left = "0";
      slide.style.top = "0";
      slide.style.width = "100%";
    });


    getDots().forEach(function (dot, i) {

      const active = i === current;

      dot.classList.toggle("active", active);

      dot.style.background =
        active
          ? "#76e30c"
          : "rgba(255,255,255,.75)";

      dot.style.transform =
        active
          ? "scale(1.35)"
          : "scale(1)";
    });
  }

  /* =========================
     AUTO SLIDER
  ========================= */

  function startSlider() {

    stopSlider();

    if (slides.length <= 1) return;

    timer = setInterval(function () {

      showSlide(current + 1);

    }, 4000);
  }


  function stopSlider() {

    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }


  function restartSlider() {
    stopSlider();
    startSlider();
  }

  /* =========================
     ARROWS
  ========================= */

  if (nextBtn) {

    nextBtn.addEventListener(
      "click",
      function (event) {

        event.preventDefault();

        showSlide(current + 1);

        restartSlider();
      }
    );
  }


  if (prevBtn) {

    prevBtn.addEventListener(
      "click",
      function (event) {

        event.preventDefault();

        showSlide(current - 1);

        restartSlider();
      }
    );
  }

  /* =========================
     MOBILE SWIPE
  ========================= */

  let touchStartX = 0;

  const hero =
    document.getElementById("home");

  if (hero) {

    hero.addEventListener(
      "touchstart",
      function (event) {

        touchStartX =
          event.touches[0].clientX;

      },
      { passive: true }
    );


    hero.addEventListener(
      "touchend",
      function (event) {

        const touchEndX =
          event.changedTouches[0].clientX;

        const difference =
          touchStartX - touchEndX;

        if (Math.abs(difference) < 45) {
          return;
        }

        if (difference > 0) {
          showSlide(current + 1);
        } else {
          showSlide(current - 1);
        }

        restartSlider();

      },
      { passive: true }
    );
  }

  /* =========================
     START
  ========================= */

  showSlide(0);
  startSlider();

  console.log(
    "MEHEDI XPRESS Hero Slider Started:",
    slides.length,
    "slides"
  );

})();
