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
const markerIcons = {
    default: "assets/map-marker.svg",
    selected: "assets/map-marker-selected.svg"
};
const markerSize = { width: 32, height: 40 };
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
    mapState.markers.forEach(marker => marker.setIcon(markerIcon(marker.propertyId === id)));
    const marker = mapState.markers.find(item => item.propertyId === id);
    if (marker && mapState.instance) mapState.instance.panTo(marker.getPosition());
}

function markerIcon(selected, scale = 1) {
    return {
        url: selected ? markerIcons.selected : markerIcons.default,
        scaledSize: new google.maps.Size(markerSize.width * scale, markerSize.height * scale),
        anchor: new google.maps.Point((markerSize.width / 2) * scale, (markerSize.height - 2) * scale)
    };
}

function updateMap() {
    if (!mapState.instance || !currentCards.length) return;
    mapState.markers.forEach(marker => marker.setMap(null));
    mapState.markers = currentCards.map(item => {
        const position = { lat: Number(item.GeoInfo?.Lat), lng: Number(item.GeoInfo?.Lng) };
        const marker = new google.maps.Marker({
            map: mapState.instance,
            position,
            title: item.Property?.PropertyName || "Stay",
            icon: markerIcon(mapState.selectedId === item.ID)
        });
        marker.propertyId = item.ID;
        marker.addListener("click", () => selectCard(item.ID));
        return marker;
    });
    const bounds = new google.maps.LatLngBounds();
    mapState.markers.forEach(marker => bounds.extend(marker.getPosition()));
    mapState.instance.fitBounds(bounds, 50);
}

let carouselSlideTimer = null;

function updateCarousel(direction) {
    const total = Math.min(currentCards.length, 4);
    const cards = [...cardWrapper.querySelectorAll(".site-stay__card")];

    if (carouselSlideTimer) {
        clearTimeout(carouselSlideTimer);
        carouselSlideTimer = null;
    }
    cards.forEach(card => card.classList.remove(
        "site-stay__card--carousel-animating",
        "site-stay__card--carousel-in",
        "site-stay__card--carousel-in-right",
        "site-stay__card--carousel-in-left",
        "site-stay__card--carousel-out-left",
        "site-stay__card--carousel-out-right"
    ));

    document.querySelectorAll("[data-carousel-dot]").forEach((dot, index) => {
        dot.hidden = index >= total;
        const isActive = index === currentSlide;
        dot.classList.toggle("site-stay__carousel-dot--active", isActive);
        dot.setAttribute("aria-current", isActive ? "true" : "false");
    });

    if (!direction || !window.matchMedia("(max-width: 767px)").matches) {
        cards.forEach((card, index) => card.classList.toggle("site-stay__card--carousel-active", index === currentSlide));
        return;
    }

    const outgoing = cards.find(card => card.classList.contains("site-stay__card--carousel-active")) || cards[0];
    const incoming = cards[currentSlide];
    if (incoming === outgoing) return;

    incoming.classList.add("site-stay__card--carousel-active", "site-stay__card--carousel-animating", "site-stay__card--carousel-in");
    incoming.classList.add(direction === "next" ? "site-stay__card--carousel-in-right" : "site-stay__card--carousel-in-left");
    outgoing.classList.add("site-stay__card--carousel-animating");

    void cardWrapper.offsetWidth;

    incoming.classList.remove("site-stay__card--carousel-in-right", "site-stay__card--carousel-in-left");
    outgoing.classList.add(direction === "next" ? "site-stay__card--carousel-out-left" : "site-stay__card--carousel-out-right");

    carouselSlideTimer = setTimeout(() => {
        carouselSlideTimer = null;
        cards.forEach((card, index) => {
            card.classList.toggle("site-stay__card--carousel-active", index === currentSlide);
            card.classList.remove(
                "site-stay__card--carousel-animating",
                "site-stay__card--carousel-in",
                "site-stay__card--carousel-out-left",
                "site-stay__card--carousel-out-right"
            );
        });
    }, 300);
}

function goToSlide(index) {
    const total = Math.min(currentCards.length, 4);
    if (!total) return;
    const wrappedIndex = ((index % total) + total) % total;
    if (wrappedIndex === currentSlide) return;
    const forwardDistance = (wrappedIndex - currentSlide + total) % total;
    const backwardDistance = (currentSlide - wrappedIndex + total) % total;
    const direction = forwardDistance <= backwardDistance ? "next" : "prev";
    currentSlide = wrappedIndex;
    updateCarousel(direction);
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

document.querySelectorAll("[data-carousel-dot]").forEach(dot => dot.addEventListener("click", () => {
    goToSlide(Number(dot.dataset.carouselDot));
}));

let swipeStartX = 0;
let swipeStartY = 0;
cardWrapper.addEventListener("touchstart", event => {
    swipeStartX = event.changedTouches[0].screenX;
    swipeStartY = event.changedTouches[0].screenY;
}, { passive: true });
cardWrapper.addEventListener("touchend", event => {
    const deltaX = event.changedTouches[0].screenX - swipeStartX;
    const deltaY = event.changedTouches[0].screenY - swipeStartY;
    const minSwipeDistance = 40;
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
        goToSlide(currentSlide + (deltaX < 0 ? 1 : -1));
    }
}, { passive: true });

querySelector.addEventListener("change", querySelectorHandler);
querySelectorHandler();
loadGoogleMap();