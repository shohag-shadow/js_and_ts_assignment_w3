const popup = {
    overlay: document.getElementById("popup-overlay"),
    content: document.getElementById("popup-content"),
    closeButton: document.getElementById("popup-close"),

    show(content) {
        this.content.innerHTML = content;
        this.overlay.classList.add("popup-overlay--active");
    },

    close() {
        this.overlay.classList.remove("popup-overlay--active");
        this.content.innerHTML = "";
        console.log("close clicked");
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