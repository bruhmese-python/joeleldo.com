document.addEventListener("DOMContentLoaded", () => {
  // Get the modal and the close button
  const modal = document.getElementById("screenshotModal");
  const modalImage = document.getElementById("modalImage");
  const closeModal = document.getElementById("closeModal");

  // Get all elements with the class "screenshot"
  const screenshots = document.querySelectorAll(".modal_img");

  // Add event listener to each screenshot
  screenshots.forEach((screenshot) => {
    screenshot.addEventListener("click", function () {
      const imageSrc = this.getAttribute("src"); // Get the full image source from data attribute
      modalImage.src = imageSrc; // Set the modal's image source
      modal.style.display = "block"; // Show the modal
    });
  });

  // When the user clicks on the close button, close the modal
  closeModal.addEventListener("click", function () {
    modal.style.display = "none";
  });

  // When the user clicks outside the modal, close it
  window.addEventListener("click", function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  // --------------------------
  // Elements for YouTube modal
  // --------------------------
  const youtubeModal = document.getElementById("youtubeModal");
  const youtubeIframe = document.getElementById("youtubeIframe");
  const closeYoutubeModal = document.getElementById("closeYoutubeModal");

  const youtubeThumbnails = document.querySelectorAll(".youtube-thumbnail");

  youtubeThumbnails.forEach((thumb) => {
    thumb.addEventListener("click", function () {
      const videoId = this.getAttribute("data-video-id");
      const videoURL = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      youtubeIframe.src = videoURL;
      youtubeModal.style.display = "grid";
      document.body.style.overflow = "hidden";
    });
  });

  // Close YouTube modal
  function closeVideoModal() {
    youtubeModal.style.display = "none";
    youtubeIframe.src = "";
    document.body.style.overflow = "auto";
  }

  closeYoutubeModal.addEventListener("click", closeVideoModal);

  window.addEventListener("click", (e) => {
    if (e.target === youtubeModal) {
      closeVideoModal();
    }
  });
});
