import './globals.css';
import type { ReactNode } from 'react';
import Script from 'next/script';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ErrorBoundary from '../components/ErrorBoundary';
import { headers } from 'next/headers';

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Detect language from URL path
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  const lang = pathname.startsWith('/en') ? 'en' : 'sv';

  return (
    <html lang={lang}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="/understrap/css/theme.min.css" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/Swiper/8.4.7/swiper-bundle.css" />
        <link rel="stylesheet" href="/understrap-child/css/animation.css" />
        <link rel="stylesheet" href="/understrap-child/css/bl-custom.css" />
        <link rel="stylesheet" href="/understrap-child/css/bl-responsive.css" />
        <link rel="stylesheet" href="/understrap-child/css/bl-menu.css" />
        <link rel="stylesheet" href="/understrap-child/fonts/stylesheet.css" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" />
        <link rel="stylesheet" href="/understrap-child/style.css" />
      </head>
      <body suppressHydrationWarning={true}>
        <Header lang={lang} />
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <Footer lang={lang} />

        {/* jQuery — load before Bootstrap */}
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.0/jquery.min.js"
          strategy="beforeInteractive"
        />

        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js"
          strategy="afterInteractive"
        />
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/Swiper/8.4.7/swiper-bundle.min.js"
          strategy="afterInteractive"
        />
        <Script
          src="/understrap-child/js/bl-custom.js"
          strategy="afterInteractive"
        />
        <Script
          src="/understrap-child/js/mapdata.js"
          strategy="afterInteractive"
        />
        <Script
          src="/understrap-child/js/countrymap.js"
          strategy="afterInteractive"
        />
        <Script
          src="/contact-form-handler.js"
          strategy="afterInteractive"
        />

        {/* Re-initialize Swiper on Next.js client-side navigation */}
        <Script
          id="swiper-reinit"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              function initSwipers() {
                if (typeof Swiper === 'undefined') return;

                // Fantastic customers / logo sliders — scoped navigation per instance
                document.querySelectorAll('.hm-firstbnr').forEach(function(el) {
                  if (el.swiper) el.swiper.destroy(true, true);
                  var nextBtn = el.querySelector('.swiper-button-next');
                  var prevBtn = el.querySelector('.swiper-button-prev');
                  new Swiper(el, {
                    slidesPerView: 1, spaceBetween: 30, loop: true, speed: 1500,
                    autoplay: { delay: 1500, disableOnInteraction: false },
                    navigation: { nextEl: nextBtn, prevEl: prevBtn },
                    breakpoints: { 0:{slidesPerView:1}, 660:{slidesPerView:2}, 1024:{slidesPerView:5} }
                  });
                });

                // Partners slider
                document.querySelectorAll('.hm-partswiper').forEach(function(el) {
                  if (el.swiper) el.swiper.destroy(true, true);
                  new Swiper(el, {
                    slidesPerView: 6, spaceBetween: 30, loop: true, speed: 2500,
                    autoplay: { delay: 2000, disableOnInteraction: false },
                    breakpoints: { 0:{slidesPerView:1}, 640:{slidesPerView:3}, 1024:{slidesPerView:5}, 1280:{slidesPerView:6} }
                  });
                });

                // Career image slider
                document.querySelectorAll('.cr-imgcrr').forEach(function(el) {
                  if (el.swiper) el.swiper.destroy(true, true);
                  new Swiper(el, {
                    slidesPerView: 2, spaceBetween: 30, loop: true, speed: 1500,
                    autoplay: { delay: 1000, disableOnInteraction: false },
                    pagination: { el: el.querySelector('.swiper-pagination'), clickable: true },
                    breakpoints: { 0:{slidesPerView:1}, 660:{slidesPerView:2} }
                  });
                });

                // Security awareness training logos
                document.querySelectorAll('.sat-securlog').forEach(function(el) {
                  if (el.swiper) el.swiper.destroy(true, true);
                  new Swiper(el, {
                    slidesPerView: 4, spaceBetween: 30, loop: true, speed: 1500,
                    autoplay: { delay: 1000, disableOnInteraction: false },
                    pagination: { el: el.querySelector('.swiper-pagination'), clickable: true },
                    breakpoints: { 0:{slidesPerView:1}, 660:{slidesPerView:2}, 1024:{slidesPerView:4} }
                  });
                });

                // Our partners slider
                document.querySelectorAll('.op-prtnrsldr').forEach(function(el) {
                  if (el.swiper) el.swiper.destroy(true, true);
                  var nextBtn = el.querySelector('.swiper-button-next');
                  var prevBtn = el.querySelector('.swiper-button-prev');
                  new Swiper(el, {
                    slidesPerView: 4, spaceBetween: 30, loop: true,
                    pagination: { el: el.querySelector('.swiper-pagination'), clickable: true },
                    navigation: { nextEl: nextBtn, prevEl: prevBtn },
                    breakpoints: { 0:{slidesPerView:1}, 660:{slidesPerView:3}, 1024:{slidesPerView:4} }
                  });
                });

                // Service testimonial
                document.querySelectorAll('.sr-testimoail').forEach(function(el) {
                  if (el.swiper) el.swiper.destroy(true, true);
                  new Swiper(el, {
                    slidesPerView: 3, spaceBetween: 30, loop: true,
                    pagination: { el: el.querySelector('.swiper-pagination'), clickable: true },
                    breakpoints: { 0:{slidesPerView:1}, 660:{slidesPerView:2}, 1024:{slidesPerView:3} }
                  });
                });

                // Add sw-aropad class to swipers that have prev/next buttons
                document.querySelectorAll('.swiper').forEach(function(el) {
                  if (el.querySelector('.swiper-button-prev')) {
                    el.classList.add('sw-aropad');
                  }
                });
              }

              // Init country map
              function initMap() {
                var mapEl = document.getElementById('map');
                if (!mapEl || mapEl.children.length > 0) return;
                if (typeof simplemaps_countrymap !== 'undefined') {
                  try { simplemaps_countrymap.load(); } catch(e) {}
                }
              }

              // Run on initial load
              window.addEventListener('load', function() {
                setTimeout(initSwipers, 300);
                setTimeout(initMap, 500);
              });

              // Re-run on Next.js route changes
              if (typeof window !== 'undefined') {
                var _pushState = history.pushState;
                history.pushState = function() {
                  _pushState.apply(history, arguments);
                  setTimeout(initSwipers, 500);
                  setTimeout(initMap, 700);
                  // Re-trigger scroll animations for new page content
                  setTimeout(function() {
                    if (typeof jQuery !== 'undefined') {
                      jQuery(".row , .bl-inners").each(function () {
                        var $el = jQuery(this);
                        var bot_obj = $el.offset().top + $el.outerHeight() * 0.6;
                        var bot_win = jQuery(window).scrollTop() + jQuery(window).height();
                        if (bot_win > bot_obj) {
                          setTimeout(function() { $el.addClass("animated"); }, 400);
                        }
                      });
                    }
                  }, 600);
                };
              }
            `
          }}
        />
      </body>
    </html>
  );
}
