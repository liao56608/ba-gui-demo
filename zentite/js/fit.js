/* ============================================================
   Auto-fit helper (fit.js)
   ------------------------------------------------------------
   The GUI is designed for a fixed 800 x 1108 device screen.
   This script uniformly scales the .device-frame so the whole
   screen always fits inside the available browser viewport on:
       - iPhone  (Safari)
       - iPad    (Safari)
       - PC      (Chrome / any desktop browser)
   ...without the user ever needing to pinch-zoom or scroll
   after navigating between pages.

   NOTHING inside the frame is changed — no font sizes, no
   positions, no ratios. We only apply a single uniform CSS
   transform: scale(...) and re-center the frame. The design
   aspect ratio (800:1108) is therefore preserved exactly.
   ============================================================ */
(function () {
  'use strict';

  function fitFrame() {
    var frame = document.querySelector('.device-frame');
    if (!frame) return;

    /* offsetWidth/offsetHeight are the layout size and are NOT
       affected by CSS transforms, so they always report the true
       design size (800 x 1108, or 800 x 1280 on the splash page)
       regardless of any previously applied scale. */
    var nw = frame.offsetWidth;
    var nh = frame.offsetHeight;
    if (!nw || !nh) return;           // not laid out yet (CSS not ready)

    var vw = window.innerWidth;
    var vh = window.innerHeight;
    if (!vw || !vh) return;

    /* Uniform scale so the whole frame fits without overflowing
       either dimension — this keeps the 800:1108 ratio intact. */
    var scale = Math.min(vw / nw, vh / nh);

    var scaledW = nw * scale;
    var scaledH = nh * scale;

    /* Center the (scaled) frame in the viewport and scale it from
       its top-left corner. position:absolute resolves against the
       initial containing block (the viewport) because no ancestor
       is positioned. */
    frame.style.position = 'absolute';
    frame.style.left = ((vw - scaledW) / 2) + 'px';
    frame.style.top = ((vh - scaledH) / 2) + 'px';
    frame.style.margin = '0';
    frame.style.transformOrigin = 'top left';
    frame.style.transform = 'scale(' + scale + ')';
  }

  /* Run as soon as the DOM is ready, plus re-run on every viewport
     change (resize, orientation change, iOS address-bar show/hide,
     and final load when CSS/images are fully applied). */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fitFrame);
  } else {
    fitFrame();
  }
  window.addEventListener('load', fitFrame);
  window.addEventListener('resize', fitFrame);
  window.addEventListener('orientationchange', function () {
    setTimeout(fitFrame, 150);
  });
  /* Final safety pass shortly after load — catches the real visible
     height on mobile browsers that report it a tick late. */
  setTimeout(fitFrame, 300);
})();
