class FilterComponent extends HTMLElement {
	constructor() {
		super();
	}
	connectedCallback() {
		this.pageType = window.location.pathname.includes("search") ? "search" : "collection";
		this.injectResultsCount(this.buildUrl());
		document.addEventListener("change", (event) => {
			if (event.target.form) {
				this.injectResultsCount(this.buildUrl());
				showLoadingBar();
				if (event.target.form.id === "filterForm") {
					this.getNewResults(this.buildUrl());
				}
			}
			if (event.target.className === "sort-by__select") {
				showLoadingBar();
				this.getNewResults(this.buildUrl());
			}
		});

		document.addEventListener("click", (event) => {
			if (event.target.className === "filter-active-filters__remove small" || event.target.className === "filter-active-filters__clear small underline") {
				this.injectResultsCount(this.buildUrl());
				showLoadingBar();
				this.getNewResults(event.target.dataset.url);
			}
		});
	}

	injectResultsCount(url) {
		fetch(url)
			.then((response) => response.text())
			.then((data) => {
				const parser = new DOMParser();
				const doc = parser.parseFromString(data, "text/html");
				const resultsCount = doc.querySelector(".results-count-hidden");
				const selector = this.pageType === "search" ? ".search__page-tab[for='products']" : ".results-count";
				document.querySelector(selector).innerHTML = "Products " + resultsCount.innerHTML;
			});
	}

	buildUrl() {
		let parameters = [];
		let windowLocation = window.location;
		let pathName = this.pageType === "search" ? `/search?q=${document.querySelector(".search-section__input").value}&type=product&` : `/${window.location.pathname.split("/")[1]}/${window.location.pathname.split("/")[2]}?`;
		let sortBy = `sort_by=${document.querySelector(".sort-by__select").value}`;
		let url = `${windowLocation.origin + pathName + sortBy}`;

		this.querySelectorAll(".filter-group__container input").forEach((container) => {
			if (container.type === "checkbox" && container.checked) {
				parameters.push(container.name + "=" + container.value.replaceAll(" ", "+"));
			}
		});

		let priceRangeLeft = this.querySelector(".filter-group__price-range__slider .range-min");
		let priceRangeRight = this.querySelector(".filter-group__price-range__slider .range-max");

		if (priceRangeLeft.value !== priceRangeLeft.min || priceRangeRight.value !== priceRangeRight.max) {
			parameters.push(priceRangeLeft.name + "=" + priceRangeLeft.value);
			parameters.push(priceRangeRight.name + "=" + priceRangeRight.value);
		}

		parameters.forEach((parameter) => {
			url += "&" + parameter;
		});

		return url;
	}

	getNewResults(url) {
		fetch(url)
			.then((response) => response.text())
			.then((data) => {
				const parser = new DOMParser();
				const doc = parser.parseFromString(data, "text/html");

				const filterField = doc.querySelector("#filterForm");
				document.querySelector("#filterForm").innerHTML = `${filterField.innerHTML}`;

				const filters = doc.querySelector(".filter-active-filters");
				document.querySelector(".filter-active-filters").innerHTML = `${filters.innerHTML}`;

				const products = doc.querySelector(".filter__results--list");
				if (products.children.length > 0) {
					document.querySelector(".filter__results--list").innerHTML = `${products.innerHTML}`;
				} else {
					document.querySelector(".filter__results--list").innerHTML = "<p>No results</p>";
				}

				history.replaceState(null, null, url);
				hideLoadingBar();
			});
	}
}
customElements.define("filter-component", FilterComponent);

class FilterPriceRange extends HTMLElement {
	constructor() {
		super();
	}
	connectedCallback() {
		this.runRange();
	}

	runRange() {
		let rangeInput = this.querySelectorAll(".filter-group__price-range__slider input");
		let priceInput = this.querySelectorAll(".filter-group__price-range__from-input input");
		let range = this.querySelector(".filter-group__price-range__slider .progress");
		let priceGap = 1;

		priceInput.forEach((input) => {
			input.addEventListener("input", (e) => {
				let minPrice = parseInt(priceInput[0].value);
				let maxPrice = parseInt(priceInput[1].value);

				if (maxPrice - minPrice >= priceGap && maxPrice <= rangeInput[1].max) {
					if (e.target.className === "input-min") {
						rangeInput[0].value = minPrice;
						range.style.left = (minPrice / rangeInput[0].max) * 100 + "%";
					} else {
						rangeInput[1].value = maxPrice;
						range.style.right = 100 - (maxPrice / rangeInput[1].max) * 100 + "%";
					}
				}
			});
		});

		rangeInput.forEach((input) => {
			input.addEventListener("input", (e) => {
				let minVal = parseInt(rangeInput[0].value),
					maxVal = parseInt(rangeInput[1].value);

				if (maxVal - minVal < priceGap) {
					if (e.target.className === "range-min") {
						rangeInput[0].value = maxVal - priceGap;
					} else {
						rangeInput[1].value = minVal + priceGap;
					}
				} else {
					priceInput[0].value = minVal;
					priceInput[1].value = maxVal;
					range.style.left = (minVal / rangeInput[0].max) * 100 + "%";
					range.style.right = 100 - (maxVal / rangeInput[1].max) * 100 + "%";
				}
			});
		});
	}
}
customElements.define("filter-price-range", FilterPriceRange);

window.addEventListener("load", () => {
	document.querySelector(".filter__box").style.height = `calc(100% - ${document.querySelector(".header-section").offsetHeight}px + 8px)`;
});

document.querySelector(".show-filter").addEventListener("click", (event) => {
	let filter = document.querySelector(".filter__box");
	filter.classList.toggle("active");
});
document.querySelector(".filter-close").addEventListener("click", (event) => {
	let filter = document.querySelector(".filter__box");
	filter.classList.remove("active");
});
document.querySelector(".filter-mobile__button").addEventListener("click", (event) => {
	let filter = document.querySelector(".filter__box");
	filter.classList.remove("active");
});
