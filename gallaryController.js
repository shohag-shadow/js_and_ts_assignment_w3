import popup from "./popupController.js";

const imageGallaryWrapper = document.createElement("div");
imageGallaryWrapper.className = "image-gallery-wrapper";

const imageGallaryScroll = document.createElement("div");
imageGallaryScroll.className = "image-gallery-scroll";
imageGallaryScroll.id = "galleryScroll";

imageGallaryWrapper.appendChild(imageGallaryScroll);

let images = [];
let activeImage = 0;
let isAnimating = false;

const DOTS_VISIBLE = 5;
const PINNED_SLOT = 2;
const DOT_SIZE = 8;
const DOT_GAP = 6;
const dotSlotWidth = DOT_SIZE + DOT_GAP;

fetch('http://localhost:3000/images')
    .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    })
    .then(data => {
        images = data;
        attachEventListeners();
        renderCarouselDots();
        updateCounter();
    })
    .catch(error => {
        console.error('Fetch error:', error);
        popup.show('<p>Could not load images.</p>', 'Error');
    });

function renderGallery() {
    const container = imageGallaryScroll;
    container.innerHTML = '';
    images.forEach(url => {
        const img = document.createElement('img');
        img.src = url;
        img.alt = 'Gallery image';
        img.loading = 'lazy';
        container.appendChild(img);
    });
    popup.show(imageGallaryWrapper.outerHTML, "Property images");
}

function changeMainImage(newSrc, direction) {
    if (isAnimating) return;
    isAnimating = true;

    const viewport = document.querySelector('.site-main__image-gallary--viewport');
    const currentImg = viewport.querySelector('.site-main__image-gallary--main');

    const nextImg = document.createElement('img');
    nextImg.className = 'site-main__image-gallary--main';
    nextImg.src = newSrc;
    nextImg.alt = "Eagle Creek Golf Club course";

    nextImg.style.transform = direction ? 'translateX(100%)' : 'translateX(-100%)';
    viewport.appendChild(nextImg);

    void nextImg.offsetHeight;

    currentImg.style.transform = direction ? 'translateX(-100%)' : 'translateX(100%)';
    nextImg.style.transform = 'translateX(0)';

    setTimeout(() => {
        currentImg.remove();
        isAnimating = false;
    }, 500);
}

function updateCounter() {
    const counter = document.getElementById('image-gallary-counter');
    if (counter && images.length) {
        counter.innerText = `${activeImage + 1}/${images.length}`;
    }
}

function renderCarouselDots() {
    const track = document.getElementById('carouselTrack');
    if (!track) return;

    const wrapper = track.parentElement;
    wrapper.style.setProperty('--dot-size', `${DOT_SIZE}px`);
    wrapper.style.setProperty('--dot-gap', `${DOT_GAP}px`);

    const visibleCount = Math.min(DOTS_VISIBLE, images.length);
    wrapper.style.width = `${(dotSlotWidth * visibleCount) - DOT_GAP}px`;
    wrapper.style.height = `${DOT_SIZE * 1.5}px`;

    track.innerHTML = '';
    images.forEach((_, idx) => {
        const dot = document.createElement('div');
        dot.className = 'site-main__image-gallary-circles__dot';
        dot.dataset.index = idx;
        dot.addEventListener('click', () => goToImageIndex(idx));
        track.appendChild(dot);
    });

    updateCarouselDots();
}

function updateCarouselDots(prevActiveImage) {
    const track = document.getElementById('carouselTrack');
    if (!track || !images.length) return;

    const dots = track.children;
    const total = images.length;

    const windowStart = Math.min(
        Math.max(activeImage - PINNED_SLOT, 0),
        Math.max(total - DOTS_VISIBLE, 0)
    );

    const wrapped = prevActiveImage !== undefined &&
        Math.abs(activeImage - prevActiveImage) > 1;

    const offset = -windowStart * dotSlotWidth;

    if (wrapped) {
        track.style.transition = 'none';
        track.style.transform = `translateX(${offset}px)`;
        void track.offsetWidth;
        track.style.transition = '';
    } else {
        track.style.transform = `translateX(${offset}px)`;
    }

    for (let idx = 0; idx < dots.length; idx++) {
        dots[idx].classList.toggle('site-main__image-gallary-circles--active', idx === activeImage);
    }
}

function goToImage(direction) {
    if (isAnimating || !images.length) return;

    const prevActiveImage = activeImage;

    if (direction) {
        activeImage = (activeImage + 1) % images.length;
    } else {
        activeImage = (activeImage - 1 + images.length) % images.length;
    }

    changeMainImage(images[activeImage], direction);
    updateCounter();
    updateCarouselDots(prevActiveImage);
}

function goToImageIndex(targetIndex) {
    if (isAnimating || !images.length || targetIndex === activeImage) return;

    const direction = targetIndex > activeImage;
    const prevActiveImage = activeImage;

    activeImage = targetIndex;
    changeMainImage(images[activeImage], direction);
    updateCounter();
    updateCarouselDots(prevActiveImage);
}

function attachEventListeners() {
    document.querySelector('.site-main__image-gallary--right-arrow')
        .addEventListener('click', () => goToImage(true));

    document.querySelector('.site-main__image-gallary--left-arrow')
        .addEventListener('click', () => goToImage(false));

    document.getElementById("view-all-images")
        .addEventListener("click", renderGallery);

    const viewport = document.querySelector('.site-main__image-gallary--viewport');
    if (viewport) {
        let touchStartX = 0, touchStartY = 0;
        let isSwiping = false;
        const SWIPE_THRESHOLD = 50;

        viewport.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
            isSwiping = false;
        }, { passive: true });

        viewport.addEventListener('touchmove', (e) => {
            const touch = e.changedTouches[0];
            const deltaX = touch.screenX - touchStartX;
            const deltaY = touch.screenY - touchStartY;
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
                isSwiping = true;
                e.preventDefault();
            }
        }, { passive: false });

        viewport.addEventListener('touchend', (e) => {
            if (!isSwiping) return;
            const touch = e.changedTouches[0];
            const deltaX = touch.screenX - touchStartX;
            const deltaY = touch.screenY - touchStartY;
            if (Math.abs(deltaX) > SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY)) {
                const direction = deltaX < 0;
                goToImage(direction);
            }
        }, { passive: true });
    }

    updateCounter();
}