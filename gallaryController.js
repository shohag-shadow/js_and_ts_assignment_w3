import popup from "./popupController.js"; // ensure correct path and export

const imageGallaryWrapper = document.createElement("div");
imageGallaryWrapper.className = "image-gallery-wrapper";

const imageGallaryScroll = document.createElement("div");
imageGallaryScroll.className = "image-gallery-scroll";
imageGallaryScroll.id = "galleryScroll";

imageGallaryWrapper.appendChild(imageGallaryScroll);

function renderGallery() {
    const container = imageGallaryScroll;
    container.innerHTML = '';

    fetch('http://localhost:3000/images')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json();
        })
        .then(data => {
            data.forEach(url => {
                const img = document.createElement('img');
                img.src = url;
                img.alt = 'Gallery image';
                img.loading = 'lazy';
                container.appendChild(img);
            });
            // Show popup after images are inserted
            popup.show(imageGallaryWrapper.outerHTML, "Property images");
        })
        .catch(error => {
            console.error('Fetch error:', error);
            popup.show('<p>Could not load images.</p>', 'Error');
        });
}

let viewAllImages = document.getElementById("view-all-images");
viewAllImages.addEventListener("click", renderGallery);