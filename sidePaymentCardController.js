console.log("Booking JS loaded");

const startDateSelector = document.getElementById("start-date-selector");
const endDateSelector = document.getElementById("end-date-selector");
const datePickerInput = document.getElementById("hotel-date-picker");

const checkInValue = startDateSelector.querySelector(
    ".booking-card__value"
);

const checkOutValue = endDateSelector.querySelector(
    ".booking-card__value"
);
const bookingStatusText = document.getElementById("booking-status-text");
const totalPrice = document.getElementById("total-price");
const nightlyPrice = 2026;



const today = new Date();
today.setHours(0, 0, 0, 0);



const hotelDatePicker = new HotelDatepicker(
    datePickerInput,
    {
        startDate: today,
        selectForward: true,
        autoClose: false,
        container: document.body,
        format: "YYYY-MM-DD",

        onOpenDatepicker: function () {
            addDatepickerActions();
        },

        onSelectRange: function () {
            const value = datePickerInput.value;

            console.log("Selected range:", value);

            const dates = value.split(" - ");

            if (dates.length !== 2) {
                return;
            }

            checkInValue.textContent = formatDate(dates[0]);
            checkOutValue.textContent = formatDate(dates[1]);
            bookingStatusText.textContent = "Dates selected are available";
            totalPrice.textContent = `USD $${calculateTotal(dates[0], dates[1]).toLocaleString("en-US")}`;

            const continueButton = document.querySelector("[data-datepicker-action=continue]");
            if (continueButton) {
                continueButton.disabled = false;
            }
        }
    }
);


startDateSelector.addEventListener("click", (event) => {
    openDatepicker(event);
});



endDateSelector.addEventListener("click", (event) => {
    openDatepicker(event);
});

function openDatepicker(clickEvent) {
    hotelDatePicker.openDatepicker(clickEvent);
    const datepicker = document.getElementById("datepicker-hotel-date-picker");
    if (datepicker) {
        positionDatepicker(datepicker, clickEvent);
    }
}

function positionDatepicker(datepicker, clickEvent) {
    const padding = 12;
    const gap = 8;
    const left = Math.min(
        Math.max(clickEvent.clientX - datepicker.offsetWidth, padding),
        window.innerWidth - datepicker.offsetWidth - padding
    );
    const top = Math.min(
        Math.max(clickEvent.clientY + gap, padding),
        window.innerHeight - datepicker.offsetHeight - padding
    );

    datepicker.style.left = `${left}px`;
    datepicker.style.top = `${top}px`;
}

document.addEventListener("click", (event) => {
    const datepicker = document.getElementById("datepicker-hotel-date-picker");
    const isDatepickerClick = datepicker && datepicker.contains(event.target);
    const isDateTriggerClick = startDateSelector.contains(event.target) || endDateSelector.contains(event.target);

    if (datepicker && !isDatepickerClick && !isDateTriggerClick) {
        hotelDatePicker.closeDatepicker();
    }
});



function formatDate(dateString) {
    const date = new Date(`${dateString}T00:00:00`);

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    }).toUpperCase();
}

function calculateTotal(startDateString, endDateString) {
    const startDate = new Date(`${startDateString}T00:00:00`);
    const endDate = new Date(`${endDateString}T00:00:00`);
    const nights = Math.round((endDate - startDate) / 86400000);

    return Math.max(nights, 0) * nightlyPrice;
}

function addDatepickerActions() {
    const datepicker = document.getElementById("datepicker-hotel-date-picker");
    if (!datepicker) {
        return;
    }

    let actions = datepicker.querySelector(".datepicker-actions");
    if (!actions) {
        actions = document.createElement("div");
        actions.className = "datepicker-actions";
        actions.innerHTML = `
            <button type="button" class="datepicker-actions__button" data-datepicker-action="skip">Skip</button>
            <button type="button" class="datepicker-actions__button datepicker-actions__button--primary"
                data-datepicker-action="continue" disabled>Continue</button>
        `;
        datepicker.appendChild(actions);

        actions.addEventListener("click", (event) => {
            const action = event.target.dataset.datepickerAction;
            if (action === "skip") {
                hotelDatePicker.closeDatepicker();
            }
            if (action === "continue" && datePickerInput.value.includes(" - ")) {
                hotelDatePicker.closeDatepicker();
            }
        });
    }

}