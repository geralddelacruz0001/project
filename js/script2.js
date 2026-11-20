/* ===== CLOCK ===== */
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  const time = `${h}:${m}`;
  const clockEl = document.getElementById("clock");
  if (clockEl) clockEl.textContent = time;
  const lc = document.getElementById("lockClock");
  if (lc) lc.textContent = time;
  const ld = document.getElementById("lockDate");
  if (ld) {
    ld.textContent = now.toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric",
    });
  }
}
updateClock();
setInterval(updateClock, 1000);

/* ===== BOOT ===== */
window.addEventListener("load", () => {
  setTimeout(() => {
    const boot = document.getElementById("bootScreen");
    if(boot) boot.classList.add("hide");
    setTimeout(() => {
      const lock = document.getElementById("lockScreen");
      if(lock) lock.classList.add("active");
    }, 300);
  }, 2000);
});

/* ===== SOUND & VIBRATE ===== */
let audioCtx = null;
function playTone(freq = 800, duration = 0.06, type = "sine") {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {}
}
function buzz(ms = 12) {
  if (navigator.vibrate) navigator.vibrate(ms);
}

/* ===== SCREEN SWITCHING & DYNAMIC LOADING ===== */
const screens = document.querySelectorAll(".app-screen");
const lockScreen = document.getElementById("lockScreen");
const homeScreen = document.getElementById("home");
const recentApps = [];
const loadedApps = {}; 

async function showScreen(id) {
  screens.forEach((s) => s.classList.remove("active"));
  if(lockScreen) lockScreen.classList.remove("active");
  
  const target = document.getElementById(id);
  if (!target) return;
  target.classList.add("active");

  // Isara ang weather modal kung sakaling bukas
  const weatherModal = document.getElementById("weatherModal");
  if (weatherModal) weatherModal.classList.remove("show");

  if (id === "facebookApp") {
    loadedApps[id] = true;
  }
  else if (id !== "home" && !loadedApps[id]) {
    target.innerHTML = '<div class="app-loading"><div class="loading-spinner"></div><span>Opening app...</span></div>';
    try {
      const response = await fetch(`${id}.html`);
      if (response.ok) {
        const html = await response.text();
        target.innerHTML = html;
        loadedApps[id] = true;

        if (target.dataset.app) {
          const appName = target.dataset.app;
          
          const appCss = document.createElement("link");
          appCss.rel = "stylesheet";
          appCss.href = `css/apps/${appName}.css`;
          document.head.appendChild(appCss);

          const appJs = document.createElement("script");
          appJs.src = `js/apps/${appName}.js`;
          document.body.appendChild(appJs);
        }

      } else {
        target.innerHTML = '<p style="text-align:center; margin-top:20px;">Error loading app.</p>';
      }
    } catch (error) {
      target.innerHTML = '<p style="text-align:center; margin-top:20px;">Offline or error.</p>';
    }
  }

  if (id !== "home") {
    const idx = recentApps.indexOf(id);
    if (idx > -1) recentApps.splice(idx, 1);
    recentApps.unshift(id);
    if (recentApps.length > 4) recentApps.pop();
  }
  
  playTone(880, 0.05);
  buzz(10);
}

window.goHome = function() {
  screens.forEach((s) => s.classList.remove("active"));
  if(lockScreen) lockScreen.classList.remove("active");
  if(homeScreen) homeScreen.classList.add("active");
  
  // Isara ang weather modal kapag bumabalik sa home
  const weatherModal = document.getElementById("weatherModal");
  if (weatherModal) weatherModal.classList.remove("show");
  
  playTone(600, 0.05);
  buzz(10);
};

window.openLightbox = function(src) {
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const downloadBtn = document.getElementById("downloadImgBtn");
  if(lightboxImg) lightboxImg.src = src;
  if(downloadBtn) downloadBtn.href = src;
  if(lightbox) lightbox.classList.add("show");
  playTone(900, 0.05);
};

window.openProject = function(imgSrc, title, desc) {
  const modal = document.getElementById("projectModal");
  document.getElementById("pmImg").src = imgSrc;
  document.getElementById("pmTitle").textContent = title;
  document.getElementById("pmDesc").textContent = desc;
  if(modal) modal.classList.add("show");
  playTone(900, 0.05);
  buzz(10);
};

document.querySelectorAll(".app-icon[data-target]").forEach((btn) => {
  btn.addEventListener("click", () => showScreen(btn.dataset.target));
});

const facebookBtn = document.getElementById("facebookBtn");
if (facebookBtn) {
  facebookBtn.addEventListener("click", () => showScreen("facebookApp"));
}

/* ===== WEATHER WIDGET CLICK ===== */
const weatherWidget = document.getElementById("weatherWidget");
if (weatherWidget) {
  weatherWidget.addEventListener("click", () => {
    if (!loadedApps["weather"]) {
      const appCss = document.createElement("link");
      appCss.rel = "stylesheet";
      appCss.href = `css/apps/weather.css`;
      document.head.appendChild(appCss);
      
      const appJs = document.createElement("script");
      appJs.src = `js/apps/weather.js`;
      document.body.appendChild(appJs);
      loadedApps["weather"] = true;
    }
  });
}

/* ===== SEARCH BAR LOGIC ===== */
const appSearch = document.getElementById("appSearch");
if (appSearch) {
  appSearch.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    const icons = document.querySelectorAll("#appGrid .app-icon");
    icons.forEach(icon => {
      const nameEl = icon.querySelector("span:last-child");
      const name = nameEl ? nameEl.textContent.toLowerCase() : "";
      if (name.includes(query)) { icon.style.display = "flex"; } 
      else { icon.style.display = "none"; }
    });
  });
}

/* ===== UNLOCK ===== */
let touchStartY = 0;
if(lockScreen) {
  lockScreen.addEventListener("touchstart", (e) => { touchStartY = e.touches[0].clientY; });
  lockScreen.addEventListener("touchend", (e) => {
    const deltaY = touchStartY - e.changedTouches[0].clientY;
    if (deltaY > 50) unlock();
  });
  lockScreen.addEventListener("click", unlock);
}

function unlock() {
  if(lockScreen) lockScreen.classList.remove("active");
  if(homeScreen) homeScreen.classList.add("active");
  
  // Isara ang weather modal kapag nag-unlock
  const weatherModal = document.getElementById("weatherModal");
  if (weatherModal) weatherModal.classList.remove("show");
  
  playTone(1200, 0.08);
  buzz(15);
}

/* ===== SWIPE NAVIGATION ===== */
const screenWrap = document.getElementById("screenWrap");
let swipeStartX = 0, swipeStartY = 0;

if(screenWrap) {
  screenWrap.addEventListener("touchstart", (e) => {
    swipeStartX = e.touches[0].clientX;
    swipeStartY = e.touches[0].clientY;
  }, { passive: true });

  screenWrap.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - swipeStartX;
    const dy = e.changedTouches[0].clientY - swipeStartY;
    if (dx > 60 && Math.abs(dy) < 40) {
      const active = document.querySelector(".app-screen.active");
      if (active && active.id !== "home" && !active.id.includes("lock")) {
        window.goHome();
      }
    }
  }, { passive: true });
}

/* ===== THEME TOGGLE ===== */
const themeBtn = document.getElementById("themeToggle");
if(themeBtn) {
  themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("light");
    themeBtn.textContent = document.body.classList.contains("light") ? "☀️" : "🌙";
    playTone(700, 0.05);
  });
}

/* ===== LIGHTBOX CLOSE ===== */
const lightbox = document.getElementById("lightbox");
if(lightbox) {
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox || e.target.classList.contains("lightbox-content")) {
      lightbox.classList.remove("show");
      const lightboxImg = document.getElementById("lightboxImg");
      if(lightboxImg) lightboxImg.src = "";
    }
  });
}

/* ===== NOTIFICATION PANEL ===== */
const notifPanel = document.getElementById("notifPanel");
const phoneNotch = document.getElementById("notch");
if(phoneNotch && notifPanel) {
  phoneNotch.addEventListener("click", () => {
    notifPanel.classList.toggle("show");
    playTone(750, 0.05);
  });
}
if(notifPanel) {
  notifPanel.addEventListener("click", (e) => {
    if (e.target === notifPanel) notifPanel.classList.remove("show");
  });
}

/* ===== APP SWITCHER ===== */
const homeBtn = document.getElementById("homeBtn");
const appSwitcher = document.getElementById("appSwitcher");
const switcherCards = document.getElementById("switcherCards");
let lastHomeTap = 0;

if(homeBtn) {
  homeBtn.addEventListener("click", () => {
    const now = Date.now();
    if (now - lastHomeTap < 400) { openSwitcher(); } 
    else { window.goHome(); }
    lastHomeTap = now;
  });
}

function openSwitcher() {
  if(!switcherCards || !appSwitcher) return;
  switcherCards.innerHTML = "";
  const appIcons = { about: "👤", projects: "💼", skills: "⚙️", gallery: "🖼️", contact: "✉️", calc: "🧮", notes: "📝", facebookApp: "📘", game: "🎮" };
  const list = recentApps.length ? recentApps : Object.keys(appIcons).slice(0, 3);
  list.forEach((id) => {
    const card = document.createElement("div");
    card.className = "switcher-card";
    card.innerHTML = `${appIcons[id] || "📱"}<small>${id}</small>`;
    card.addEventListener("click", () => {
      appSwitcher.classList.remove("show");
      showScreen(id);
    });
    switcherCards.appendChild(card);
  });
  appSwitcher.classList.add("show");
  playTone(950, 0.06);
}

const switcherClose = document.getElementById("switcherClose");
if(switcherClose && appSwitcher) {
  switcherClose.addEventListener("click", () => { appSwitcher.classList.remove("show"); });
}

/* ===== SETTINGS & WALLPAPER ===== */
const openSettings = document.getElementById("openSettings");
const closeSettings = document.getElementById("closeSettings");
const settingsModal = document.getElementById("settingsModal");
const screenWrapEl = document.getElementById("screenWrap");

if(openSettings) {
  openSettings.addEventListener("click", () => {
    settingsModal.classList.add("show");
    playTone(600, 0.05);
  });
}
if(closeSettings) {
  closeSettings.addEventListener("click", () => {
    settingsModal.classList.remove("show");
    playTone(500, 0.05);
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
    playTone(800, 0.05);
  });
});

/* ===== SHARE BUTTON ===== */
const shareBtn = document.getElementById("shareBtn");
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
        playTone(1000, 0.08);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard! 🔗");
        playTone(800, 0.05);
      }
    } catch (err) { console.log("Share failed:", err); }
  });
}

/* ===== SLEEP MODE ===== */
const sleepScreen = document.getElementById("sleepScreen");
let sleepTimer;

function resetSleepTimer() {
  if(sleepScreen) sleepScreen.classList.remove("show");
  clearTimeout(sleepTimer);
  sleepTimer = setTimeout(() => {
    if(sleepScreen) sleepScreen.classList.add("show");
    // Isara ang weather modal kapag natutulog
    const weatherModal = document.getElementById("weatherModal");
    if (weatherModal) weatherModal.classList.remove("show");
  }, 30000);
}

document.body.addEventListener("touchstart", resetSleepTimer);
document.body.addEventListener("click", resetSleepTimer);
resetSleepTimer();

if(sleepScreen) {
  sleepScreen.addEventListener("click", () => {
    sleepScreen.classList.remove("show");
    resetSleepTimer();
  });
}

/* ===== TOUCH RIPPLE ===== */
document.addEventListener("click", function(e) {
  if(e.target.classList.contains("sleep-screen")) return;
  const ripple = document.createElement("span");
  ripple.classList.add("ripple");
  const rect = e.target.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  ripple.style.width = ripple.style.height = size + "px";
  ripple.style.left = (e.clientX - rect.left - size / 2) + "px";
  ripple.style.top = (e.clientY - rect.top - size / 2) + "px";
  e.target.appendChild(ripple);
  setTimeout(() => { ripple.remove(); }, 600);
});

/* ===== MUSIC PLAYER ===== */
const bgMusic = document.getElementById("bgMusic");
const playPauseBtn = document.getElementById("playPauseBtn");
const musicProgress = document.getElementById("musicProgress");
const currentTimeEl = document.getElementById("currentTime");
const totalTimeEl = document.getElementById("totalTime");
const progressContainer = document.getElementById("progressContainer");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

if(playPauseBtn && bgMusic) {
  playPauseBtn.addEventListener("click", () => {
    if (bgMusic.paused) {
      bgMusic.play().catch(e => console.log("Audio error:", e));
      playPauseBtn.textContent = "⏸";
    } else {
      bgMusic.pause();
      playPauseBtn.textContent = "▶";
    }
    playTone(800, 0.05); buzz(10);
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
}

/* ===== DYNAMIC ISLAND (MUSIC EXPANSION) ===== */
const notchEl = document.getElementById("notch");
const islandText = document.getElementById("islandText");

if (notchEl) {
  notchEl.addEventListener("click", () => {
    notchEl.classList.toggle("expanded");
    if (notchEl.classList.contains("expanded")) {
      if (islandText) islandText.textContent = bgMusic && !bgMusic.paused ? "Playing Music 🎵" : "Music Paused ⏸";
    }
    playTone(700, 0.05);
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

/* ===== BATTERY WARNING ===== */
setTimeout(() => {
  const batteryText = document.getElementById("battery");
  if (batteryText) {
    const batteryAlert = document.getElementById("batteryAlertText");
    if (batteryAlert) batteryAlert.textContent = "Battery level is good.";
  }
}, 5000);
