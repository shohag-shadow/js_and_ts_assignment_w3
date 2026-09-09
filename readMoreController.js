let readMoreButton = document.getElementById("read-more-button");
let buttonStatus = false;
let info = document.getElementById("site-inforation");
function readMoreButtonToggle() {
    buttonStatus = !buttonStatus;
    if (buttonStatus) {
        info.classList.add("site-course-info__description--read-less");
        readMoreButton.innerText = "READ LESS";
    }
    else {
        info.classList.remove("site-course-info__description--read-less");
        readMoreButton.innerText = "READ MORE";
    }
}
readMoreButton.addEventListener("click", readMoreButtonToggle);