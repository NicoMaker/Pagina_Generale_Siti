// Create a new file to ensure the share modal close button works properly

document.addEventListener("DOMContentLoaded", () => {
  // Get references to the share modal and close button
  const shareModal = document.getElementById("share-modal");
  const closeShareModalBtn = document.getElementById("close-share-modal");

  // Ensure the close button works
  if (closeShareModalBtn && shareModal) {
    closeShareModalBtn.addEventListener("click", () => {
      shareModal.style.display = "none";
      shareModal.setAttribute("aria-hidden", "true");
    });
  }

  // Also ensure the modal can be closed by clicking outside
  if (shareModal) {
    window.addEventListener("click", (event) => {
      if (event.target === shareModal) {
        shareModal.style.display = "none";
        shareModal.setAttribute("aria-hidden", "true");
      }
    });
  }
});
