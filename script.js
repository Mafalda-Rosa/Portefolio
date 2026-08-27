const API_KEY = "AIzaSyC_-mD0SnxS917L6H9JChpqxW3wnlzY0ZQ";
const CHANNEL_ID = "UCmLuDdUU9hQBPvKamaO87cg";

const myItchGames = [
  {
    title: "Musguinho",
    link: "https://acid-rainbow.itch.io/musguinho",
    thumbnail: "musguinho_completo.png", // Vai buscar a imagem local da pasta do projeto
  },
];

// Elementos Básicos
const btnAbout = document.getElementById("btnAbout");
const aboutSection = document.getElementById("aboutSection");
btnAbout.addEventListener("click", () =>
  aboutSection.classList.toggle("hidden"),
);

const btnContact = document.getElementById("btnContact");
const contactSection = document.getElementById("contactSection");
btnContact.addEventListener("click", () =>
  contactSection.classList.toggle("hidden"),
);

const mainContainer = document.getElementById("mainContainer");
const bottomButtonsGroup = document.getElementById("bottomButtonsGroup");
const btnAboutElement = document.getElementById("btnAbout");
const mainHeader = document.querySelector(".main-header");

// --- Grelhas ---
const gamesSection = document.getElementById("gamesSection");
const gamesGrid = document.getElementById("gamesGrid");
let isGamesLoaded = false;

const youtubeSection = document.getElementById("youtubeSection");
const playlistsGrid = document.getElementById("playlistsGrid");
let isPlaylistsLoaded = false;

// --- Ações dos Botões ---
document.getElementById("btnGames").addEventListener("click", () => {
  gamesSection.classList.toggle("hidden");
  youtubeSection.classList.add("hidden");
  if (!isGamesLoaded) {
    loadMyGames();
  }
});
document
  .getElementById("btnBackGames")
  .addEventListener("click", () => gamesSection.classList.add("hidden"));

document.getElementById("btnYoutube").addEventListener("click", () => {
  youtubeSection.classList.toggle("hidden");
  gamesSection.classList.add("hidden");
  if (!isPlaylistsLoaded) {
    fetchPlaylists();
  }
});
document
  .getElementById("btnBackYoutube")
  .addEventListener("click", () => youtubeSection.classList.add("hidden"));

function loadMyGames() {
  gamesGrid.innerHTML = "";
  if (myItchGames.length === 0) {
    gamesGrid.innerHTML = "<p>No games added yet.</p>";
    return;
  }
  myItchGames.forEach((game) => {
    const card = document.createElement("a");
    card.href = game.link;
    card.target = "_blank";
    card.className = "grid-card game-card";
    card.innerHTML = `<img src="${game.thumbnail}" alt="${game.title}"><p>${game.title}</p>`;
    gamesGrid.appendChild(card);
  });
  isGamesLoaded = true;
}

// --- API do YouTube Otimizada ---
async function fetchPlaylists() {
  try {
    playlistsGrid.innerHTML =
      "<p class='loading-text'>Loading playlists...</p>";

    let url = `https://www.googleapis.com/youtube/v3/playlists?part=snippet&channelId=${CHANNEL_ID}&maxResults=20&key=${API_KEY}`;
    let res = await fetch(url);
    let data = await res.json();
    let items = data.items || [];

    if (items.length === 0) {
      url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&order=date&type=video&maxResults=12&key=${API_KEY}`;
      res = await fetch(url);
      data = await res.json();
      items = data.items || [];
    }

    if (items.length === 0) {
      playlistsGrid.innerHTML = "<p>No content available right now.</p>";
      return;
    }

    playlistsGrid.innerHTML = "";
    items.forEach((item) => {
      const title = item.snippet.title;
      const isPlaylist =
        item.kind === "youtube#playlist" || (item.id && item.id.playlistId);
      const id = isPlaylist
        ? item.id.playlistId || item.id
        : item.id.videoId || item.id;

      const linkUrl = isPlaylist
        ? `https://www.youtube.com/playlist?list=${id}`
        : `https://www.youtube.com/watch?v=${id}`;

      const thumbnail =
        item.snippet.thumbnails.high?.url ||
        item.snippet.thumbnails.medium?.url ||
        item.snippet.thumbnails.default?.url;

      const card = document.createElement("a");
      card.href = linkUrl;
      card.target = "_blank";
      card.className = "grid-card playlist-card";
      card.innerHTML = `<img src="${thumbnail}" alt="${title}"><p>${title}</p>`;
      playlistsGrid.appendChild(card);
    });

    isPlaylistsLoaded = true;
  } catch (error) {
    console.error("Erro ao carregar conteúdo do YT:", error);
    playlistsGrid.innerHTML = "<p>Failed to load content.</p>";
  }
}

// --- Ecrã Inteiro ---
const fullscreenPage = document.getElementById("fullscreenPage");
const btnBackFullScreen = document.getElementById("btnBackFullScreen");
const fullscreenGrid = document.getElementById("fullscreenGrid");
const fullscreenTitle = document.getElementById("fullscreenTitle");

function openFullScreen(title, sourceGrid) {
  const leaves = [
    mainHeader,
    btnAboutElement,
    aboutSection,
    document.getElementById("btnGames"),
    document.getElementById("btnYoutube"),
    bottomButtonsGroup,
    gamesSection,
    youtubeSection,
  ].filter((el) => el && !el.classList.contains("hidden"));

  leaves.forEach((el, index) => {
    el.style.animationDelay = `${index * 0.1}s`;
    el.classList.add("leaf-fall");
  });

  fullscreenTitle.textContent = title;
  fullscreenGrid.innerHTML = sourceGrid.innerHTML;

  setTimeout(
    () => {
      mainContainer.classList.add("hidden");
      fullscreenPage.classList.remove("hidden");
      leaves.forEach((el) => {
        el.classList.remove("leaf-fall");
        el.style.animationDelay = "";
      });
    },
    leaves.length * 100 + 800,
  );
}

document
  .getElementById("btnFullScreenGames")
  .addEventListener("click", () => openFullScreen("My Games", gamesGrid));
document
  .getElementById("btnFullScreenYoutube")
  .addEventListener("click", () =>
    openFullScreen("My Playlists", playlistsGrid),
  );

btnBackFullScreen.addEventListener("click", () => {
  fullscreenPage.classList.add("hidden");
  mainContainer.classList.remove("hidden");
});

// --- Controlo de Música de Fundo (YouTube Iframe API) ---
let player;
let isPlaying = true;

const SOUND_ON_SVG = `<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>`;
const SOUND_OFF_SVG = `<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>`;

function onYouTubeIframeAPIReady() {
  player = new YT.Player("bgMusicPlayer", {
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  });
}

function onPlayerReady(event) {
  event.target.playVideo();
  const musicToggleBtn = document.getElementById("musicToggleBtn");
  const musicIcon = document.getElementById("musicIcon");

  musicToggleBtn.addEventListener("click", () => {
    if (!isPlaying) {
      player.playVideo();
      musicIcon.innerHTML = SOUND_ON_SVG;
      isPlaying = true;
    } else {
      player.pauseVideo();
      musicIcon.innerHTML = SOUND_OFF_SVG;
      isPlaying = false;
    }
  });
}

function onPlayerStateChange(event) {
  const musicIcon = document.getElementById("musicIcon");
  if (event.data === YT.PlayerState.PLAYING) {
    isPlaying = true;
    musicIcon.innerHTML = SOUND_ON_SVG;
  } else if (event.data === YT.PlayerState.PAUSED) {
    isPlaying = false;
    musicIcon.innerHTML = SOUND_OFF_SVG;
  }
}

// --- Efeito de Brilhos no Cursor ---
const canvas = document.getElementById("sparklesCanvas");
const ctx = canvas.getContext("2d");
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

window.addEventListener("mousemove", (e) => {
  for (let i = 0; i < 2; i++) {
    particles.push({
      x: e.clientX,
      y: e.clientY,
      size: Math.random() * 3 + 1.5,
      color: Math.random() > 0.5 ? "#ff85a2" : "#ffc2d1",
      vx: (Math.random() - 0.5) * 1.2,
      vy: Math.random() * 1.5 + 0.5,
      alpha: 1,
      decay: Math.random() * 0.02 + 0.015,
    });
  }
});

function animateSparkles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= p.decay;
    if (p.alpha <= 0) {
      particles.splice(i, 1);
      continue;
    }
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  requestAnimationFrame(animateSparkles);
}
animateSparkles();
