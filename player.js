(function () {
  const audio = document.getElementById("audioEl");
  const tracklistEl = document.getElementById("tracklist");
  const playBtn = document.getElementById("playBtn");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const scrub = document.getElementById("scrub");
  const volume = document.getElementById("volume");
  const curTimeEl = document.getElementById("curTime");
  const durTimeEl = document.getElementById("durTime");
  const npTitle = document.getElementById("npTitle");
  const npMeta = document.getElementById("npMeta");
  const badgeSpin = document.getElementById("badgeSpin");
  const castWrap = document.getElementById("castWrap");
  const castBtn = document.getElementById("castBtn");

  let currentIndex = -1;
  let isPlaying = false;

  // ---------- Google Cast ----------
  let remotePlayer = null;
  let remotePlayerController = null;
  let isCasting = false;

  function getAbsoluteUrl(path) {
    return new URL(path, window.location.href).href;
  }

  function castCurrentTrack(autoplay) {
    if (currentIndex === -1 || !window.cast || !cast.framework) return;
    const session = cast.framework.CastContext.getInstance().getCurrentSession();
    if (!session) return;
    const track = TRACKS[currentIndex];
    const mediaInfo = new chrome.cast.media.MediaInfo(getAbsoluteUrl(track.src), "audio/mpeg");
    mediaInfo.metadata = new chrome.cast.media.MusicTrackMediaMetadata();
    mediaInfo.metadata.title = track.title;
    mediaInfo.metadata.artist = `Fear of Beards — ${track.album || ""}`;
    const request = new chrome.cast.media.LoadRequest(mediaInfo);
    request.autoplay = autoplay !== false;
    session.loadMedia(request).catch(() => {});
  }

  function onCastConnectionChange() {
    isCasting = !!(remotePlayer && remotePlayer.isConnected);
    if (castBtn) castBtn.classList.toggle("casting", isCasting);
    if (isCasting) {
      audio.pause();
      if (currentIndex !== -1) castCurrentTrack(true);
    } else {
      updatePlayUI();
    }
  }

  function onRemoteTimeChange() {
    if (!isCasting || !remotePlayer) return;
    curTimeEl.textContent = fmtTime(remotePlayer.currentTime);
    scrub.value = remotePlayer.currentTime;
  }

  function onRemoteDurationChange() {
    if (!isCasting || !remotePlayer) return;
    scrub.max = remotePlayer.duration || 0;
    durTimeEl.textContent = fmtTime(remotePlayer.duration);
  }

  // Called by the Cast Sender SDK once it has loaded.
  window["__onGCastApiAvailable"] = function (isAvailable) {
    if (!isAvailable) return;
    // The `cast` framework namespace can attach a tick after this callback
    // fires — poll briefly instead of reading window.cast synchronously here.
    let attempts = 0;
    (function waitForFramework() {
      if (window.cast && cast.framework) {
        initCastFramework();
      } else if (attempts++ < 20) {
        setTimeout(waitForFramework, 100);
      }
    })();
  };

  function initCastFramework() {
    if (!window.cast || !cast.framework) return;

    cast.framework.CastContext.getInstance().setOptions({
      receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
      autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
    });

    remotePlayer = new cast.framework.RemotePlayer();
    remotePlayerController = new cast.framework.RemotePlayerController(remotePlayer);

    remotePlayerController.addEventListener(
      cast.framework.RemotePlayerEventType.IS_CONNECTED_CHANGED,
      onCastConnectionChange
    );
    remotePlayerController.addEventListener(
      cast.framework.RemotePlayerEventType.PLAYER_STATE_CHANGED,
      onCastPlayerStateChanged
    );
    remotePlayerController.addEventListener(
      cast.framework.RemotePlayerEventType.CURRENT_TIME_CHANGED,
      onRemoteTimeChange
    );
    remotePlayerController.addEventListener(
      cast.framework.RemotePlayerEventType.DURATION_CHANGED,
      onRemoteDurationChange
    );

    if (castWrap) castWrap.hidden = false;
  }

  // When casting, the local <audio> "ended" event never fires (nothing is
  // playing locally), so auto-advance has to be driven by the remote
  // player's own state instead. A track finishing shows up as the remote
  // player going IDLE with idleReason FINISHED.
  let castAdvancing = false;

  function onCastPlayerStateChanged() {
    updatePlayUI();
    if (!isCasting || currentIndex === -1 || !remotePlayer) return;

    if (remotePlayer.playerState === chrome.cast.media.PlayerState.PLAYING) {
      castAdvancing = false;
      return;
    }

    if (remotePlayer.playerState === chrome.cast.media.PlayerState.IDLE && !castAdvancing) {
      const session = cast.framework.CastContext.getInstance().getCurrentSession();
      const media = session && session.getMediaSession();
      if (media && media.idleReason === chrome.cast.media.IdleReason.FINISHED) {
        castAdvancing = true;
        if (currentIndex < TRACKS.length - 1) {
          loadTrack(currentIndex + 1, true);
        }
      }
    }
  }

  // ---------- Local player ----------
  function fmtTime(sec) {
    if (!isFinite(sec) || sec < 0) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  // ---------- Track play counts ----------
  function trackId(track) {
    return track.src.split("/").pop();
  }

  function renderPlayCounts(counts) {
    if (!counts) return;
    document.querySelectorAll("[data-plays-for]").forEach((el) => {
      const id = el.dataset.playsFor;
      const n = counts[id];
      if (typeof n === "number") {
        el.textContent = `${n} ${n === 1 ? "play" : "plays"}`;
        el.hidden = false;
      }
    });
  }

  function loadPlayCounts() {
    fetch("/api/plays", { headers: { Accept: "application/json" } })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => renderPlayCounts(data && data.counts))
      .catch(() => {
        // endpoint missing / KV not bound — leave the placeholders hidden
      });
  }

  function registerPlay(track) {
    fetch("/api/plays", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ track: trackId(track) }),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => renderPlayCounts(data && data.counts))
      .catch(() => {
        // silently ignore — a missed play count isn't worth surfacing an error
      });
  }

  function renderTracklist() {
    tracklistEl.innerHTML = "";
    let lastAlbum = null;
    let albumPosition = 0;
    TRACKS.forEach((track, i) => {
      if (track.album !== lastAlbum) {
        lastAlbum = track.album;
        albumPosition = 0;
        const meta = (typeof ALBUMS !== "undefined" && ALBUMS[track.album]) || {};
        const divider = document.createElement("li");
        divider.className = "album-divider";
        divider.innerHTML = `
          ${meta.cover ? `<img class="album-divider-cover" src="${meta.cover}" alt="">` : ""}
          <span class="album-divider-text">
            <span class="album-divider-name">${track.album}</span>
            <span class="album-divider-year">${meta.year || ""}</span>
          </span>
        `;
        tracklistEl.appendChild(divider);
      }
      albumPosition++;
      const li = document.createElement("li");
      li.className = "track-row";
      li.dataset.index = i;
      li.innerHTML = `
        <span class="track-index">${String(albumPosition).padStart(2, "0")}</span>
        <span class="track-main">
          <span class="track-title">${track.title}</span>${track.note ? `<br><span class="track-note">${track.note}</span>` : ""}
          <span class="track-plays" data-plays-for="${trackId(track)}" hidden>— plays</span>
        </span>
        <span class="track-dur" data-dur="${i}">--:--</span>
        <a class="track-dl" href="${track.src}" download title="Download ${track.title}">Download</a>
      `;
      li.addEventListener("click", (e) => {
        if (e.target.closest(".track-dl")) return; // let download link behave normally
        loadTrack(i, true);
      });
      tracklistEl.appendChild(li);
    });
    preloadDurations();
    loadPlayCounts();
  }

  function preloadDurations() {
    TRACKS.forEach((track, i) => {
      const probe = new Audio();
      probe.preload = "metadata";
      probe.src = track.src;
      probe.addEventListener("loadedmetadata", () => {
        const el = tracklistEl.querySelector(`[data-dur="${i}"]`);
        if (el) el.textContent = fmtTime(probe.duration);
      });
      probe.addEventListener("error", () => {
        const el = tracklistEl.querySelector(`[data-dur="${i}"]`);
        if (el) el.textContent = "—";
      });
    });
  }

  function setActiveRow(index) {
    tracklistEl.querySelectorAll(".track-row").forEach((row) => {
      row.classList.toggle("active", Number(row.dataset.index) === index);
    });
  }

  function loadTrack(index, autoplay) {
    if (index < 0 || index >= TRACKS.length) return;
    currentIndex = index;
    castAdvancing = false;
    const track = TRACKS[index];
    const meta = (typeof ALBUMS !== "undefined" && ALBUMS[track.album]) || {};
    npTitle.textContent = track.title;
    npMeta.textContent = meta.year ? `${track.album} · ${meta.year}` : track.album || "";
    setActiveRow(index);
    if (autoplay) registerPlay(track);
    scrub.value = 0;
    curTimeEl.textContent = "0:00";
    durTimeEl.textContent = "0:00";
    if (isCasting) {
      castCurrentTrack(autoplay !== false);
    } else {
      audio.src = track.src;
      if (autoplay) {
        audio.play().catch(() => {});
      }
    }
  }

  function togglePlay() {
    if (isCasting && remotePlayerController) {
      remotePlayerController.playOrPause();
      return;
    }
    if (currentIndex === -1) {
      loadTrack(0, true);
      return;
    }
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }

  function updatePlayUI() {
    if (isCasting && remotePlayer) {
      isPlaying = remotePlayer.playerState === chrome.cast.media.PlayerState.PLAYING;
    } else {
      isPlaying = !audio.paused && !audio.ended;
    }
    playBtn.textContent = isPlaying ? "⏸" : "▶";
    playBtn.setAttribute("aria-label", isPlaying ? "Pause" : "Play");
    badgeSpin.classList.toggle("spinning", isPlaying);
  }

  playBtn.addEventListener("click", togglePlay);

  prevBtn.addEventListener("click", () => {
    if (currentIndex <= 0) return;
    loadTrack(currentIndex - 1, true);
  });

  nextBtn.addEventListener("click", () => {
    if (currentIndex === -1 || currentIndex >= TRACKS.length - 1) return;
    loadTrack(currentIndex + 1, true);
  });

  audio.addEventListener("play", updatePlayUI);
  audio.addEventListener("pause", updatePlayUI);
  audio.addEventListener("ended", () => {
    if (isCasting) return;
    if (currentIndex < TRACKS.length - 1) {
      loadTrack(currentIndex + 1, true);
    } else {
      updatePlayUI();
    }
  });

  audio.addEventListener("loadedmetadata", () => {
    if (isCasting) return;
    scrub.max = audio.duration || 0;
    durTimeEl.textContent = fmtTime(audio.duration);
  });

  audio.addEventListener("timeupdate", () => {
    if (isCasting) return;
    scrub.value = audio.currentTime;
    curTimeEl.textContent = fmtTime(audio.currentTime);
  });

  scrub.addEventListener("input", () => {
    if (isCasting && remotePlayer && remotePlayerController) {
      remotePlayer.currentTime = Number(scrub.value);
      remotePlayerController.seek();
    } else {
      audio.currentTime = Number(scrub.value);
    }
  });

  volume.addEventListener("input", () => {
    const v = Number(volume.value);
    if (isCasting && remotePlayer && remotePlayerController) {
      remotePlayer.volumeLevel = v;
      remotePlayerController.setVolumeLevel();
    } else {
      audio.volume = v;
    }
  });
  audio.volume = Number(volume.value);

  renderTracklist();
})();
