// Complete Mobile-optimized version of sketch.js
// Added touch support, mobile popup handling, and responsive features

// Detect if we're on a mobile device
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                 (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);

// Auto-scroll variables
let autoScrollEnabled = false;
let autoScrollInterval = null;
let lastUserScrollTime = 0;
const AUTO_SCROLL_DELAY = 3000; // 3 seconds of no user interaction before auto-scroll starts

// Initialize popup system after page load with better mobile load handling
window.addEventListener('load', function() {
  // Add styles
  addPopupStyles();

  // Set up observers with mobile-specific settings
  setupImageObserver();
  setupTextObserver();

  // Set up scroll handler for popup system with mobile optimization
  window.addEventListener('scroll', handlePopupScroll, { passive: true });

  // Store initial scroll position
  lastScrollPosition = window.scrollY;

  // Mobile-optimized: Wait longer for mobile devices to ensure content loads
  const initialDelay = isMobile ? 2500 : 1500;
  setTimeout(() => {
    const currentScrollY = window.scrollY;
    textPopups.forEach(item => {
      if (!shownTextPopups[item.id] && 
          currentScrollY > item.triggerPosition - 500 && 
          currentScrollY < item.triggerPosition + 1000) {
        
        if (currentTextPopup) {
          if (!missedTextPopups.includes(item)) {
            missedTextPopups.push(item);
          }
        } else {
          createTextPopup(item);
          shownTextPopups[item.id] = true;
        }
      }
    });
  }, initialDelay);
  
  // Mobile fullscreen detection
  setTimeout(function() {
    isInFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || 
                      document.mozFullScreenElement || document.msFullscreenElement);
    
    if (isInFullscreen) {
      console.log("Detected initial fullscreen state, triggering popup check");
      forceTriggerPopupsAtCurrentPosition();
    }
  }, 500);
  
  // Setup keyboard shortcuts for testing (desktop only)
  if (!isMobile) {
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        if (currentTextPopup) {
          closeTextPopup();
        }
      }
      
      if (event.key === 'r' || event.key === 'R') {
        resetAllPopups();
      }
    });
  }

  // Mobile-specific: Add touch event listeners for better interaction
  if (isMobile) {
    setupMobileTouchHandlers();
    setupAutoScroll();
  }
});

// Mobile-specific touch handlers
function setupMobileTouchHandlers() {
  let lastTouchY = 0;
  let touchStartTime = 0;

  document.addEventListener('touchstart', function(e) {
    lastTouchY = e.touches[0].clientY;
    touchStartTime = Date.now();
    
    // User interaction detected - stop auto scroll temporarily
    onUserInteraction();
  }, { passive: true });

  document.addEventListener('touchmove', function(e) {
    // Prevent default only when necessary to avoid scroll issues
    if (isScrollDisabled) {
      e.preventDefault();
    }
    
    // User interaction detected - stop auto scroll temporarily
    onUserInteraction();
  }, { passive: false });

  document.addEventListener('touchend', function(e) {
    const touchEndTime = Date.now();
    const touchDuration = touchEndTime - touchStartTime;
    
    // Handle quick taps for closing popups
    if (touchDuration < 200 && currentTextPopup) {
      const target = e.target;
      const overlay = target.closest('.text-popup-overlay');
      if (overlay && target === overlay) {
        closeTextPopup();
      }
    }
    
    // User interaction detected - stop auto scroll temporarily
    onUserInteraction();
  }, { passive: true });
}

// Auto-scroll setup for mobile
function setupAutoScroll() {
  // Listen for scroll events to detect user interaction
  window.addEventListener('scroll', function() {
    onUserInteraction();
  }, { passive: true });
  
  // Start auto-scroll after initial delay
  setTimeout(() => {
    startAutoScroll();
  }, AUTO_SCROLL_DELAY);
}

// Handle user interaction - temporarily stop auto scroll
function onUserInteraction() {
  lastUserScrollTime = Date.now();
  
  if (autoScrollEnabled) {
    stopAutoScroll();
    
    // Restart auto scroll after delay
    setTimeout(() => {
      const timeSinceLastInteraction = Date.now() - lastUserScrollTime;
      if (timeSinceLastInteraction >= AUTO_SCROLL_DELAY) {
        startAutoScroll();
      }
    }, AUTO_SCROLL_DELAY);
  }
}

// Start automatic scrolling with human-like speed
function startAutoScroll() {
  if (autoScrollInterval || isScrollDisabled) return;
  
  autoScrollEnabled = true;
  
  autoScrollInterval = setInterval(() => {
    // Check if user has interacted recently
    const timeSinceLastInteraction = Date.now() - lastUserScrollTime;
    if (timeSinceLastInteraction < AUTO_SCROLL_DELAY) {
      return; // Don't auto scroll if user interacted recently
    }
    
    // Don't auto scroll if popup is open
    if (currentTextPopup || isScrollDisabled) {
      return;
    }
    
    // Human-like scrolling speed: 1-3 pixels per frame, with some randomness
    const scrollSpeed = Math.random() * 2 + 1; // 1-3 pixels
    const currentScrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    
    // Stop auto scroll if we've reached the bottom
    if (currentScrollY >= maxScroll - 10) {
      stopAutoScroll();
      return;
    }
    
    // Scroll down smoothly
    window.scrollBy({
      top: scrollSpeed,
      behavior: 'auto' // Don't use 'smooth' for more natural feel
    });
    
    // Occasionally pause for more human-like behavior
    if (Math.random() < 0.02) { // 2% chance to pause
      setTimeout(() => {
        // Brief pause (100-500ms)
        const pauseDuration = Math.random() * 400 + 100;
        setTimeout(() => {
          // Continue scrolling after pause
        }, pauseDuration);
      }, 0);
    }
    
  }, 16); // ~60fps for smooth scrolling
}

// Stop automatic scrolling
function stopAutoScroll() {
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval);
    autoScrollInterval = null;
  }
  autoScrollEnabled = false;
}

// Function to reset all popups (mobile-optimized)
function resetAllPopups() {
  if (currentTextPopup) {
    closeTextPopup();
  }
  
  closeAllImagePopups();
  
  for (const id in shownTextPopups) {
    shownTextPopups[id] = false;
  }
  for (const id in shownImagePopups) {
    shownImagePopups[id] = false;
  }
  
  missedTextPopups = [];
  lastMilestone = 0;
  
  setTimeout(() => {
    const currentScrollY = window.scrollY;
    checkFastScrolling(currentScrollY);
  }, 100);
}

// Mobile-optimized reset button
function addResetButton() {
  const resetBtn = document.createElement("button");
  resetBtn.textContent = "Reset";
  resetBtn.style.position = "fixed";
  resetBtn.style.left = "10px";
  resetBtn.style.top = "10px";
  resetBtn.style.zIndex = "1001";
  
  // Mobile-optimized button styling
  if (isMobile) {
    resetBtn.style.padding = "12px 16px";
    resetBtn.style.fontSize = "16px";
    resetBtn.style.minHeight = "44px"; // iOS touch target minimum
    resetBtn.style.minWidth = "44px";
  } else {
    resetBtn.style.padding = "8px 12px";
    resetBtn.style.fontSize = "14px";
  }
  
  resetBtn.style.background = "white";
  resetBtn.style.border = "1px solid black";
  resetBtn.style.fontFamily = "'Times New Roman', Times, serif";
  resetBtn.style.cursor = "pointer";
  resetBtn.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";

  resetBtn.addEventListener("click", resetAllPopups);
  resetBtn.addEventListener("touchend", function(e) {
    e.preventDefault();
    resetAllPopups();
  });
  
  document.body.appendChild(resetBtn);
}

// Global constants with mobile adjustments
const SCROLL_THROTTLE = isMobile ? 150 : 100; // Longer throttle on mobile
let lastScrollCheck = 0;

// Mobile-optimized image observer setup
function setupImageObserver() {
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        
        if (shownImagePopups[img.id] || 
            (img.naturalWidth < 100 || img.naturalHeight < 100)) {
          return;
        }
        
        // On mobile, limit the number of simultaneous image popups
        const maxImagePopups = isMobile ? 2 : 5;
        if (Object.keys(openImagePopups).length >= maxImagePopups) {
          return;
        }
        
        createImagePopup(img);
        shownImagePopups[img.id] = true;
      }
    });
  }, {
    threshold: isMobile ? 0.3 : 0.4, // Lower threshold on mobile
    rootMargin: isMobile ? "100px" : "0px" // More margin on mobile
  });
  
  document.querySelectorAll('img').forEach(img => {
    if (img.width < 100 || img.height < 100) return;
    
    if (!img.id) {
      img.id = 'img-' + Math.random().toString(36).substr(2, 9);
    }
    
    imageObserver.observe(img);
  });
}

// Mobile-optimized text observer setup
function setupTextObserver() {
  const textObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        const popupInfo = textPopups.find(item => item.id === element.id);
        
        if (popupInfo && !shownTextPopups[popupInfo.id]) {
          if (currentTextPopup) {
            if (!missedTextPopups.includes(popupInfo)) {
              missedTextPopups.push(popupInfo);
            }
          } else {
            console.log("Intersection observer triggering popup:", popupInfo.id);
            createTextPopup(popupInfo);
            shownTextPopups[popupInfo.id] = true;
          }
        }
      }
    });
  }, {
    // Mobile-optimized thresholds
    threshold: isMobile ? 0.2 : (isInFullscreen ? 0.1 : 0.3),
    rootMargin: isMobile ? "200px 0px 200px 0px" : (isInFullscreen ? "300px 0px 300px 0px" : "0px 0px 0px 0px")
  });
  
  textPopups.forEach(item => {
    const element = document.getElementById(item.id);
    if (element) {
      textObserver.observe(item);
    }
  });
}

// Mobile-optimized fast scrolling check
function checkFastScrolling(currentScrollY) {
  const scrollSpeed = Math.abs(currentScrollY - lastScrollPosition);
  // More sensitive to fast scrolling on mobile
  const isFastScrolling = scrollSpeed > (isMobile ? 300 : 400);

  if (isFastScrolling && !currentTextPopup && !isScrollDisabled) {
    textPopups.forEach(item => {
      if (!shownTextPopups[item.id]) {
        const scrollDirection = currentScrollY > lastScrollPosition ? 'down' : 'up';
        const scrollRange = isMobile ? 150 : 100; // Larger range on mobile
        
        if (scrollDirection === 'down' && 
            lastScrollPosition < (item.triggerPosition - scrollRange) && 
            currentScrollY > (item.triggerPosition + scrollRange)) {
          
          if (currentTextPopup) {
            if (!missedTextPopups.includes(item)) {
              missedTextPopups.push(item);
            }
          } else {
            createTextPopup(item);
            shownTextPopups[item.id] = true;
          }
        }
      }
    });
  }

  lastScrollPosition = currentScrollY;
}

// Mobile-optimized scroll handler
function handlePopupScroll() {
  if (isScrollDisabled) return;

  const now = Date.now();
  const throttleTime = isMobile ? 150 : (isInFullscreen ? 50 : SCROLL_THROTTLE);

  if (now - lastScrollCheck < throttleTime) return;
  lastScrollCheck = now;

  const currentScrollY = window.scrollY;
  checkFastScrolling(currentScrollY);
  
  if (isInFullscreen && !currentTextPopup) {
    textPopups.forEach(item => {
      if (!shownTextPopups[item.id]) {
        const buffer = isMobile ? 400 : 300;
        if (currentScrollY > item.triggerPosition - buffer && 
            currentScrollY < item.triggerPosition + buffer) {
          createTextPopup(item);
          shownTextPopups[item.id] = true;
        }
      }
    });
  }
}

// Mobile-optimized image popup creation
function createImagePopup(imageElement) {
  if (!imageElement.id) {
    imageElement.id = 'img-' + Math.random().toString(36).substr(2, 9);
  }
  
  if (openImagePopups[imageElement.id]) return;
  
  if (imageElement.width < 100 || imageElement.height < 100) return;
  
  const imageSrc = imageElement.src;
  
  const originalStyles = {
    opacity: imageElement.style.opacity,
    visibility: imageElement.style.visibility,
    display: imageElement.style.display
  };
  
  imageElement.style.opacity = '0';
  imageElement.style.visibility = 'hidden';
  imageElement.style.pointerEvents = 'none';
  
  const tempImg = new Image();
  tempImg.src = imageSrc;
  
  const createPopup = () => {
    const imgWidth = tempImg.naturalWidth || imageElement.naturalWidth || 300;
    const imgHeight = tempImg.naturalHeight || imageElement.naturalHeight || 300;
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Mobile-specific sizing
    const maxWidthPercent = isMobile ? 0.8 : 0.3; // Larger on mobile
    const maxHeightPercent = isMobile ? 0.6 : 0.4; // Larger on mobile
    
    let popupWidth = imgWidth;
    let popupHeight = imgHeight;
    
    if (popupWidth > viewportWidth * maxWidthPercent) {
      const scale = (viewportWidth * maxWidthPercent) / popupWidth;
      popupWidth *= scale;
      popupHeight *= scale;
    }
    
    if (popupHeight > viewportHeight * maxHeightPercent) {
      const scale = (viewportHeight * maxHeightPercent) / popupHeight;
      popupWidth *= scale;
      popupHeight *= scale;
    }
    
    const popup = document.createElement('div');
    popup.className = 'image-popup';
    popup.id = `image-popup-${imageElement.id}`;
    popup.style.width = Math.round(popupWidth) + 'px';
    popup.style.height = Math.round(popupHeight) + 'px';
    popup.style.position = 'fixed';
    popup.style.background = 'white';
    popup.style.border = '1px solid black';
    popup.style.boxShadow = '0 0 15px rgba(0,0,0,0.3)';
    popup.style.zIndex = '998';
    popup.style.overflow = 'hidden';
    
    // Mobile-specific positioning
    if (isMobile) {
      popup.style.cursor = 'default';
      // Center on mobile for easier interaction
      popup.style.top = '50%';
      popup.style.left = '50%';
      popup.style.transform = 'translate(-50%, -50%)';
    } else {
      popup.style.cursor = 'move';
      // Use original positioning logic for desktop
      const positions = [
        { top: '20px', right: '20px' },
        { top: '20px', left: '20px' },
        { bottom: '20px', right: '20px' },
        { bottom: '20px', left: '20px' }
      ];
      
      const openPopupCount = Object.keys(openImagePopups).length;
      const position = positions[openPopupCount % positions.length];
      
      Object.keys(position).forEach(prop => {
        popup.style[prop] = position[prop];
      });
    }
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'popup-content';
    contentDiv.style.width = '100%';
    contentDiv.style.height = '100%';
    contentDiv.style.display = 'flex';
    contentDiv.style.alignItems = 'center';
    contentDiv.style.justifyContent = 'center';
    
    const img = document.createElement('img');
    img.src = imageSrc;
    img.alt = imageElement.alt || "Image";
    img.style.maxWidth = '100%';
    img.style.maxHeight = '100%';
    img.style.display = 'block';
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'popup-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '5px';
    closeBtn.style.right = '5px';
    closeBtn.style.background = 'none';
    closeBtn.style.border = 'none';
    closeBtn.style.color = '#000';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.zIndex = '10';
    
    // Mobile-optimized close button
    if (isMobile) {
      closeBtn.style.fontSize = '28px';
      closeBtn.style.padding = '10px';
      closeBtn.style.minHeight = '44px';
      closeBtn.style.minWidth = '44px';
    } else {
      closeBtn.style.fontSize = '24px';
    }
    
    contentDiv.appendChild(img);
    popup.appendChild(contentDiv);
    popup.appendChild(closeBtn);
    
    document.body.appendChild(popup);
    
    openImagePopups[imageElement.id] = {
      popup: popup,
      originalElement: imageElement,
      originalStyles: originalStyles
    };
    
    closeBtn.addEventListener('click', () => {
      closeImagePopup(imageElement.id);
    });
    
    // Mobile touch events for close button
    if (isMobile) {
      closeBtn.addEventListener('touchend', function(e) {
        e.preventDefault();
        closeImagePopup(imageElement.id);
      });
    }
    
    // Only make draggable on desktop
    if (!isMobile) {
      makeDraggable(popup);
    }
    
    return popup;
  };
  
  if (tempImg.complete) {
    return createPopup();
  } else {
    tempImg.onload = createPopup;
  }
}

// Desktop-only draggable functionality
function makeDraggable(element) {
  if (isMobile) return; // Skip on mobile
  
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  
  element.onmousedown = dragMouseDown;
  
  function dragMouseDown(e) {
    if (e.target.className === 'popup-close') return;
    
    e = e || window.event;
    e.preventDefault();
    
    pos3 = e.clientX;
    pos4 = e.clientY;
    
    element.style.zIndex = getHighestZIndex() + 1;
    
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }
  
  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    
    const newTop = element.offsetTop - pos2;
    const newLeft = element.offsetLeft - pos1;
    
    const maxTop = window.innerHeight - element.offsetHeight;
    const maxLeft = window.innerWidth - element.offsetWidth;
    
    element.style.top = Math.max(0, Math.min(newTop, maxTop)) + "px";
    element.style.left = Math.max(0, Math.min(newLeft, maxLeft)) + "px";
  }
  
  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
  
  function getHighestZIndex() {
    let highest = 998;
    const IMAGE_POPUP_MAX_Z_INDEX = 1500;
    
    document.querySelectorAll('.image-popup').forEach(popup => {
      const zIndex = parseInt(window.getComputedStyle(popup).zIndex);
      if (zIndex > highest) highest = zIndex;
    });
    
    return Math.min(highest, IMAGE_POPUP_MAX_Z_INDEX);
  }
}

// Mobile-optimized text popup close
function closeTextPopup() {
  if (currentTextPopup) {
    currentTextPopup.style.transition = 'opacity 0.3s ease-out';
    currentTextPopup.style.opacity = '0';
    
    const popup = currentTextPopup.querySelector('.text-popup');
    if (popup) {
      popup.style.transition = 'transform 0.3s ease-out';
      popup.style.transform = 'scale(0.8)';
    }
    
    if (heightUpdateInterval) {
      clearInterval(heightUpdateInterval);
      heightUpdateInterval = null;
    }
    
    setTimeout(() => {
      if (document.body.contains(currentTextPopup)) {
        document.body.removeChild(currentTextPopup);
      }
      currentTextPopup = null;
      
      showOriginalElement();
      enablePopupScroll();
      checkMissedPopups();
    }, 300);
  }
}

function checkMissedPopups() {
  if (missedTextPopups.length > 0 && !currentTextPopup) {
    const nextPopup = missedTextPopups.shift();
    createTextPopup(nextPopup);
    shownTextPopups[nextPopup.id] = true;
  }
}

function closeImagePopup(id) {
  const popupInfo = openImagePopups[id];
  if (popupInfo) {
    const popup = popupInfo.popup;
    const originalElement = popupInfo.originalElement;
    const originalStyles = popupInfo.originalStyles;
    
    popup.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
    popup.style.opacity = '0';
    popup.style.transform = 'scale(0.8)';
    
    setTimeout(() => {
      if (document.body.contains(popup)) {
        document.body.removeChild(popup);
      }
      
      if (originalElement) {
        originalElement.style.opacity = originalStyles.opacity || '';
        originalElement.style.visibility = originalStyles.visibility || '';
        originalElement.style.display = originalStyles.display || '';
        originalElement.style.pointerEvents = '';
      }
      
      delete openImagePopups[id];
    }, 300);
  }
}

function closeAllImagePopups() {
  for (const id in openImagePopups) {
    closeImagePopup(id);
  }
}

// Track if we're in fullscreen mode
let isInFullscreen = false;

document.addEventListener("DOMContentLoaded", () => {
  let dialogShown = false;
  let audioPlayer = null;
  let lastMilestone = 0;
  
  document.addEventListener("fullscreenchange", handleFullscreenChange);
  document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
  document.addEventListener("mozfullscreenchange", handleFullscreenChange);
  document.addEventListener("MSFullscreenChange", handleFullscreenChange);
  
  // Mobile-optimized audio initialization
  initBackgroundMusic();

  for (let i = 0; i < (isMobile ? 8 : 10); i++) { // Fewer initial images on mobile
    addImage();
    addImageTop();
  }

  function disableScroll() {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    
    // Additional mobile scroll prevention
    if (isMobile) {
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
    }
  }

  function enableScroll() {
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    
    if (isMobile) {
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    }
  }

  function initBackgroundMusic() {
    audioPlayer = document.createElement('audio');
    audioPlayer.src = 'music/Goldberg Variations_ BWV 988_ Aria-Johann Sebastian Bach.mp3';
    audioPlayer.loop = true;
    audioPlayer.volume = isMobile ? 0.3 : 0.5; // Lower volume on mobile
    audioPlayer.muted = false;
    
    // Mobile-friendly audio handling
    const events = isMobile ? 
      ['touchstart', 'touchend', 'click'] : 
      ['click', 'touchstart'];
    
    events.forEach(event => {
      document.body.addEventListener(event, attemptAutoplay, { once: true });
    });
    
    window.addEventListener('scroll', attemptAutoplay, { once: true });
    attemptAutoplay();
    
    function attemptAutoplay() {
      const playPromise = audioPlayer.play();
      
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log('Autoplay started successfully');
        }).catch(error => {
          console.log('Autoplay prevented by browser policy:', error);
          
          const clickHandler = () => {
            audioPlayer.play().catch(e => console.log('Still cannot play audio'));
            document.body.removeEventListener('click', clickHandler);
            document.body.removeEventListener('touchstart', clickHandler);
          };
          
          document.body.addEventListener('click', clickHandler);
          if (isMobile) {
            document.body.addEventListener('touchstart', clickHandler);
          }
        });
      }
    }
    
    document.body.appendChild(audioPlayer);
  }

  // Mobile-optimized scroll event listener
  window.addEventListener("scroll", () => {
    const scrollBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 50;
    const scrollTop = window.scrollY <= 50;

    if (scrollBottom) {
      addImage();
    } else if (scrollTop) {
      addImageTop();
    }

    if (window.scrollY >= 185000 && !dialogShown) {
      // Stop auto scroll when dialog appears
      if (isMobile) {
        stopAutoScroll();
      }
      
      disableScroll();

      Confirm.open({
        title: '🤔',
        message: 'If we have to work and build, can we work on the build of love?',
        okText: 'Yes',
        cancelText: 'No',
        onok: () => {
          redirectToNextPage();
          enableScroll();
        },
        oncancel: () => {
          closeConfirm();
          enableScroll();
          dialogShown = true;
          
          // Resume auto scroll after dialog closes on mobile
          if (isMobile) {
            setTimeout(() => {
              startAutoScroll();
            }, AUTO_SCROLL_DELAY);
          }
        }
      });

      dialogShown = true;
    }

    updatePageHeightDisplay();
  }, { passive: true });

  function addImage() {
    const image = createImage();
    document.body.appendChild(image);
  }

  function addImageTop() {
    const image = createImage();
    image.onload = () => {
      window.scrollTo(0, window.scrollY + image.height);
    };
    document.body.insertBefore(image, document.body.firstChild);
  }

  function createImage() {
    const img = document.createElement("img");
    img.src = "column3.png";
    img.alt = "Dynamic Image";
    img.classList.add("dynamic-image");
    
    // Make column images 4x larger on mobile
    if (isMobile) {
      img.style.transform = 'scale(4)'; // 4x larger than current size
      img.style.transformOrigin = 'center';
    }
    
    return img;
  }

  function updatePageHeightDisplay() {
    const pixels = window.scrollY + window.innerHeight;
    const centimeters = (pixels / 96) * 2.54;
    const pageHeightDisplay = document.getElementById("pageHeightDisplay");
    if (pageHeightDisplay) {
      pageHeightDisplay.textContent = `Column height: ${centimeters.toFixed(2)} cm`;
    }
    
    checkMilestone(centimeters);
  }
  
  function checkMilestone(centimeters) {
    if (centimeters < 5000) return;
    
    const currentMilestone = Math.floor(centimeters / 1000) * 1000;
    
    if (currentMilestone > lastMilestone && !currentTextPopup && !isScrollDisabled) {
      showMilestonePopup(currentMilestone, centimeters);
      lastMilestone = currentMilestone;
    }
  }
  
  function showMilestonePopup(milestone, currentCm) {
    const overlay = document.createElement('div');
    overlay.className = 'text-popup-overlay';
    
    const popup = document.createElement('div');
    popup.className = 'text-popup';
    
    // Mobile-optimized milestone popup sizing
    if (isMobile) {
      popup.style.width = '90vw';
      popup.style.height = '50vh';
      popup.style.maxWidth = '400px';
      popup.style.maxHeight = '300px';
    } else {
      popup.style.width = '500px';
      popup.style.height = '300px';
    }
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'popup-content';
    contentDiv.style.fontSize = isMobile ? '24px' : '28px';
    contentDiv.style.display = 'flex';
    contentDiv.style.flexDirection = 'column';
    contentDiv.style.alignItems = 'center';
    contentDiv.style.justifyContent = 'center';
    contentDiv.innerHTML = `
      <div style="margin-bottom: 30px; font-size: ${isMobile ? '30px' : '36px'}; font-weight: bold;">Great job😈</div>
      <div>You've reached ${milestone} cm!</div>
    `;
    
    const footerDiv = document.createElement('div');
    footerDiv.className = 'popup-footer';
    footerDiv.innerHTML = `
      <div class="popup-height">Column height: ${currentCm.toFixed(2)} cm</div>
      <button class="popup-button" style="${isMobile ? 'min-height: 44px; min-width: 44px; padding: 12px;' : ''}">😈</button>
    `;
    
    popup.appendChild(contentDiv);
    popup.appendChild(footerDiv);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    
    currentTextPopup = overlay;
    disablePopupScroll();
    
    // Mobile-optimized button handling
    const button = popup.querySelector('.popup-button');
    button.addEventListener('click', closeMilestonePopup);
    if (isMobile) {
      button.addEventListener('touchend', function(e) {
        e.preventDefault();
        closeMilestonePopup();
      });
    }
    
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeMilestonePopup();
      }
    });

    if (isMobile) {
      overlay.addEventListener('touchend', (e) => {
        if (e.target === overlay) {
          e.preventDefault();
          closeMilestonePopup();
        }
      });
    }
    
    function closeMilestonePopup() {
      overlay.style.transition = 'opacity 0.3s ease-out';
      overlay.style.opacity = '0';
      popup.style.transition = 'transform 0.3s ease-out';
      popup.style.transform = 'scale(0.8)';
      
      setTimeout(() => {
        if (document.body.contains(overlay)) {
          document.body.removeChild(overlay);
        }
        currentTextPopup = null;
        enablePopupScroll();
      }, 300);
    }
  }
});

function handleFullscreenChange() {
  const wasInFullscreen = isInFullscreen;
  isInFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || 
                     document.mozFullScreenElement || document.msFullscreenElement);
  
  console.log("Fullscreen change detected:", isInFullscreen ? "Entered fullscreen" : "Exited fullscreen");
  
  if (isInFullscreen !== wasInFullscreen) {
    console.log("Fullscreen state changed, resetting popup tracking");
    forceResetAllPopups();
    setTimeout(forceTriggerPopupsAtCurrentPosition, 300);
  }
}

function forceResetAllPopups() {
  for (const id in shownTextPopups) {
    shownTextPopups[id] = false;
  }
  
  lastMilestone = 0;
  missedTextPopups = [];
  lastScrollPosition = window.scrollY;
  
  console.log("All popup tracking reset, current scroll:", window.scrollY);
}

function forceTriggerPopupsAtCurrentPosition() {
  const currentScrollY = window.scrollY;
  console.log("Forcing popup check at position:", currentScrollY);
  
  let found = false;
  const buffer = isMobile ? 1500 : 1000; // Larger buffer on mobile
  
  let closestPopup = null;
  let closestDistance = Infinity;
  
  textPopups.forEach(item => {
    if (!shownTextPopups[item.id]) {
      const distance = Math.abs(currentScrollY - item.triggerPosition);
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestPopup = item;
      }
      
      if (currentScrollY > item.triggerPosition - buffer && 
          currentScrollY < item.triggerPosition + buffer) {
        found = true;
        
        if (!currentTextPopup) {
          console.log("Found popup to show:", item.id, "at position:", item.triggerPosition);
          createTextPopup(item);
          shownTextPopups[item.id] = true;
        } else {
          if (!missedTextPopups.includes(item)) {
            missedTextPopups.push(item);
          }
        }
      }
    }
  });
  
  if (!found && closestPopup && !currentTextPopup && closestDistance < 5000) {
    console.log("No popup in range, showing closest popup:", closestPopup.id, 
                "at distance:", closestDistance);
    createTextPopup(closestPopup);
    shownTextPopups[closestPopup.id] = true;
  }
}

// Mobile-optimized resize handler
window.addEventListener('resize', function() {
  // More reliable fullscreen detection for mobile
  const isFullscreenNow = isMobile ? 
    (window.innerHeight === screen.height) : 
    (window.innerWidth === screen.width && window.innerHeight === screen.height);
  
  if (isFullscreenNow !== isInFullscreen) {
    console.log("Detected fullscreen change via resize event");
    isInFullscreen = isFullscreenNow;
    forceResetAllPopups();
    setTimeout(forceTriggerPopupsAtCurrentPosition, 300);
  }
});

// Mobile-optimized Confirm dialog
const Confirm = {
  open(options) {
    options = Object.assign({
      title: '',
      message: '',
      okText: 'OK',
      cancelText: 'Cancel',
      onok: () => {},
      oncancel: () => {}
    }, options);

    const html = `
      <div class="confirm">
        <div class="confirm__window" style="${isMobile ? 'width: 90vw; max-width: 400px; margin: 20px;' : ''}">
          <div class="confirm__titlebar">
            <span class="confirm__title">${options.title}</span>
            <button class="confirm__close" style="${isMobile ? 'font-size: 28px; padding: 10px; min-height: 44px; min-width: 44px;' : ''}">&times;</button>
          </div>
          <div class="confirm__content" style="${isMobile ? 'font-size: 18px; padding: 20px;' : ''}">${options.message}</div>
          <div class="confirm__buttons">
            <button class="confirm__button confirm__button--ok confirm__button--fill" style="${isMobile ? 'min-height: 44px; font-size: 18px; padding: 12px 20px;' : ''}">${options.okText}</button>
            <button class="confirm__button confirm__button--cancel" style="${isMobile ? 'min-height: 44px; font-size: 18px; padding: 12px 20px;' : ''}">${options.cancelText}</button>
          </div>
        </div>
      </div>
    `;

    const template = document.createElement('template');
    template.innerHTML = html.trim();
    const confirmEl = template.content.firstChild;

    const okButton = confirmEl.querySelector('.confirm__button--ok');
    const cancelButton = confirmEl.querySelector('.confirm__button--cancel');
    const closeButton = confirmEl.querySelector('.confirm__close');

    // Desktop events
    okButton.addEventListener('click', () => {
      options.onok();
      this._close(confirmEl);
    });

    cancelButton.addEventListener('click', () => {
      options.oncancel();
      this._close(confirmEl);
    });

    closeButton.addEventListener('click', () => {
      options.oncancel();
      this._close(confirmEl);
    });

    // Mobile touch events
    if (isMobile) {
      okButton.addEventListener('touchend', (e) => {
        e.preventDefault();
        options.onok();
        this._close(confirmEl);
      });

      cancelButton.addEventListener('touchend', (e) => {
        e.preventDefault();
        options.oncancel();
        this._close(confirmEl);
      });

      closeButton.addEventListener('touchend', (e) => {
        e.preventDefault();
        options.oncancel();
        this._close(confirmEl);
      });
    }

    document.body.appendChild(confirmEl);
  },
  _close(confirmEl) {
    confirmEl.classList.add('confirm--close');
    confirmEl.addEventListener('animationend', () => {
      document.body.removeChild(confirmEl);
    });
  }
};

function closeConfirm() {
  const confirm = document.querySelector(".confirm");
  if (confirm) {
    confirm.remove();
  }
}

function redirectToNextPage() {
  window.location.href = "indexheart.html";
}

// Mobile-optimized text popup definitions
const textPopups = [
  {
    id: "higher", 
    triggerPosition: 4500,
    buttonText: "Yes",
    customFit: { width: isMobile ? 350 : 550, height: isMobile ? 250 : 300 }
  },
  {
    id: "scroll1",
    triggerPosition: 11800,
    buttonText: "Yes",
    customFit: { width: isMobile ? 300 : 400, height: isMobile ? 200 : 250 }
  },
  {
    id: "scroll2",
    triggerPosition: 20500,
    buttonText: "🤤",
    customFit: { width: isMobile ? 350 : 800, height: isMobile ? 300 : 400 }
  },
  {
    id: "scroll3",
    triggerPosition: 29800,
    buttonText: "🤑",
    customFit: { width: isMobile ? 350 : 650, height: isMobile ? 300 : 400 }
  },
  {
    id: "scroll4",
    triggerPosition: 59800,
    buttonText: "Yes",
    customFit: { width: isMobile ? 350 : 600, height: isMobile ? 280 : 350 }
  },
  {
    id: "more1",
    triggerPosition: 79800,
    buttonText: "💪",
    customFit: { width: isMobile ? 350 : 800, height: isMobile ? 400 : 500 }
  },
  {
    id: "more2",
    triggerPosition: 99800,
    buttonText: "💪💪",
    customFit: { width: isMobile ? 350 : 900, height: isMobile ? 450 : 600 }
  },
  {
    id: "number",
    triggerPosition: 139800,
    buttonText: "🤭",
    customFit: { width: isMobile ? 350 : 900, height: isMobile ? 400 : 500 }
  },
  {
    id: "scroll5",
    triggerPosition: 149800,
    buttonText: "😿",
    customFit: { width: isMobile ? 350 : 850, height: isMobile ? 400 : 500 }
  },
  {
    id: "scroll6",
    triggerPosition: 159800,
    buttonText: "🫧",
    customFit: { width: isMobile ? 350 : 850, height: isMobile ? 400 : 500 }
  },
  {
    id: "scroll6plus",
    triggerPosition: 164800,
    buttonText: "😨",
    customFit: { width: isMobile ? 350 : 800, height: isMobile ? 350 : 450 }
  },
  {
    id: "scroll7",
    triggerPosition: 171800,
    buttonText: "📖",
    customFit: { width: isMobile ? 350 : 650, height: isMobile ? 300 : 400 }
  },
  {
    id: "scroll8",
    triggerPosition: 172100,
    buttonText: "🔨",
    customFit: { width: isMobile ? 350 : 700, height: isMobile ? 300 : 400 }
  },
  {
    id: "scroll9",
    triggerPosition: 182100,
    buttonText: "🌏",
    customFit: { width: isMobile ? 350 : 650, height: isMobile ? 300 : 400 }
  },
  {
    id: "scroll10",
    triggerPosition: 193100,
    buttonText: "❤️",
    customFit: { width: isMobile ? 350 : 900, height: isMobile ? 400 : 500 }
  }
];

// Mobile-optimized popup styles
function addPopupStyles() {
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    /* Mobile-optimized text popup styles */
    .text-popup-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 1999;
      display: flex;
      justify-content: center;
      align-items: center;
      animation: overlay-appear 0.3s ease-out;
      padding: ${isMobile ? '20px' : '0'};
      box-sizing: border-box;
    }
    
    .text-popup {
      position: relative;
      background: white;
      border: 1px solid black;
      box-shadow: 0 0 15px rgba(0,0,0,0.3);
      z-index: 2000;
      display: flex;
      flex-direction: column;
      font-family: 'Times New Roman', Times, serif;
      animation: popup-appear 0.3s ease-out;
      overflow: hidden;
      max-width: ${isMobile ? '95vw' : '90vw'};
      max-height: ${isMobile ? '85vh' : '90vh'};
      ${isMobile ? 'border-radius: 8px;' : ''}
    }
    
    /* Mobile-optimized image popup styles */
    .image-popup {
      position: fixed;
      background: white;
      border: 1px solid black;
      box-shadow: 0 0 15px rgba(0,0,0,0.3);
      z-index: 998;
      display: flex;
      flex-direction: column;
      font-family: 'Times New Roman', Times, serif;
      animation: popup-appear 0.3s ease-out;
      overflow: hidden;
      ${isMobile ? 'border-radius: 8px;' : ''}
    }
    
    .popup-titlebar {
      background: #fffefe;
      color: #000000;
      padding: ${isMobile ? '10px' : '5px'};
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #000000;
    }
    
    .popup-title {
      margin-left: ${isMobile ? '15px' : '10px'};
      font-family: 'Times New Roman', Times, serif;
      font-size: ${isMobile ? '18px' : '16px'};
    }
    
    .popup-close {
      background: none;
      outline: none;
      border: none;
      font-size: ${isMobile ? '28px' : '24px'};
      color: #000000;
      cursor: pointer;
      padding: ${isMobile ? '10px' : '5px'};
      ${isMobile ? 'min-height: 44px; min-width: 44px;' : ''}
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .popup-content {
      flex-grow: 1;
      padding: ${isMobile ? '15px' : '20px'};
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      overflow: auto;
      font-size: ${isMobile ? '16px' : '18px'};
      line-height: ${isMobile ? '1.4' : '1.5'};
    }
    
    .popup-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: ${isMobile ? '15px 20px' : '10px 20px'};
      border-top: 1px solid #ddd;
      flex-shrink: 0;
    }
    
    .popup-height {
      font-size: ${isMobile ? '12px' : '14px'};
      color: #666;
    }
    
    .popup-button {
      padding: ${isMobile ? '12px 20px' : '5px 15px'};
      border: 1px solid black;
      background: white;
      font-family: 'Times New Roman', Times, serif;
      cursor: pointer;
      font-size: ${isMobile ? '18px' : '16px'};
      ${isMobile ? 'min-height: 44px; min-width: 44px; border-radius: 4px;' : ''}
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .popup-button:hover {
      background: #f5f5f5;
    }
    
    .popup-button:active {
      background: #e5e5e5;
    }
    
    .image-popup .popup-content {
      padding: 0;
    }
    
    .image-popup .popup-content img {
      max-width: 100%;
      max-height: 100%;
      display: block;
    }
    
    @keyframes overlay-appear {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }
    
    @keyframes popup-appear {
      0% { 
        opacity: 0; 
        transform: scale(0.8);
      }
      100% { 
        opacity: 1; 
        transform: scale(1);
      }
    }
    
    body.popup-open {
      overflow: hidden;
      ${isMobile ? 'position: fixed; width: 100%; height: 100%;' : ''}
    }
    
    .hidden-by-popup {
      opacity: 0 !important;
      visibility: hidden !important;
      pointer-events: none !important;
    }

    /* Mobile-specific confirm dialog adjustments */
    ${isMobile ? `
    .confirm__window {
      margin: 20px !important;
      width: calc(100vw - 40px) !important;
      max-width: 400px !important;
    }
    
    .confirm__content {
      font-size: 18px !important;
      line-height: 1.4 !important;
      padding: 20px !important;
    }
    
    .confirm__buttons {
      padding: 15px 20px !important;
    }
    
    .confirm__button {
      min-height: 44px !important;
      font-size: 18px !important;
      padding: 12px 20px !important;
      margin: 0 5px !important;
    }
    ` : ''}
  `;
  
  document.head.appendChild(styleEl);
}

// Track popup states
const shownTextPopups = {};
const shownImagePopups = {};
let currentTextPopup = null;
let currentHiddenElement = null;
const originalElementStyles = {};
const openImagePopups = {};
let isScrollDisabled = false;
let lastScrollPosition = 0;
let missedTextPopups = [];
let originalPageHeightDisplay = '';
let heightUpdateInterval = null;

// Mobile-optimized helper functions
function getCurrentHeightText() {
  const pixels = window.scrollY + window.innerHeight;
  const centimeters = (pixels / 96) * 2.54;
  return `Column height: ${centimeters.toFixed(2)} cm`;
}

function disablePopupScroll() {
  if (isScrollDisabled) return;
  
  // Stop auto scroll when popup opens
  if (isMobile) {
    stopAutoScroll();
  }
  
  const scrollY = window.scrollY;
  
  const pageHeightDisplay = document.getElementById('pageHeightDisplay');
  if (pageHeightDisplay) {
    pageHeightDisplay.style.display = 'none';
  }
  
  document.body.classList.add('popup-open');
  
  if (isMobile) {
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.height = '100%';
  } else {
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
  }
  
  isScrollDisabled = true;
}

function enablePopupScroll() {
  if (!isScrollDisabled) return;
  
  document.body.classList.remove('popup-open');
  
  const scrollY = document.body.style.top;
  
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  if (isMobile) {
    document.body.style.height = '';
  }
  
  window.scrollTo(0, parseInt(scrollY || '0') * -1);
  
  isScrollDisabled = false;
  
  if (heightUpdateInterval) {
    clearInterval(heightUpdateInterval);
    heightUpdateInterval = null;
  }
  
  const pageHeightDisplay = document.getElementById('pageHeightDisplay');
  if (pageHeightDisplay) {
    pageHeightDisplay.style.display = '';
  }
  
  updatePageHeightDisplay();
  
  // Resume auto scroll after popup closes on mobile
  if (isMobile) {
    setTimeout(() => {
      startAutoScroll();
    }, AUTO_SCROLL_DELAY);
  }
}

function hideOriginalElement(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    originalElementStyles[elementId] = {
      opacity: element.style.opacity,
      visibility: element.style.visibility,
      display: element.style.display
    };
    
    element.style.opacity = '0';
    element.style.visibility = 'hidden';
    element.style.pointerEvents = 'none';
    element.classList.add('hidden-by-popup');
    
    currentHiddenElement = element;
  }
}

function showOriginalElement() {
  if (currentHiddenElement) {
    const elementId = currentHiddenElement.id;
    if (originalElementStyles[elementId]) {
      currentHiddenElement.style.opacity = originalElementStyles[elementId].opacity || '';
      currentHiddenElement.style.visibility = originalElementStyles[elementId].visibility || '';
      currentHiddenElement.style.display = originalElementStyles[elementId].display || '';
      currentHiddenElement.style.pointerEvents = '';
    }
    
    currentHiddenElement.classList.remove('hidden-by-popup');
    currentHiddenElement = null;
  }
}

// Mobile-optimized content analysis
function analyzeContent(html) {
  const textOnly = html.replace(/<[^>]*>/g, '');
  const lineBreaks = (html.match(/<br>/g) || []).length;
  const words = textOnly.split(/\s+/).length;
  const chars = textOnly.length;
  
  // More conservative for mobile
  const charsPerLine = isMobile ? 30 : 50;
  const wordsPerLine = isMobile ? 5 : 8;
  
  const estLinesBasedOnChars = Math.ceil(chars / charsPerLine);
  const estLinesBasedOnWords = Math.ceil(words / wordsPerLine);
  
  const estimatedLines = Math.max(estLinesBasedOnChars, estLinesBasedOnWords, lineBreaks + 1);
  
  let baseWidth;
  if (isMobile) {
    baseWidth = Math.min(350, window.innerWidth * 0.9);
  } else {
    if (chars < 80) {
      baseWidth = 450;
    } else if (chars < 200) {
      baseWidth = 550;
    } else if (chars < 400) {
      baseWidth = 650;
    } else {
      baseWidth = 750;
    }
  }
  
  const lineHeight = isMobile ? 24 : 28;
  const paddingMultiplier = estimatedLines > 10 ? 1.6 : 2.0;
  const baseHeight = (estimatedLines * lineHeight) + (60 * paddingMultiplier);
  
  return {
    textLength: chars,
    wordCount: words,
    lineBreaks: lineBreaks,
    estimatedLines: estimatedLines,
    width: Math.min(Math.round(baseWidth * (isMobile ? 1.0 : 1.2)), window.innerWidth * (isMobile ? 0.95 : 0.9)),
    height: Math.min(Math.round(baseHeight * (isMobile ? 1.0 : 1.2)), window.innerHeight * (isMobile ? 0.8 : 0.85)),
    isComplex: chars > 200 || estimatedLines > 8,
    isVeryComplex: chars > 400 || estimatedLines > 15
  };
}

// Mobile-optimized text popup creation
function createTextPopup(textItem) {
  if (currentTextPopup) {
    closeTextPopup();
  }
  
  const element = document.getElementById(textItem.id);
  if (!element) return;
  
  const content = element.innerHTML;
  const style = window.getComputedStyle(element);
  
  let fontSize = style.fontSize;
  const fontSizeNum = parseFloat(fontSize);
  
  const scrollPosition = window.scrollY + window.innerHeight;
  const centimeters = (scrollPosition / 96) * 2.54;
  const heightText = `Column height: ${centimeters.toFixed(2)} cm`;
  
  const contentAnalysis = analyzeContent(content);
  
  let width, height, fontSizeReduction = 1.0, buttonEmoji = textItem.buttonText;
  
  // Mobile-specific sizing logic
  if (isMobile) {
    width = Math.min(
      Math.max(350, contentAnalysis.width),
      window.innerWidth * 0.95
    );
    
    height = Math.min(
      Math.max(300, contentAnalysis.height),
      window.innerHeight * 0.8
    );
    
    // Less aggressive font reduction on mobile
    fontSizeReduction = contentAnalysis.isVeryComplex ? 0.9 : 0.95;
  } else {
    // Desktop logic (same as before)
    if (textItem.id === "more2") {
      width = Math.min(1000, window.innerWidth * 0.95);
      height = Math.min(800, window.innerHeight * 0.95);
      fontSizeReduction = 0.9;
    } else if (textItem.id.includes("more")) {
      width = Math.min(900, window.innerWidth * 0.95);
      height = Math.min(700, window.innerHeight * 0.95);
      fontSizeReduction = 0.9;
    } else if (textItem.customFit) {
      width = Math.min(
        Math.max(textItem.customFit.width * 1.5, contentAnalysis.width * 1.5),
        window.innerWidth * 0.95
      );
      
      height = Math.min(
        Math.max(textItem.customFit.height * 1.5, contentAnalysis.height * 1.5),
        window.innerHeight * 0.95
      );
      
      if (contentAnalysis.isVeryComplex) {
        fontSizeReduction = 0.85;
      } else if (contentAnalysis.isComplex) {
        fontSizeReduction = 0.9;
      } else {
        fontSizeReduction = 0.95;
      }
    } else {
      width = Math.min(contentAnalysis.width * 1.5, window.innerWidth * 0.95);
      height = Math.min(contentAnalysis.height * 1.5, window.innerHeight * 0.95);
      
      if (contentAnalysis.isVeryComplex) {
        fontSizeReduction = 0.85;
      } else if (contentAnalysis.isComplex) {
        fontSizeReduction = 0.9;
      } else {
        fontSizeReduction = 0.95;
      }
    }
  }
  
  // Ensure minimum dimensions
  const minWidth = isMobile ? 300 : 500;
  const minHeight = isMobile ? 250 : 400;
  width = Math.max(width, Math.min(minWidth, window.innerWidth * 0.7));
  height = Math.max(height, Math.min(minHeight, window.innerHeight * 0.6));
  
  // Final bounds check
  width = Math.min(width, window.innerWidth * 0.98);
  height = Math.min(height, window.innerHeight * (isMobile ? 0.85 : 0.98));
  
  // Add extra height for footer
  height += isMobile ? 70 : 60;
  
  hideOriginalElement(textItem.id);
  
  const overlay = document.createElement('div');
  overlay.className = 'text-popup-overlay';
  
  const popup = document.createElement('div');
  popup.className = 'text-popup';
  popup.style.width = width + 'px';
  popup.style.height = height + 'px';
  popup.style.maxHeight = isMobile ? '85vh' : '98vh';
  
  const contentDiv = document.createElement('div');
  contentDiv.className = 'popup-content';
  
  const reducedSize = fontSizeNum * fontSizeReduction;
  contentDiv.style.fontSize = `${reducedSize}px`;
  
  const contentPadding = isMobile ? 15 : 8;
  contentDiv.style.padding = `${contentPadding}px`;
  contentDiv.style.overflowY = 'auto';
  contentDiv.style.maxHeight = isMobile ? 'calc(85vh - 90px)' : 'calc(98vh - 70px)';
  contentDiv.innerHTML = content;
  
  const footerDiv = document.createElement('div');
  footerDiv.className = 'popup-footer';
  
  footerDiv.innerHTML = `
    <div class="popup-height">${heightText}</div>
    <button class="popup-button">${buttonEmoji || 'OK'}</button>
  `;
  
  popup.appendChild(contentDiv);
  popup.appendChild(footerDiv);
  overlay.appendChild(popup);
  
  document.body.appendChild(overlay);
  
  currentTextPopup = overlay;
  
  const button = popup.querySelector('.popup-button');
  button.addEventListener('click', closeTextPopup);
  
  if (isMobile) {
    button.addEventListener('touchend', function(e) {
      e.preventDefault();
      closeTextPopup();
    });
  }
  
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) {
      closeTextPopup();
    }
  });

  if (isMobile) {
    overlay.addEventListener('touchend', function(e) {
      if (e.target === overlay) {
        e.preventDefault();
        closeTextPopup();
      }
    });
  }
  
  const heightElement = popup.querySelector('.popup-height');
  if (heightElement) {
    heightUpdateInterval = setInterval(() => {
      const savedScrollY = parseInt(document.body.style.top || '0') * -1;
      const pixels = savedScrollY + window.innerHeight;
      const cm = (pixels / 96) * 2.54;
      heightElement.textContent = `Column height: ${cm.toFixed(2)} cm`;
    }, 100);
  }
  
  disablePopupScroll();
  
  return popup;
}