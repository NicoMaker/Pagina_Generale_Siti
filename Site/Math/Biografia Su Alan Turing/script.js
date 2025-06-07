// Script to update scroll indicator position
document.addEventListener('DOMContentLoaded', function () {
    const scrollContent = document.querySelector('.scrollable-content');
    const scrollThumb = document.querySelector('.scroll-thumb');

    scrollContent.addEventListener('scroll', function () {
        const scrollPercentage = (scrollContent.scrollTop / (scrollContent.scrollHeight - scrollContent.clientHeight)) * 100;
        scrollThumb.style.top = `${scrollPercentage}%`;
    });
});