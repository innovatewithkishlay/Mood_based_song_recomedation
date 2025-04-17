const YOUTUBE_API_KEY = "AIzaSyAnXdZ6GALkQmAalXcWBC3ixwQV2WC6XP8";

let currentSongs = [];
let latestSongs = [];
let currentIndex = 0;
let isPlaying = false;
let youtubePlayer;
let progressInterval;
let isPlayerReady = false;
let currentlyPlayingId = null;

function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

function updateProgress() {
  if (youtubePlayer && youtubePlayer.getCurrentTime) {
    try {
      const currentTime = youtubePlayer.getCurrentTime();
      const duration = youtubePlayer.getDuration();
      document.getElementById("current-time").textContent =
        formatTime(currentTime);
      document.getElementById("duration").textContent = formatTime(duration);
      const progressPercent = (currentTime / duration) * 100;
      document.getElementById("progress").style.width = `${progressPercent}%`;
    } catch (e) {
      console.error("Error updating progress:", e);
    }
  }
}

function handleProgressClick(e) {
  if (!youtubePlayer || !isPlayerReady) return;

  const progressBar = document.getElementById("progress-bar");
  const clickPosition = e.clientX - progressBar.getBoundingClientRect().left;
  const progressBarWidth = progressBar.clientWidth;
  const clickPercentage = clickPosition / progressBarWidth;

  const duration = youtubePlayer.getDuration();
  youtubePlayer.seekTo(duration * clickPercentage, true);
}

const tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function onYouTubeIframeAPIReady() {
  youtubePlayer = new YT.Player("youtube-player", {
    height: "0",
    width: "0",
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  });
}

function onPlayerReady(event) {
  console.log("YouTube player is ready");
  isPlayerReady = true;
  loadInitialData();
  loadLatestSongs();
}

function onPlayerStateChange(event) {
  switch (event.data) {
    case YT.PlayerState.ENDED:
      playNextSong();
      break;
    case YT.PlayerState.PLAYING:
      isPlaying = true;
      document.getElementById("play-pause-btn").textContent = "⏸";
      startProgressUpdate();
      break;
    case YT.PlayerState.PAUSED:
      isPlaying = false;
      document.getElementById("play-pause-btn").textContent = "▶";
      stopProgressUpdate();
      break;
  }
}

function startProgressUpdate() {
  stopProgressUpdate();
  progressInterval = setInterval(updateProgress, 1000);
}

function stopProgressUpdate() {
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
}

async function loadInitialData() {
  try {
    await searchSongs("New Hindi Song latest", false);
  } catch (error) {
    console.error("Failed to load initial data:", error);
    document.getElementById("results-grid").innerHTML =
      "<p>Could not load songs. Please try searching manually.</p>";
  }
}

async function loadLatestSongs() {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?` +
        `part=snippet&` +
        `maxResults=10&` +
        `q=latest hindi songs&` +
        `type=video&` +
        `videoCategoryId=10&` +
        `key=${YOUTUBE_API_KEY}`
    );

    const data = await response.json();

    latestSongs = data.items.map((item) => ({
      id: item.id.videoId,
      title: cleanTitle(item.snippet.title),
      artist: item.snippet.channelTitle,
      thumbnail:
        item.snippet.thumbnails?.high?.url ||
        item.snippet.thumbnails?.default?.url ||
        "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));

    displayLatestSongs();
  } catch (error) {
    console.error("Error loading latest songs:", error);
  }
}

function displayLatestSongs() {
  const latestSongsContainer = document.getElementById("latest-songs");
  latestSongsContainer.innerHTML = "";

  latestSongs.forEach((song) => {
    const songElement = document.createElement("div");
    songElement.className = "sidebar-song";
    if (song.id === currentlyPlayingId) {
      songElement.classList.add("active");
    }
    songElement.innerHTML = `
              <img src="${song.thumbnail}" alt="${song.title}">
              <div class="sidebar-song-info">
                  <div class="sidebar-song-title">${song.title}</div>
                  <div class="sidebar-song-artist">${song.artist}</div>
              </div>
          `;

    songElement.addEventListener("click", () => playSidebarSong(song));
    latestSongsContainer.appendChild(songElement);
  });
}

function playSidebarSong(song) {
  document.getElementById("player-title").textContent = song.title;
  document.getElementById("player-artist").textContent = song.artist;
  document.getElementById("player-album-art").src = song.thumbnail;

  document.querySelectorAll(".sidebar-song").forEach((el) => {
    el.classList.remove("active");
  });
  event.currentTarget.classList.add("active");

  document.querySelectorAll(".song-card").forEach((el) => {
    el.classList.remove("current-song");
  });

  currentlyPlayingId = song.id;

  if (isPlayerReady) {
    youtubePlayer.loadVideoById(song.id);
    youtubePlayer.playVideo();
  }
}

async function searchSongs(query, autoPlayFirst = false) {
  if (!query) return;

  document.querySelector(".loading").style.display = "block";
  document.getElementById("results-grid").innerHTML = "";

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?` +
        `part=snippet&` +
        `maxResults=20&` +
        `q=${encodeURIComponent(query)}&` +
        `type=video&` +
        `videoCategoryId=10&` +
        `key=${YOUTUBE_API_KEY}`
    );

    const data = await response.json();

    currentSongs = data.items.map((item) => ({
      id: item.id.videoId,
      title: cleanTitle(item.snippet.title),
      artist: item.snippet.channelTitle,
      thumbnail:
        item.snippet.thumbnails?.high?.url ||
        item.snippet.thumbnails?.default?.url ||
        "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));

    displayResults(currentSongs);

    if (autoPlayFirst && currentSongs.length > 0) {
      playSong(0);
    }
  } catch (error) {
    console.error("Search error:", error);
  } finally {
    document.querySelector(".loading").style.display = "none";
  }
}

async function fetchMoodSongs(mood) {
  document.querySelector(".loading").style.display = "block";
  document.getElementById("results-grid").innerHTML = "";

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?` +
        `part=snippet&` +
        `maxResults=20&` +
        `q=${encodeURIComponent(mood + " songs")}&` +
        `type=video&` +
        `videoCategoryId=10&` +
        `key=${YOUTUBE_API_KEY}`
    );

    const data = await response.json();

    currentSongs = data.items.map((item) => ({
      id: item.id.videoId,
      title: cleanTitle(item.snippet.title),
      artist: item.snippet.channelTitle,
      thumbnail:
        item.snippet.thumbnails?.high?.url ||
        item.snippet.thumbnails?.default?.url ||
        "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));

    displayResults(currentSongs);
  } catch (error) {
    console.error("Error fetching mood songs:", error);
    document.getElementById("results-grid").innerHTML =
      "<p>Could not load songs. Please try again later.</p>";
  } finally {
    document.querySelector(".loading").style.display = "none";
  }
}

function cleanTitle(title) {
  return title
    .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
    .replace(
      /official video|official music video|lyrics?|hd|4k|1080p|720p|\[.*?\]|\(.*?\)/gi,
      ""
    )
    .trim();
}

function displayResults(songs) {
  const resultsGrid = document.getElementById("results-grid");
  resultsGrid.innerHTML = "";

  songs.forEach((song, index) => {
    const card = document.createElement("div");
    card.className = `song-card ${
      song.id === currentlyPlayingId ? "current-song" : ""
    }`;
    card.innerHTML = `
      <img src="${song.thumbnail}" alt="${song.title}" class="song-thumbnail">
      <div class="song-info">
        <h3 class="song-title">${song.title}</h3>
        <p class="song-artist">${song.artist}</p>
      </div>
    `;

    // Make the entire card clickable
    card.addEventListener("click", () => playSong(index));
    resultsGrid.appendChild(card);
  });
}

function playSong(index) {
  if (index < 0 || index >= currentSongs.length) return;

  const song = currentSongs[index];
  currentlyPlayingId = song.id;

  document.getElementById("player-title").textContent = song.title;
  document.getElementById("player-artist").textContent = song.artist;
  document.getElementById("player-album-art").src = song.thumbnail;

  document.querySelectorAll(".song-card").forEach((el) => {
    el.classList.remove("current-song");
  });
  document.querySelectorAll(".song-card")[index].classList.add("current-song");

  document.querySelectorAll(".sidebar-song").forEach((el) => {
    el.classList.remove("active");
  });

  if (isPlayerReady) {
    youtubePlayer.loadVideoById(song.id);
    youtubePlayer.playVideo();
  }
}

function togglePlayPause() {
  if (!isPlayerReady) return;

  if (isPlaying) {
    youtubePlayer.pauseVideo();
  } else {
    youtubePlayer.playVideo();
  }
}

function playNextSong() {
  if (currentSongs.length === 0) return;
  const newIndex = (currentIndex + 1) % currentSongs.length;
  playSong(newIndex);
}

function playPrevSong() {
  if (currentSongs.length === 0) return;
  const newIndex =
    (currentIndex - 1 + currentSongs.length) % currentSongs.length;
  playSong(newIndex);
}

function init() {
  document
    .getElementById("search-input")
    .addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        const query = this.value.trim();
        if (query) searchSongs(query);
      }
    });

  document
    .getElementById("progress-bar")
    .addEventListener("click", handleProgressClick);
  document
    .getElementById("play-pause-btn")
    .addEventListener("click", togglePlayPause);
  document.getElementById("prev-btn").addEventListener("click", playPrevSong);
  document.getElementById("next-btn").addEventListener("click", playNextSong);

  // Initialize mood buttons
  const moodButtons = document.querySelectorAll(".mood-btn");
  moodButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const mood = button.getAttribute("data-mood");
      fetchMoodSongs(mood); // Fetch songs based on the selected mood
    });
  });

  const moodCards = document.querySelectorAll(".mood-card");
  moodCards.forEach((card) => {
    card.addEventListener("click", () => {
      const mood = card.getAttribute("data-mood");
      fetchMoodSongs(mood);
    });
  });
}

window.onload = init;
