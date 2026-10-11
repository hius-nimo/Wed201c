let currentActivePic = null;
let currentLightboxIndex = 0;
let galleryImages = [];
let soundEnabled = true;
let slideshowInterval = null;
let audioCtx = null;

function initializeApp() {
  galleryImages = document.querySelectorAll(".gallery img");
  addTabAttributes();

  const themeToggleBtn = document.getElementById("theme-toggle");
  themeToggleBtn.addEventListener("click", toggleTheme);

  const soundToggleBtn = document.getElementById("sound-toggle");
  soundToggleBtn.addEventListener("click", toggleSound);

  document.addEventListener("keydown", handleKeyboardNavigation);
}

function addTabAttributes() {
  galleryImages.forEach((img, index) => {
    img.setAttribute("tabindex", "0");
    img.addEventListener("focus", () => upDate(img));
    img.addEventListener("blur", () => unDo());
  });
}

function upDate(previewPic) {
  playSound("hover");

  let imageDiv = document.getElementById("image");
  let heroTitle = document.querySelector(".hero-title");

  imageDiv.style.backgroundImage = `url('${previewPic.src}')`;

  let parentCard = previewPic.closest(".preview");
  let captionText = parentCard
    ? parentCard.getAttribute("data-title")
    : previewPic.alt;

  heroTitle.textContent = captionText;
  currentActivePic = previewPic;
}

function unDo() {
  let imageDiv = document.getElementById("image");
  let heroTitle = document.querySelector(".hero-title");

  imageDiv.style.backgroundImage = "none";
  heroTitle.textContent =
    "Rà chuột hoặc nhấn phím Tab vào ảnh bên dưới để khám phá chi tiết";
  currentActivePic = null;
}

function filterCategory(category) {
  playSound("click");

  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.remove("active");
    if (btn.getAttribute("data-filter") === category) {
      btn.classList.add("active");
    }
  });

  const items = document.querySelectorAll(".gallery .preview");
  items.forEach((item) => {
    const itemCat = item.getAttribute("data-category");
    if (category === "all" || itemCat === category) {
      item.style.display = "block";
      item.style.animation = "fadeIn 0.5s ease";
    } else {
      item.style.display = "none";
    }
  });
}

function filterGallery() {
  const query = document
    .getElementById("searchInput")
    .value.toLowerCase()
    .trim();
  const items = document.querySelectorAll(".gallery .preview");

  items.forEach((item) => {
    const title = item.getAttribute("data-title").toLowerCase();
    const altText = item.querySelector("img").alt.toLowerCase();

    if (title.includes(query) || altText.includes(query)) {
      item.style.display = "block";
    } else {
      item.style.display = "none";
    }
  });
}

function resetSearch() {
  document.getElementById("searchInput").value = "";
  filterGallery();
}

function setViewMode(mode) {
  playSound("click");
  const galleryGrid = document.getElementById("galleryGrid");
  const modeButtons = document.querySelectorAll(".mode-btn");

  modeButtons.forEach((btn) => btn.classList.remove("active"));
  event.currentTarget.classList.add("active");

  if (mode === "compact") {
    galleryGrid.classList.add("compact-mode");
  } else {
    galleryGrid.classList.remove("compact-mode");
  }
}

function openLightbox(imgElement) {
  playSound("click");
  const modal = document.getElementById("lightboxModal");
  const modalImg = document.getElementById("lightboxImg");
  const caption = document.getElementById("lightboxCaption");

  currentLightboxIndex = Array.from(galleryImages).indexOf(imgElement);

  modal.classList.add("active");
  modalImg.src = imgElement.src;

  let parentCard = imgElement.closest(".preview");
  caption.textContent = parentCard
    ? parentCard.getAttribute("data-title")
    : imgElement.alt;

  document.body.style.overflow = "hidden";
}

function openLightboxFromHero() {
  if (currentActivePic) {
    openLightbox(currentActivePic);
  } else {
    openLightbox(galleryImages[0]);
  }
}

function closeLightbox() {
  playSound("click");
  const modal = document.getElementById("lightboxModal");
  modal.classList.remove("active");
  document.body.style.overflow = "auto";
  stopSlideshow();
}

function changeLightboxImage(direction) {
  playSound("click");
  currentLightboxIndex += direction;

  if (currentLightboxIndex < 0) {
    currentLightboxIndex = galleryImages.length - 1;
  } else if (currentLightboxIndex >= galleryImages.length) {
    currentLightboxIndex = 0;
  }

  const targetImg = galleryImages[currentLightboxIndex];
  const modalImg = document.getElementById("lightboxImg");
  const caption = document.getElementById("lightboxCaption");

  modalImg.src = targetImg.src;
  let parentCard = targetImg.closest(".preview");
  caption.textContent = parentCard
    ? parentCard.getAttribute("data-title")
    : targetImg.alt;
}

function startSlideshow() {
  playSound("click");
  if (slideshowInterval) {
    stopSlideshow();
    return;
  }

  openLightbox(galleryImages[0]);

  slideshowInterval = setInterval(() => {
    changeLightboxImage(1);
  }, 3000);
}

function stopSlideshow() {
  if (slideshowInterval) {
    clearInterval(slideshowInterval);
    slideshowInterval = null;
  }
}

function toggleLike(button) {
  playSound("click");
  button.classList.toggle("liked");

  const icon = button.querySelector("i");
  if (button.classList.contains("liked")) {
    icon.classList.remove("fa-regular");
    icon.classList.add("fa-solid");
  } else {
    icon.classList.remove("fa-solid");
    icon.classList.add("fa-regular");
  }
}

function toggleFavoriteCurrent() {
  if (currentActivePic) {
    let parentCard = currentActivePic.closest(".preview");
    let likeBtn = parentCard.querySelector(".like-icon");
    if (likeBtn) toggleLike(likeBtn);
  }
}

function toggleTheme() {
  playSound("click");
  const htmlElement = document.documentElement;
  const currentTheme = htmlElement.getAttribute("data-theme");
  const themeIcon = document.querySelector("#theme-toggle i");

  if (currentTheme === "dark") {
    htmlElement.setAttribute("data-theme", "light");
    themeIcon.classList.remove("fa-moon");
    themeIcon.classList.add("fa-sun");
  } else {
    htmlElement.setAttribute("data-theme", "dark");
    themeIcon.classList.remove("fa-sun");
    themeIcon.classList.add("fa-moon");
  }
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  const soundIcon = document.querySelector("#sound-toggle i");

  if (soundEnabled) {
    soundIcon.classList.remove("fa-volume-xmark");
    soundIcon.classList.add("fa-volume-high");
  } else {
    soundIcon.classList.remove("fa-volume-high");
    soundIcon.classList.add("fa-volume-xmark");
  }
}

function playSound(type) {
  if (!soundEnabled) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (type === "hover") {
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.02, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } else if (type === "click") {
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    }
  } catch (e) {}
}

function showToast(message) {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<i class="fa-solid fa-circle-info" style="color: var(--accent-gold); margin-right: 8px;"></i> ${message}`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function handleKeyboardNavigation(event) {
  const modal = document.getElementById("lightboxModal");
  const isLightboxActive = modal.classList.contains("active");

  if (isLightboxActive) {
    if (event.key === "ArrowLeft") {
      changeLightboxImage(-1);
    } else if (event.key === "ArrowRight") {
      changeLightboxImage(1);
    } else if (event.key === "Escape") {
      closeLightbox();
    }
  }
}
