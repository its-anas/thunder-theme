class SearchPageTabs extends HTMLElement {
	constructor() {
		super();
	}
	connectedCallback() {
		this.injectArticles();

		this.addEventListener("click", (event) => {
			let type = event.target.attributes.for.nodeValue;
			this.querySelector(".page-tab.selected").classList.remove("selected");
			event.target.classList.add("selected");

			document.querySelector(".tab.active").classList.add("hidden");
			document.querySelector(".tab.active").classList.remove("active");
			setTimeout(() => {
				document.querySelector(`.tab[type="${type}"]`).classList.remove("hidden");
				document.querySelector(`.tab[type="${type}"]`).classList.add("active");
			}, 300);

			document.querySelector(".search__content").style.height = document.querySelector(`.tab[type="${type}"]`).offsetHeight + "px";
		});
	}

	injectArticles() {
		let windowLocation = window.location;
		let searchTerm = `search?q=${document.querySelector(".search-form__input").value}`;
		let articlesUrl = `${windowLocation.origin}/${searchTerm}&type=article`;

		fetch(articlesUrl)
			.then((response) => response.text())
			.then((data) => {
				const parser = new DOMParser();
				const doc = parser.parseFromString(data, "text/html");

				const searchResults = doc.querySelector(".results-count-hidden");
				if (searchResults) {
					document.querySelector(".page-tab[for='articles']").innerHTML += ` ${searchResults.innerHTML}`;
				}

				const articles = doc.querySelector(".filter__results--list[type='articles']");
				if (articles) {
					document.querySelector(".filter__results--list[type='articles']").innerHTML = `${articles.innerHTML}`;
				}
			});
	}
}
customElements.define("search-page-tabs", SearchPageTabs);
