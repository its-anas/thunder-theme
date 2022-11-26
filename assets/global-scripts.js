let mediaQueries = [window.matchMedia("screen and (max-width: 750px)"), window.matchMedia("screen and (min-width: 751px) and (max-width: 1024px)"), window.matchMedia("screen and (min-width: 1025px)")];
let domainName = window.location.hostname;
let actualDate = new Date().getTime();

function handleize(text) {
	return text
		.toString()
		.toLowerCase()
		.replace(/\s+/g, "-")
		.replace(/[^\w\-]+/g, "")
		.replace(/\-\-+/g, "-")
		.replace(/^-+/, "")
		.replace(/-+$/, "");
}

// ANCHOR: Shop the look
// UNFINISHED: Make product/feature box show up on theme editor select and add
let icons = document.querySelectorAll(".shop-the-look__icon");

document.addEventListener("click", (event) => {
	icons.forEach((icon) => {
		if (!icon.contains(event.target)) {
			handleUnselectedIcon(icon);
		} else if (icon.contains(event.target)) {
			handleSelectedIcon(icon);
		}
	});
});

function handleUnselectedIcon(icon) {
	icon.classList.remove("shop-the-look__icon-rotate");
	if (icon.nextElementSibling) {
		icon.nextElementSibling.classList.remove("clicked");
	}
}

function handleSelectedIcon(icon) {
	if (!icon.classList.contains("shop-the-look__icon-rotate")) {
		icons.forEach((i) => {
			i.classList.remove("shop-the-look__icon-rotate");
			if (i.nextElementSibling) {
				i.nextElementSibling.classList.remove("clicked");
			}
		});
		icon.classList.add("shop-the-look__icon-rotate");
		if (icon.nextElementSibling) {
			icon.nextElementSibling.classList.add("clicked");
		}
	} else {
		icon.classList.remove("shop-the-look__icon-rotate");
		if (icon.nextElementSibling) {
			icon.nextElementSibling.classList.remove("clicked");
		}
	}
}

// ANCHOR: lock page
function lockPage() {
	document.querySelector("html").classList.add("lock");
	document.querySelector(".theme-overlay").classList.remove("hidden");
}

function unlockPage() {
	document.querySelector("html").classList.remove("lock");
	document.querySelector(".theme-overlay").classList.add("hidden");
}

// ANCHOR: Search drawer

let searchDrawer = document.querySelector(".search-drawer");

window.addEventListener("load", () => {
	document.querySelector(".search-drawer").style.height = `calc(100% - ${document.querySelector(".header-section").offsetHeight}px + 8px)`;
});

window.addEventListener("resize", () => {
	document.querySelector(".search-drawer").style.height = `calc(100% - ${document.querySelector(".header-section").offsetHeight}px + 8px)`;
});

function sendToCart(itemId, quantity) {
	// if (document.querySelector("#add-to-cart-button")) {
	// 	document.querySelector("#add-to-cart-button").classList.add("loading");
	// }

	let variantId = parseInt(itemId);

	let formData = {
		items: [
			{
				id: variantId,
				quantity: quantity,
			},
		],
	};

	fetch(window.Shopify.routes.root + "cart/add.js", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(formData),
	})
		.then((response) => {
			if (cartType === "drawer") {
				showDrawer();
			} else {
				window.location.assign(window.Shopify.routes.root + "cart").then(() => {
					window.location.reload();
				});
			}
			return response.json();
		})
		.catch((error) => {
			console.error("Error:", error);
		});
}

function showDrawer() {
	updateCartDrawer()
		.then(() => {
			setCartState().then(() => {
				if (document.querySelector("cart-component").classList.contains("hidden")) {
					injectCartDrawerRecommendedProducts();
					lockPage();
				}

				document.querySelector("cart-component").classList.remove("hidden");
				document.querySelector("cart-component").classList.add("active");
			});
		})
		.then(() => {
			// if (document.querySelector("#add-to-cart-button")) {
			// 	document.querySelector("#add-to-cart-button").classList.remove("loading");
			// 	document.querySelector("#add-to-cart-button").classList.add("finished");
			// }
		});
}

async function updateCartDrawer() {
	await fetch("/cart.js")
		.then((resp) => resp.json())
		.then((data) => {
			setCartState();
			let itemList = [];
			document.getElementById("header__icons-cart__item-count").innerHTML = data.item_count;
			document.querySelector(".cart-drawer__products-list").innerHTML = "";
			data.items.forEach((item) => {
				let variantTitle = item.variant_title !== null ? `<p class="product-variant">${item.variant_title}</p>` : "";
				itemList.push(`
					<div class="cart-drawer__product" data-variant="${item.variant_id}">
						<a href="${item.url}" class="cart-drawer__product__image">
						<img
						srcset="${item.featured_image.url}"
						loading="lazy"
						alt="${item.featured_image.alt}"
						width="${item.featured_image.width}"
						height="${item.featured_image.height}"
						class="full"
						>
						</a>
						<div class="cart-drawer__product__details-middle">
						<a href="${item.url}" class="product-name">${item.product_title}</a>
						<div class="product-variants">
						${variantTitle}
						</div>
						<div class="quantity">
						<quantity-field class="quantity">
							<div class="quantity-field cart" id="quantity-field">
							<button type="button" class="quantity-field__minus" id="quantity-field__minus">-</button>
							<input
							type="quantity"
							class="quantity-field__input"
							id="quantity-field__input"
							name="quantity"
							min="1"
							value="${item.quantity}"
							data-variant-id="${item.variant_id}"
							>
							<button type="button" class="quantity-field__plus" id="quantity-field__plus">+</button>
							</div>
						</quantity-field>
						</div>
						</div>
						<div class="cart-drawer__product__details-side" data-variant-id="${item.variant_id}">
						<p class="price--actual">${formatMoney(item.final_line_price)}</p>
						<a class="remove">
						<svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M8.71678 7.78444V18.6032L17.0342 18.6137V7.7832M8.71678 7.78444H6.21533M8.71678 7.78444H11.0416L13.0369 7.7832L17.0342 7.7832M17.0342 7.7832H19.5292" stroke="white"/>
							<path d="M9.53809 6.79688H16.2578" stroke="white"/>
							<path d="M14.3414 16.6045L14.3414 9.88672M11.3965 16.6045L11.3965 9.88672" stroke="white"/>
						</svg>
						</a>
						</div>
						</div>`);
			});
			itemList.forEach((item) => {
				document.querySelector(".cart-drawer__products-list").innerHTML += item;
			});
			document.querySelectorAll(".cart-drawer__interaction .cart-drawer__interaction--filled .buttons .button").forEach((button, index) => {
				let buttonText = button.innerHTML.includes("- ") ? button.innerHTML.split("- ")[0] : button.innerHTML;
				if (index === 0) {
					button.innerHTML = `${buttonText} - ${data.item_count} ITEMS`;
				} else if (index === 1) {
					button.innerHTML = `${buttonText} - ${formatMoney(data.total_price)}`;
				}
			});
			document.querySelectorAll(".cart-drawer__product__details-side .remove").forEach((icon) => {
				let variantId = icon.parentNode.getAttribute("data-variant-id");
				icon.addEventListener("click", () => {
					updateCartQuantity(variantId, 0).then(updateCartDrawer);
					setCartState();
				});
			});
			document.querySelectorAll(".quantity-field.cart").forEach((field) => {
				field.addEventListener("click", () => {
					let input = field.querySelector("input");
					let variantId = input.getAttribute("data-variant-id");
					let quantity = input.value;

					updateCartQuantity(variantId, quantity).then(updateCartDrawer);
				});
			});
		});
}

async function setCartState() {
	await fetch("/cart.js")
		.then((resp) => resp.json())
		.then((data) => {
			let cartItemsCount = data.items.length;
			if (cartItemsCount === 0) {
				if (document.querySelector(".recommended-products.desktop-only")) {
					document.querySelector(".recommended-products.desktop-only").classList.remove("active");
				}
				document.querySelector(".cart-drawer__products").classList.remove("show");
				document.querySelector(".cart-drawer__products").classList.add("hide");
				document.querySelector(".cart-drawer__interaction--filled").classList.remove("show");
				document.querySelector(".cart-drawer__interaction--filled").classList.add("hide");
				document.querySelector(".free-shipping-reminder").classList.remove("show");
				document.querySelector(".free-shipping-reminder").classList.add("hide");

				document.querySelector(".cart-drawer__interaction--empty").classList.remove("hide");
				document.querySelector(".cart-drawer__interaction--empty").classList.add("show");

				updateFreeShippingBar(data.total_price);
			} else if (cartItemsCount > 0) {
				updateFreeShippingBar(data.total_price);

				document.querySelector(".cart-drawer__interaction--empty").classList.remove("show");
				document.querySelector(".cart-drawer__interaction--empty").classList.add("hide");

				document.querySelector(".cart-drawer__products").classList.remove("hide");
				document.querySelector(".cart-drawer__products").classList.add("show");
				document.querySelector(".cart-drawer__interaction--filled").classList.remove("hide");
				document.querySelector(".cart-drawer__interaction--filled").classList.add("show");
				document.querySelector(".free-shipping-reminder").classList.remove("hide");
				document.querySelector(".free-shipping-reminder").classList.add("show");
			}
		});
}

async function updateCartQuantity(variantId, qty) {
	let variant = variantId.toString();

	let data = {
		id: variant,
		quantity: qty,
	};

	await fetch(window.Shopify.routes.root + "cart/change.js", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
	})
		.then((response) => {
			return response.json();
		})

		.catch((error) => {
			console.error("Error:", error);
		});
}

function updateFreeShippingBar(cartAmount) {
	let firstMessage = `Spend ${formatMoney(freeShippingThreshold - cartAmount)} more and get free shipping`;
	let secondMessage = `Congratulations! You have qualified for free shipping`;

	let freeShippingMessage = cartAmount < freeShippingThreshold ? firstMessage : secondMessage;

	let barCssClass = cartAmount < freeShippingThreshold ? "not-enough" : "";

	let barLoadingPercentage = (cartAmount / freeShippingThreshold) * 100;

	let barCssWidth = barLoadingPercentage > 100 ? "100%" : `${barLoadingPercentage}%`;

	if (document.querySelector(".free-shipping-reminder")) {
		document.querySelector(".free-shipping-reminder").innerHTML = `        
		<style>
		.free-shipping-reminder__bar__inside {
			width: ${barCssWidth};
		}
		</style>

		<p class="free-shipping-reminder__text">
			${freeShippingMessage}
		</p>

		<div class="free-shipping-reminder__bar">
			<div class="free-shipping-reminder__bar__inside ${barCssClass}" > </div>
		</div>
	`;
	}
}

function injectCartDrawerRecommendedProducts() {
	fetch("/cart.js")
		.then((resp) => resp.json())
		.then((data) => {
			// UNFINISHED:
			addCartRecommendedProducts(data.items);

			// UNFINISHED: show and hide recommended products container on mobile too
		});
}

const targetNode = document.querySelector(".recommended-products.desktop-only");
const config = { childList: true, subtree: true };
const observer = new MutationObserver(callback);
observer.observe(targetNode, config);

function callback(mutationList, observer) {
	for (const mutation of mutationList) {
		if (mutation.addedNodes.length > 0) {
			if (document.querySelector(".recommended-products.desktop-only")) {
				document.querySelector(".recommended-products.desktop-only").classList.add("active");
			}
		}
	}
}

function addCartRecommendedProducts(cartProducts) {
	let recommendedProducts = [];

	cartProducts.forEach((cartProduct) => {
		fetch(window.Shopify.routes.root + `recommendations/products.json?product_id=${cartProduct.product_id}&limit=5&intent=related`)
			.then((response) => response.json())
			.then(({ products }) => {
				if (products) {
					if (products.length > 0) {
						products.forEach((product) => {
							const index = recommendedProducts.findIndex((object) => object.id === product.id);

							if (index === -1) {
								recommendedProducts.push(product);
							}
						});
						document.querySelector(".recommended-products.desktop-only .recommended-products__list-container").innerHTML = "";
						document.querySelector(".recommended-products.mobile-only .recommended-products__list-container").innerHTML = "";

						recommendedProducts.forEach((product) => {
							let variant_first_id = parseInt(product.variants[0].id);

							if (!cartProducts.some((cartProduct) => cartProduct.variant_id === variant_first_id)) {
								let handle = product.handle;
								let variants_size = parseInt(product.variants.length);
								let productWithVariants = variants_size > 1 ? "with" : "without";
								let quickAddButtonText = variants_size > 1 ? "Quick view" : "Add to Cart";

								document.querySelector(".recommended-products.desktop-only .recommended-products__list-container").innerHTML += `
									<div class="recommended-product">
										<div class="recommended-product__image media">
											<img
												srcset="${product.media[0].src}"
												alt="${product.media[0].alt}"
												width="${product.media[0].width}"
												height="${product.media[0].height}"
												class="fit"
											>
										</div>
										<div class="recommended-product__details">
										<div class="details">
											<p class="product-name">${product.title}...</p>
											<p class="price--actual">${formatMoney(product.price)}</p>
										</div>
										<quick-view-button>
										<div
											class="button--link"
											id="quick-add-button"
											data-first-available-variant-id="${variant_first_id}"
											data-product-handle="${handle}"
											data-product-variants="${productWithVariants}"
										>
											${quickAddButtonText}
										</div>
										</quick-view-button>
										</div>
									</div>
								`;
								document.querySelector(".recommended-products.mobile-only .recommended-products__list-container").innerHTML += `
									<div class="recommended-product">
										<div class="recommended-product__image media">
											<img
												srcset="${product.media[0].src}"
												alt="${product.media[0].alt}"
												width="${product.media[0].width}"
												height="${product.media[0].height}"
												class="fit"
											>
										</div>
										<div class="recommended-product__details">
											<p class="product-name">${product.title}...</p>
											<p class="price--actual">${formatMoney(product.price)}</p>
										<quick-view-button>
										<div
											class="button--link"
											id="quick-add-button"
											data-first-available-variant-id="${variant_first_id}"
											data-product-handle="${handle}"
											data-product-variants="${productWithVariants}"
										>
											${quickAddButtonText}
										</div>
										</quick-view-button>
									</div>
								`;
							}
						});
					}
				}
			});
	});
}

// ANCHOR: Predictive search

class PredictiveSearch extends HTMLElement {
	constructor() {
		super();

		this.input = this.querySelector('input[type="search"]');
		this.icon = this.querySelector(".search-section__icon");
		this.predictiveSearchResults = this.querySelector("#predictive-search");

		this.input.addEventListener(
			"input",
			this.debounce((event) => {
				this.onChange(event);
			}, 300).bind(this)
		);

		if (this.icon !== null) {
			this.icon.addEventListener("click", () => {
				window.location.href = "/search?q=" + this.input.value;
			});
		}
	}

	onChange() {
		const searchTerm = this.input.value.trim();
		if (!searchTerm.length) {
			this.close();
			return;
		}

		this.getSearchResults(searchTerm);
	}

	getSearchResults(searchTerm) {
		fetch(`/search/suggest?q=${searchTerm}&resources[type]=product&resources[limit]=8&section_id=predictive-search`)
			.then((response) => {
				if (!response.ok) {
					var error = new Error(response.status);
					this.close();
					throw error;
				}

				return response.text();
			})
			.then((text) => {
				const resultsMarkup = new DOMParser().parseFromString(text, "text/html").querySelector("#shopify-section-predictive-search").innerHTML;
				this.predictiveSearchResults.innerHTML = resultsMarkup;
				this.open();
			})
			.catch((error) => {
				this.close();
				throw error;
			});
	}

	open() {
		this.querySelector(".search-section__results").classList.remove("hidden");
	}

	close() {
		this.querySelector(".search-section__results").classList.add("hidden");
	}

	debounce(fn, wait) {
		let t;
		return (...args) => {
			clearTimeout(t);
			t = setTimeout(() => fn.apply(this, args), wait);
		};
	}
}

customElements.define("predictive-search", PredictiveSearch);

// ANCHOR: Search drawer
class SearchDrawer extends PredictiveSearch {
	constructor() {
		super();

		this.searchDrawer = this.querySelector(".search-drawer");
		this.closeIcon = this.searchDrawer.querySelector(".search-section__close");
		this.inputField = this.searchDrawer.querySelector(".search-section__input");

		this.decideDrawerAction();
	}

	showSearchDrawer() {
		this.searchDrawer.classList.remove("hidden");
		this.searchDrawer.classList.add("active");
		lockPage();
	}

	hideSearchDrawer() {
		unlockPage();

		this.searchDrawer.classList.remove("active");
		this.searchDrawer.classList.add("hidden");
	}

	resetSearch() {
		this.inputField.value = "";
		this.searchDrawer.querySelector(".search-section__results").classList.add("hidden");
	}

	decideDrawerAction() {
		document.addEventListener("click", (event) => {
			if ((this.searchDrawer.classList.contains("active") && document.querySelector(".header__icons-cart ").contains(event.target)) || (this.searchDrawer.classList.contains("active") && document.querySelector(".header__icons-drawer").contains(event.target))) {
				this.searchDrawer.classList.remove("active");
				this.searchDrawer.classList.add("hidden");
			}
		});

		document.querySelector("#header__search-icon").addEventListener("click", () => {
			if (this.searchDrawer.classList.contains("hidden")) {
				this.showSearchDrawer();
			} else if (this.searchDrawer.classList.contains("active")) {
				this.hideSearchDrawer();
			}
		});

		document.querySelector(".theme-overlay").addEventListener("click", () => {
			if (this.searchDrawer.classList.contains("active")) {
				this.hideSearchDrawer();
				this.resetSearch();
			}
		});

		this.closeIcon.addEventListener("click", () => {
			this.hideSearchDrawer();
			this.resetSearch();
		});

		if (this.inputField) {
			this.inputField.addEventListener("input", (event) => {
				if (this.searchDrawer.querySelector(".preload")) {
					if (event.target.value.length > 0) {
						this.searchDrawer.querySelector(".preload").classList.add("hidden");
					} else {
						this.searchDrawer.querySelector(".preload").classList.remove("hidden");
					}
				}
			});
		}

		if (Shopify.designMode) {
			document.addEventListener("shopify:section:load", (event) => {
				event.target.classList.forEach((i) => {
					if (i === "section-search-drawer") {
						this.searchDrawer.style.height = `calc(100% - ${document.querySelector(".header-section").offsetHeight}px + 8px)`;
						this.showSearchDrawer();
					}
				});
			});

			document.addEventListener("shopify:section:select", (event) => {
				event.target.classList.forEach((i) => {
					if (i === "section-search-drawer") {
						this.searchDrawer.style.height = `calc(100% - ${document.querySelector(".header-section").offsetHeight}px + 8px)`;
						this.showSearchDrawer();
					}
				});
			});

			document.addEventListener("shopify:section:deselect", (event) => {
				event.target.classList.forEach((i) => {
					if (i === "section-search-drawer") {
						this.hideSearchDrawer();
					}
				});
			});
		}
	}
}

customElements.define("search-drawer", SearchDrawer);

// ANCHOR: Dynamic buy now button
// document.querySelector(".dynamic-buy-button").addEventListener("click", () => {
// 	document.querySelector(".product-page__buttons .shopify-payment-button__button").classList.add("loading");
// });

// document.addEventListener("click", (e) => {
// 	if (document.querySelector(".product-page__buttons #add-to-cart-button.finished")) {
// 		if (!e.target.classList.contains("add-to-cart-button")) {
// 			document.querySelector(".product-page__buttons #add-to-cart-button").classList.remove("finished");
// 		}
// 	}
// });

// ANCHOR: Countdown timer

class CountdownTimer extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = "<slot></slot>";
	}
	connectedCallback() {
		this.loadCountdown();
	}
	loadCountdown() {
		const countdownType = this.getAttribute("countdown-type");
		const timeInDate = this.getAttribute("time-in-date");
		const timeInMinutes = Number(this.getAttribute("time-in-minutes"));
		const afterExpirationTimeOnly = this.getAttribute("after-expiration");
		const id = this.getAttribute("section-id");
		const cookieName = this.getAttribute("cookie-name");

		function initializeClock(endTime) {
			const clock = document.querySelector(`#${id}`);
			const daysSpan = clock.querySelector(".days");
			const hoursSpan = clock.querySelector(".hours");
			const minutesSpan = clock.querySelector(".minutes");
			const secondsSpan = clock.querySelector(".seconds");

			const timeInterval = setInterval(updateClock, 1000);
			function updateClock() {
				function getTimeRemaining(endTime) {
					const total = Date.parse(endTime) - Date.parse(new Date());
					const days = Math.floor(total / (1000 * 60 * 60 * 24));
					const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
					const minutes = Math.floor((total / 1000 / 60) % 60);
					const seconds = Math.floor((total / 1000) % 60);
					return {
						total,
						days,
						hours,
						minutes,
						seconds,
					};
				}
				const t = getTimeRemaining(endTime);
				daysSpan.innerHTML = t.days < 100 ? ("0" + t.days).slice(-2) : t.days;
				hoursSpan.innerHTML = ("0" + t.hours).slice(-2);
				minutesSpan.innerHTML = ("0" + t.minutes).slice(-2);
				secondsSpan.innerHTML = ("0" + t.seconds).slice(-2);

				if (t.total >= 0) {
					clock.querySelector(".countdown-timer__timers").classList.add("shown");
					clock.querySelector(".countdown-timer__message").classList.add("hidden");
				}

				if (t.total <= 0) {
					clearInterval(timeInterval);

					if (afterExpirationTimeOnly === "showMessage") {
						clock.querySelector(".countdown-timer__timers").classList.remove("shown");
						clock.querySelector(".countdown-timer__message").classList.remove("hidden");
					}
				}
			}
			updateClock();
		}

		if (countdownType === "date") {
			let deadline = timeInDate;
			initializeClock(deadline);
		} else if (countdownType === "time") {
			let deadline = document.cookie
				.split("; ")
				.find((row) => row.startsWith(cookieName + "="))
				?.split("=")[1];
			function saveCookie() {
				const currentTime = Date.parse(new Date());
				deadline = new Date(timeInMinutes * 60 * 1000 + currentTime);
				document.cookie = cookieName + "=" + deadline + "; expires=" + deadline + "; path=/; domain=." + domainName;
			}

			if (document.cookie && deadline) {
				if (Date.parse(deadline) - Date.parse(new Date()) < 0) {
					if (afterExpirationTimeOnly === "repeatCountdown") {
						saveCookie();
					}
				}
			} else {
				saveCookie();
			}
			initializeClock(deadline);
		}
	}
}

customElements.define("countdown-timer", CountdownTimer);

// ANCHOR: Slider component

class SliderComponent extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = "<slot></slot>";
		this.loadSlider();
	}

	loadSlider() {
		let slidesContainer = this.querySelector(".slides-container");
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
		let isDragging = false;
		let startPos = 0;
		let actual = 0;
		let nextTranslate = 0;
		let maxNext = 0;
		let maxPrev = 0;
		let currentTranslate = 0;
		let currentPosition = 0;

		function setMaxScroll() {
			itemsDisplayed = getComputedStyle(slidesContainer).getPropertyValue("--slider-items");
			itemsFound = items.length;
			itemWidth = item.offsetWidth;
			itemHeight = item.offsetHeight;
			slide.style.transform = "translateX(0px)";
			prev.style.visibility = "hidden";
			prev.style.height = itemHeight + "px";
			next.style.height = itemHeight + "px";

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
		setMaxScroll();

		function getTranslateX(type) {
			let actualTranslate = parseInt(slide.style.transform == "translateX(0px)" ? 0 : slide.style.transform.match(/[-]{0,1}[\d]*[.]{0,1}[\d]+/g)[0]);
			let newTranslate = 0;

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
		}

		function movePrev() {
			let translatePrev = getTranslateX("prev");
			slide.style.transform = `translateX(${translatePrev}px)`;
		}

		function touchStart() {
			return function (event) {
				isDragging = true;
				startPos = event.touches[0].clientX;
				actual = parseInt(slide.style.transform == "translateX(0px)" ? 0 : slide.style.transform.match(/[-]{0,1}[\d]*[.]{0,1}[\d]+/g)[0]);
				maxNext = getTranslateX("next");
				maxPrev = getTranslateX("prev");
			};
		}

		function touchMove(event) {
			if (isDragging) {
				currentPosition = event.touches[0].clientX;
				currentTranslate = actual + currentPosition - startPos;
				nextTranslate = currentPosition > startPos ? maxPrev : maxNext;
				let movement = currentPosition - startPos;
				if (movement > 50 || movement < -50) {
					slide.style.transform = `translateX(${nextTranslate}px)`;
				}

				actualTranslate = parseInt(slide.style.transform == "translateX(0px)" ? 0 : slide.style.transform.match(/[-]{0,1}[\d]*[.]{0,1}[\d]+/g)[0]);
				newTranslate = 0;

				if (movement > 50) {
					newTranslate = Math.max(actualTranslate - itemWidth * itemsDisplayed, maxSliderScroll);
				} else if (movement < -50) {
					newTranslate = Math.min(actualTranslate + itemWidth * itemsDisplayed, 0);
				}

				if (actualTranslate === 0) {
					prev.style.visibility = "hidden";
				}
				if (actualTranslate < 0) {
					prev.style.visibility = "visible";
				}
				if (actualTranslate > maxSliderScroll) {
					next.style.visibility = "visible";
				}
				if (actualTranslate <= maxSliderScroll) {
					next.style.visibility = "hidden";
				}
			}
		}

		window.addEventListener("resize", setMaxScroll);
		next.addEventListener("click", moveNext);
		prev.addEventListener("click", movePrev);

		items.forEach((slide) => {
			slide.addEventListener("touchstart", touchStart());
			slide.addEventListener("touchmove", touchMove);
		});
	}
}

customElements.define("slider-component", SliderComponent);

// ANCHOR: Menu drawer

let extraPadding = document.querySelector(".header-section").classList.contains("boxed") ? 15 : 0;
let announcementHeight = document.querySelector(".announcement") ? document.querySelector(".announcement").offsetHeight : 0;
let allChildHeights = [];
let menuChildContainer = document.querySelectorAll(".menu__childs");
let height = 0;
let margin = 32;

function setDropdownPadding() {
	document.querySelectorAll(".menu__dropdown-wrapper").forEach((dropdown) => {
		dropdown.style.paddingTop = `calc(${announcementHeight}px + ${extraPadding}px)`;
	});

	document.querySelectorAll(".menu__grandchilds").forEach((grandchild) => {
		height = grandchild.offsetHeight;
		allChildHeights.push(height);
		grandchild.style.height = "100%";
	});

	menuChildContainer.forEach((ChildContainer) => {
		allChildHeights.push(ChildContainer.offsetHeight);
		ChildContainer.style.height = `${Math.max.apply(Math, allChildHeights) + margin}px`;
		ChildContainer.style.minHeight = "300px";
	});
}

window.addEventListener("load", () => {
	setDropdownPadding();
});

window.addEventListener("resize", () => {
	setDropdownPadding();
});

if (Shopify.designMode) {
	document.addEventListener("shopify:section:load", (event) => {
		setDropdownPadding();
	});

	document.addEventListener("shopify:section:select", (event) => {
		setDropdownPadding();
	});

	document.addEventListener("shopify:section:deselect", (event) => {
		setDropdownPadding();
	});
}

class MenuDrawerComponent extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = "<slot></slot>";
		this.decideDrawerAction();
	}

	showDrawer() {
		this.classList.remove("hidden");
		this.classList.add("active");
		lockPage();
	}

	hideDrawer() {
		unlockPage();

		this.classList.remove("active");
		this.classList.add("hidden");
	}

	decideDrawerAction() {
		this.closeIcon = this.querySelector("#close-icon");
		this.header = document.querySelector(".header-section");

		let extraPadding = this.header.classList.contains("boxed") ? 8 : 0;

		window.addEventListener("load", () => {
			this.style.height = `calc(100% - ${document.querySelector(".header-section").offsetHeight}px + ${extraPadding}px)`;
		});

		window.addEventListener("resize", () => {
			this.style.height = `calc(100% - ${document.querySelector(".header-section").offsetHeight}px + ${extraPadding}px)`;
		});

		document.addEventListener("click", (event) => {
			if ((this.classList.contains("active") && document.querySelector(".header__icons-cart ").contains(event.target)) || (this.classList.contains("active") && document.querySelector(".header__icons-search").contains(event.target))) {
				this.classList.remove("active");
				this.classList.add("hidden");
			}
		});

		document.querySelector(".header__icons-drawer").addEventListener("click", () => {
			if (this.classList.contains("hidden")) {
				this.showDrawer();
			} else if (this.classList.contains("active")) {
				this.hideDrawer();
			}
		});

		document.querySelector(".theme-overlay").addEventListener("click", () => {
			if (this.classList.contains("active")) {
				this.hideDrawer();
			}
		});

		this.closeIcon.addEventListener("click", () => {
			this.hideDrawer();
		});

		if (Shopify.designMode) {
			document.addEventListener("shopify:section:load", (event) => {
				event.target.classList.forEach((i) => {
					this.style.height = `calc(100% - ${document.querySelector(".header-section").offsetHeight}px + 8px)`;
					if (i === "section-header") {
						this.showDrawer();
					}
				});
			});

			document.addEventListener("shopify:section:select", (event) => {
				event.target.classList.forEach((i) => {
					this.style.height = `calc(100% - ${document.querySelector(".header-section").offsetHeight}px + 8px)`;
					if (i === "section-header") {
						this.showDrawer();
					}
				});
			});

			document.addEventListener("shopify:section:deselect", (event) => {
				event.target.classList.forEach((i) => {
					if (i === "section-header") {
						this.hideDrawer();
					}
				});
			});
		}
	}
}

customElements.define("menu-drawer-component", MenuDrawerComponent);

// ANCHOR:  Menu mobile
class MenuMobile extends HTMLElement {
	constructor() {
		super();
	}
	connectedCallback() {
		this.showHide();
	}
	showHide() {
		this.querySelectorAll(".menu-mobile__parent").forEach((parent) => {
			let childsHeight = parent.querySelector(".menu-mobile__parent-childs").scrollHeight;

			parent.querySelector(".menu-mobile__parent-title").addEventListener("click", () => {
				if (!parent.querySelector(".menu-mobile__parent-childs").classList.contains("active")) {
					parent.querySelector(".menu-mobile__parent-childs").style.height = `${childsHeight}px`;
					parent.querySelector(".menu-mobile__parent-childs").classList.add("active");
				} else {
					parent.querySelector(".menu-mobile__parent-childs").style.height = "0px";
					parent.querySelector(".menu-mobile__parent-childs").classList.remove("active");
				}
			});

			parent.querySelectorAll(".menu-mobile__child").forEach((child) => {
				let grandchildsHeight = child.querySelector(".menu-mobile__child-childs").scrollHeight;
				child.querySelector(".menu-mobile__child-title").addEventListener("click", () => {
					if (!child.querySelector(".menu-mobile__child-childs").classList.contains("active")) {
						parent.querySelector(".menu-mobile__parent-childs").style.height = `${childsHeight + grandchildsHeight}px`;
						child.querySelector(".menu-mobile__child-childs").style.height = `${grandchildsHeight}px`;
						child.querySelector(".menu-mobile__child-childs").classList.add("active");
					} else {
						parent.querySelector(".menu-mobile__parent-childs").style.height = `${childsHeight}px`;
						child.querySelector(".menu-mobile__child-childs").style.height = "0px";
						child.querySelector(".menu-mobile__child-childs").classList.remove("active");
					}
				});
			});
		});
	}
}

customElements.define("menu-mobile", MenuMobile);

// ANCHOR: Quantity field

class QuantityField extends HTMLElement {
	constructor() {
		super();
	}
	connectedCallback() {
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = "<slot></slot>";
		this.quantityField();
	}
	quantityField() {
		let quantityField = this.querySelector("#quantity-field");
		let quantityFieldInput = quantityField.querySelector("#quantity-field__input");
		let quantityFieldPlus = quantityField.querySelector("#quantity-field__plus");
		let quantityFieldMinus = quantityField.querySelector("#quantity-field__minus");

		quantityFieldPlus.addEventListener("click", () => {
			quantityFieldInput.value = parseInt(quantityFieldInput.value) + 1;
		});

		quantityFieldMinus.addEventListener("click", () => {
			if (parseInt(quantityFieldInput.value) > 1) {
				quantityFieldInput.value = parseInt(quantityFieldInput.value) - 1;
			}
		});
	}
}

customElements.define("quantity-field", QuantityField);

// ANCHOR: Cart drawer

document.addEventListener("click", (event) => {
	if (document.querySelector(".cart-drawer__interaction a.order-note").contains(event.target)) {
		document.querySelector(".cart-drawer__note-popup").classList.remove("fade");
		document.querySelector(".cart-drawer__note-popup").classList.add("reveal");
	} else if ((!document.querySelector(".cart-drawer__note-popup").contains(event.target) && document.querySelector(".cart-drawer__note-popup").classList.contains("reveal")) || document.querySelector(".cart-drawer__note-popup #note-close-icon").contains(event.target)) {
		document.querySelector(".cart-drawer__note-popup").classList.remove("reveal");
		document.querySelector(".cart-drawer__note-popup").classList.add("fade");
	}
	if (document.querySelector(".cart-drawer__note-popup__content #cart-note-send").contains(event.target)) {
		let noteContent = document.querySelector("#cart-note").value;
		let noteMessage = {
			note: noteContent,
		};

		fetch(window.Shopify.routes.root + "cart/update.js", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(noteMessage),
		})
			.then((response) => {
				document.querySelector(".cart-drawer__note-popup").classList.remove("reveal");
				document.querySelector(".cart-drawer__note-popup").classList.add("fade");
				return response.json();
			})
			.catch((error) => {
				console.error("Error:", error);
			});
	}
});

class CartComponent extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = "<slot></slot>";
		this.decideDrawerAction();
	}

	hideDrawer() {
		unlockPage();

		this.classList.remove("active");
		this.classList.add("hidden");

		if (document.querySelector(".recommended-products.desktop-only")) {
			document.querySelector(".recommended-products.desktop-only").classList.remove("active");
		}
	}

	decideDrawerAction() {
		this.closeIcon = this.querySelector("#close-icon");
		this.header = document.querySelector(".header-section");

		let extraPadding = this.header.classList.contains("boxed") ? 8 : 0;

		window.addEventListener("load", () => {
			this.style.height = `calc(100% - ${document.querySelector(".header-section").offsetHeight}px + ${extraPadding}px)`;
		});

		window.addEventListener("resize", () => {
			this.style.height = `calc(100% - ${document.querySelector(".header-section").offsetHeight}px + ${extraPadding}px)`;
		});

		if (document.querySelector(".header__icons-cart").getAttribute("for") === "drawer") {
			document.querySelector(".header__icons-cart").addEventListener("click", () => {
				if (this.classList.contains("hidden")) {
					showDrawer();
				} else if (this.classList.contains("active")) {
					this.hideDrawer();
				}
			});

			document.addEventListener("click", (event) => {
				if ((document.querySelector("cart-component").classList.contains("active") && document.querySelector(".header__icons-search").contains(event.target)) || (document.querySelector("cart-component").classList.contains("active") && document.querySelector(".header__icons-drawer").contains(event.target))) {
					this.classList.remove("active");
					this.classList.add("hidden");

					if (document.querySelector(".recommended-products.desktop-only")) {
						document.querySelector(".recommended-products.desktop-only").classList.remove("active");
					}
				}
			});

			document.querySelector(".theme-overlay").addEventListener("click", () => {
				if (this.classList.contains("active")) {
					this.hideDrawer();
				}
			});

			this.closeIcon.addEventListener("click", () => {
				this.hideDrawer();
			});

			if (Shopify.designMode) {
				document.addEventListener("shopify:section:load", (event) => {
					event.target.classList.forEach((i) => {
						this.style.height = `calc(100% - ${document.querySelector(".header-section").offsetHeight}px + 8px)`;

						if (i === "section-cart-drawer") {
							showDrawer();
						}
					});
				});

				document.addEventListener("shopify:section:select", (event) => {
					event.target.classList.forEach((i) => {
						this.style.height = `calc(100% - ${document.querySelector(".header-section").offsetHeight}px + 8px)`;

						if (i === "section-cart-drawer") {
							showDrawer();
						}
					});
				});

				document.addEventListener("shopify:section:deselect", (event) => {
					event.target.classList.forEach((i) => {
						if (i === "section-cart-drawer") {
							this.hideDrawer();
						}
					});
				});
			}
		}
	}
}

customElements.define("cart-component", CartComponent);

// ANCHOR: Quick view

function fromQuickViewToCart(selectedVariant, quantity) {
	if (document.querySelector("cart-component").classList.contains("hidden")) {
		unlockPage();
	}

	if (document.querySelector("cart-component").classList.contains("active")) {
		document.querySelector(".theme-overlay").classList.remove("higher-layer");
		setTimeout(() => {
			document.querySelector(".header-section").classList.remove("higher-layer");
		}, 500);
	}

	document.querySelector(".quick-view").classList.add("hidden");
	document.querySelector(".quick-view").classList.remove("active");

	sendToCart(selectedVariant, quantity);

	setTimeout(() => {
		document.querySelector("quick-view-component").style.zIndex = -1;
	}, 300);
}

class QuickView extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = "<slot></slot>";

		document.querySelectorAll("#quick-add-button").forEach((icon) => {
			icon.addEventListener("click", () => {
				this.runQuickView(icon);
			});
		});

		this.listenToQuickView();
	}

	showQuickView() {
		document.querySelector("quick-view-component").style.height = `calc(100% - ${document.querySelector(".header-section").offsetHeight}px +  0.5rem)`;
		document.querySelector("quick-view-component").style.marginTop = `calc(${document.querySelector(".header-section").offsetHeight}px -  0.5rem)`;
		let headerSize = document.querySelector(".header-section").offsetHeight;
		let viewportHeight = window.innerHeight;
		let spaceLeft = viewportHeight - headerSize;
		let halfOfSpaceLeft = spaceLeft / 2;
		let newTop = 100 - (halfOfSpaceLeft / viewportHeight) * 100;

		document.querySelector("quick-view-component").style.top = `${newTop}%`;

		lockPage();

		document.querySelector("quick-view-component").style.zIndex = 105;
		document.querySelector(".quick-view").classList.remove("hidden");
		document.querySelector(".quick-view").classList.add("active");
	}

	hideQuickView() {
		unlockPage();

		document.querySelector(".quick-view").classList.add("hidden");
		document.querySelector(".quick-view").classList.remove("active");

		setTimeout(() => {
			document.querySelector("quick-view-component").style.zIndex = -1;
		}, 300);
	}

	runQuickView(icon) {
		if (icon.dataset.productVariants === "without") {
			let variantId = icon.dataset.firstAvailableVariantId;
			sendToCart(variantId, 1);
		} else if (icon.dataset.productVariants === "with") {
			fetch(`/products/${icon.dataset.productHandle}/product.json`)
				.then((resp) => resp.json())
				.then((data) => {
					window.quickViewVariants = data.product.variants;
					let productVendor = data.product.vendor;
					let productTitle = data.product.title;
					let productFeaturedImage = data.product.image;
					let productPrice = data.product.price;
					let productUrl = `/products/${data.product.handle}`;
					let productOptions = {};
					let productVariantsImages = {};

					document.querySelector(".quick-view__image-box").innerHTML = "";
					document.querySelector(".quick-view__options").innerHTML = "";

					data.product.images.forEach((image, index) => {
						if (image.variant_ids.length > 0) {
							let style = index === 0 ? "style='opacity: 1;'" : "";
							productVariantsImages[image.position] = image;
							document.querySelector(".quick-view__image-box").innerHTML += `
							<div class="media">
								<img
									srcset="${image.src}"
									alt="${image.alt}"
									width="${image.width}"
									height="${image.height}"
									id="${image.id}"
									${style}
									class="fit"
								>
							</div>
							`;
						}
					});

					if (data.product.variants.length > 1) {
						data.product.options.forEach((option) => {
							let optionValues = [];
							option.values.forEach((value) => {
								optionValues.push(value);
							});
							productOptions[option.name] = optionValues;
						});
					}

					for (var key in productOptions) {
						document.querySelector(".quick-view__options").innerHTML += `
							<div class="quick-view__radios-container quick-view__radios-container--${key}">
								<p class="quick-view__radio__title">${key}</p>
							</div>
						`;

						if (key !== "Color") {
							if (quickViewVariantSelectorType === "block") {
								document.querySelector(`.quick-view__radios-container--${key}`).innerHTML += `
									<div class="quick-view__radio__content quick-view__radio__content--${key}"></div>
							`;
							} else if (quickViewVariantSelectorType === "dropdown") {
								document.querySelector(`.quick-view__radios-container--${key}`).innerHTML += `
									<select name="${key}"></select>
							`;
							}
						} else if (key === "Color") {
							if (quickViewColorSelectorType === "block" || quickViewColorSelectorType === "variant_image" || quickViewColorSelectorType === "color_swatch") {
								document.querySelector(`.quick-view__radios-container--${key}`).innerHTML += `
									<div class="quick-view__radio__content quick-view__radio__content--${key}"></div>
							`;
							} else if (quickViewColorSelectorType === "dropdown") {
								document.querySelector(`.quick-view__radios-container--${key}`).innerHTML += `
									<select name="${key}"></select>
							`;
							}
						}

						productOptions[key].forEach((value, index) => {
							if (key !== "Color") {
								document.querySelector(`.quick-view__radios-container--${key}`).setAttribute("data-selector-type", quickViewVariantSelectorType);
								if (quickViewVariantSelectorType === "block") {
									document.querySelector(`.quick-view__radio__content--${key}`).innerHTML += `
											<label
												class="quick-view__radio__label "
												for="${handleize(key)}-${handleize(value)}"
												>
												<input

													type="radio"
													name="${key}"
													value="${value}"
													id="${handleize(key)}-${handleize(value)}"
													class="quick-view__radio__input"
												>
												${value}
											</label>
										`;
								} else if (quickViewVariantSelectorType === "dropdown") {
									document.querySelector(`.quick-view__radios-container--${key} select`).innerHTML += `
										<option value="${value}" type="radio">
											${value}
										</option>
									`;
								}
							} else if (key === "Color") {
								if (quickViewColorSelectorType === "block") {
									document.querySelector(`.quick-view__radios-container--${key}`).setAttribute("data-selector-type", quickViewColorSelectorType);
									document.querySelector(`.quick-view__radio__content--${key}`).innerHTML += `
											<label
												class="quick-view__radio__label "
												for="${handleize(key)}-${handleize(value)}"
												>
												<input
													type="radio"
													name="${key}"
													value="${value}"
													id="${handleize(key)}-${handleize(value)}"
													class="quick-view__radio__input"
												>
												${value}
											</label>
										`;
								} else if (quickViewColorSelectorType === "dropdown") {
									document.querySelector(`.quick-view__radios-container--${key}`).setAttribute("data-selector-type", quickViewColorSelectorType);
									document.querySelector(`.quick-view__radios-container--${key} select`).innerHTML += `
										<option value="${value}" type="radio">
											${value}
										</option>
									`;
								} else if (quickViewColorSelectorType === "variant_image") {
									document.querySelector(`.quick-view__radios-container--${key}`).setAttribute("data-selector-type", quickViewColorSelectorType);
									let done;
									for (var vkey in productVariantsImages) {
										if (productVariantsImages[vkey].alt) {
											if (productVariantsImages[vkey].alt.includes("#color:")) {
												let altLastPart = productVariantsImages[vkey].alt.split("#color:")[1];
												if (altLastPart === value) {
													document.querySelector(`.quick-view__radio__content--${key}`).innerHTML += `
															<label
																class="quick-view__radio__label media variant_image ${handleize(value)}  "
																style=""
																for="${handleize(key)}-${handleize(value)}"
															>
																<input  type="radio" name="${key}" value="${value}" id="${handleize(key)}-${handleize(value)}" class="quick-view__radio__input">
															</label>
														`;
													document.querySelector(`.quick-view__radio__content--${key} label.${handleize(value)}`).innerHTML += `
															<img
																src="${productVariantsImages[vkey].src}"
																loading="lazy"
																alt="${productVariantsImages[vkey].alt}"
																width="${productVariantsImages[vkey].width}"
																height="${productVariantsImages[vkey].height}"
																class="fit"
															>
													`;
													done = true;
												}
											}
										}
									}

									if (!done) {
										document.querySelector(`.quick-view__radios-container--${key}`).setAttribute("data-selector-type", quickViewColorSelectorType);
										document.querySelector(`.quick-view__radio__content--${key}`).innerHTML += `
											<label
											class="quick-view__radio__label "
											for="${handleize(key)}-${handleize(value)}"
											>
												<input
													type="radio"
													name="${key}"
													value="${value}"
													id="${handleize(key)}-${handleize(value)}"
													class="quick-view__radio__input"
												>
												${value}
											</label>
										`;
									}
								} else if (quickViewColorSelectorType === "color_swatch") {
									document.querySelector(`.quick-view__radios-container--${key}`).setAttribute("data-selector-type", quickViewColorSelectorType);
									let done;
									for (var color in colorSwatchList) {
										if (value === color) {
											document.querySelector(`.quick-view__radio__content--${key}`).innerHTML += `
													<label
														class="quick-view__radio__label color_swatch"
														style="background-color: ${color};"
														id="${handleize(key)}-${handleize(value)}"
													>
													<input  type="radio" name="${key}" value="${value}" id="${handleize(key)}-${handleize(value)}" class="quick-view__radio__input">
													</label>
												`;
											done = true;
										}
									}
									if (!done) {
										document.querySelector(`.quick-view__radios-container--${key}`).setAttribute("data-selector-type", quickViewColorSelectorType);
										document.querySelector(`.quick-view__radio__content--${key}`).innerHTML += `
											<label
											class="quick-view__radio__label "
											for="${handleize(key)}-${handleize(value)}"
											>
												<input
													type="radio"
													name="${key}"
													value="${value}"
													id="${handleize(key)}-${handleize(value)}"
													class="quick-view__radio__input"
												>
												${value}
											</label>
										`;
									}
								}
							}
						});
					}

					document.querySelector(".quick-view__vendor").innerHTML = `${productVendor}`;
					document.querySelector(".quick-view__title").innerHTML = `${productTitle}`;
					document.querySelector(".quick-view__product-url").href = `${productUrl}`;
					document.querySelector(".quick-view__price").innerHTML = `${formatMoney(productPrice)}`;
				})
				.then(() => {
					document.querySelectorAll(".quick-view__radios-container").forEach((selectorContainer) => {
						if (selectorContainer.querySelector("input")) {
							selectorContainer.querySelector("input").setAttribute("checked", "checked");
							selectorContainer.querySelector("input").parentNode.classList.add("checked");
						}
					});

					this.setVariant();

					this.showQuickView();

					document.querySelectorAll(".quick-view__radios-container").forEach((selectorContainer) => {
						selectorContainer.addEventListener("change", () => {
							this.setVariant();
						});
					});

					document.querySelectorAll(".quick-view__radios-container").forEach((selector) => {
						if (selector.dataset.selectorType === "block" || selector.dataset.selectorType === "variant_image" || selector.dataset.selectorType === "color_swatch") {
							selector.querySelectorAll("input").forEach((input) => {
								input.addEventListener("click", () => {
									selector.querySelectorAll("input").forEach((inp) => {
										inp.removeAttribute("checked");
										inp.parentNode.classList.remove("checked");
									});

									input.setAttribute("checked", "checked");
									input.parentNode.classList.add("checked");
								});
							});
						}
					});
					``;
				});
		}
	}

	setVariant() {
		let productVariants = window.quickViewVariants;
		let variantsNames = [];
		let selectedVariant = {};
		let quantity;
		let quickViewSelectors = document.querySelectorAll(".quick-view__radios-container");

		if (quickViewSelectors.length === 1) {
			let variantValue;
			if (quickViewSelectors[0].dataset.selectorType === "block") {
				variantValue = quickViewSelectors[0].querySelector("input:checked").value;
			} else if (quickViewSelectors[0].dataset.selectorType === "dropdown") {
				variantValue = quickViewSelectors[0].querySelector("select").value;
			} else if (quickViewSelectors[0].dataset.selectorType === "variant_image") {
				variantValue = quickViewSelectors[0].querySelector("input:checked").value;
			} else if (quickViewSelectors[0].dataset.selectorType === "color_swatch") {
				variantValue = quickViewSelectors[0].querySelector("input:checked").value;
			}

			variantsNames = [`${variantValue}`];
		} else if (quickViewSelectors.length === 2) {
			let variantValue1;
			let variantValue2;
			if (quickViewSelectors[0].dataset.selectorType === "block") {
				variantValue1 = quickViewSelectors[0].querySelector("input:checked").value;
			} else if (quickViewSelectors[0].dataset.selectorType === "dropdown") {
				variantValue1 = quickViewSelectors[0].querySelector("select").value;
			} else if (quickViewSelectors[0].dataset.selectorType === "variant_image") {
				variantValue1 = quickViewSelectors[0].querySelector("input:checked").value;
			} else if (quickViewSelectors[0].dataset.selectorType === "color_swatch") {
				variantValue1 = quickViewSelectors[0].querySelector("input:checked").value;
			}

			if (quickViewSelectors[1].dataset.selectorType === "block") {
				variantValue2 = quickViewSelectors[1].querySelector("input:checked").value;
			} else if (quickViewSelectors[1].dataset.selectorType === "dropdown") {
				variantValue2 = quickViewSelectors[1].querySelector("select").value;
			} else if (quickViewSelectors[1].dataset.selectorType === "variant_image") {
				variantValue2 = quickViewSelectors[1].querySelector("input:checked").value;
			} else if (quickViewSelectors[1].dataset.selectorType === "color_swatch") {
				variantValue2 = quickViewSelectors[1].querySelector("input:checked").value;
			}

			variantsNames = [`${variantValue1} / ${variantValue2}`, `${variantValue2} / ${variantValue1}`];
		} else if (quickViewSelectors.length === 3) {
			let variantValue1;
			let variantValue2;
			let variantValue3;
			if (quickViewSelectors[0].dataset.selectorType === "block") {
				variantValue1 = quickViewSelectors[0].querySelector("input:checked").value;
			} else if (quickViewSelectors[0].dataset.selectorType === "dropdown") {
				variantValue1 = quickViewSelectors[0].querySelector("select").value;
			} else if (quickViewSelectors[0].dataset.selectorType === "variant_image") {
				variantValue1 = quickViewSelectors[0].querySelector("input:checked").value;
			} else if (quickViewSelectors[0].dataset.selectorType === "color_swatch") {
				variantValue1 = quickViewSelectors[0].querySelector("input:checked").value;
			}

			if (quickViewSelectors[1].dataset.selectorType === "block") {
				variantValue2 = quickViewSelectors[1].querySelector("input:checked").value;
			} else if (quickViewSelectors[1].dataset.selectorType === "dropdown") {
				variantValue2 = quickViewSelectors[1].querySelector("select").value;
			} else if (quickViewSelectors[1].dataset.selectorType === "variant_image") {
				variantValue2 = quickViewSelectors[1].querySelector("input:checked").value;
			} else if (quickViewSelectors[1].dataset.selectorType === "color_swatch") {
				variantValue2 = quickViewSelectors[1].querySelector("input:checked").value;
			}

			if (quickViewSelectors[2].dataset.selectorType === "block") {
				variantValue3 = quickViewSelectors[2].querySelector("input:checked").value;
			} else if (quickViewSelectors[2].dataset.selectorType === "dropdown") {
				variantValue3 = quickViewSelectors[2].querySelector("select").value;
			} else if (quickViewSelectors[2].dataset.selectorType === "variant_image") {
				variantValue3 = quickViewSelectors[2].querySelector("input:checked").value;
			} else if (quickViewSelectors[2].dataset.selectorType === "color_swatch") {
				variantValue3 = quickViewSelectors[2].querySelector("input:checked").value;
			}

			variantsNames = [`${variantValue1} / ${variantValue2} / ${variantValue3}`, `${variantValue1} / ${variantValue3} / ${variantValue2}`, `${variantValue2} / ${variantValue1} / ${variantValue3}`, `${variantValue2} / ${variantValue3} / ${variantValue1}`, `${variantValue3} / ${variantValue1} / ${variantValue2}`, `${variantValue3} / ${variantValue2} / ${variantValue1}`];
		}

		for (var key in productVariants) {
			variantsNames.forEach((variantName) => {
				if (productVariants[key].title === variantName) {
					selectedVariant = productVariants[key];
				}
			});
		}

		let selectedVariantPrice = selectedVariant.price;

		document.querySelector(".quick-view__price").innerHTML = `${formatMoney(selectedVariantPrice)}`;

		quantity = document.querySelector(".quick-view__quantity-field .quantity-field__input").value;
		document.getElementById("quick-view-buy-now").href = `/cart/${selectedVariant.id}:${quantity}`;

		document.querySelectorAll(".quick-view__image-box img").forEach((image) => {
			if (image.id.toString() === selectedVariant.image_id.toString()) {
				image.style.zIndex = 2;
				image.style.opacity = 1;
			} else {
				image.style.zIndex = 1;
				image.style.opacity = 0;
			}
		});

		let injectedFunction = `fromQuickViewToCart(${selectedVariant.id},${quantity})`;
		document.getElementById("quick-view-add-to-cart").setAttribute("onclick", injectedFunction);

		document.querySelector(".quick-view__quantity-field #quantity-field").addEventListener("click", () => {
			quantity = document.querySelector(".quick-view__quantity-field .quantity-field__input").value;
			document.getElementById("quick-view-buy-now").href = `/cart/${selectedVariant.id}:${quantity}`;
			let injectedFunction = `fromQuickViewToCart(${selectedVariant.id},${quantity})`;
			document.getElementById("quick-view-add-to-cart").setAttribute("onclick", injectedFunction);
		});
	}

	listenToQuickView() {
		document.querySelector(".quick-view__close").addEventListener("click", () => {
			this.hideQuickView();
			if (document.querySelector(".theme-overlay").classList.contains("higher-layer") && document.querySelector(".header-section").classList.contains("higher-layer")) {
				document.querySelector(".theme-overlay").classList.remove("higher-layer");
				setTimeout(() => {
					document.querySelector(".header-section").classList.remove("higher-layer");
				}, 500);
			}
		});

		document.querySelector(".header-section").addEventListener("click", () => {
			if (document.querySelector(".quick-view").classList.contains("active")) {
				this.hideQuickView();
				if (document.querySelector(".theme-overlay").classList.contains("higher-layer") && document.querySelector(".header-section").classList.contains("higher-layer")) {
					document.querySelector(".theme-overlay").classList.remove("higher-layer");
					setTimeout(() => {
						document.querySelector(".header-section").classList.remove("higher-layer");
					}, 500);
				}
			}
		});

		document.querySelector(".theme-overlay").addEventListener("click", () => {
			if (document.querySelector(".quick-view").classList.contains("active")) {
				this.hideQuickView();
				if (document.querySelector(".theme-overlay").classList.contains("higher-layer") && document.querySelector(".header-section").classList.contains("higher-layer")) {
					document.querySelector(".theme-overlay").classList.remove("higher-layer");
					setTimeout(() => {
						document.querySelector(".header-section").classList.remove("higher-layer");
					}, 500);
				}
			}
		});

		if (Shopify.designMode) {
			document.addEventListener("shopify:section:select", (event) => {
				event.target.classList.forEach((i) => {
					if (i === "section-quick-view") {
						this.showQuickView();
					}
				});
			});
			document.addEventListener("shopify:section:deselect", (event) => {
				event.target.classList.forEach((i) => {
					if (i === "section-quick-view") {
						this.hideQuickView();
					}
				});
			});
		}

		document.querySelector(".theme-overlay").addEventListener("click", () => {
			if (document.querySelector(".quick-view").classList.contains("active")) {
				this.hideQuickView();
			}
		});
	}
}

customElements.define("quick-view-component", QuickView);

class QuickViewButton extends QuickView {
	constructor() {
		super();
	}

	connectedCallback() {
		this.addEventListener("click", () => {
			this.icon = this.querySelector("#quick-add-button");
			this.runQuickView(this.icon);
			if (document.querySelector("cart-component").classList.contains("active") && this.icon.dataset.productVariants === "with") {
				document.querySelector(".header-section").classList.add("higher-layer");
				setTimeout(() => {
					document.querySelector(".theme-overlay").classList.add("higher-layer");
				}, 500);
			}
		});
	}
}

customElements.define("quick-view-button", QuickViewButton);
