class ProductPageTabs extends HTMLElement {
	constructor() {
		super();
	}
	connectedCallback() {
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = "<slot></slot>";
		this.showHide();
	}
	showHide() {
		this.tabs = this.querySelectorAll(".product-page__tab");
		this.tabs.forEach((tab) => {
			let answer = tab.querySelector(".product-page__tab-content");
			let answerHeight = answer.scrollHeight;

			function showAnswer() {
				tab.classList.add("active");
				answer.style.height = answerHeight + "px";
				answer.style.paddingTop = "1rem";
				answer.style.paddingBottom = "1rem";
			}

			if (this.getAttribute("data-set-initial-state") === "expanded") {
				showAnswer();
			}

			tab.addEventListener("click", () => {
				if (!tab.classList.contains("active")) {
					showAnswer();
				} else {
					tab.classList.remove("active");
					tab.childNodes[3].style.height = "0px";
					tab.childNodes[3].style.paddingTop = "0";
					tab.childNodes[3].style.paddingBottom = "0";
				}
			});
		});
	}
}

customElements.define("product-page-tabs", ProductPageTabs);
