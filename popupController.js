const popup = {
    overlay: document.getElementById("popup-overlay"),
    content: document.getElementById("popup-content"),
    titleEl: document.getElementById("popup-title"),
    closeButton: document.getElementById("popup-close"),

    show(content, title) {
        this.content.innerHTML = content;
        this.titleEl.textContent = title || "Popup";   // fallback if no title given
        this.overlay.classList.add("popup-overlay--active");
        document.body.style.overflow = "hidden";
    },

    close() {
        this.overlay.classList.remove("popup-overlay--active");
        this.content.innerHTML = "";
        console.log("close clicked");
        document.body.style.overflow = "";
    }
};

popup.closeButton.addEventListener("click", () => {
    popup.close();
});

popup.overlay.addEventListener("click", (event) => {
    if (event.target === popup.overlay) {
        popup.close();
    }
});

// demo – try a long title that wraps
// popup.show(
//     "I am a POPUP with some content below.",
//     "This is a very long popup title that will wrap onto the next line when there isn't enough room"
// );

export default popup;