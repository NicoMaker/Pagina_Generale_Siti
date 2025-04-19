// share-modal-fix.js - Fix for share modal close button

(function () {
  // Function to fix the share modal close button
  function fixShareModalCloseButton() {
    console.log("Initializing share modal close button fix");

    // Get references to the elements
    const shareModal = document.getElementById("share-modal");
    const closeShareModalBtn = document.getElementById("close-share-modal");

    if (!shareModal || !closeShareModalBtn) {
      console.error("Share modal elements not found");
      return;
    }

    // Remove any existing event listeners to prevent duplicates
    const newCloseBtn = closeShareModalBtn.cloneNode(true);
    closeShareModalBtn.parentNode.replaceChild(newCloseBtn, closeShareModalBtn);

    // Add the event listener directly with debugging
    newCloseBtn.addEventListener("click", function (event) {
      console.log("Share modal close button clicked");
      event.preventDefault();
      event.stopPropagation();
      shareModal.style.display = "none";
      shareModal.setAttribute("aria-hidden", "true");
    });

    // Also ensure clicking outside the modal content closes it
    shareModal.addEventListener("click", function (event) {
      if (event.target === shareModal) {
        console.log("Clicked outside share modal content");
        shareModal.style.display = "none";
        shareModal.setAttribute("aria-hidden", "true");
      }
    });

    // Override the condividiClassifica function to ensure proper initialization
    const originalCondividiClassifica = window.condividiClassifica;
    window.condividiClassifica = function () {
      // Call the original function
      if (typeof originalCondividiClassifica === "function") {
        originalCondividiClassifica();
      }

      // Ensure the close button works after opening the modal
      setTimeout(fixShareModalCloseButton, 50);
    };

    // Override the hideShareModal function
    window.hideShareModal = function () {
      shareModal.style.display = "none";
      shareModal.setAttribute("aria-hidden", "true");
      console.log("Share modal hidden");
    };

    console.log("Share modal close button fix initialized");
  }

  // Run when DOM is loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fixShareModalCloseButton);
  } else {
    // DOM already loaded, run immediately
    fixShareModalCloseButton();
  }

  // Also run when window is fully loaded
  window.addEventListener("load", fixShareModalCloseButton);
})();
