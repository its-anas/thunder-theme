class Slideshow extends HTMLElement {
	constructor() {
		super();
	}
	connectedCallback() {
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = "<slot></slot>";
		this.loadSlideshow();
	}
	loadSlideshow() {
		let slideshow = this.querySelector(".slideshow");
		let slideshowContainer = this.querySelector(".slideshow__container");
		let slideshowSlides = this.querySelectorAll(".slideshow__container .slideshow__slide");
		let prev = this.querySelector(".prev");
		let next = this.querySelector(".next");
		let totalSlides = slideshowSlides.length;
		this.delayTime = parseInt(this.getAttribute("data-delay-time"));
		this.autoPlay = this.getAttribute("data-autoplay");

		let step = 100 / totalSlides;
		let activeSlide = 0;
		let activeIndicator = 0;
		let direction = -1;
		let jump = 1;
		let interval = this.delayTime;
		let time;
		let isDragging = false;
		let startPos = 0;
		let movement = 0;
		let currentPosition = 0;

		if (totalSlides <= 1) {
			next.style.display = "none";
			prev.style.display = "none";
		}

		function loadIndicators() {
			slideshowSlides.forEach((slide, index) => {
				let indicators = slideshow.querySelector(".slideshow__indicators");

				if (index === 0) {
					indicators.innerHTML += `<span data-slide-to="${index}" class="active"></span>`;
				} else {
					indicators.innerHTML += `<span data-slide-to="${index}"></span>`;
				}
			});
		}
		loadIndicators();

		function slideToNext() {
			if (direction === -1) {
				direction = -1;
			} else if (direction === 1) {
				direction = -1;
				slideshowContainer.prepend(slideshowContainer.lastElementChild);
			}
			slideshow.style.justifyContent = "flex-start";
			if (totalSlides <= 1) {
			} else {
				slideshowContainer.style.transform = `translateX(-${step}%)`;
			}
		}

		function slideToPrev() {
			if (direction === -1) {
				direction = 1;
				slideshowContainer.append(slideshowContainer.firstElementChild);
			} else if (direction === 1) {
				direction = 1;
			}
			slideshow.style.justifyContent = "flex-end";
			if (totalSlides <= 1) {
			} else {
				slideshowContainer.style.transform = `translateX(${step}%)`;
			}
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

		function touchStart() {
			return function (event) {
				isDragging = true;
				startPos = event.touches[0].clientX;
			};
		}

		function touchMove(event) {
			if (isDragging) {
				currentPosition = event.touches[0].clientX;
				movement = currentPosition - startPos;

				if (movement > 50) {
					slideToPrev();
				} else if (movement < -50) {
					slideToNext();
				}
			}
		}

		slideshowContainer.addEventListener("transitionend", (event) => {
			if (event.target.className == "slideshow__container") {
				if (direction === -1) {
					if (jump > 1) {
						for (let i = 0; i < jump; i++) {
							activeSlide++;
							slideshowContainer.append(slideshowContainer.firstElementChild);
						}
					} else {
						activeSlide++;
						slideshowContainer.append(slideshowContainer.firstElementChild);
					}
				} else if (direction === 1) {
					if (jump > 1) {
						for (let i = 0; i < jump; i++) {
							activeSlide--;
							slideshowContainer.prepend(slideshowContainer.lastElementChild);
						}
					} else {
						activeSlide--;
						slideshowContainer.prepend(slideshowContainer.lastElementChild);
					}
				}
				slideshowContainer.style.transition = "none";
				slideshowContainer.style.transform = "translateX(0%)";
				setTimeout(() => {
					jump = 1;
					slideshowContainer.style.transition = "all 0.8s cubic-bezier(0.45, 0.05, 0.55, 0.95)";
				});
				function updateIndicators() {
					if (activeSlide > totalSlides - 1) {
						activeSlide = 0;
					} else if (activeSlide < 0) {
						activeSlide = totalSlides - 1;
					}
					slideshow.querySelector(".slideshow__indicators span.active").classList.remove("active");
					slideshow.querySelectorAll(".slideshow__indicators span")[activeSlide].classList.add("active");
				}
				updateIndicators();
			}
		});

		let indicator = slideshow.querySelectorAll(".slideshow__indicators span");
		indicator.forEach((item) => {
			item.addEventListener("click", (e) => {
				let slideTo = parseInt(e.target.dataset.slideTo);
				indicator.forEach((item, index) => {
					if (item.classList.contains("active")) {
						activeIndicator = index;
					}
				});
				if (slideTo - activeIndicator > 1) {
					jump = slideTo - activeIndicator;
					step = jump * step;
					slideToNext();
				} else if (slideTo - activeIndicator === 1) {
					slideToNext();
				} else if (slideTo - activeIndicator < 0) {
					if (Math.abs(slideTo - activeIndicator) > 1) {
						jump = Math.abs(slideTo - activeIndicator);
						step = jump * step;
						slideToPrev();
					}
					slideToPrev();
				}
				step = 100 / totalSlides;
			});
		});

		next.addEventListener("click", () => {
			slideToNext();
		});
		prev.addEventListener("click", () => {
			slideToPrev();
		});

		this.addEventListener("mouseover", () => {
			loop(false);
		});
		this.addEventListener("mouseout", () => {
			if (this.autoPlay === "true") {
				loop(true);
			}
		});

		slideshowSlides.forEach((slide) => {
			slide.addEventListener("touchstart", touchStart());
			slide.addEventListener("touchmove", touchMove);
		});

		this.addEventListener("touchstart", () => {
			loop(false);
		});
		this.addEventListener("touchend", () => {
			if (this.autoPlay === "true") {
				loop(true);
			}
		});
	}
}

customElements.define("slideshow-section", Slideshow);
