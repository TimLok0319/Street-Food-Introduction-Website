// scroller.js
document.addEventListener("DOMContentLoaded", function() {
  const scrollers = document.querySelectorAll(".scroller");

  // If a user hasn't opted in for reduced motion, then we add the animation
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    addAnimation();
  }

  function addAnimation() {
    scrollers.forEach((scroller) => {
      scroller.setAttribute("data-animated", true);

      const reviewList = scroller.querySelector(".review-list");
      const scrollerContent = Array.from(reviewList.children);

      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        duplicatedItem.setAttribute("aria-hidden", true);
        reviewList.appendChild(duplicatedItem);
      });
    });
  }
});