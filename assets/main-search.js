if (document.getElementById("search__results__filter-control")) {
	document.getElementById("search__results__filter-control").addEventListener("click", () => {
		let filterText = document.querySelector(".search__results__filter-text");
		if (filterText.innerHTML === "Hide filter") {
			filterText.innerHTML = "Show filter";
		} else {
			filterText.innerHTML = "Hide filter";
		}
		document.querySelector(".search__content--side").classList.toggle("collapse");
	});
}

if (document.querySelector(".search__results--head .sort-by__select")) {
	document.querySelector(".search__results--head .sort-by__select").addEventListener("change", (e) => {
		let value = e.target.value;

		if (window.location.href.includes("&sort_by")) {
			window.location.href = window.location.href.split("&sort_by")[0] + "&sort_by=" + value;
		} else {
			window.location.href = window.location.href + "&sort_by=" + value;
		}
	});
}
