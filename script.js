const CHANNEL_ID = "UC-v1yLlsG3A-4eC1J106_rA";

const btnAbout = document.getElementById("btnAbout");
const aboutSection = document.getElementById("aboutSection");

btnAbout.addEventListener("click", () => {
  aboutSection.classList.toggle("hidden");
});

const btnContact = document.getElementById("btnContact");
const contactSection = document.getElementById("contactSection");

btnContact.addEventListener("click", () => {
  contactSection.classList.toggle("hidden");
});

const btnYoutube = document.getElementById("btnYoutube");
const btnBackYoutube = document.getElementById("btnBackYoutube");
const youtubeSection = document.getElementById("youtubeSection");
const playlistsGrid = document.getElementById("playlistsGrid");
const mainContainer = document.getElementById("mainContainer");
const bottomButtonsGroup = document.getElementById("bottomButtonsGroup");
const btnAboutElement = document.getElementById("btnAbout");
const mainHeader = document.querySelector(".main-header");
const youtubeHeader = document.querySelector(".youtube-header");

let isPlaylistsLoaded = false;

btnYoutube.addEventListener("click", () => {
  const isOpening = youtubeSection.classList.contains("hidden");

  if (isOpening) {
    youtubeSection.classList.remove("hidden");
    if (!isPlaylistsLoaded) {
      fetchPlaylists();
    }
  } else {
    youtubeSection.classList.add("hidden");
  }
});

btnBackYoutube.addEventListener("click", () => {
  youtubeSection.classList.add("hidden");
});

// --- "View in full screen" transition: other buttons fall like leaves, then the new page opens ---

const btnFullScreen = document.getElementById("btnFullScreen");
const fullscreenPage = document.getElementById("fullscreenPage");
const fullscreenPlaylistsGrid = document.getElementById(
  "fullscreenPlaylistsGrid",
);
const btnBackFullScreen = document.getElementById("btnBackFullScreen");

function getLeafElements() {
  return [
    mainHeader,
    btnAboutElement,
    aboutSection,
    youtubeHeader,
    bottomButtonsGroup,
  ].filter((el) => el && !el.classList.contains("hidden"));
}

btnFullScreen.addEventListener("click", () => {
  const leaves = getLeafElements();

  leaves.forEach((el, index) => {
    el.style.animationDelay = `${index * 0.12}s`;
    el.classList.add("leaf-fall");
  });

  fullscreenPlaylistsGrid.innerHTML = playlistsGrid.innerHTML;

  const totalDelay = leaves.length * 120 + 950;

  setTimeout(() => {
    mainContainer.classList.add("hidden");
    fullscreenPage.classList.remove("hidden");

    leaves.forEach((el) => {
      el.classList.remove("leaf-fall");
      el.style.animationDelay = "";
    });
  }, totalDelay);
});

btnBackFullScreen.addEventListener("click", () => {
  fullscreenPage.classList.add("hidden");
  mainContainer.classList.remove("hidden");
});

async function fetchPlaylists() {
  try {
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`;

    const res = await fetch(proxyUrl);
    const data = await res.json();

    if (!data.contents) {
      playlistsGrid.innerHTML = "<p>No content found.</p>";
      return;
    }

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data.contents, "text/xml");
    const entries = xmlDoc.querySelectorAll("entry");

    if (entries.length === 0) {
      playlistsGrid.innerHTML = "<p>No videos found.</p>";
      return;
    }

    playlistsGrid.innerHTML = "";

    entries.forEach((entry) => {
      const title = entry.querySelector("title").textContent;
      const videoId = entry.querySelector("yt\\:videoId, videoId").textContent;
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

      const card = document.createElement("a");
      card.href = videoUrl;
      card.target = "_blank";
      card.className = "playlist-card";
      card.innerHTML = `
        <img src="${thumbnail}" alt="${title}">
        <p>${title}</p>
      `;

      playlistsGrid.appendChild(card);
    });

    isPlaylistsLoaded = true;
  } catch (error) {
    console.error("Erro ao carregar vídeos:", error);
    playlistsGrid.innerHTML = "<p>Failed to load content.</p>";
  }
}

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
