// ===== DASHBOARD APP LOGIC =====
(function() {
  const container = document.querySelector(".dash-container");
  if (!container) return;

  // Simple interaction para sa Tabs (6h, 7d, 30d)
  const tabs = document.querySelectorAll(".dash-tabs span");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      if (typeof playTone === 'function') { playTone(700, 0.04); }
    });
  });

  // Fake real-time update sa Active Sessions
  const activeSessionsEl = document.querySelector(".dash-card:nth-child(4) .dash-value");
  if (activeSessionsEl) {
    setInterval(() => {
      let current = parseInt(activeSessionsEl.textContent.replace(/,/g, ''));
      current += Math.floor(Math.random() * 5) - 2; // Random +/-
      activeSessionsEl.textContent = current.toLocaleString();
    }, 5000);
  }
})();
