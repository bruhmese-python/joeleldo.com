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
});
