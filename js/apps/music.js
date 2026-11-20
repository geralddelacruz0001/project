// ===== MUSIC PLAYER LOGIC =====
(function() {
  const bgMusic = document.getElementById("bgMusic");
  const playPauseBtn = document.getElementById("playPauseBtn");
  const musicProgress = document.getElementById("musicProgress");
  const currentTimeEl = document.getElementById("currentTime");
  const totalTimeEl = document.getElementById("totalTime");
  const progressContainer = document.getElementById("progressContainer");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  if (!bgMusic || !playPauseBtn) return;

  function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  }

  playPauseBtn.addEventListener("click", () => {
    if (bgMusic.paused) {
      bgMusic.play().catch(e => console.log("Audio error:", e));
      playPauseBtn.textContent = "⏸";
    } else {
      bgMusic.pause();
      playPauseBtn.textContent = "▶";
    }
    if (typeof playTone === 'function') { playTone(800, 0.05); buzz(10); }
  });

  bgMusic.addEventListener("loadedmetadata", () => {
    if(totalTimeEl) totalTimeEl.textContent = formatTime(bgMusic.duration);
  });

  bgMusic.addEventListener("timeupdate", () => {
    if (bgMusic.duration) {
      const progress = (bgMusic.currentTime / bgMusic.duration) * 100;
      if(musicProgress) musicProgress.style.width = progress + "%";
      if(currentTimeEl) currentTimeEl.textContent = formatTime(bgMusic.currentTime);
    }
  });

  if(progressContainer) {
    progressContainer.addEventListener("click", (e) => {
      const width = progressContainer.clientWidth;
      const clickX = e.offsetX;
      const duration = bgMusic.duration;
      bgMusic.currentTime = (clickX / width) * duration;
    });
  }

  if(prevBtn) prevBtn.addEventListener("click", () => { bgMusic.currentTime = 0; if(!bgMusic.paused) bgMusic.play(); });
  if(nextBtn) nextBtn.addEventListener("click", () => { bgMusic.currentTime = 0; if(!bgMusic.paused) bgMusic.play(); });

  // Dynamic Island Integration
  const notchEl = document.getElementById("notch");
  const islandText = document.getElementById("islandText");

  if (notchEl) {
    notchEl.addEventListener("click", () => {
      notchEl.classList.toggle("expanded");
      if (notchEl.classList.contains("expanded")) {
        if (islandText) islandText.textContent = bgMusic && !bgMusic.paused ? "Playing Music 🎵" : "Music Paused ⏸";
      }
      if (typeof playTone === 'function') { playTone(700, 0.05); }
    });
  }

  if (playPauseBtn) {
    playPauseBtn.addEventListener("click", () => {
      if (!bgMusic.paused) {
        if (notchEl) notchEl.classList.add("expanded");
        if (islandText) islandText.textContent = "Playing Music 🎵";
        setTimeout(() => { if (notchEl) notchEl.classList.remove("expanded"); }, 3000);
      }
    });
  }
})();
