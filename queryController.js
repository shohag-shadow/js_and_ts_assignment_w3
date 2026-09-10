const querySelector = document.getElementById("query-selector");
const cardWrapper = document.getElementById("stay-card-wrapper");
const mapElement = document.getElementById("stay-map");
const favoriteStorageKey = "stay-and-play-favorites";
const fallbackImages = [
    "assets/side_img1.jpg",
    "assets/side_img2.jpg",
    "assets/main_img.jpg"
];
const propertyImageBaseUrl = "https://beta.imgservice.rentbyowner.com/640x300/";
const markerColors = ["#49a94d", "#168aad", "#e76f51", "#9b5de5", "#f4a261", "#d62828"];
const mapState = { instance: null, markers: [], selectedId: null };
let currentCards = [];
let currentSlide = 0;

function getLimit() {
    return window.matchMedia("(max-width: 767px)").matches ? 4 : 6;
}

function querySelectorHandler() {
    const query = querySelector.value.trim();
    const queryName = query ? `?${query}=true&limit=${getLimit()}` : `?most-popular=true&limit=${getLimit()}`;

    fetch(`/get-property${queryName}`)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json();
        })
        .then(data => updateStayCards(data))
        .catch(error => console.error("Fetch error:", error));
}

function getFavorites() {
    try {
        return new Set(JSON.parse(localStorage.getItem(favoriteStorageKey) || "[]"));
    } catch {
        return new Set();
    }
}

function saveFavorites(favorites) {
    localStorage.setItem(favoriteStorageKey, JSON.stringify([...favorites]));
}

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, character => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
    }[character]));
}

function cardMarkup(item, index, favorites) {
    const property = item.Property || {};
    const location = item.GeoInfo?.Location || {};
    const name = property.PropertyName || "Stay near Eagle Creek";
    const city = location.City || item.GeoInfo?.City || "Orlando";
    const state = location.State || "Florida";
    const price = Number(property.Price || 0).toLocaleString("en-US", { maximumFractionDigits: 2 });
    const amenities = Object.values(property.Amenities || {}).slice(0, 4).join(" · ") || "Comfortable stay · Golf access";
    const reviews = property.ReviewScores?.Score || "Exceptional";
    const image = property.FeatureImage
        ? `${propertyImageBaseUrl}${property.FeatureImage}`
        : fallbackImages[index % fallbackImages.length];
    const id = escapeHtml(item.ID);
    const favorite = favorites.has(item.ID);

    return `<article class="site-stay__card${mapState.selectedId === item.ID ? " site-stay__card--selected" : ""}" data-property-id="${id}">
        <div class="site-stay__card-image">
            <img src="${image}" alt="${escapeHtml(name)}">
            <span class="site-stay__card-badge">50+ GOLF<br>COURSES NEARBY</span>
            <div class="site-stay__card-actions">
                <button type="button" aria-label="View golf courses">◉</button>
                <button type="button" aria-label="View location" data-card-location>●</button>
                <button type="button" aria-label="${favorite ? "Remove from favorites" : "Add to favorites"}" data-favorite class="${favorite ? "is-favorite" : ""}">${favorite ? "♥" : "♡"}</button>
            </div>
        </div>
        <div class="site-stay__card-body">
            <div class="site-stay__rating"><span aria-hidden="true">★</span><strong>${escapeHtml(reviews)}</strong><b aria-hidden="true">|</b><strong>${property.ReviewScores?.Count || 12} Reviews</strong></div>
            <h3 class="site-stay__card-title">${escapeHtml(name)}</h3>
            <span class="site-stay__booking">Booking.com</span>
            <div class="site-stay__price">From <strong>$${price}</strong><span aria-hidden="true">ⓘ</span></div>
            <p class="site-stay__details">${escapeHtml(amenities)}</p>
            <div class="site-stay__location">${escapeHtml(state)} &gt; ${escapeHtml(city)}</div>
            <div class="site-stay__card-buttons"><button class="site-stay__learn-more" type="button">LEARN MORE</button><button class="site-stay__see-dates" type="button">SEE DATES</button></div>
        </div>
    </article>`;
}

function updateStayCards(data) {
    currentCards = data?.Result?.Items?.slice(0, 6) || [];
    currentSlide = 0;
    cardWrapper.innerHTML = currentCards.map((item, index) => cardMarkup(item, index, getFavorites())).join("");
    bindCardEvents();
    updateCarousel();
    updateMap();
}

function bindCardEvents() {
    cardWrapper.onclick = event => {
        const card = event.target.closest(".site-stay__card");
        if (!card) return;

        const id = card.dataset.propertyId;
        if (event.target.closest("[data-favorite]")) {
            const favorites = getFavorites();
            favorites.has(id) ? favorites.delete(id) : favorites.add(id);
            saveFavorites(favorites);
            const item = currentCards.find(cardData => cardData.ID === id);
            card.outerHTML = cardMarkup(item, currentCards.indexOf(item), favorites);
            return;
        }

        if (event.target.closest("[data-card-location]") || card) {
            selectCard(id);
        }
    };
}

function selectCard(id) {
    mapState.selectedId = id;
    cardWrapper.querySelectorAll(".site-stay__card").forEach(card => card.classList.toggle("site-stay__card--selected", card.dataset.propertyId === id));
    mapState.markers.forEach(marker => marker.setIcon(markerIcon(marker.propertyId === id ? marker.color : "#6b7280", marker.propertyId === id ? 1.25 : 1)));
    const marker = mapState.markers.find(item => item.propertyId === id);
    if (marker && mapState.instance) mapState.instance.panTo(marker.getPosition());
}

function markerIcon(color, scale) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40"><path fill="${color}" stroke="white" stroke-width="2" d="M16 2C8.3 2 2 8.3 2 16c0 10 14 21 14 21s14-11 14-21C30 8.3 23.7 2 16 2z"/><circle cx="16" cy="16" r="5" fill="white"/></svg>`;
    return { url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`, scaledSize: new google.maps.Size(32 * scale, 40 * scale), anchor: new google.maps.Point(16 * scale, 38 * scale) };
}

function updateMap() {
    if (!mapState.instance || !currentCards.length) return;
    mapState.markers.forEach(marker => marker.setMap(null));
    mapState.markers = currentCards.map((item, index) => {
        const position = { lat: Number(item.GeoInfo?.Lat), lng: Number(item.GeoInfo?.Lng) };
        const marker = new google.maps.Marker({ map: mapState.instance, position, title: item.Property?.PropertyName || "Stay", icon: markerIcon(markerColors[index], 1) });
        marker.propertyId = item.ID;
        marker.color = markerColors[index];
        marker.addListener("click", () => selectCard(item.ID));
        return marker;
    });
    const bounds = new google.maps.LatLngBounds();
    mapState.markers.forEach(marker => bounds.extend(marker.getPosition()));
    mapState.instance.fitBounds(bounds, 50);
}

function updateCarousel() {
    const position = document.querySelector("[data-carousel-position]");
    const total = Math.min(currentCards.length, 4);
    cardWrapper.querySelectorAll(".site-stay__card").forEach((card, index) => {
        card.classList.toggle("site-stay__card--carousel-active", index === currentSlide);
    });
    if (position) position.textContent = `${currentSlide + 1} / ${total || 1}`;
}

function loadGoogleMap() {
    if (!mapElement || !window.matchMedia("(min-width: 768px)").matches) return;
    fetch("/config/maps").then(response => response.json()).then(({ apiKey }) => {
        if (!apiKey) throw new Error("GOOGLE_MAPS_API_KEY is not configured");
        window.initStayMap = () => {
            mapState.instance = new google.maps.Map(mapElement, { center: { lat: 35.5, lng: -96 }, zoom: 4, mapTypeControl: false, streetViewControl: false, fullscreenControl: false });
            updateMap();
        };
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&callback=initStayMap`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
    }).catch(error => console.error("Google Maps error:", error));
}

document.querySelectorAll("[data-carousel-action]").forEach(button => button.addEventListener("click", () => {
    currentSlide = button.dataset.carouselAction === "next" ? Math.min(currentSlide + 1, Math.min(currentCards.length, 4) - 1) : Math.max(currentSlide - 1, 0);
    updateCarousel();
}));

querySelector.addEventListener("change", querySelectorHandler);
querySelectorHandler();
loadGoogleMap();