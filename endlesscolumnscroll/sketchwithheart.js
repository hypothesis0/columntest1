let soundEnabled = false;  // Flag to track if sound is enabled

document.addEventListener("DOMContentLoaded", () => {
  // Modal close logic
  const modal = document.getElementById("soundModal");
  const enableSoundBtn = document.getElementById("enableSoundBtn");

  enableSoundBtn.addEventListener("click", () => {
    soundEnabled = true;  // Enable sound
    modal.style.display = "none";  // Hide modal
  });

  // Existing scroll listener (modified to check soundEnabled flag)
  window.addEventListener("scroll", debounce(() => {
    if (soundEnabled) {  // Play sound only after user clicks
      const randomX = Math.random() * window.innerWidth;
      const randomY = Math.random() * window.innerHeight;
      createHeartFirework(randomX, randomY);
    }
  }, 200));
});

// Updated playSound function
function playSound(soundFile) {
  if (soundEnabled) {
    const audio = new Audio(soundFile);
    audio.play().catch(error => console.error("Error playing sound:", error));
  }
}


document.addEventListener("DOMContentLoaded", () => {
  addImage();
  addImageTop();
  adjustHeartsToColumnHeight();
  updatePageHeightDisplay();

  // Preload sound files
  const sounds = loadSounds();

  setInterval(() => {
    adjustHeartsToColumnHeight();
    updatePageHeightDisplay();
  }, 1000);

  window.addEventListener("scroll", debounce(() => {
    // Trigger a firework at a random location on each scroll (one per scroll)
    const randomX = Math.random() * window.innerWidth;
    const randomY = Math.random() * window.innerHeight;
    createHeartFirework(randomX, randomY, sounds);

    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
      addImage();
    } else if (window.scrollY === 0) {
      addImageTop();
    }
  }, 200)); // Adjust debounce delay as needed (200ms here)
});

// Function to create heart fireworks at a random location
function createHeartFirework(x, y, sounds) {
  const numberOfHearts = 200;  // Number of hearts in the firework

  for (let i = 0; i < numberOfHearts; i++) {
    emitHeart(x, y, sounds);
  }
}

// Emit a single heart with explosion effect
function emitHeart(x, y, sounds) {
  const heart = document.createElement("div");
  heart.textContent = getRandomHeart();
  heart.classList.add("dynamic-heart");
  heart.style.position = "fixed";
  heart.style.left = `${x}px`;
  heart.style.top = `${y}px`;
  heart.style.fontSize = "12px"; // Constant size for all hearts

  document.body.appendChild(heart);

  // Calculate random direction and speed for explosion effect
  const angle = Math.random() * 2 * Math.PI;
  const speed = Math.random() * 4 + 1;  // Slower speed for explosion

  const velocityX = Math.cos(angle) * speed;
  const velocityY = Math.sin(angle) * speed;

  let posX = x;
  let posY = y;
  let opacity = 1;

  // Randomly pick and play sound
  const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
  playSound(randomSound);

  // Animate heart with slower explosion and fade out
  function animateHeart() {
    posX += velocityX;
    posY += velocityY;
  
    opacity -= 0.005;  // Slower fade-out (reduce this value for a longer fade)
  
    heart.style.left = `${posX}px`;
    heart.style.top = `${posY}px`;
    heart.style.opacity = opacity;
  
    if (opacity <= 0) {
      heart.remove(); // Remove heart when it fades out completely
    } else {
      requestAnimationFrame(animateHeart);
    }
  }

  animateHeart();
}

// Reuse existing heart emojis
function getRandomHeart() {
  const heartEmojis = ["💚", "💛", "💙", "🧡", "🤍", "❤️", "💖", "💜"];
  return heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
}

// Load and preload sound files
function loadSounds() {
  const soundFiles = [
 
    "sound/explosion1.wav", 
    "sound/explosion2.wav", 
    "sound/explosion3.wav", 
    "sound/explosion4.wav", 
    "sound/explosion5.wav",
    "sound/explosion6.wav", 
   
    "sound/explosion10.wav"
  ];

  // Preload sounds
  return soundFiles.map(file => {
    const audio = new Audio(file);
    return audio;
  });
}

// Play a preloaded sound
function playSound(audio) {
  audio.currentTime = 0;  // Reset audio to the start for multiple plays
  audio.play().catch(e => console.error("Sound play error:", e));
}

// Existing functions (unchanged)
function addImage() {
  const image = document.createElement("img");
  image.onload = function () {
    adjustHeartsToColumnHeight();
    updatePageHeightDisplay();
  };
  image.src = "img/column3.jpg";
  image.classList.add("dynamic-image");
  document.body.appendChild(image);
}

function addImageTop() {
  const image = document.createElement("img");
  image.onload = function () {
    const imageHeight = this.height;
    window.scrollTo(0, window.scrollY + imageHeight);
    adjustHeartsToColumnHeight();
    updatePageHeightDisplay();
  };
  image.src = "img/column3.jpg";
  image.classList.add("dynamic-image");
  document.body.insertBefore(image, document.body.firstChild);
}

function adjustHeartsToColumnHeight() {
  const targetHearts = calculateHearts();
  const existingHearts = document.querySelectorAll(".dynamic-heart").length;
  const difference = targetHearts - existingHearts;

  if (difference > 0) {
    for (let i = 0; i < difference; i++) {
      addHeart();
    }
  }
}

function addHeart() {
  const heart = document.createElement("div");
  heart.textContent = getRandomHeart();
  heart.style.position = "fixed";
  heart.style.left = `${Math.random() * window.innerWidth}px`;
  heart.style.top = `${Math.random() * window.innerHeight}px`;
  heart.classList.add("dynamic-heart");
  document.body.appendChild(heart);
}

function calculateHearts() {
  const pixels = document.documentElement.scrollHeight;
  return Math.floor((pixels / 96) * 0.54);
}

function updatePageHeightDisplay() {
  const pixels = document.documentElement.scrollHeight;
  const centimeters = (pixels / 96) * 2.54;
  document.getElementById("pageHeightDisplay").textContent = `Column height: ${centimeters.toFixed(2)} cm`;
}

// Debounce function to limit the number of scroll events
function debounce(func, delay) {
  let debounceTimer;
  return function () {
    const context = this;
    const args = arguments;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => func.apply(context, args), delay);
  };
}



