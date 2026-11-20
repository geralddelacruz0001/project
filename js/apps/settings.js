// ===== SETTINGS APP LOGIC =====
(function() {
  const openSettings = document.getElementById("openSettings");
  const closeSettings = document.getElementById("closeSettings");
  const settingsModal = document.getElementById("settingsModal");
  const screenWrapEl = document.getElementById("screenWrap");
  const themeBtn = document.getElementById("themeToggle");
  const shareBtn = document.getElementById("shareBtn");

  if (openSettings && settingsModal) {
    openSettings.addEventListener("click", () => {
      settingsModal.classList.add("show");
      if (typeof playTone === 'function') { playTone(600, 0.05); }
    });
  }

  if (closeSettings && settingsModal) {
    closeSettings.addEventListener("click", () => {
      settingsModal.classList.remove("show");
      if (typeof playTone === 'function') { playTone(500, 0.05); }
    });
  }

  document.querySelectorAll(".wp-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const bg = btn.dataset.bg;
      if (bg === "gradient") {
        screenWrapEl.style.background = "";
        screenWrapEl.style.backgroundImage = "";
      } else {
        screenWrapEl.style.background = bg;
      }
      if (typeof playTone === 'function') { playTone(800, 0.05); }
    });
  });

  if(themeBtn) {
    themeBtn.addEventListener("click", () => {
      document.body.classList.toggle("light");
      themeBtn.textContent = document.body.classList.contains("light") ? "☀️" : "🌙";
      if (typeof playTone === 'function') { playTone(700, 0.05); }
      if (navigator.vibrate) navigator.vibrate(30);
    });
  }

  if (shareBtn) {
    shareBtn.addEventListener("click", async () => {
      const shareData = {
        title: "Gerald's Portfolio",
        text: "Check out my mobile-style portfolio!",
        url: window.location.href
      };
      try {
        if (navigator.share) {
          await navigator.share(shareData);
          if (typeof playTone === 'function') { playTone(1000, 0.08); }
        } else {
          await navigator.clipboard.writeText(window.location.href);
          alert("Link copied to clipboard! 🔗");
          if (typeof playTone === 'function') { playTone(800, 0.05); }
        }
      } catch (err) { console.log("Share failed:", err); }
    });
  }
})();
