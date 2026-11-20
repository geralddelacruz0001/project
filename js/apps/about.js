// ===== ABOUT APP LOGIC =====
(async function() {
  const dynName = document.getElementById("dynName");
  if (!dynName) return;
  
  try {
    const res = await fetch("data.json");
    if (res.ok) {
      const data = await res.json();
      document.getElementById("dynName").textContent = data.profile.name;
      document.getElementById("dynRole").textContent = data.profile.role;
      document.getElementById("dynAbout").textContent = data.profile.about;
    }
  } catch (e) { console.log("About data error", e); }
})();
