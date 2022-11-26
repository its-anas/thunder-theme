class PopupComponent extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		this.drawer = this.querySelector("[openable]");
		this.delayTime = parseInt(this.drawer.getAttribute("data-delay-time"));
		this.cookie = document.cookie.split("; ").find((row) => row.startsWith("popupCookie"))
			? JSON.parse(
					document.cookie
						.split("; ")
						.find((row) => row.startsWith("popupCookie"))
						.split("=")
						.slice(1)
						.join("=")
			  )
			: "";
		this.decideDrawerAction();

		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = "<slot></slot>";
	}

	saveInCookie() {
		let popupMessage = "closed";
		let message = JSON.stringify(popupMessage);
		if (!Shopify.designMode) {
			// let expiry = new Date(400 * 24 * 60 * 60 * 1000 + Date.parse(new Date()));
			document.cookie = "popupCookie" + "=" + message + "; path=/; domain=." + window.location.hostname;
		}
	}

	openPopupDrawer() {
		if (this.cookie !== "closed" || Shopify.designMode) {
			this.querySelector(".popup").style.display = "flex";
			this.querySelector(".popup").style.zIndex = "102";

			setTimeout(() => {
				lockPage();

				this.drawer.classList.remove("hidden");
				this.drawer.classList.add("active");

				setTimeout(() => {
					if (this.drawer.querySelector(".popup__picture")) {
						this.drawer.querySelector(".popup__picture").classList.add("slide-in");
					}
					this.drawer.querySelector(".popup__content").classList.add("slide-in");

					setTimeout(() => {
						this.drawer.classList.add("border");
					}, 500);
				}, 1000);
			}, 1000);
		}
	}

	hidePopupDrawer() {
		unlockPage();

		this.drawer.classList.remove("active");
		this.drawer.classList.add("hidden");

		setTimeout(() => {
			this.querySelector(".popup").style.display = "none";
			this.querySelector(".popup").style.zIndex = "98";
			if (this.drawer.querySelector(".popup__picture")) {
				this.drawer.querySelector(".popup__picture").classList.remove("slide-in");
			}
			this.drawer.querySelector(".popup__content").classList.remove("slide-in");
			this.drawer.classList.remove("border");
		}, 300);

		this.saveInCookie();
	}

	decideDrawerAction() {
		if (!Shopify.designMode && this.drawer.classList.contains("hidden")) {
			setTimeout(() => {
				this.openPopupDrawer();
			}, this.delayTime);
		}

		if (Shopify.designMode) {
			document.addEventListener("shopify:section:select", (event) => {
				event.target.classList.forEach((i) => {
					if (i === "section-popup") {
						this.openPopupDrawer();
					}
				});
			});
			document.addEventListener("shopify:section:deselect", (event) => {
				event.target.classList.forEach((i) => {
					if (i === "section-popup") {
						this.hidePopupDrawer();
					}
				});
			});
		}

		document.querySelector(".popup__close").addEventListener("click", () => {
			if (this.drawer.classList.contains("active")) {
				this.hidePopupDrawer();
			}
		});

		document.querySelector(".theme-overlay").addEventListener("click", () => {
			if (this.drawer.classList.contains("active")) {
				this.hidePopupDrawer();
			}
		});
	}
}

customElements.define("popup-component", PopupComponent);
