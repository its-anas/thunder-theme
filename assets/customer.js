class customerPopup extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		this.addEventListener("click", (e) => {
			if (e.target.id === "customer__popup__add-address__button" || e.target.id === "customer__popup__add-address__close-icon" || e.target.id === "customer__popup__add-address__cancel-button") {
				this.loadCustomerPopup();
				let form = this.querySelector("#customer__popup__add-address__form");

				if (form.classList.contains("hidden")) {
					this.showPopup();
				} else {
					this.hidePopup();
				}
			}
		});

		this.querySelector("select[data-address-country-select]").addEventListener("change", (e) => {
			let country = e.target.value;
			let provinces = e.target.options[e.target.selectedIndex].dataset.provinces;
			this.injectProvinces(country, provinces);
		});
	}

	loadCustomerPopup() {
		let country = this.querySelector("select[data-address-country-select]").dataset.default;
		let province = this.querySelector("select[data-address-province-select]").dataset.default;
		this.querySelector("select[data-address-country-select]").value = country;
		this.querySelector("select[data-address-province-select]").value = province;

		if (this.querySelector(`select[data-address-country-select] option[value='${country}']`)) {
			let provinces = this.querySelector(`select[data-address-country-select] option[value='${country}']`).dataset.provinces;
			this.injectProvinces(country, provinces);
		}
	}

	injectProvinces(country, provinces) {
		let provincesArrays = JSON.parse(provinces);

		if (provincesArrays.length === 0) {
			this.querySelector("select[data-address-province-select]").style.display = "none";
		} else {
			this.querySelector("select[data-address-province-select]").style.display = "block";
			let provincesOptions = "";

			provincesArrays.forEach((province) => {
				provincesOptions += `<option value="${province[1]}">${province[1]}</option>`;
			});

			this.querySelector("select[data-address-province-select]").innerHTML = provincesOptions;
		}
	}

	showPopup() {
		this.querySelector(".customer__popup").style.height = `calc(100% - ${document.querySelector(".header-section").offsetHeight}px +  0.5rem)`;
		this.querySelector(".customer__popup").style.marginTop = `calc(${document.querySelector(".header-section").offsetHeight}px -  0.5rem)`;
		let headerSize = document.querySelector(".header-section").offsetHeight;
		let viewportHeight = window.innerHeight;
		let spaceLeft = viewportHeight - headerSize;
		let halfOfSpaceLeft = spaceLeft / 2;
		let newTop = 100 - (halfOfSpaceLeft / viewportHeight) * 100;

		document.querySelector(".customer__popup").style.top = `${newTop}%`;

		lockPage();

		this.querySelector(".customer__popup").classList.remove("hidden");
		this.querySelector(".customer__popup").classList.add("active");
	}

	hidePopup() {
		unlockPage();

		this.querySelector(".customer__popup").classList.add("hidden");
		this.querySelector(".customer__popup").classList.remove("active");
	}
}

customElements.define("customer-popup", customerPopup);
