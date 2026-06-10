(function () {
  function initSilkBackground() {
    if (!window.VANTA || !window.VANTA.FOG || !window.THREE) {
      return;
    }

    const target = document.body;
    if (!target || target.dataset.silkInited === "1") {
      return;
    }

    target.dataset.silkInited = "1";
    window.VANTA.FOG({
      el: target,
      THREE: window.THREE,
      mouseControls: false,
      touchControls: false,
      gyroControls: false,
      minHeight: 200,
      minWidth: 200,
      scale: 1.0,
      scaleMobile: 1.0,
      highlightColor: 0x74b7ff,
      midtoneColor: 0x244a75,
      lowlightColor: 0x0d1f3a,
      baseColor: 0x0a1324,
      blurFactor: 0.58,
      speed: 0.8,
      zoom: 0.2
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSilkBackground);
  } else {
    initSilkBackground();
  }
})();
