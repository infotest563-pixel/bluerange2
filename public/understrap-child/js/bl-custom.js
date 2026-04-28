// Ensure jQuery is loaded before executing any code
(function() {
  // Wait for jQuery to be available
  function waitForJQuery(callback) {
    if (typeof jQuery !== 'undefined') {
      callback();
    } else {
      setTimeout(function() {
        waitForJQuery(callback);
      }, 50);
    }
  }

  waitForJQuery(function() {
    // Make sure $ is available
    if (typeof window.$ === 'undefined') {
      window.$ = jQuery;
    }

    //-------  dropdown menu on hover to show  ------------//
    if (window.innerWidth >= 1024) {
      jQuery(document).ready(function () {
        jQuery(".menu-item-has-children").hover(
          function () {
            jQuery(this).find(".dropdown-menu").stop().slideDown(500);
          },
          function () {
            jQuery(this).find(".dropdown-menu").stop().slideUp(400);
          }
        );
      });
    }

jQuery(document).ready(function () {
  //------- sticky header in class add ------------//
  var header = jQuery("#wrapper-navbar");
  jQuery(window).scroll(function () {
    var scroll = jQuery(window).scrollTop();
    if (scroll >= 200) {
      header.addClass("sticky");
    } else {
      header.removeClass("sticky");
    }
  });

  //------- section in class add ------------//
  function checkAnimations() {
    jQuery(".row , .bl-inners").each(function () {
      var $element = jQuery(this);
      var bottom_of_object =
        $element.offset().top + $element.outerHeight() * 0.6;
      var bottom_of_window =
        jQuery(window).scrollTop() + jQuery(window).height();

      if (bottom_of_window > bottom_of_object) {
        setTimeout(function () {
          $element.addClass("animated");
        }, 400);
      }
    });
  }

  // Run on scroll
  jQuery(window).scroll(checkAnimations);

  // Also run on page load — catches elements already in viewport
  jQuery(window).on("load", function () {
    setTimeout(checkAnimations, 200);
  });

  // Also run immediately in case load already fired
  setTimeout(checkAnimations, 300);

  // jQuery(window).scroll(function () {
  //     jQuery('.row').each(function (i) {
  //         var bottom_of_object = jQuery(this).offset().top + (jQuery(this).outerHeight() * 0.6);
  //         var bottom_of_window = jQuery(window).scrollTop() + jQuery(window).height();
  //         if (bottom_of_window > bottom_of_object) {
  //             jQuery(this).addClass('animated');
  //         }
  //     });
  // });

  //-------- |--swiper in dotts class add --| -------------//
  jQuery(document).ready(function () {
    if (jQuery(".swiper-pagination").length) {
      jQuery(".swiper").addClass("sw-botom");
    }
  });

  jQuery(document).ready(function () {
    jQuery(".swiper-button-prev").each(function () {
      jQuery(this).closest(".swiper").addClass("sw-aropad");
    });
  });

  //-------- |-- Home page first banner (banner slider) --| -------------//

  var swiper = new Swiper(".hm-firstbnr", {
    slidesPerView: 1,
    spaceBetween: 30,
    loop: true,
    speed: 1500,
    autoplay: {
      delay: 1500,
      disableOnInteraction: false,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    breakpoints: {
      0: { slidesPerView: 1, spaceBetween: 30 },
      660: { slidesPerView: 2, spaceBetween: 30 },
      1024: { slidesPerView: 5, spaceBetween: 30 },
    },
  });

  //-------- |-- Fantastic customers logo slider (homepage) --| -------------//
  if (jQuery(".hm-firstbnr .hm_frtbnr-inner .swiper-slide").length) {
    new Swiper(".hm-firstbnr", {
      slidesPerView: 1,
      spaceBetween: 30,
      loop: true,
      speed: 1500,
      autoplay: { delay: 1500, disableOnInteraction: false },
      breakpoints: {
        0: { slidesPerView: 1, spaceBetween: 30 },
        660: { slidesPerView: 2, spaceBetween: 30 },
        1024: { slidesPerView: 5, spaceBetween: 30 },
      },
    });
  }

  //-------- |-- Home page slider ( We are partnered) --| -------------//
  let SwiperTop = new Swiper(".hm-partswiper", {
    slidesPerView: "6",
    spaceBetween: 30,
    speed: 2500,
    autoplay: {
      delay: 2000,
      disableOnInteraction: false,
    },
    loop: true,
    breakpoints: {
      0: {
        slidesPerView: 1,
        spaceBetween: 20,
      },
      640: {
        slidesPerView: 3,
        spaceBetween: 25,
      },
      890: {
        slidesPerView: 3,
        spaceBetween: 25,
      },
      1024: {
        slidesPerView: 5,
        spaceBetween: 25,
      },
      1280: {
        slidesPerView: 6,
        spaceBetween: 30,
      },
    },
  });

  //-------- |-- Service page slider (Testimonial) --| -------------//
  var swiper = new Swiper(".sr-testimoail", {
    slidesPerView: 3,
    spaceBetween: 30,
    loop: true,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    breakpoints: {
      0: {
        slidesPerView: 1,
        spaceBetween: 0,
      },
      660: {
        slidesPerView: 2,
        spaceBetween: 30,
      },
      1024: {
        slidesPerView: 3,
        spaceBetween: 30,
      },
    },
  });

  //-------- |-- Our Partner page slider(Testimonial) --| -------------//

  var swiper = new Swiper(".op-prtnrsldr", {
    slidesPerView: 4,
    spaceBetween: 30,
    loop: true,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    breakpoints: {
      0: {
        slidesPerView: 1,
        spaceBetween: 0,
      },
      660: {
        slidesPerView: 3,
        spaceBetween: 30,
      },
      1024: {
        slidesPerView: 4,
        spaceBetween: 30,
      },
    },
  });

  //-------- |-- Career page slider(Testimonial) --| -------------//

  var swiper = new Swiper(".cr-imgcrr", {
    slidesPerView: 2,
    spaceBetween: 30,
    loop: true,
    speed: 1500,
    autoplay: {
      delay: 1000,
      disableOnInteraction: false,
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    breakpoints: {
      0: {
        slidesPerView: 1,
        spaceBetween: 0,
      },
      660: {
        slidesPerView: 2,
        spaceBetween: 30,
      },
    },
  });

  //-------- |-- Sercurity Awarness Training Page --| -------------//

  var swiper = new Swiper(".sat-securlog", {
    slidesPerView: 4,
    spaceBetween: 30,
    loop: true,
    speed: 1500,
    autoplay: {
      delay: 1000,
      disableOnInteraction: false,
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    breakpoints: {
      0: {
        slidesPerView: 1,
        spaceBetween: 0,
      },
      660: {
        slidesPerView: 2,
        spaceBetween: 20,
      },
      1024: {
        slidesPerView: 4,
        spaceBetween: 60,
      },
    },
  });

  //jQuery(document).ready(function() emd............
});

jQuery(document).ready(function ($) {
  // Calculate progress based on completed fields (adjust as needed)
  function calculateProgress() {
    const totalFields = 8; // Change this to the total number of fields
    const completedFields = $('input[type="text"]:filled').length; // Adjust selector as needed

    const progressPercentage = (completedFields / totalFields) * 100;
    return progressPercentage;
  }

  // Update the progress bar when the form changes
  $('input[type="text"]').on("input", function () {
    const progress = calculateProgress();
    $(".progress").css("width", progress + "%");
  });
});

// @s jQuery for mobile field in contact form - home page

jQuery(document).ready(function ($) {
  // Replace 'your-number' with the name of your field
  jQuery('input[name="tel-104"]').on("input", function (e) {
    this.value = this.value.replace(/[^0-9]/g, ""); // Allow only numeric characters
  });
});

//map website hide title
// Wait for the DOM to be ready
jQuery(document).ready(function () {
  // Set a timeout to hide the link after 3000 milliseconds (3 seconds)
  setTimeout(function () {
    // Find the link by its href attribute
    var link = $('a[href="https://simplemaps.com"]');

    // Check if the link exists before attempting to hide it
    if (link.length > 0) {
      // Hide the link by setting its display property to 'none'
      link.hide();
    }
  }, 5); // Adjust the delay in milliseconds as needed
});

jQuery(document).ready(function () {
  // tabs js
  jQuery(".microsoft-365-package-sec-tabs-wrapper .tab-btn").on(
    "click",
    function () {
      var tabId = jQuery(this).data("tab");
      jQuery(".microsoft-365-package-sec-tabs-wrapper .tab-btn").removeClass(
        "active"
      );
      jQuery(this).addClass("active");
      jQuery(
        ".microsoft-365-package-sec-tabs-wrapper .tab-content"
      ).removeClass("active");
      jQuery("#" + tabId).addClass("active");
    }
  );

  // according js
  jQuery(".faq-question").on("click", function () {
    const $item = jQuery(this).parent(".faq-item");
    const $answer = $item.find(".faq-answer");
    const $icon = jQuery(this).find(".faq-icon");

    if ($item.hasClass("active")) {
      // Close current if already active
      $answer.slideUp(300);
      $item.removeClass("active");
      $icon.html(
        '<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>'
      );
    } else {
      // Close all others
      jQuery(".faq-answer").slideUp(300);
      jQuery(".faq-item").removeClass("active");
      jQuery(".faq-icon").html(
        '<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>'
      );

      // Open clicked
      $answer.slideDown(300);
      $item.addClass("active");
      $icon.html(
        '<svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"></line></svg>'
      );
    }
  });
});

// For Buy Now Button Js

$(document).ready(function () {
  // Show modal on any "Buy Now" click
  $(".buyNowBtn").on("click", function (e) {
    e.preventDefault();
    $("#popupModal").fadeIn(200).css("display", "flex");
  });

  // Close modal on close button
  $(".close-btn").on("click", function () {
    $("#popupModal").fadeOut(200);
  });

  // Close modal if user clicks outside popup
  $(window).on("click", function (e) {
    if ($(e.target).is("#popupModal")) {
      $("#popupModal").fadeOut(200);
    }
  });
});

jQuery(document).ready(function($) {
  // Parent link click par toggle hoga
  $("#menu-sidebar-toggle-menu li.menu-item-has-children > a").on("click", function(e) {
    e.preventDefault(); // default page redirect rokna
    $(this).parent("li").toggleClass("open");
    $(this).siblings(".sub-menu").slideToggle(200);
  });

  $("#menu-sidebar-toggle-menu-se li.menu-item-has-children > a").on("click", function(e) {
    e.preventDefault(); // default page redirect rokna
    $(this).parent("li").toggleClass("open");
    $(this).siblings(".sub-menu").slideToggle(200);
  });
});


document.addEventListener("DOMContentLoaded", function () {
    const fileInputs = document.querySelectorAll('input[type="file"].wpcf7-file');
    if (!fileInputs.length) return;

    let labelText = "Choose File"; // Default English

    if (window.location.hostname === "bluerange.se") {
        labelText = "Välj fil"; // Swedish
    }

    fileInputs.forEach(function (input) {
        input.setAttribute("data-label", labelText);
        input.style.setProperty("--label-text", `"${labelText}"`);
    });

    // Apply label through CSS pseudo-element
    const style = document.createElement("style");
    style.innerHTML = `
        input[type="file"].wpcf7-file::before {
            content: attr(data-label);
        }
    `;
    document.head.appendChild(style);
});

  // SP Easy Accordion — init for headless Next.js (no WP plugin JS)
  function initSpAccordion() {
    jQuery('.sp-easy-accordion').each(function () {
      var $accordion = jQuery(this);

      // Already initialized — skip
      if ($accordion.data('sp-init')) return;
      $accordion.data('sp-init', true);

      var $items = $accordion.find('.sp-ea-single');

      // Inject +/- icon into each header link if not already there
      $items.each(function () {
        var $header = jQuery(this).find('.ea-header a');
        if (!$header.find('.sp-ea-icon').length) {
          $header.append('<span class="sp-ea-icon"><span class="sp-ea-plus">+</span><span class="sp-ea-minus">−</span></span>');
        }
        // Hide body initially
        jQuery(this).find('.ea-body').hide();
      });

      // Open first item by default
      var $first = $items.first();
      $first.addClass('ea-expand');
      $first.find('.ea-body').show();

      // Click handler
      $items.find('.ea-header a').off('click.spea').on('click.spea', function (e) {
        e.preventDefault();
        var $item = jQuery(this).closest('.sp-ea-single');
        var isOpen = $item.hasClass('ea-expand');

        // Close all
        $items.removeClass('ea-expand');
        $items.find('.ea-body').slideUp(250);

        // Open clicked if it was closed
        if (!isOpen) {
          $item.addClass('ea-expand');
          $item.find('.ea-body').slideDown(250);
        }
      });
    });
  }

  // Run on page load and after Next.js route changes
  jQuery(document).ready(function () {
    setTimeout(initSpAccordion, 400);
  });

  // Re-init on Next.js client navigation (pushState)
  (function () {
    var _orig = history.pushState;
    history.pushState = function () {
      _orig.apply(history, arguments);
      setTimeout(initSpAccordion, 600);
    };
  })();

  }); // End of waitForJQuery callback
})(); // End of IIFE

