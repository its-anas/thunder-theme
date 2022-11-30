class Announcement extends HTMLElement {
	constructor() {
		super();
	}
	connectedCallback() {
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = "<slot></slot>";
		this.loadSlideshow();
	}
	loadSlideshow() {
		let announcement = this.querySelector(".announcement");
		let announcementContainer = this.querySelector(".announcement__container");
		let announcementSlides = this.querySelectorAll(".announcement__container .announcement__slide");
		let prev = this.querySelector(".prev");
		let next = this.querySelector(".next");
		let totalSlides = announcementSlides.length;
		let step = 100 / totalSlides;
		this.delayTime = parseInt(this.getAttribute("data-delay-time"));
		this.autoPlay = this.getAttribute("data-autoplay");
		let activeSlide = 0;
		let activeIndicator = 0;
		let direction = -1;
		let jump = 1;
		let interval = this.delayTime;
		let time;

		if (totalSlides <= 1) {
			if (next) {
				next.style.display = "none";
			}
			if (prev) {
				prev.style.display = "none";
			}
		}

		function slideToNext() {
			if (direction === -1) {
				direction = -1;
			} else if (direction === 1) {
				direction = -1;
				announcementContainer.prepend(announcementContainer.lastElementChild);
			}
			if (announcement) {
				announcement.style.justifyContent = "flex-start";
			}
			if (totalSlides <= 1) {
			} else {
				announcementContainer.style.transform = `translateX(-${step}%)`;
			}
		}

		function slideToPrev() {
			if (direction === -1) {
				direction = 1;
				announcementContainer.append(announcementContainer.firstElementChild);
			} else if (direction === 1) {
				direction = 1;
			}
			announcement.style.justifyContent = "flex-end";
			if (totalSlides <= 1) {
			} else {
				announcementContainer.style.transform = `translateX(${step}%)`;
			}
		}
		if (next) {
			next.addEventListener("click", () => {
				slideToNext();
			});
		}
		if (prev) {
			prev.addEventListener("click", () => {
				slideToPrev();
			});
		}

		function loop(status) {
			if (status === true) {
				time = setInterval(() => {
					slideToNext();
				}, interval);
			} else {
				clearInterval(time);
			}
		}
		if (this.autoPlay === "true") {
			loop(true);
		}

		this.addEventListener("mouseover", () => {
			loop(false);
		});

		this.addEventListener("mouseout", () => {
			if (this.autoPlay === "true") {
				loop(true);
			}
		});

		if (announcementContainer) {
			announcementContainer.addEventListener("transitionend", (event) => {
				if (event.target.className == "announcement__container") {
					if (direction === -1) {
						if (jump > 1) {
							for (let i = 0; i < jump; i++) {
								activeSlide++;
								announcementContainer.append(announcementContainer.firstElementChild);
							}
						} else {
							activeSlide++;
							announcementContainer.append(announcementContainer.firstElementChild);
						}
					} else if (direction === 1) {
						if (jump > 1) {
							for (let i = 0; i < jump; i++) {
								activeSlide--;
								announcementContainer.prepend(announcementContainer.lastElementChild);
							}
						} else {
							activeSlide--;
							announcementContainer.prepend(announcementContainer.lastElementChild);
						}
					}
					announcementContainer.style.transition = "none";
					announcementContainer.style.transform = "translateX(0%)";
					setTimeout(() => {
						jump = 1;
						announcementContainer.style.transition = "all 0.8s cubic-bezier(0.45, 0.05, 0.55, 0.95)";
					});
				}
			});
		}
	}
}

customElements.define("announcement-bar", Announcement);
