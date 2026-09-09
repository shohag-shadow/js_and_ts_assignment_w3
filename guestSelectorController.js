import popup from "./popupController.js";

const guestSelector = document.getElementById("guest-selector");
const guestValue = guestSelector.querySelector(".booking-card__value");
const guests = {
    guests: 3,
    infants: 1,
    pets: 1
};

const guestTypes = [
    { key: "guests", label: "Guests", hint: "Ages 13+", minimum: 1 },
    { key: "infants", label: "Infants", hint: "Under 2", minimum: 0 },
    { key: "pets", label: "Pets", hint: "Service animals included", minimum: 0 }
];

function guestSelectorMarkup() {
    const rows = guestTypes.map(({ key, label, hint, minimum }) => `
        <div class="guest-selector__row">
            <span class="guest-selector__label">
                ${label}
                <span class="guest-selector__hint">${hint}</span>
            </span>
            <span class="guest-selector__controls">
                <button class="guest-selector__button" type="button" data-action="decrease" data-type="${key}"
                    data-minimum="${minimum}" aria-label="Decrease ${label.toLowerCase()}">-</button>
                <span class="guest-selector__count" data-count="${key}">${guests[key]}</span>
                <button class="guest-selector__button" type="button" data-action="increase" data-type="${key}"
                    aria-label="Increase ${label.toLowerCase()}">+</button>
            </span>
        </div>
    `).join("");

    return `<div class="guest-selector" data-guest-selector>
        ${rows}
        <button class="guest-selector__done" type="button" data-action="done">Done</button>
    </div>`;
}

function updateGuestSummary() {
    const summary = [
        `${guests.guests} ${guests.guests === 1 ? "GUEST" : "GUESTS"}`,
        `${guests.infants} ${guests.infants === 1 ? "INFANT" : "INFANTS"}`,
        `${guests.pets} ${guests.pets === 1 ? "PET" : "PETS"}`
    ];

    guestValue.textContent = summary.join(", ");
}

function updateGuestControls(container) {
    guestTypes.forEach(({ key, minimum }) => {
        container.querySelector(`[data-count="${key}"]`).textContent = guests[key];
        container.querySelector(`[data-action="decrease"][data-type="${key}"]`).disabled = guests[key] <= minimum;
    });
}

function openGuestSelector() {
    popup.show(guestSelectorMarkup(), "Select guests");
    const container = popup.content.querySelector("[data-guest-selector]");

    container.addEventListener("click", (event) => {
        const button = event.target.closest("button");
        if (!button) return;

        if (button.dataset.action === "done") {
            updateGuestSummary();
            popup.close();
            return;
        }

        const change = button.dataset.action === "increase" ? 1 : -1;
        guests[button.dataset.type] += change;
        updateGuestControls(container);
    });

    updateGuestControls(container);
}

guestSelector.addEventListener("click", openGuestSelector);
guestSelector.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openGuestSelector();
    }
});