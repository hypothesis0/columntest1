document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("image-container");
  const images = container.getElementsByTagName("img");

  const exclusionZones = [
    { start: 78000, end: 83000 }, // First exclusion zone
    { start: 98000, end: 102000 } // Second exclusion zone
  ];

  for (let img of images) {
    // Random size between 50px and 200px, ensuring it doesn't exceed container size
    const maxDimension = Math.min(container.clientWidth, container.clientHeight);
    const dimension = Math.random() * (Math.min(170, maxDimension) - 80) + 80;
    img.style.width = `${dimension}px`;
    img.style.height = `${dimension}px`;

    // Position images within container bounds, avoiding exclusion zones
    img.onload = function () {
      let validPosition = false;
      let posX, posY;

      while (!validPosition) {
        // Define margins (1% of container size)
const marginX = container.clientWidth * 0.13;  // 1% of container width
const marginY = container.clientHeight * 0.01; // 1% of container height

// Calculate random positions within the constrained area
posX = Math.random() * (container.clientWidth - img.clientWidth - 2 * marginX) + marginX;
posY = Math.random() * (container.clientHeight - img.clientHeight - 2 * marginY) + marginY;

        // Check if the position is outside all exclusion zones
        validPosition = exclusionZones.every(zone => !(posY >= zone.start && posY <= zone.end));
      }

      // Set the position once a valid one is found
      img.style.left = `${posX}px`;
      img.style.top = `${posY}px`;
    };

    // For images already loaded before the script runs
    if (img.complete) {
      img.onload();
    }
  }
});


