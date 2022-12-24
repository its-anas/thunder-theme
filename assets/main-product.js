class ProductPage extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = "<slot></slot>";
		this.runProductPage();
	}

	runProductPage() {
		if (document.querySelector(".product-page__buttons")) {
			const targetNode = document.querySelector(".product-page__buttons");
			const config = { childList: true, subtree: true };
			const observer = new MutationObserver(callback);
			observer.observe(targetNode, config);
		}

		document.querySelectorAll(".product-page__radio__content").forEach((content) => {
			content.querySelectorAll("input.product-page__radio__input").forEach((radio) => {
				radio.addEventListener("click", () => {
					content.querySelector(".product-page__radio__label.checked").classList.remove("checked");
					radio.parentNode.classList.add("checked");
					syncSelect(content.querySelector("select"), radio.value);
				});
			});
		});

		document.querySelectorAll(".product-page__color-select-content").forEach((content) => {
			content.querySelector("select").addEventListener("change", () => {
				let selectValue = content.querySelector("select").value;
				syncSelect(content.querySelector("select"), selectValue);
			});
		});

		if (document.querySelector(".product-page__tag")) {
			document.querySelector(".product-page__tag").innerHTML = "";
		}

		announceSoldout(currentVariantInventory);

		if (document.querySelector(".product-page__hidden-variants") && productJson.variants.length > 0) {
			function selectCallback(variant, selector) {
				document.querySelector(".product-page__price--compare-at").innerHTML = "";

				let priceDifference = variant.compare_at_price - variant.price;

				if (priceDifference > 0) {
					if (document.querySelector(".product-page__tag")) {
						document.querySelector(".product-page__tag").classList.remove("hidden");
						document.querySelector(".product-page__tag").innerHTML = `<p class='tag--animated tag-text'> ${priceDifferenceText} ${formatMoney(priceDifference)} </p>`;
					}
				} else {
					if (document.querySelector(".product-page__tag")) {
						document.querySelector(".product-page__tag").classList.add("hidden");
					}
				}

				if (variant.compare_at_price > 0) {
					document.querySelector(".product-page__price--compare-at").innerHTML = formatMoney(variant.compare_at_price);
				}

				document.querySelector(".product-page__price--actual").innerHTML = formatMoney(variant.price);

				for (var key in variantsInventory) {
					document.querySelector(".product-page-slider__slides-container .slide").innerHTML = "";
					document.querySelector(".product-page-slider__thumbnails").innerHTML = "";
					document.querySelector(".product-page-slider__indicators").innerHTML = "";

					if (key == variant.title) {
						if (variantsInventory[key] > 0 && variantsInventory[key] < stockAlertThreshold) {
							if (document.querySelector(".product-page__stock-disclaimer__text")) {
								document.querySelector(".product-page__stock-disclaimer__text").innerHTML = `Only ${variantsInventory[key]} left in stock`;
							}
						}
						announceSoldout(variantsInventory[key]);
					}
				}

				document.querySelector(".product-page-slider__slides-container").classList.add("reveal");
				setTimeout(() => {
					document.querySelector(".product-page-slider__slides-container").classList.remove("reveal");
				}, 200);

				document.querySelectorAll(".product-hidden-images .item").forEach((item) => {
					if (item.getAttribute("data-attached-to-variant")) {
						if (item.getAttribute("data-attached-to-variant") === variant.title) {
							document.querySelector(".product-page-slider__slides-container .slide").prepend(item.cloneNode(true));
						} else if (item.getAttribute("data-attached-to-variant") !== variant.title) {
							document.querySelector(".product-page-slider__slides-container .slide").append(item.cloneNode(true));
						}
					} else if (item.getAttribute("data-variant-color") && variant.featured_media) {
						if (item.getAttribute("data-variant-color") === variant.featured_media.alt.split("#color:")[1]) {
							document.querySelector(".product-page-slider__slides-container .slide").appendChild(item.cloneNode(true));
						}
					} else {
						document.querySelector(".product-page-slider__slides-container .slide").appendChild(item.cloneNode(true));
					}
				});

				document.querySelectorAll(".product-hidden-thumbnails .thumbnail").forEach((thumbnail) => {
					if (thumbnail.getAttribute("data-attached-to-variant")) {
						if (thumbnail.getAttribute("data-attached-to-variant") === variant.title) {
							document.querySelector(".product-page-slider__thumbnails").prepend(thumbnail.cloneNode(true));
						} else if (thumbnail.getAttribute("data-attached-to-variant") !== variant.title) {
							document.querySelector(".product-page-slider__thumbnails").append(thumbnail.cloneNode(true));
						}
					} else if (thumbnail.getAttribute("data-variant-color") && variant.featured_media) {
						if (thumbnail.querySelector(".thumbnail-picture img").alt === variant.featured_media.alt) {
							document.querySelector(".product-page-slider__thumbnails").appendChild(thumbnail.cloneNode(true));
						}
					} else {
						document.querySelector(".product-page-slider__thumbnails").appendChild(thumbnail.cloneNode(true));
					}
				});

				document.querySelectorAll(".product-page__hidden-variants #product-select option").forEach((option) => {
					if (parseInt(option.value) === parseInt(variant.id)) {
						document.querySelector(".product-page__hidden-variants #product-select option[selected]").removeAttribute("selected");
						option.setAttribute("selected", "selected");
					}
				});
			}
			new Shopify.OptionSelectors("product-select", {
				product: productJson,
				onVariantSelected: selectCallback,
				enableHistoryState: true,
			});
		} else {
			cloneImages(".product-hidden-images .item", ".product-page-slider__slides-container .slide");
			cloneImages(".product-hidden-thumbnails .thumbnail", ".product-page-slider__thumbnails");
		}

		let addToCartButton = this.querySelector("#add-to-cart-button");
		let pageProductVariantsNumber = parseInt(addToCartButton.dataset.variantsNumber);
		addToCartButton.addEventListener("click", (event) => {
			this.querySelector(".add-to-cart-button .loading-spinner").classList.add("active");
			if (cartType === "drawer") {
				event.preventDefault();
			}
			let variantId = pageProductVariantsNumber > 1 ? document.querySelector(".product-page__hidden-variants #product-select option[selected]").value : addToCartButton.dataset.actualVariant;
			let quantity = document.querySelector(".product-page__form .quantity-field__input").value;
			sendToCart(variantId, quantity);
		});

		function announceSoldout(inventory) {
			if (inventory > 0) {
				if (document.getElementById("dynamic-buy-button").classList.contains("sold-out")) {
					document.getElementById("add-to-cart-button").classList.remove("sold-out");
					document.getElementById("add-to-cart-button").innerHTML = "ADD TO CART";
					document.getElementById("dynamic-buy-button").classList.remove("sold-out");
				}
			} else if (inventory === 0) {
				if (document.querySelector(".product-page__stock-disclaimer__text")) {
					document.querySelector(".product-page__stock-disclaimer__text").innerHTML = `Out of stock`;
				}
				document.getElementById("add-to-cart-button").classList.add("sold-out");
				document.getElementById("add-to-cart-button").innerHTML = "SOLD OUT";
				document.getElementById("dynamic-buy-button").classList.add("sold-out");
			}
		}

		function cloneAllImages(variant, originalImagesSelector, cloneImagesSelector) {
			document.querySelectorAll(".product-hidden-images .item").forEach((item) => {
				if (item.getAttribute("data-attached-to-variant")) {
					if (item.getAttribute("data-attached-to-variant") === variant.title) {
						document.querySelector(originalImagesSelector).prepend(item.cloneNode(true));
					}
				} else if (originalImagesSelector && variant.featured_media) {
					if (originalImagesSelector === ".product-hidden-images .item") {
						if (item.getAttribute("data-variant-color") === variant.featured_media.alt.split("#color:")[1]) {
							document.querySelector(cloneImagesSelector).appendChild(item.cloneNode(true));
						}
					} else if (originalImagesSelector === ".product-hidden-thumbnails .thumbnail") {
						if (item.querySelector(".thumbnail-picture img").alt === variant.featured_media.alt) {
							document.querySelector(cloneImagesSelector).appendChild(item.cloneNode(true));
						}
					}
				} else {
					document.querySelector(cloneImagesSelector).prepend(item.cloneNode(true));
				}
			});
		}

		function cloneImages(originalImagesSelector, cloneImagesSelector) {
			document.querySelectorAll(originalImagesSelector).forEach((image) => {
				let imageClone = image.cloneNode(true);
				document.querySelector(cloneImagesSelector).appendChild(imageClone);
			});
		}

		function syncSelect(select, value) {
			document.querySelectorAll(".selector-wrapper select option").forEach((option) => {
				if (option.label === value) {
					option.parentNode.value = value;
					option.parentNode.dispatchEvent(new Event("change"));
				}
			});
		}

		function callback(mutationList, observer) {
			for (const mutation of mutationList) {
				if (mutation.type === "childList" && mutation.target.className === "shopify-payment-button" && mutation.addedNodes.length > 0) {
					setTimeout(() => {
						document.querySelector(".shopify-payment-button__more-options").innerHTML = `${document.querySelector(".shopify-payment-button__more-options").innerHTML} ${paymentMethods}`;
						document.querySelector(".dynamic-buy-button").style.height = `${document.querySelector(".dynamic-buy-button").scrollHeight}px`;
						document.querySelector(".dynamic-buy-button").classList.add("loaded");
						document.querySelector("product-page .shopify-payment-button__button").classList.add("button", "button--secondary", "border");
						document.querySelector("product-page .shopify-payment-button__button").innerHTML += `<span></span> <span></span> <span></span> <span></span><div class="loading-spinner" style="background: var(--secondary-button-background-color);"> <svg viewBox="25 25 50 50"> <circle stroke="var(--secondary-text-background-color)" cx="50" cy="50" r="20"></circle> </svg> </div>`;
						document.querySelector("product-page .shopify-payment-button__button").addEventListener("click", () => {
							document.querySelector("product-page .shopify-payment-button__button .loading-spinner").classList.add("active");
						});
						observer.disconnect();
					}, 500);
				}
			}
		}
	}
}

customElements.define("product-page", ProductPage);

class ProductPageSlider extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = "<slot></slot>";

		window.addEventListener("load", () => {
			this.loadSlider();
		});

		if (document.querySelector(".product-page__hidden-variants .selector-wrapper select")) {
			document.querySelectorAll(".product-page__hidden-variants .selector-wrapper select").forEach((select) => {
				select.addEventListener("change", () => {
					this.loadSlider();
				});
			});
		}
	}

	loadSlider() {
		let slidesContainer = this.querySelector(".product-page-slider__slides-container");
		let slide = this.querySelector(".slide");
		let item = this.querySelector(".item");
		let items = this.querySelectorAll(".item");
		let prev = this.querySelector(".prev");
		let next = this.querySelector(".next");
		let maxSliderScroll;
		let itemsDisplayed;
		let itemWidth;
		let itemHeight;
		let itemsFound;
		let actualTranslate;
		let newTranslate;
		let step;

		loadIndicators();
		let indicators = this.querySelectorAll(".product-page-slider__indicators span");
		let thumbnails = this.querySelectorAll(".product-page-slider__thumbnails .thumbnail");
		thumbnails[0].classList.add("active");
		thumbnails.forEach((thumbnail, index) => {
			thumbnail.setAttribute("data-slide-to", index);
		});

		travelToItem(indicators, ".product-page-slider__indicators span", ".product-page-slider__thumbnails .thumbnail");
		travelToItem(thumbnails, ".product-page-slider__thumbnails .thumbnail", ".product-page-slider__indicators span");

		setMaxScroll();

		function loadIndicators() {
			items.forEach((item, index) => {
				let indicatorsContainer = document.querySelector(".product-page-slider__indicators");

				if (index === 0) {
					indicatorsContainer.innerHTML += `<span data-slide-to="${index}" class="active"></span>`;
				} else {
					indicatorsContainer.innerHTML += `<span data-slide-to="${index}"></span>`;
				}
			});

			items[0].classList.add("active");
		}

		function pushActiveClass(className, direction) {
			let activeELement = document.querySelector(`${className}.active`);

			if (direction === "next" && activeELement.nextElementSibling) {
				activeELement.classList.remove("active");
				activeELement.nextElementSibling.classList.add("active");
			} else if (direction === "prev" && activeELement.previousElementSibling) {
				activeELement.classList.remove("active");
				activeELement.previousElementSibling.classList.add("active");
			}
		}

		function setMaxScroll() {
			itemsDisplayed = getComputedStyle(slidesContainer).getPropertyValue("--slider-items");
			itemsFound = items.length;
			itemWidth = item.offsetWidth;
			itemHeight = item.offsetHeight;
			slide.style.transform = "translateX(0px)";
			prev.style.visibility = "hidden";

			if (itemsFound >= itemsDisplayed) {
				maxSliderScroll = -itemWidth * (itemsFound - itemsDisplayed);
				if (itemsFound > itemsDisplayed) {
					next.style.visibility = "visible";
				}
				slide.style.justifyContent = "flex-start";
			} else {
				maxSliderScroll = -itemWidth * itemsFound;
				slide.style.justifyContent = "center";
				next.style.visibility = "hidden";
			}
		}

		function getTranslateX(type) {
			actualTranslate = parseInt(slide.style.transform == "translateX(0px)" ? 0 : slide.style.transform.match(/[-]{0,1}[\d]*[.]{0,1}[\d]+/g)[0]);
			newTranslate = 0;

			if (type === "next") {
				newTranslate = Math.max(actualTranslate - itemWidth * itemsDisplayed, maxSliderScroll);
			} else if (type === "prev") {
				newTranslate = Math.min(actualTranslate + itemWidth * itemsDisplayed, 0);
			}

			if (newTranslate === 0) {
				prev.style.visibility = "hidden";
			}
			if (newTranslate < 0) {
				prev.style.visibility = "visible";
			}
			if (newTranslate > maxSliderScroll) {
				next.style.visibility = "visible";
			}
			if (newTranslate <= maxSliderScroll) {
				next.style.visibility = "hidden";
			}

			return newTranslate;
		}

		function moveNext() {
			let translateNext = getTranslateX("next");
			slide.style.transform = `translateX(${translateNext}px)`;

			pushActiveClass(".product-page-slider__slides-container .slide .item", "next");
			pushActiveClass(".product-page-slider__indicators span", "next");
			pushActiveClass(".product-page-slider__thumbnails .thumbnail", "next");
		}

		function movePrev() {
			let translatePrev = getTranslateX("prev");
			slide.style.transform = `translateX(${translatePrev}px)`;

			pushActiveClass(".product-page-slider__slides-container .slide .item", "prev");
			pushActiveClass(".product-page-slider__indicators span", "prev");
			pushActiveClass(".product-page-slider__thumbnails .thumbnail", "prev");
		}

		function travelToItem(AllItems, actualItem, follower) {
			AllItems.forEach((item) => {
				item.addEventListener("click", (e) => {
					let activeItem = 0;
					AllItems.forEach((item, index) => {
						if (item.classList.contains("active")) {
							activeItem = index;
							return activeItem;
						}
					});
					let slideTo = AllItems === indicators ? parseInt(e.target.dataset.slideTo) : parseInt(item.getAttribute("data-slide-to"));
					step = activeItem - slideTo;

					document.querySelector(`${actualItem}.active`).classList.remove("active");

					for (let i = 0; i < Math.abs(step); i++) {
						if (step < 0) {
							let translateNext = getTranslateX("next");
							slide.style.transform = `translateX(${translateNext}px)`;

							pushActiveClass(".product-page-slider__slides-container .slide .item", "next");
							pushActiveClass(`${follower}`, "next");
						} else if (step > 0) {
							let translatePrev = getTranslateX("prev");
							slide.style.transform = `translateX(${translatePrev}px)`;

							pushActiveClass(".product-page-slider__slides-container .slide .item", "prev");
							pushActiveClass(`${follower}`, "prev");
						}
					}

					item.classList.add("active");
				});
			});
		}

		window.addEventListener("resize", setMaxScroll);
		next.addEventListener("click", moveNext);
		prev.addEventListener("click", movePrev);

		if (document.querySelector(".product-page__hidden-variants .selector-wrapper select")) {
			document.querySelectorAll(".product-page__hidden-variants .selector-wrapper select").forEach((select) => {
				select.addEventListener("change", () => {
					next.removeEventListener("click", moveNext);
					prev.removeEventListener("click", movePrev);
				});
			});
		}
	}
}

customElements.define("product-page-slider", ProductPageSlider);
