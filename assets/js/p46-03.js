

(function () {

  "use strict";


  /* -----------------------------------------------------
     SEARCH FORM HELPER
  ----------------------------------------------------- */

  const searchForm =
    document.getElementById("searchForm");

  const searchInput =
    document.getElementById("search");


  if (searchForm && searchInput) {

    searchForm.addEventListener(
      "submit",
      function (event) {

        event.preventDefault();

        const keyword =
          searchInput.value.trim();


        if (!keyword) {

          searchInput.focus();

          return;

        }


        const productSection =
          document.getElementById("products");


        if (productSection) {

          productSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });

        }


        /*
          store.js search input listener
          trigger করার জন্য input event পাঠানো হচ্ছে।
        */

        searchInput.dispatchEvent(
          new Event(
            "input",
            {
              bubbles: true
            }
          )
        );

      }
    );

  }



  /* -----------------------------------------------------
     MOBILE CART BUTTON
  ----------------------------------------------------- */

  const mobileCartButton =
    document.getElementById("mobileCartBtn");

  const desktopCartButton =
    document.getElementById("cartBtn");


  if (
    mobileCartButton &&
    desktopCartButton
  ) {

    mobileCartButton.addEventListener(
      "click",
      function () {

        desktopCartButton.click();

      }
    );

  }



  /* -----------------------------------------------------
     MOBILE ACCOUNT BUTTON
  ----------------------------------------------------- */

  const mobileAccountButton =
    document.getElementById(
      "mobileAccountBtn"
    );

  const desktopAccountButton =
    document.getElementById(
      "account"
    );


  if (
    mobileAccountButton &&
    desktopAccountButton
  ) {

    mobileAccountButton.addEventListener(
      "click",
      function () {

        desktopAccountButton.click();

      }
    );

  }



  /* -----------------------------------------------------
     BACK TO TOP
  ----------------------------------------------------- */

  const backTopButton =
    document.getElementById("backTop");


  if (backTopButton) {

    window.addEventListener(
      "scroll",
      function () {

        if (window.scrollY > 500) {

          backTopButton.classList.add(
            "show"
          );

        } else {

          backTopButton.classList.remove(
            "show"
          );

        }

      }
    );


    backTopButton.addEventListener(
      "click",
      function () {

        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });

      }
    );

  }



  /* -----------------------------------------------------
     IMAGE ERROR FALLBACK
  ----------------------------------------------------- */

  document.addEventListener(
    "error",
    function (event) {

      const element =
        event.target;


      if (
        element &&
        element.tagName === "IMG"
      ) {

        /*
          placeholder নিজেই error করলে
          infinite loop যেন না হয়।
        */

        if (
          !element.src.includes(
            "placeholder.svg"
          )
        ) {

          element.src =
            "assets/images/p46/51b7fc68a677eb.svg";

        }

      }

    },
    true
  );



  /* -----------------------------------------------------
     SMOOTH INTERNAL LINKS
  ----------------------------------------------------- */

  document.addEventListener(
    "click",
    function (event) {

      const link =
        event.target.closest(
          'a[href^="#"]'
        );


      if (!link) {
        return;
      }


      const href =
        link.getAttribute("href");


      if (
        !href ||
        href === "#"
      ) {
        return;
      }


      const target =
        document.querySelector(href);


      if (!target) {
        return;
      }


      event.preventDefault();


      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

    }
  );



  /* -----------------------------------------------------
     ACTIVE NAV LINK
  ----------------------------------------------------- */

  const navLinks =
    document.querySelectorAll(
      ".mx-nav-links a"
    );


  navLinks.forEach(
    function (link) {

      link.addEventListener(
        "click",
        function () {

          navLinks.forEach(
            function (item) {

              item.classList.remove(
                "active"
              );

            }
          );


          link.classList.add(
            "active"
          );

        }
      );

    }
  );



  /* -----------------------------------------------------
     MOBILE CART COUNT SYNC
  ----------------------------------------------------- */

  const desktopCartCount =
    document.getElementById("count");

  const mobileCartCount =
    document.getElementById(
      "mobileCartCount"
    );


  if (
    desktopCartCount &&
    mobileCartCount
  ) {

    const syncCartCount =
      function () {

        mobileCartCount.textContent =
          desktopCartCount.textContent ||
          "0";

      };


    syncCartCount();


    const observer =
      new MutationObserver(
        syncCartCount
      );


    observer.observe(
      desktopCartCount,
      {
        childList: true,
        subtree: true,
        characterData: true
      }
    );

  }

})();

