class FaqSection extends HTMLElement {
	constructor() {
		super();
	}
	connectedCallback() {
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = "<slot></slot>";
		this.showHide();
	}
	showHide() {
		this.tabs = this.querySelectorAll(".faq__tab");
		this.tabs.forEach((tab) => {
			const answer = tab.querySelector(".faq__answer");
			const answerHeight = answer.scrollHeight;
			tab.addEventListener("click", () => {
				if (!tab.classList.contains("active")) {
					this.tabs.forEach((tab) => {
						hideTab(tab);
					});
					tab.classList.add("active");
					// answer.style.height = answerHeight + 20 + "px";
					answer.style.height = answerHeight + "px";
				} else {
					hideTab(tab);
				}
				function hideTab(selector) {
					selector.classList.remove("active");
					selector.childNodes[3].style.height = "0px";
				}
			});
		});
	}
}

customElements.define("faq-section", FaqSection);
