// ============================================================
// Space4Ag Tour — Lightbox Image Gallery Component
// ============================================================

document.addEventListener('DOMContentLoaded', function () {
  // Find all gallery image containers (grids or carousels)
  const galleries = document.querySelectorAll('.photo-carousel, .photo-grid');

  // Create Lightbox Modal HTML elements dynamically
  const modal = document.createElement('div');
  modal.className = 'lightbox-modal';
  modal.innerHTML = `
    <span class="lightbox-close">&times;</span>
    <button class="lightbox-btn prev">&#10094;</button>
    <div class="lightbox-img-wrap">
      <img class="lightbox-content" src="" alt="">
      <div class="lightbox-caption"></div>
    </div>
    <button class="lightbox-btn next">&#10095;</button>
  `;
  document.body.appendChild(modal);

  const modalImg = modal.querySelector('.lightbox-content');
  const captionText = modal.querySelector('.lightbox-caption');
  const closeBtn = modal.querySelector('.lightbox-close');
  const prevBtn = modal.querySelector('.lightbox-btn.prev');
  const nextBtn = modal.querySelector('.lightbox-btn.next');

  let currentGalleryImages = [];
  let currentImageIdx = 0;

  galleries.forEach((gallery) => {
    // Revert styling to original grid format
    gallery.classList.remove('carousel-container');
    gallery.classList.add('photo-grid');

    const images = Array.from(gallery.querySelectorAll('img'));
    images.forEach((img, idx) => {
      // Style cursor to indicate clickable
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => {
        currentGalleryImages = images;
        currentImageIdx = idx;
        openLightbox();
      });
    });
  });

  function openLightbox() {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Disable page scrolling
    updateLightboxImage();
  }

  function closeLightbox() {
    modal.style.display = 'none';
    document.body.style.overflow = ''; // Re-enable page scrolling
  }

  function updateLightboxImage() {
    if (currentGalleryImages.length === 0) return;
    const img = currentGalleryImages[currentImageIdx];
    modalImg.src = img.src;
    modalImg.alt = img.alt;
    captionText.textContent = img.alt || '';
    
    // Hide navigation if only one image in gallery group
    if (currentGalleryImages.length <= 1) {
      prevBtn.style.display = 'none';
      nextBtn.style.display = 'none';
    } else {
      prevBtn.style.display = 'block';
      nextBtn.style.display = 'block';
    }
  }

  function prevImage() {
    if (currentGalleryImages.length === 0) return;
    currentImageIdx = (currentImageIdx - 1 + currentGalleryImages.length) % currentGalleryImages.length;
    updateLightboxImage();
  }

  function nextImage() {
    if (currentGalleryImages.length === 0) return;
    currentImageIdx = (currentImageIdx + 1) % currentGalleryImages.length;
    updateLightboxImage();
  }

  // Event Listeners
  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    prevImage();
  });
  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    nextImage();
  });

  // Close when clicking background outside the image content wrapper
  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.classList.contains('lightbox-img-wrap')) {
      closeLightbox();
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (modal.style.display === 'flex') {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    }
  });
});
