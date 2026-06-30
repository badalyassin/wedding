/* ================= LOAD CLIENT DATA ================= */
async function loadData() {
  const res = await fetch("data/client.json");
  const data = await res.json();

  document.getElementById("names").innerText =
    data.groom + " & " + data.bride;

  document.getElementById("venueText").innerText =
    data.locationText;

  startCountdown(data.date);
  setupMusic(data.music);
}

loadData();

/* ================= COUNTDOWN ================= */
function startCountdown(dateStr) {
  const weddingDate = new Date(dateStr).getTime();

  setInterval(() => {
    const now = new Date().getTime();
    const diff = weddingDate - now;

    document.getElementById("days").innerText =
      Math.floor(diff / (1000*60*60*24));

    document.getElementById("hours").innerText =
      Math.floor((diff % (1000*60*60*24))/(1000*60*60));

    document.getElementById("minutes").innerText =
      Math.floor((diff % (1000*60*60))/60000);

    document.getElementById("seconds").innerText =
      Math.floor((diff % 60000)/1000);

  }, 1000);
}

/* ================= MUSIC ENGINE ================= */
function setupMusic(path) {
  const music = document.getElementById("bgMusic");
  music.src = path;

  document.body.addEventListener("click", () => {
    music.play().catch(()=>{});
  }, { once: true });
}

/* ================= CURTAIN SYSTEM ================= */
const curtain = document.getElementById("curtain");
document.getElementById("openBtn").onclick = () => {
  curtain.classList.add("open");
  setTimeout(() => curtain.remove(), 2500);
};

/* ================= PREMIUM EFFECTS ================= */
function spawnParticles() {
  const p = document.getElementById("particles");

  for (let i = 0; i < 60; i++) {
    let el = document.createElement("div");
    el.className = "particle";
    el.style.left = Math.random() * 100 + "%";
    el.style.animationDuration = (3 + Math.random()*5) + "s";
    p.appendChild(el);
  }
}
spawnParticles();