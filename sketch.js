// Complete Mobile-optimized version of sketch.js with auto-scroll
// Fixed version with proper mobile support and automatic scrolling

// Detect if we're on a mobile device
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                 (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);

// Auto-scroll variables for mobile
let autoScrollEnabled = false;
let autoScrollInterval = null;
let lastUserInteraction = 0;
const AUTO_SCROLL_DELAY = 3000; // 3 seconds

console.log("Mobile detected:", isMobile);

// Initialize popup system after page load
window.addEventListener('load', function() {
  console.log("Page loaded, initializing...");
  
  // Add styles
  addPopupStyles();

  // Set up observers
  setupImageObserver();
  setupTextObserver();

  // Set up scroll handler
  window.addEventListener('scroll', handlePopupScroll, { passive: true });

  // Store initial scroll position
  lastScrollPosition = window.scrollY;

  // Wait for content to load
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
  
  // Fullscreen detection
  setTimeout(function() {
    isInFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || 
                      document.mozFullScreenElement || document.msFullscreenElement);
    
    if (isInFullscreen) {
      console.log("Initial fullscreen detected");
      forceTriggerPopupsAtCurrentPosition();
    }
  }, 500);
  
  // Desktop keyboard shortcuts
  if (!isMobile) {
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && currentTextPopup) {
        closeTextPopup();
      }
      if (event.key === 'r' || event.key === 'R') {
        resetAllPopups();
      }
    });
  }

  // Mobile-specific setup
  if (isMobile) {
    console.log("Setting up mobile features...");
    setupMobileFeatures();
  }
});

// Mobile features setup
function setupMobileFeatures() {
  // Touch handlers
  setupMobileTouchHandlers();
  
  // Auto-scroll setup
  console.log("Starting auto-scroll setup...");
  setTimeout(() => {
    console.log("Initiating auto-scroll");
    startAutoScroll();
  }, AUTO_SCROLL_DELAY);
}

// Mobile touch handlers
function setupMobileTouchHandlers() {
  console.log("Setting up touch handlers");
  
  // Track user interactions
  ['touchstart', 'touchmove', 'touchend', 'scroll'].forEach(eventType => {
    document.addEventListener(eventType, () => {
      lastUserInteraction = Date.now();
      if (autoScrollEnabled) {
        console.log("User interaction detected, pausing auto-scroll");
        pauseAutoScroll();
      }
    }, { passive: true });
  });

  // Handle popup closing with touch
  document.addEventListener('touchend', function(e) {
    if (currentTextPopup) {
      const target = e.target;
      const overlay = target.closest('.text-popup-overlay');
      if (overlay && target === overlay) {
        closeTextPopup();
      }
    }
  }, { passive: true });
}

// Auto-scroll functions
function startAutoScroll() {
  if (autoScrollInterval || !isMobile) {
    console.log("Auto-scroll already running or not mobile");
    return;
  }
  
  console.log("Starting auto-scroll");
  autoScrollEnabled = true;
  
  autoScrollInterval = setInterval(() => {
    // Check if user interacted recently
    const timeSinceInteraction = Date.now() - lastUserInteraction;
    if (timeSinceInteraction < AUTO_SCROLL_DELAY) {
      return; // Don't scroll if user interacted recently
    }
    
    // Don't scroll if popup is open
    if (currentTextPopup || isScrollDisabled) {
      return;
    }
    
    // Check if we've reached the bottom
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (window.scrollY >= maxScroll - 10) {
      console.log("Reached bottom, stopping auto-scroll");
      stopAutoScroll();
      return;
    }
    
    // Human-like scrolling speed
    const scrollSpeed = Math.random() * 2 + 1; // 1-3 pixels
    window.scrollBy(0, scrollSpeed);
    
    // Occasionally pause for realism
    if (Math.random() < 0.02) { // 2% chance
      setTimeout(() => {
        // Brief pause
      }, Math.random() * 300 + 100);
    }
    
  }, 16); // ~60fps
}

function pauseAutoScroll() {
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval);
    autoScrollInterval = null;
    autoScrollEnabled = false;
    
    // Resume after delay
    setTimeout(() => {
      const timeSinceInteraction = Date.now() - lastUserInteraction;
      if (timeSinceInteraction >= AUTO_SCROLL_DELAY && !currentTextPopup) {
        console.log("Resuming auto-scroll after pause");
        startAutoScroll();
      }
    }, AUTO_SCROLL_DELAY);
  }
}

function stopAutoScroll() {
  if (autoScrollInterval) {
    console.log("Stopping auto-scroll");
    clearInterval(autoScrollInterval);
    autoScrollInterval = null;
  }
  autoScrollEnabled = false;
}

// Reset all popups
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
    checkFastScrolling(window.scrollY);
  }, 100);
}

// Global constants
const SCROLL_THROTTLE = isMobile ? 150 : 100;
let lastScrollCheck = 0;

// Image observer setup
function setupImageObserver() {
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        
        if (shownImagePopups[img.id] || 
            (img.naturalWidth < 100 || img.naturalHeight < 100)) {
          return;
        }
        
        // Limit simultaneous popups on mobile
        const maxImagePopups = isMobile ? 2 : 5;
        if (Object.keys(openImagePopups).length >= maxImagePopups) {
          return;
        }
        
        createImagePopup(img);
        shownImagePopups[img.id] = true;
      }
    });
  }, {
    threshold: isMobile ? 0.3 : 0.4,
    rootMargin: isMobile ? "100px" : "0px"
  });
  
  document.querySelectorAll('img').forEach(img => {
    if (img.width < 100 || img.height < 100) return;
    
    if (!img.id) {
      img.id = 'img-' + Math.random().toString(36).substr(2, 9);
    }
    
    imageObserver.observe(img);
  });
}

// Text observer setup
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
            console.log("Text popup triggered:", popupInfo.id);
            createTextPopup(popupInfo);
            shownTextPopups[popupInfo.id] = true;
          }
        }
      }
    });
  }, {
    threshold: isMobile ? 0.2 : 0.3,
    rootMargin: isMobile ? "200px 0px 200px 0px" : "0px 0px 0px 0px"
  });
  
  textPopups.forEach(item => {
    const element = document.getElementById(item.id);
    if (element) {
      textObserver.observe(element);
    }
  });
}

// Fast scrolling check
function checkFastScrolling(currentScrollY) {
  const scrollSpeed = Math.abs(currentScrollY - lastScrollPosition);
  const isFastScrolling = scrollSpeed > (isMobile ? 300 : 400);

  if (isFastScrolling && !currentTextPopup && !isScrollDisabled) {
    textPopups.forEach(item => {
      if (!shownTextPopups[item.id]) {
        const scrollDirection = currentScrollY > lastScrollPosition ? 'down' : 'up';
        const scrollRange = isMobile ? 150 : 100;
        
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

// Scroll handler
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

// Image popup creation
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
    
    const maxWidthPercent = isMobile ? 0.8 : 0.3;
    const maxHeightPercent = isMobile ? 0.6 : 0.4;
    
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
    
    if (isMobile) {
      popup.style.top = '50%';
      popup.style.left = '50%';
      popup.style.transform = 'translate(-50%, -50%)';
      popup.style.borderRadius = '8px';
    } else {
      popup.style.cursor = 'move';
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
    closeBtn.innerHTML = '&times;';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '5px';
    closeBtn.style.right = '5px';
    closeBtn.style.background = 'none';
    closeBtn.style.border = 'none';
    closeBtn.style.color = '#000';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.zIndex = '10';
    closeBtn.style.fontSize = isMobile ? '28px' : '24px';
    closeBtn.style.padding = isMobile ? '10px' : '5px';
    
    if (isMobile) {
      closeBtn.style.minHeight = '44px';
      closeBtn.style.minWidth = '44px';
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
    
    if (isMobile) {
      closeBtn.addEventListener('touchend', function(e) {
        e.preventDefault();
        closeImagePopup(imageElement.id);
      });
    }
    
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

// Draggable functionality (desktop only)
function makeDraggable(element) {
  if (isMobile) return;
  
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  
  element.onmousedown = dragMouseDown;
  
  function dragMouseDown(e) {
    if (e.target.innerHTML === '&times;') return;
    
    e = e || window.event;
    e.preventDefault();
    
    pos3 = e.clientX;
    pos4 = e.clientY;
    
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
}

// Close functions
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

// Track fullscreen
let isInFullscreen = false;

// Main DOM content loaded handler
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded");
  
  let dialogShown = false;
  let audioPlayer = null;
  let lastMilestone = 0;
  
  // Fullscreen handlers
  document.addEventListener("fullscreenchange", handleFullscreenChange);
  document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
  document.addEventListener("mozfullscreenchange", handleFullscreenChange);
  document.addEventListener("MSFullscreenChange", handleFullscreenChange);
  
  // Initialize audio
  initBackgroundMusic();

  // Load initial images (fewer on mobile)
  const initialImageCount = isMobile ? 8 : 10;
  for (let i = 0; i < initialImageCount; i++) {
    addImage();
    addImageTop();
  }

  function disableScroll() {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    
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
    audioPlayer.volume = isMobile ? 0.3 : 0.5;
    audioPlayer.muted = false;
    
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
          console.log('Audio started');
        }).catch(error => {
          console.log('Audio autoplay prevented:', error);
          
          const clickHandler = () => {
            audioPlayer.play().catch(e => console.log('Audio still blocked'));
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

  // Scroll event listener
  window.addEventListener("scroll", () => {
    const scrollBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 50;
    const scrollTop = window.scrollY <= 50;

    if (scrollBottom) {
      addImage();
    } else if (scrollTop) {
      addImageTop();
    }

    if (window.scrollY >= 185000 && !dialogShown) {
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
    
    // Make images 4x larger on mobile
    if (isMobile) {
      console.log("Creating mobile-sized image");
      img.style.transform = 'scale(4)';
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
    console.log("Showing milestone popup:", milestone);
    
    const overlay = document.createElement('div');
    overlay.className = 'text-popup-overlay';
    
    const popup = document.createElement('div');
    popup.className = 'text-popup';
    
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

// Fullscreen handling
function handleFullscreenChange() {
  const wasInFullscreen = isInFullscreen;
  isInFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || 
                     document.mozFullScreenElement || document.msFullscreenElement);
  
  console.log("Fullscreen change:", isInFullscreen ? "Entered" : "Exited");
  
  if (isInFullscreen !== wasInFullscreen) {
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
  
  console.log("Popup tracking reset");
}

function forceTriggerPopupsAtCurrentPosition() {
  const currentScrollY = window.scrollY;
  console.log("Force checking popups at:", currentScrollY);
  
  let found = false;
  const buffer = isMobile ? 1500 : 1000;
  
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
          console.log("Showing popup:", item.id);
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
    console.log("Showing closest popup:", closestPopup.id);
    createTextPopup(closestPopup);
    shownTextPopups[closestPopup.id] = true;
  }
}

// Resize handler
window.addEventListener('resize', function() {
  const isFullscreenNow = isMobile ? 
    (window.innerHeight === screen.height) : 
    (window.innerWidth === screen.width && window.innerHeight === screen.height);
  
  if (isFullscreenNow !== isInFullscreen) {
    console.log("Fullscreen detected via resize");
    isInFullscreen = isFullscreenNow;
    forceResetAllPopups();
    setTimeout(forceTriggerPopupsAtCurrentPosition, 300);
  }
});

// Confirm dialog
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

// Text popup definitions with mobile sizing
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

// Popup styles
function addPopupStyles() {
  const styleEl = document.createElement('style');
  styleEl.textContent = `
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
  `;
  
  document.head.appendChild(styleEl);
}

// Global state variables
const shownTextPopups = {};
const shownImagePopups = {};
let currentTextPopup = null;
let currentHiddenElement = null;
const originalElementStyles = {};
const openImagePopups = {};
let isScrollDisabled = false;
let lastScrollPosition = 0;
let missedTextPopups = [];
let heightUpdateInterval = null;

// Helper functions
function getCurrentHeightText() {
  const pixels = window.scrollY + window.innerHeight;
  const centimeters = (pixels / 96) * 2.54;
  return `Column height: ${centimeters.toFixed(2)} cm`;
}

function disablePopupScroll() {
  if (isScrollDisabled) return;
  
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

function analyzeContent(html) {
  const textOnly = html.replace(/<[^>]*>/g, '');
  const lineBreaks = (html.match(/<br>/g) || []).length;
  const words = textOnly.split(/\s+/).length;
  const chars = textOnly.length;
  
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

function createTextPopup(textItem) {
  console.log("Creating text popup:", textItem.id);
  
  if (currentTextPopup) {
    closeTextPopup();
  }
  
  const element = document.getElementById(textItem.id);
  if (!element) {
    console.log("Element not found:", textItem.id);
    return;
  }
  
  const content = element.innerHTML;
  const style = window.getComputedStyle(element);
  
  let fontSize = style.fontSize;
  const fontSizeNum = parseFloat(fontSize);
  
  const scrollPosition = window.scrollY + window.innerHeight;
  const centimeters = (scrollPosition / 96) * 2.54;
  const heightText = `Column height: ${centimeters.toFixed(2)} cm`;
  
  const contentAnalysis = analyzeContent(content);
  
  let width, height, fontSizeReduction = 1.0, buttonEmoji = textItem.buttonText;
  
  if (isMobile) {
    width = Math.min(
      Math.max(350, contentAnalysis.width),
      window.innerWidth * 0.95
    );
    
    height = Math.min(
      Math.max(300, contentAnalysis.height),
      window.innerHeight * 0.8
    );
    
    fontSizeReduction = contentAnalysis.isVeryComplex ? 0.9 : 0.95;
  } else {
    if (textItem.customFit) {
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
  
  const minWidth = isMobile ? 300 : 500;
  const minHeight = isMobile ? 250 : 400;
  width = Math.max(width, Math.min(minWidth, window.innerWidth * 0.7));
  height = Math.max(height, Math.min(minHeight, window.innerHeight * 0.6));
  
  width = Math.min(width, window.innerWidth * 0.98);
  height = Math.min(height, window.innerHeight * (isMobile ? 0.85 : 0.98));
  
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