class VideoWithText extends HTMLElement {
	constructor() {
		super();
	}
	connectedCallback() {
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = "<slot></slot>";
		this.playVideo();
	}
	playVideo() {
		this.thumbnail = this.querySelector(".video-with-text__thumbnail");
		this.video = this.querySelector(".video");
		this.originalVideoSrc = this.video.src;
		this.thumbnail.addEventListener("click", () => {
			this.video.src = this.originalVideoSrc + "&autoplay=1";
			this.thumbnail.classList.add("hidden");
			this.video.classList.add("shown");
		});
	}
}

customElements.define("video-with-text", VideoWithText);
