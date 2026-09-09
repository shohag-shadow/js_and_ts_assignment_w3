let readMoreButton = document.getElementById("read-more-button");
let buttonStatus = false;
let info = document.getElementById("site-inforation");

function readMoreButtonToggle() {
    buttonStatus = !buttonStatus;
    if (buttonStatus) {
        info.classList.add("site-course-info__description--read-less");
        readMoreButton.innerHTML = `READ LESS <span class="arrow">▲</span>`;
        info.style.paddingBottom = "20px";
    } else {
        info.classList.remove("site-course-info__description--read-less");
        readMoreButton.innerHTML = `READ MORE <span class="arrow">▼</span>`;
    }
}

readMoreButton.addEventListener("click", readMoreButtonToggle);

// Initial arrow (set on page load)
readMoreButton.innerHTML = `READ MORE <span class="arrow">▼</span>`;