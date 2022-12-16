// ANCHOR: Global functions

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

function lockPage() {
	document.querySelector("html").classList.add("lock");
	document.querySelector(".theme-overlay").classList.remove("hidden");
}

function unlockPage() {
	document.querySelector("html").classList.remove("lock");
	document.querySelector(".theme-overlay").classList.add("hidden");
}

// ANCHOR: Slider component

class SliderComponent extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = "<slot></slot>";
		if (this.querySelector("recently-viewed-component")) {
			setTimeout(() => {
				// to wait for the recently viewed component to load
				this.loadSlider();
			}, 500);
		} else {
			this.loadSlider();
		}
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

// ANCHOR: Predictive search

class PredictiveSearch extends HTMLElement {
	constructor() {
		super();

		this.input = this.querySelector('input[type="search"]');
		this.icon = this.querySelector(".search__icon");
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
		fetch(`/search/suggest?q=${searchTerm}&resources[type]=product&resources[limit]=8&section_id=section-predictive-search`)
			.then((response) => {
				if (!response.ok) {
					var error = new Error(response.status);
					this.close();
					throw error;
				}

				return response.text();
			})
			.then((text) => {
				const resultsMarkup = new DOMParser().parseFromString(text, "text/html").querySelector("#shopify-section-section-predictive-search").innerHTML;
				this.predictiveSearchResults.innerHTML = resultsMarkup;
				this.open();
			})
			.catch((error) => {
				this.close();
				throw error;
			});
	}

	open() {
		this.querySelector(".search-form__results").classList.remove("hidden");
	}

	close() {
		this.querySelector(".search-form__results").classList.add("hidden");
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

// ANCHOR: Loading bar
function showLoadingBar() {
	document.querySelector(".loading-bar").classList.add("show");
}

function hideLoadingBar() {
	document.querySelector(".loading-bar").classList.remove("show");
	document.querySelector(".loading-bar").classList.add("end");
	setTimeout(() => {
		document.querySelector(".loading-bar").classList.remove("end");
	}, 700);
}

// ANCHOR: Search drawer

let searchDrawer = document.querySelector(".search-drawer");

window.addEventListener("load", () => {
	document.querySelector(".search-drawer").style.height = `calc(100% - ${document.querySelector(".header-section").offsetHeight}px + 8px)`;
});

window.addEventListener("resize", () => {
	document.querySelector(".search-drawer").style.height = `calc(100% - ${document.querySelector(".header-section").offsetHeight}px + 8px)`;
});

class SearchDrawer extends PredictiveSearch {
	constructor() {
		super();

		this.searchDrawer = this.querySelector(".search-drawer");
		this.closeIcon = this.searchDrawer.querySelector(".search-section__close");
		this.inputField = this.searchDrawer.querySelector(".search-form__input");

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
		this.searchDrawer.querySelector(".search-form__results").classList.add("hidden");
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
					if (i === "main-search-drawer") {
						this.searchDrawer.style.height = `calc(100% - ${document.querySelector(".header-section").offsetHeight}px + 8px)`;
						this.showSearchDrawer();
					}
				});
			});

			document.addEventListener("shopify:section:select", (event) => {
				event.target.classList.forEach((i) => {
					if (i === "main-search-drawer") {
						this.searchDrawer.style.height = `calc(100% - ${document.querySelector(".header-section").offsetHeight}px + 8px)`;
						this.showSearchDrawer();
					}
				});
			});

			document.addEventListener("shopify:section:deselect", (event) => {
				event.target.classList.forEach((i) => {
					if (i === "main-search-drawer") {
						this.hideSearchDrawer();
					}
				});
			});
		}
	}
}

customElements.define("search-drawer", SearchDrawer);

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
					if (i === "main-header") {
						this.showDrawer();
					}
				});
			});

			document.addEventListener("shopify:section:select", (event) => {
				event.target.classList.forEach((i) => {
					this.style.height = `calc(100% - ${document.querySelector(".header-section").offsetHeight}px + 8px)`;
					if (i === "main-header") {
						this.showDrawer();
					}
				});
			});

			document.addEventListener("shopify:section:deselect", (event) => {
				event.target.classList.forEach((i) => {
					if (i === "main-header") {
						this.hideDrawer();
					}
				});
			});
		}
	}
}

customElements.define("menu-drawer-component", MenuDrawerComponent);

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

// ANCHOR: Cart drawer

function sendToCart(itemId, quantity) {
	// if (document.querySelector("#add-to-cart-button")) {
	// 	document.querySelector("#add-to-cart-button").classList.add("loading");
	// }
	showLoadingBar();

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
			if (cartType === "drawer" && !window.location.pathname.includes("/cart")) {
				showDrawer();
			} else {
				window.location.assign(window.Shopify.routes.root + "cart").then(() => {
					window.location.reload();
				});
			}
			setTimeout(() => {
				hideLoadingBar();
			}, 1000);

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

			if (data.item_count === 0) {
				document.getElementById("header__icons-cart__item-count").classList.add("hidden");
				setTimeout(() => {
					document.getElementById("header__icons-cart__item-count").innerHTML = data.item_count;
				}, 500);
			} else if (data.item_count > 0) {
				document.getElementById("header__icons-cart__item-count").innerHTML = data.item_count;
				document.getElementById("header__icons-cart__item-count").classList.remove("hidden");
			}

			document.querySelector(".cart-drawer__products-list").innerHTML = "";
			data.items.forEach((item) => {
				let variantTitle = item.variant_title !== null ? `<p class="product-variant">${item.variant_title}</p>` : "";
				let itemImage = item.image == null ? "" : `<img srcset="${item.featured_image.url}" loading="lazy" alt="${item.featured_image.alt}" width="${item.featured_image.width}" height="${item.featured_image.height}" class="full">`;
				itemList.push(`
					<div class="cart-drawer__product" data-variant="${item.variant_id}">
						<a href="${item.url}" class="cart-drawer__product__image">
						${itemImage}
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

document.querySelectorAll(".cart-page__product .quantity-field").forEach((field) => {
	field.addEventListener("click", () => {
		let input = field.querySelector("input");
		let variantId = input.getAttribute("data-variant-id");
		let quantity = input.value;

		updateCartQuantity(variantId, quantity).then(() => {
			window.location.reload();
		});
	});
});

document.querySelectorAll(".cart-page__product .remove").forEach((icon) => {
	icon.addEventListener("click", () => {
		let variantId = icon.getAttribute("data-variant-id");
		updateCartQuantity(variantId, 0).then(() => {
			window.location.reload();
		});
	});
});

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
			addCartRecommendedProducts(data.items);
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
											id="quick-view-button"
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
											id="quick-view-button"
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

class OrderNote extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = "<slot></slot>";
		document.addEventListener("click", (event) => {
			this.listenToEvents(event);
		});
	}

	listenToEvents(event) {
		if (this.querySelector("a.order-note").contains(event.target)) {
			this.querySelector(".cart-drawer__note-popup").classList.remove("fade");
			this.querySelector(".cart-drawer__note-popup").classList.add("reveal");
		} else if ((!this.querySelector(".cart-drawer__note-popup").contains(event.target) && this.querySelector(".cart-drawer__note-popup").classList.contains("reveal")) || this.querySelector(".cart-drawer__note-popup #note-close-icon").contains(event.target)) {
			this.querySelector(".cart-drawer__note-popup").classList.remove("reveal");
			this.querySelector(".cart-drawer__note-popup").classList.add("fade");
		}
		if (this.querySelector(".cart-drawer__note-popup__content #cart-note-send").contains(event.target)) {
			let noteContent = this.querySelector("#cart-note").value;
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
					this.querySelector(".cart-drawer__note-popup").classList.remove("reveal");
					this.querySelector(".cart-drawer__note-popup").classList.add("fade");
					return response.json();
				})
				.catch((error) => {
					console.error("Error:", error);
				});
		}
	}
}
customElements.define("order-note", OrderNote);

if (document.querySelector(".header__icons-cart").getAttribute("for") === "drawer" && window.location.pathname.includes("/cart")) {
	document.querySelector(".header__icons-cart").addEventListener("click", () => {
		window.location.assign(window.Shopify.routes.root + "cart");
	});
}

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

		if (document.querySelector(".header__icons-cart").getAttribute("for") === "drawer" && !window.location.pathname.includes("/cart")) {
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

						if (i === "main-cart-drawer") {
							showDrawer();
						}
					});
				});

				document.addEventListener("shopify:section:select", (event) => {
					event.target.classList.forEach((i) => {
						this.style.height = `calc(100% - ${document.querySelector(".header-section").offsetHeight}px + 8px)`;

						if (i === "main-cart-drawer") {
							showDrawer();
						}
					});
				});

				document.addEventListener("shopify:section:deselect", (event) => {
					event.target.classList.forEach((i) => {
						if (i === "main-cart-drawer") {
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

		document.addEventListener("click", (event) => {
			if (event.target.id === "quick-view-button") {
				this.runQuickView(event.target);
			}
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
												for="${handleize(key)}-${handleize(value)}-${this.sectionId}"
												>
												<input

													type="radio"
													name="${key}"
													value="${value}"
													id="${handleize(key)}-${handleize(value)}-${this.sectionId}"
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
												for="${handleize(key)}-${handleize(value)}-${this.sectionId}"
												>
												<input
													type="radio"
													name="${key}"
													value="${value}"
													id="${handleize(key)}-${handleize(value)}-${this.sectionId}"
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
																for="${handleize(key)}-${handleize(value)}-${this.sectionId}"
															>
																<input  type="radio" name="${key}" value="${value}" id="${handleize(key)}-${handleize(value)}-${this.sectionId}" class="quick-view__radio__input">
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
											for="${handleize(key)}-${handleize(value)}-${this.sectionId}"
											>
												<input
													type="radio"
													name="${key}"
													value="${value}"
													id="${handleize(key)}-${handleize(value)}-${this.sectionId}"
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
														id="${handleize(key)}-${handleize(value)}-${this.sectionId}"
													>
													<input  type="radio" name="${key}" value="${value}" id="${handleize(key)}-${handleize(value)}-${this.sectionId}" class="quick-view__radio__input">
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
											for="${handleize(key)}-${handleize(value)}-${this.sectionId}"
											>
												<input
													type="radio"
													name="${key}"
													value="${value}"
													id="${handleize(key)}-${handleize(value)}-${this.sectionId}"
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
				});
		}
	}

	setVariant() {
		let productVariants = window.quickViewVariants;
		let variantsNames = [];

		let quantity;
		let quickViewSelectors = document.querySelectorAll(".quick-view__radios-container");

		let selectedVariant = matchVariant(quickViewSelectors, productVariants);

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
					if (i === "main-quick-view") {
						this.showQuickView();
					}
				});
			});
			document.addEventListener("shopify:section:deselect", (event) => {
				event.target.classList.forEach((i) => {
					if (i === "main-quick-view") {
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
			this.icon = this.querySelector("#quick-view-button");
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

// Function to match variant with selected options
function matchVariant(allSelectedVariants, allAvailableVariants) {
	let variantsNames = [];
	let matchedVariant;

	if (allSelectedVariants.length === 1) {
		let variantValue;
		if (allSelectedVariants[0].dataset.selectorType === "block") {
			variantValue = allSelectedVariants[0].querySelector("input:checked").value;
		} else if (allSelectedVariants[0].dataset.selectorType === "dropdown") {
			variantValue = allSelectedVariants[0].querySelector("select").value;
		} else if (allSelectedVariants[0].dataset.selectorType === "variant_image") {
			variantValue = allSelectedVariants[0].querySelector("input:checked").value;
		} else if (allSelectedVariants[0].dataset.selectorType === "color_swatch") {
			variantValue = allSelectedVariants[0].querySelector("input:checked").value;
		}

		variantsNames = [`${variantValue}`];
	} else if (allSelectedVariants.length === 2) {
		let variantValue1;
		let variantValue2;
		if (allSelectedVariants[0].dataset.selectorType === "block") {
			variantValue1 = allSelectedVariants[0].querySelector("input:checked").value;
		} else if (allSelectedVariants[0].dataset.selectorType === "dropdown") {
			variantValue1 = allSelectedVariants[0].querySelector("select").value;
		} else if (allSelectedVariants[0].dataset.selectorType === "variant_image") {
			variantValue1 = allSelectedVariants[0].querySelector("input:checked").value;
		} else if (allSelectedVariants[0].dataset.selectorType === "color_swatch") {
			variantValue1 = allSelectedVariants[0].querySelector("input:checked").value;
		}

		if (allSelectedVariants[1].dataset.selectorType === "block") {
			variantValue2 = allSelectedVariants[1].querySelector("input:checked").value;
		} else if (allSelectedVariants[1].dataset.selectorType === "dropdown") {
			variantValue2 = allSelectedVariants[1].querySelector("select").value;
		} else if (allSelectedVariants[1].dataset.selectorType === "variant_image") {
			variantValue2 = allSelectedVariants[1].querySelector("input:checked").value;
		} else if (allSelectedVariants[1].dataset.selectorType === "color_swatch") {
			variantValue2 = allSelectedVariants[1].querySelector("input:checked").value;
		}

		variantsNames = [`${variantValue1} / ${variantValue2}`, `${variantValue2} / ${variantValue1}`];
	} else if (allSelectedVariants.length === 3) {
		let variantValue1;
		let variantValue2;
		let variantValue3;
		if (allSelectedVariants[0].dataset.selectorType === "block") {
			variantValue1 = allSelectedVariants[0].querySelector("input:checked").value;
		} else if (allSelectedVariants[0].dataset.selectorType === "dropdown") {
			variantValue1 = allSelectedVariants[0].querySelector("select").value;
		} else if (allSelectedVariants[0].dataset.selectorType === "variant_image") {
			variantValue1 = allSelectedVariants[0].querySelector("input:checked").value;
		} else if (allSelectedVariants[0].dataset.selectorType === "color_swatch") {
			variantValue1 = allSelectedVariants[0].querySelector("input:checked").value;
		}

		if (allSelectedVariants[1].dataset.selectorType === "block") {
			variantValue2 = allSelectedVariants[1].querySelector("input:checked").value;
		} else if (allSelectedVariants[1].dataset.selectorType === "dropdown") {
			variantValue2 = allSelectedVariants[1].querySelector("select").value;
		} else if (allSelectedVariants[1].dataset.selectorType === "variant_image") {
			variantValue2 = allSelectedVariants[1].querySelector("input:checked").value;
		} else if (allSelectedVariants[1].dataset.selectorType === "color_swatch") {
			variantValue2 = allSelectedVariants[1].querySelector("input:checked").value;
		}

		if (allSelectedVariants[2].dataset.selectorType === "block") {
			variantValue3 = allSelectedVariants[2].querySelector("input:checked").value;
		} else if (allSelectedVariants[2].dataset.selectorType === "dropdown") {
			variantValue3 = allSelectedVariants[2].querySelector("select").value;
		} else if (allSelectedVariants[2].dataset.selectorType === "variant_image") {
			variantValue3 = allSelectedVariants[2].querySelector("input:checked").value;
		} else if (allSelectedVariants[2].dataset.selectorType === "color_swatch") {
			variantValue3 = allSelectedVariants[2].querySelector("input:checked").value;
		}

		variantsNames = [`${variantValue1} / ${variantValue2} / ${variantValue3}`, `${variantValue1} / ${variantValue3} / ${variantValue2}`, `${variantValue2} / ${variantValue1} / ${variantValue3}`, `${variantValue2} / ${variantValue3} / ${variantValue1}`, `${variantValue3} / ${variantValue1} / ${variantValue2}`, `${variantValue3} / ${variantValue2} / ${variantValue1}`];
	}

	for (var key in allAvailableVariants) {
		variantsNames.forEach((variantName) => {
			if (allAvailableVariants[key].title === variantName) {
				matchedVariant = allAvailableVariants[key];
			}
		});
	}

	return matchedVariant;
}

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
				let domainName = window.location.hostname;
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

// ANCHOR: Shop the look

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

// ANCHOR: FAQ

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

// ANCHOR:Newsletter popup

class PopupComponent extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		this.drawer = this.querySelector("[openable]");
		this.delayTime = parseInt(this.drawer.getAttribute("data-delay-time"));
		this.cookie = document.cookie.split("; ").find((row) => row.startsWith("popupCookie"))
			? JSON.parse(
					document.cookie
						.split("; ")
						.find((row) => row.startsWith("popupCookie"))
						.split("=")
						.slice(1)
						.join("=")
			  )
			: "";
		this.decideDrawerAction();

		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = "<slot></slot>";
	}

	saveInCookie() {
		let popupMessage = "closed";
		let message = JSON.stringify(popupMessage);
		if (!Shopify.designMode) {
			// let expiry = new Date(400 * 24 * 60 * 60 * 1000 + Date.parse(new Date()));
			document.cookie = "popupCookie" + "=" + message + "; path=/; domain=." + window.location.hostname;
		}
	}

	openPopupDrawer() {
		if (this.cookie !== "closed" || Shopify.designMode) {
			this.querySelector(".popup").style.display = "flex";
			this.querySelector(".popup").style.zIndex = "102";

			setTimeout(() => {
				lockPage();

				this.drawer.classList.remove("hidden");
				this.drawer.classList.add("active");

				setTimeout(() => {
					if (this.drawer.querySelector(".popup__picture")) {
						this.drawer.querySelector(".popup__picture").classList.add("slide-in");
					}
					this.drawer.querySelector(".popup__content").classList.add("slide-in");

					setTimeout(() => {
						this.drawer.classList.add("border");
					}, 500);
				}, 1000);
			}, 1000);
		}
	}

	hidePopupDrawer() {
		unlockPage();

		this.drawer.classList.remove("active");
		this.drawer.classList.add("hidden");

		setTimeout(() => {
			this.querySelector(".popup").style.display = "none";
			this.querySelector(".popup").style.zIndex = "98";
			if (this.drawer.querySelector(".popup__picture")) {
				this.drawer.querySelector(".popup__picture").classList.remove("slide-in");
			}
			this.drawer.querySelector(".popup__content").classList.remove("slide-in");
			this.drawer.classList.remove("border");
		}, 300);

		this.saveInCookie();
	}

	decideDrawerAction() {
		if (!Shopify.designMode && this.drawer.classList.contains("hidden")) {
			setTimeout(() => {
				this.openPopupDrawer();
			}, this.delayTime);
		}

		if (Shopify.designMode) {
			document.addEventListener("shopify:section:select", (event) => {
				event.target.classList.forEach((i) => {
					if (i === "main-popup") {
						this.openPopupDrawer();
					}
				});
			});
			document.addEventListener("shopify:section:deselect", (event) => {
				event.target.classList.forEach((i) => {
					if (i === "main-popup") {
						this.hidePopupDrawer();
					}
				});
			});
		}

		document.querySelector(".popup__close").addEventListener("click", () => {
			if (this.drawer.classList.contains("active")) {
				this.hidePopupDrawer();
			}
		});

		document.querySelector(".theme-overlay").addEventListener("click", () => {
			if (this.drawer.classList.contains("active")) {
				this.hidePopupDrawer();
			}
		});
	}
}

customElements.define("popup-component", PopupComponent);

// ANCHOR: Recently viewed product

class RecentlyViewedComponent extends SliderComponent {
	constructor() {
		super();
		this.addProducts();
	}

	addProducts() {
		let products =
			document.cookie.indexOf("recentlyViewedProducts=") !== -1
				? JSON.parse(
						document.cookie
							.split("; ")
							.find((row) => row.startsWith("recentlyViewedProducts"))
							.split("=")
							.slice(1)
							.join("=")
				  )
				: [];

		if (products.length > 0) {
			products = products.reverse();
			let itemsLimits = parseInt(this.querySelector(".slides-container").getAttribute("data-items-limit"));
			let imageStyle = this.querySelector(".slides-container").getAttribute("data-image-style");
			let newTag = this.querySelector(".slides-container").getAttribute("data-new-tag");
			let newTagTime = this.querySelector(".slides-container").getAttribute("data-new-tag-time");
			let maxItems = products.length > itemsLimits ? itemsLimits : products.length;

			for (let product = 0; product < maxItems; product++) {
				let productId = products[product].id;
				let productTitle = products[product].title;
				let productUrl = products[product].url;
				let productImage = products[product].image;
				let productImageAlt = products[product].image_alt;
				let productImageWidth = products[product].image_width;
				let productImageHeight = products[product].image_height;
				let productPrice = products[product].price;
				let productCompareAtPrice = products[product].compare_at_price;
				let productPriceDifference = products[product].price_difference;
				let productPriceDifferenceWithCurrency = products[product].price_difference_with_currency;
				let date_difference = products[product].date_difference;
				let variant_first_id = parseInt(products[product].variant_first_id);
				let handle = products[product].handle;
				let variants_size = parseInt(products[product].variants_size);

				let productWithVariants = variants_size > 1 ? "with" : "without";
				let newTagClass = newTag === "true" && date_difference < parseInt(newTagTime) ? " tag--animated-hover" : "";
				let itemElement = document.createElement("div");
				let saleTag = productPriceDifference <= 0 ? "" : `<p class="tag--normal tag-text">SAVE ${productPriceDifferenceWithCurrency}</p>`;
				let productPlaceholder =
					"<svg class='placeholder' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 525.5 525.5'><path d='M375.5 345.2c0-.1 0-.1 0 0 0-.1 0-.1 0 0-1.1-2.9-2.3-5.5-3.4-7.8-1.4-4.7-2.4-13.8-.5-19.8 3.4-10.6 3.6-40.6 1.2-54.5-2.3-14-12.3-29.8-18.5-36.9-5.3-6.2-12.8-14.9-15.4-17.9 8.6-5.6 13.3-13.3 14-23 0-.3 0-.6.1-.8.4-4.1-.6-9.9-3.9-13.5-2.1-2.3-4.8-3.5-8-3.5h-54.9c-.8-7.1-3-13-5.2-17.5-6.8-13.9-12.5-16.5-21.2-16.5h-.7c-8.7 0-14.4 2.5-21.2 16.5-2.2 4.5-4.4 10.4-5.2 17.5h-48.5c-3.2 0-5.9 1.2-8 3.5-3.2 3.6-4.3 9.3-3.9 13.5 0 .2 0 .5.1.8.7 9.8 5.4 17.4 14 23-2.6 3.1-10.1 11.7-15.4 17.9-6.1 7.2-16.1 22.9-18.5 36.9-2.2 13.3-1.2 47.4 1 54.9 1.1 3.8 1.4 14.5-.2 19.4-1.2 2.4-2.3 5-3.4 7.9-4.4 11.6-6.2 26.3-5 32.6 1.8 9.9 16.5 14.4 29.4 14.4h176.8c12.9 0 27.6-4.5 29.4-14.4 1.2-6.5-.5-21.1-5-32.7zm-97.7-178c.3-3.2.8-10.6-.2-18 2.4 4.3 5 10.5 5.9 18h-5.7zm-36.3-17.9c-1 7.4-.5 14.8-.2 18h-5.7c.9-7.5 3.5-13.7 5.9-18zm4.5-6.9c0-.1.1-.2.1-.4 4.4-5.3 8.4-5.8 13.1-5.8h.7c4.7 0 8.7.6 13.1 5.8 0 .1 0 .2.1.4 3.2 8.9 2.2 21.2 1.8 25h-30.7c-.4-3.8-1.3-16.1 1.8-25zm-70.7 42.5c0-.3 0-.6-.1-.9-.3-3.4.5-8.4 3.1-11.3 1-1.1 2.1-1.7 3.4-2.1l-.6.6c-2.8 3.1-3.7 8.1-3.3 11.6 0 .2 0 .5.1.8.3 3.5.9 11.7 10.6 18.8.3.2.8.2 1-.2.2-.3.2-.8-.2-1-9.2-6.7-9.8-14.4-10-17.7 0-.3 0-.6-.1-.8-.3-3.2.5-7.7 3-10.5.8-.8 1.7-1.5 2.6-1.9h155.7c1 .4 1.9 1.1 2.6 1.9 2.5 2.8 3.3 7.3 3 10.5 0 .2 0 .5-.1.8-.3 3.6-1 13.1-13.8 20.1-.3.2-.5.6-.3 1 .1.2.4.4.6.4.1 0 .2 0 .3-.1 13.5-7.5 14.3-17.5 14.6-21.3 0-.3 0-.5.1-.8.4-3.5-.5-8.5-3.3-11.6l-.6-.6c1.3.4 2.5 1.1 3.4 2.1 2.6 2.9 3.5 7.9 3.1 11.3 0 .3 0 .6-.1.9-1.5 20.9-23.6 31.4-65.5 31.4h-43.8c-41.8 0-63.9-10.5-65.4-31.4zm91 89.1h-7c0-1.5 0-3-.1-4.2-.2-12.5-2.2-31.1-2.7-35.1h3.6c.8 0 1.4-.6 1.4-1.4v-14.1h2.4v14.1c0 .8.6 1.4 1.4 1.4h3.7c-.4 3.9-2.4 22.6-2.7 35.1v4.2zm65.3 11.9h-16.8c-.4 0-.7.3-.7.7 0 .4.3.7.7.7h16.8v2.8h-62.2c0-.9-.1-1.9-.1-2.8h33.9c.4 0 .7-.3.7-.7 0-.4-.3-.7-.7-.7h-33.9c-.1-3.2-.1-6.3-.1-9h62.5v9zm-12.5 24.4h-6.3l.2-1.6h5.9l.2 1.6zm-5.8-4.5l1.6-12.3h2l1.6 12.3h-5.2zm-57-19.9h-62.4v-9h62.5c0 2.7 0 5.8-.1 9zm-62.4 1.4h62.4c0 .9-.1 1.8-.1 2.8H194v-2.8zm65.2 0h7.3c0 .9.1 1.8.1 2.8H259c.1-.9.1-1.8.1-2.8zm7.2-1.4h-7.2c.1-3.2.1-6.3.1-9h7c0 2.7 0 5.8.1 9zm-7.7-66.7v6.8h-9v-6.8h9zm-8.9 8.3h9v.7h-9v-.7zm0 2.1h9v2.3h-9v-2.3zm26-1.4h-9v-.7h9v.7zm-9 3.7v-2.3h9v2.3h-9zm9-5.9h-9v-6.8h9v6.8zm-119.3 91.1c-2.1-7.1-3-40.9-.9-53.6 2.2-13.5 11.9-28.6 17.8-35.6 5.6-6.5 13.5-15.7 15.7-18.3 11.4 6.4 28.7 9.6 51.8 9.6h6v14.1c0 .8.6 1.4 1.4 1.4h5.4c.3 3.1 2.4 22.4 2.7 35.1 0 1.2.1 2.6.1 4.2h-63.9c-.8 0-1.4.6-1.4 1.4v16.1c0 .8.6 1.4 1.4 1.4H256c-.8 11.8-2.8 24.7-8 33.3-2.6 4.4-4.9 8.5-6.9 12.2-.4.7-.1 1.6.6 1.9.2.1.4.2.6.2.5 0 1-.3 1.3-.8 1.9-3.7 4.2-7.7 6.8-12.1 5.4-9.1 7.6-22.5 8.4-34.7h7.8c.7 11.2 2.6 23.5 7.1 32.4.2.5.8.8 1.3.8.2 0 .4 0 .6-.2.7-.4 1-1.2.6-1.9-4.3-8.5-6.1-20.3-6.8-31.1H312l-2.4 18.6c-.1.4.1.8.3 1.1.3.3.7.5 1.1.5h9.6c.4 0 .8-.2 1.1-.5.3-.3.4-.7.3-1.1l-2.4-18.6H333c.8 0 1.4-.6 1.4-1.4v-16.1c0-.8-.6-1.4-1.4-1.4h-63.9c0-1.5 0-2.9.1-4.2.2-12.7 2.3-32 2.7-35.1h5.2c.8 0 1.4-.6 1.4-1.4v-14.1h6.2c23.1 0 40.4-3.2 51.8-9.6 2.3 2.6 10.1 11.8 15.7 18.3 5.9 6.9 15.6 22.1 17.8 35.6 2.2 13.4 2 43.2-1.1 53.1-1.2 3.9-1.4 8.7-1 13-1.7-2.8-2.9-4.4-3-4.6-.2-.3-.6-.5-.9-.6h-.5c-.2 0-.4.1-.5.2-.6.5-.8 1.4-.3 2 0 0 .2.3.5.8 1.4 2.1 5.6 8.4 8.9 16.7h-42.9v-43.8c0-.8-.6-1.4-1.4-1.4s-1.4.6-1.4 1.4v44.9c0 .1-.1.2-.1.3 0 .1 0 .2.1.3v9c-1.1 2-3.9 3.7-10.5 3.7h-7.5c-.4 0-.7.3-.7.7 0 .4.3.7.7.7h7.5c5 0 8.5-.9 10.5-2.8-.1 3.1-1.5 6.5-10.5 6.5H210.4c-9 0-10.5-3.4-10.5-6.5 2 1.9 5.5 2.8 10.5 2.8h67.4c.4 0 .7-.3.7-.7 0-.4-.3-.7-.7-.7h-67.4c-6.7 0-9.4-1.7-10.5-3.7v-54.5c0-.8-.6-1.4-1.4-1.4s-1.4.6-1.4 1.4v43.8h-43.6c4.2-10.2 9.4-17.4 9.5-17.5.5-.6.3-1.5-.3-2s-1.5-.3-2 .3c-.1.2-1.4 2-3.2 5 .1-4.9-.4-10.2-1.1-12.8zm221.4 60.2c-1.5 8.3-14.9 12-26.6 12H174.4c-11.8 0-25.1-3.8-26.6-12-1-5.7.6-19.3 4.6-30.2H197v9.8c0 6.4 4.5 9.7 13.4 9.7h105.4c8.9 0 13.4-3.3 13.4-9.7v-9.8h44c4 10.9 5.6 24.5 4.6 30.2z'></path><path d='M286.1 359.3c0 .4.3.7.7.7h14.7c.4 0 .7-.3.7-.7 0-.4-.3-.7-.7-.7h-14.7c-.3 0-.7.3-.7.7zm5.3-145.6c13.5-.5 24.7-2.3 33.5-5.3.4-.1.6-.5.4-.9-.1-.4-.5-.6-.9-.4-8.6 3-19.7 4.7-33 5.2-.4 0-.7.3-.7.7 0 .4.3.7.7.7zm-11.3.1c.4 0 .7-.3.7-.7 0-.4-.3-.7-.7-.7H242c-19.9 0-35.3-2.5-45.9-7.4-.4-.2-.8 0-.9.3-.2.4 0 .8.3.9 10.8 5 26.4 7.5 46.5 7.5h38.1zm-7.2 116.9c.4.1.9.1 1.4.1 1.7 0 3.4-.7 4.7-1.9 1.4-1.4 1.9-3.2 1.5-5-.2-.8-.9-1.2-1.7-1.1-.8.2-1.2.9-1.1 1.7.3 1.2-.4 2-.7 2.4-.9.9-2.2 1.3-3.4 1-.8-.2-1.5.3-1.7 1.1s.2 1.5 1 1.7z'></path><path d='M275.5 331.6c-.8 0-1.4.6-1.5 1.4 0 .8.6 1.4 1.4 1.5h.3c3.6 0 7-2.8 7.7-6.3.2-.8-.4-1.5-1.1-1.7-.8-.2-1.5.4-1.7 1.1-.4 2.3-2.8 4.2-5.1 4zm5.4 1.6c-.6.5-.6 1.4-.1 2 1.1 1.3 2.5 2.2 4.2 2.8.2.1.3.1.5.1.6 0 1.1-.3 1.3-.9.3-.7-.1-1.6-.8-1.8-1.2-.5-2.2-1.2-3-2.1-.6-.6-1.5-.6-2.1-.1zm-38.2 12.7c.5 0 .9 0 1.4-.1.8-.2 1.3-.9 1.1-1.7-.2-.8-.9-1.3-1.7-1.1-1.2.3-2.5-.1-3.4-1-.4-.4-1-1.2-.8-2.4.2-.8-.3-1.5-1.1-1.7-.8-.2-1.5.3-1.7 1.1-.4 1.8.1 3.7 1.5 5 1.2 1.2 2.9 1.9 4.7 1.9z'></path><path d='M241.2 349.6h.3c.8 0 1.4-.7 1.4-1.5s-.7-1.4-1.5-1.4c-2.3.1-4.6-1.7-5.1-4-.2-.8-.9-1.3-1.7-1.1-.8.2-1.3.9-1.1 1.7.7 3.5 4.1 6.3 7.7 6.3zm-9.7 3.6c.2 0 .3 0 .5-.1 1.6-.6 3-1.6 4.2-2.8.5-.6.5-1.5-.1-2s-1.5-.5-2 .1c-.8.9-1.8 1.6-3 2.1-.7.3-1.1 1.1-.8 1.8 0 .6.6.9 1.2.9z'></path></svg>";
				let itemImage = productImage.includes("error") ? productPlaceholder : `<img srcset="${productImage}" loading="lazy" alt="${productImageAlt}" width="${productImageWidth}" height="${productImageHeight}" class="${imageStyle}" >`;

				itemElement.classList.add("item");

				itemElement.innerHTML = `
                                      <div class="recently-viewed__image">
                                      ${saleTag}
                                      <div class="quick-view-button"
									     id="quick-view-button"
										data-first-available-variant-id="${variant_first_id}"
										data-product-handle="${handle}"
										data-product-variants="${productWithVariants}"
									     >									
											<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M4.78125 19.4481H4.75V7.98962H19.25V19.4481H19.2188H19.1875H19.1562H19.125H19.0938H19.0625H19.0312H19H18.9688H18.9375H18.9062H18.875H18.8438H18.8125H18.7812H18.75H18.7188H18.6875H18.6562H18.625H18.5938H18.5625H18.5312H18.5H18.4688H18.4375H18.4062H18.375H18.3438H18.3125H18.2812H18.25H18.2188H18.1875H18.1562H18.125H18.0938H18.0625H18.0312H18H17.9688H17.9375H17.9062H17.875H17.8438H17.8125H17.7812H17.75H17.7188H17.6875H17.6562H17.625H17.5938H17.5625H17.5312H17.5H17.4688H17.4375H17.4062H17.375H17.3438H17.3125H17.2812H17.25H17.2188H17.1875H17.1562H17.125H17.0938H17.0625H17.0312H17H16.9688H16.9375H16.9062H16.875H16.8438H16.8125H16.7812H16.75H16.7188H16.6875H16.6562H16.625H16.5938H16.5625H16.5312H16.5H16.4688H16.4375H16.4062H16.375H16.3438H16.3125H16.2812H16.25H16.2188H16.1875H16.1562H16.125H16.0938H16.0625H16.0312H16H15.9688H15.9375H15.9062H15.875H15.8438H15.8125H15.7812H15.75H15.7188H15.6875H15.6562H15.625H15.5938H15.5625H15.5312H15.5H15.4688H15.4375H15.4062H15.375H15.3438H15.3125H15.2812H15.25H15.2188H15.1875H15.1562H15.125H15.0938H15.0625H15.0312H15H14.9688H14.9375H14.9062H14.875H14.8438H14.8125H14.7812H14.75H14.7188H14.6875H14.6562H14.625H14.5938H14.5625H14.5312H14.5H14.4688H14.4375H14.4062H14.375H14.3438H14.3125H14.2812H14.25H14.2188H14.1875H14.1562H14.125H14.0938H14.0625H14.0312H14H13.9688H13.9375H13.9062H13.875H13.8438H13.8125H13.7812H13.75H13.7188H13.6875H13.6562H13.625H13.5938H13.5625H13.5312H13.5H13.4688H13.4375H13.4062H13.375H13.3438H13.3125H13.2812H13.25H13.2188H13.1875H13.1562H13.125H13.0938H13.0625H13.0312H13H12.9688H12.9375H12.9062H12.875H12.8438H12.8125H12.7812H12.75H12.7188H12.6875H12.6562H12.625H12.5938H12.5625H12.5312H12.5H12.4688H12.4375H12.4062H12.375H12.3438H12.3125H12.2812H12.25H12.2188H12.1875H12.1562H12.125H12.0938H12.0625H12.0312H12H11.9688H11.9375H11.9062H11.875H11.8438H11.8125H11.7812H11.75H11.7188H11.6875H11.6562H11.625H11.5938H11.5625H11.5312H11.5H11.4688H11.4375H11.4062H11.375H11.3438H11.3125H11.2812H11.25H11.2188H11.1875H11.1562H11.125H11.0938H11.0625H11.0312H11H10.9688H10.9375H10.9062H10.875H10.8438H10.8125H10.7812H10.75H10.7188H10.6875H10.6562H10.625H10.5938H10.5625H10.5312H10.5H10.4688H10.4375H10.4062H10.375H10.3438H10.3125H10.2812H10.25H10.2188H10.1875H10.1562H10.125H10.0938H10.0625H10.0312H10H9.96875H9.9375H9.90625H9.875H9.84375H9.8125H9.78125H9.75H9.71875H9.6875H9.65625H9.625H9.59375H9.5625H9.53125H9.5H9.46875H9.4375H9.40625H9.375H9.34375H9.3125H9.28125H9.25H9.21875H9.1875H9.15625H9.125H9.09375H9.0625H9.03125H9H8.96875H8.9375H8.90625H8.875H8.84375H8.8125H8.78125H8.75H8.71875H8.6875H8.65625H8.625H8.59375H8.5625H8.53125H8.5H8.46875H8.4375H8.40625H8.375H8.34375H8.3125H8.28125H8.25H8.21875H8.1875H8.15625H8.125H8.09375H8.0625H8.03125H8H7.96875H7.9375H7.90625H7.875H7.84375H7.8125H7.78125H7.75H7.71875H7.6875H7.65625H7.625H7.59375H7.5625H7.53125H7.5H7.46875H7.4375H7.40625H7.375H7.34375H7.3125H7.28125H7.25H7.21875H7.1875H7.15625H7.125H7.09375H7.0625H7.03125H7H6.96875H6.9375H6.90625H6.875H6.84375H6.8125H6.78125H6.75H6.71875H6.6875H6.65625H6.625H6.59375H6.5625H6.53125H6.5H6.46875H6.4375H6.40625H6.375H6.34375H6.3125H6.28125H6.25H6.21875H6.1875H6.15625H6.125H6.09375H6.0625H6.03125H6H5.96875H5.9375H5.90625H5.875H5.84375H5.8125H5.78125H5.75H5.71875H5.6875H5.65625H5.625H5.59375H5.5625H5.53125H5.5H5.46875H5.4375H5.40625H5.375H5.34375H5.3125H5.28125H5.25H5.21875H5.1875H5.15625H5.125H5.09375H5.0625H5.03125H5H4.96875H4.9375H4.90625H4.875H4.84375H4.8125H4.78125Z" stroke="white" stroke-width="1.5" stroke-linejoin="round"/>
                                                <mask id="path-2-inside-1_422_52593" fill="white">
                                                <path d="M20 7.23963L17.4813 4H6.51867L4 7.23963M15.3578 10.053C15.3578 11.8425 13.8547 13.2926 12 13.2926C10.1453 13.2926 8.64178 11.8425 8.64178 10.053"/>
                                                </mask>
                                                <path d="M18.8158 8.1603C19.3243 8.81432 20.2667 8.93232 20.9207 8.42384C21.5747 7.91537 21.6927 6.97298 21.1842 6.31896L18.8158 8.1603ZM17.4813 4L18.6655 3.07933C18.3814 2.71381 17.9443 2.5 17.4813 2.5V4ZM6.51867 4V2.5C6.05568 2.5 5.61863 2.71381 5.33445 3.07933L6.51867 4ZM2.81579 6.31896C2.30731 6.97298 2.4253 7.91537 3.07933 8.42384C3.73335 8.93232 4.67574 8.81432 5.18421 8.1603L2.81579 6.31896ZM16.8578 10.053C16.8578 9.22456 16.1862 8.55299 15.3578 8.55299C14.5294 8.55299 13.8578 9.22456 13.8578 10.053H16.8578ZM10.1418 10.053C10.1418 9.22456 9.4702 8.55299 8.64178 8.55299C7.81335 8.55299 7.14178 9.22456 7.14178 10.053H10.1418ZM21.1842 6.31896L18.6655 3.07933L16.2971 4.92067L18.8158 8.1603L21.1842 6.31896ZM17.4813 2.5H6.51867V5.5H17.4813V2.5ZM5.33445 3.07933L2.81579 6.31896L5.18421 8.1603L7.70288 4.92067L5.33445 3.07933ZM13.8578 10.053C13.8578 10.9638 13.0774 11.7926 12 11.7926V14.7926C14.632 14.7926 16.8578 12.7211 16.8578 10.053H13.8578ZM12 11.7926C10.9224 11.7926 10.1418 10.9636 10.1418 10.053H7.14178C7.14178 12.7213 9.36829 14.7926 12 14.7926V11.7926Z" fill="white" mask="url(#path-2-inside-1_422_52593)"/>
                                                <circle cx="17.392" cy="17.392" r="5.39198" fill="#FCDB33"/>
                                                <path d="M19.2323 16.8421H17.8907V15.5314H16.8961V16.8421H15.5623V17.7827H16.8961V19.0934H17.8907V17.7827H19.2323V16.8421Z" fill="black"/>
											</svg>
                                      </div>
                                          <a href="${productUrl}" class="media">
                                                ${itemImage}
                                          </a>
                                      </div>
                                      <div class="recently-viewed__container">
                                          <p class="text ${newTagClass}">
                                                ${productTitle}
                                          </p>
                                      <div class="recently-viewed__price">
                                          <p class="text price--actual">${productPrice}</p>
                                          <p class="text price--compare-at">${productCompareAtPrice}</p>
                                      </div>
                                      </div>
                                  `;

				this.querySelector(".slide").appendChild(itemElement);
			}
		} else {
			let recentlyViewedProductsSections = document.querySelectorAll("recently-viewed-component");
			recentlyViewedProductsSections.forEach((section) => {
				section.closest("slider-component").style.display = "none";
			});
		}
	}
}

customElements.define("recently-viewed-component", RecentlyViewedComponent);

// ANCHOR: Slideshow

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

// ANCHOR: Video with text

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

// ANCHOR: Featured product

class FeaturedProduct extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = "<slot></slot>";

		this.sectionId = this.querySelector("[data-section-id]").dataset.sectionId;
		this.featuredProductVariantSelectorType = this.querySelector("[data-featured-product-variant-selector-type]").dataset.featuredProductVariantSelectorType;
		this.featuredProductColorSelectorType = this.querySelector("[data-featured-product-color-selector-type]").dataset.featuredProductColorSelectorType;

		this.featuredProductImages = JSON.parse(localStorage.getItem(`featuredProductImages-${this.sectionId}`));
		this.featuredProductVariants = JSON.parse(localStorage.getItem(`featuredProductVariants-${this.sectionId}`));
		this.featuredProductOptions = JSON.parse(localStorage.getItem(`featuredProductOptions-${this.sectionId}`));

		if (Object.keys(this.featuredProductVariants).length > 1) {
			this.addOptions();
			this.runVariant();
		} else if (Object.keys(this.featuredProductVariants).length === 1) {
			this.setVariant();
		}
	}

	addOptions() {
		for (var key in this.featuredProductOptions) {
			this.querySelector(".featured-product__options").innerHTML += `
							<div class="featured-product__radios-container featured-product__radios-container--${key}">
								<p class="featured-product__radio__title">${key}</p>
							</div>
			`;

			if (key !== "Color") {
				if (this.featuredProductVariantSelectorType === "block") {
					this.querySelector(`.featured-product__radios-container--${key}`).innerHTML += `
									<div class="featured-product__radio__content featured-product__radio__content--${key}"></div>
							`;
				} else if (this.featuredProductVariantSelectorType === "dropdown") {
					this.querySelector(`.featured-product__radios-container--${key}`).innerHTML += `
									<select name="${key}"></select>
							`;
				}
			} else if (key === "Color") {
				if (this.featuredProductColorSelectorType === "block" || this.featuredProductColorSelectorType === "variant_image" || this.featuredProductColorSelectorType === "color_swatch") {
					this.querySelector(`.featured-product__radios-container--${key}`).innerHTML += `
									<div class="featured-product__radio__content featured-product__radio__content--${key}"></div>
							`;
				} else if (this.featuredProductColorSelectorType === "dropdown") {
					this.querySelector(`.featured-product__radios-container--${key}`).innerHTML += `
									<select name="${key}"></select>
							`;
				}
			}

			this.featuredProductOptions[key].forEach((value, index) => {
				if (key !== "Color") {
					this.querySelector(`.featured-product__radios-container--${key}`).setAttribute("data-selector-type", this.featuredProductVariantSelectorType);
					if (this.featuredProductVariantSelectorType === "block") {
						this.querySelector(`.featured-product__radio__content--${key}`).innerHTML += `
						<label
							class="featured-product__radio__label "
							for="${handleize(key)}-${handleize(value)}-${this.sectionId}"
							>
							<input
								type="radio"
								name="${key}"
								value="${value}"
								id="${handleize(key)}-${handleize(value)}-${this.sectionId}"
								class="featured-product__radio__input"
							>
							${value}
						</label>
						`;
					} else if (this.featuredProductVariantSelectorType === "dropdown") {
						this.querySelector(`.featured-product__radios-container--${key} select`).innerHTML += `
										<option value="${value}" type="radio">
											${value}
										</option>
									`;
					}
				} else if (key === "Color") {
					if (this.featuredProductColorSelectorType === "block") {
						this.querySelector(`.featured-product__radios-container--${key}`).setAttribute("data-selector-type", this.featuredProductColorSelectorType);
						this.querySelector(`.featured-product__radio__content--${key}`).innerHTML += `
											<label
												class="featured-product__radio__label "
												for="${handleize(key)}-${handleize(value)}-${this.sectionId}"
												>
												<input
													type="radio"
													name="${key}"
													value="${value}"
													id="${handleize(key)}-${handleize(value)}-${this.sectionId}"
													class="featured-product__radio__input"
												>
												${value}
											</label>
										`;
					} else if (this.featuredProductColorSelectorType === "dropdown") {
						this.querySelector(`.featured-product__radios-container--${key}`).setAttribute("data-selector-type", this.featuredProductColorSelectorType);
						this.querySelector(`.featured-product__radios-container--${key} select`).innerHTML += `
										<option value="${value}" type="radio">
											${value}
										</option>
									`;
					} else if (this.featuredProductColorSelectorType === "variant_image") {
						this.querySelector(`.featured-product__radios-container--${key}`).setAttribute("data-selector-type", this.featuredProductColorSelectorType);
						let done;
						for (var vkey in this.featuredProductImages) {
							if (this.featuredProductImages[vkey].alt) {
								if (this.featuredProductImages[vkey].alt.includes("#color:")) {
									let altLastPart = this.featuredProductImages[vkey].alt.split("#color:")[1];
									if (altLastPart === value) {
										this.querySelector(`.featured-product__radio__content--${key}`).innerHTML += `
											<label
												class="featured-product__radio__label media variant_image ${handleize(value)}  "
												style=""
												for="${handleize(key)}-${handleize(value)}-${this.sectionId}"
											>
												<input  type="radio" name="${key}" value="${value}" id="${handleize(key)}-${handleize(value)}-${this.sectionId}" class="featured-product__radio__input">
											</label>
										`;
										this.querySelector(`.featured-product__radio__content--${key} label.${handleize(value)}`).innerHTML += `
											<img
												src="${this.featuredProductImages[vkey].src}"
												loading="lazy"
												alt="${this.featuredProductImages[vkey].alt}"
												width="${this.featuredProductImages[vkey].width}"
												height="${this.featuredProductImages[vkey].height}"
												class="fit"
											>
										`;
										done = true;
										break;
									}
								}
							}
						}

						if (!done) {
							this.querySelector(`.featured-product__radio__content--${key}`).innerHTML += `
								<label
									class="featured-product__radio__label media variant_image ${handleize(value)}  "
									style=""
									for="${handleize(key)}-${handleize(value)}-${this.sectionId}"
								>
									<input  type="radio" name="${key}" value="${value}" id="${handleize(key)}-${handleize(value)}-${this.sectionId}" class="featured-product__radio__input">
								</label>
							`;
							this.querySelector(`.featured-product__radio__content--${key} label.${handleize(value)}`).innerHTML += `
								${value}
							`;
						}
					} else if (this.featuredProductColorSelectorType === "color_swatch") {
						this.querySelector(`.featured-product__radios-container--${key}`).setAttribute("data-selector-type", this.featuredProductColorSelectorType);
						let done;
						for (var color in colorSwatchList) {
							if (value === color) {
								this.querySelector(`.featured-product__radio__content--${key}`).innerHTML += `
									<label
										class="featured-product__radio__label color_swatch"
										style="background-color: ${color};"
										id="${handleize(key)}-${handleize(value)}-${this.sectionId}"
									>
									<input  type="radio" name="${key}" value="${value}" id="${handleize(key)}-${handleize(value)}-${this.sectionId}" class="featured-product__radio__input">
									</label>
								`;
								done = true;
							}
						}
						if (!done) {
							this.querySelector(`.featured-product__radio__content--${key}`).innerHTML += `
									<label
										class="featured-product__radio__label color_swatch"
										id="${handleize(key)}-${handleize(value)}-${this.sectionId}"
									>
									<input  type="radio" name="${key}" value="${value}" id="${handleize(key)}-${handleize(value)}-${this.sectionId}" class="featured-product__radio__input">
									${value}
									</label>
								`;
						}
					}
				}
			});
		}
	}

	runVariant() {
		this.querySelectorAll(".featured-product__radios-container").forEach((selectorContainer) => {
			if (selectorContainer.querySelector("input")) {
				selectorContainer.querySelector("input").setAttribute("checked", "checked");
				selectorContainer.querySelector("input").parentNode.classList.add("checked");
			}
		});

		this.setVariant();

		this.querySelectorAll(".featured-product__radios-container").forEach((selectorContainer) => {
			selectorContainer.addEventListener("change", () => {
				this.setVariant();
			});
		});

		this.querySelectorAll(`.featured-product__radios-container`).forEach((selector) => {
			if (selector.dataset.selectorType === "block" || selector.dataset.selectorType === "variant_image" || selector.dataset.selectorType === "color_swatch") {
				selector.querySelectorAll(`input`).forEach((input) => {
					input.addEventListener("click", () => {
						selector.querySelectorAll(`input`).forEach((inp) => {
							inp.removeAttribute("checked");
							inp.parentNode.classList.remove("checked");
						});
						input.setAttribute("checked", "checked");
						input.parentNode.classList.add("checked");
					});
				});
			}
		});
	}

	setVariant() {
		let quantity;
		let selectedVariant;
		quantity = this.querySelector(".featured-product__quantity-field .quantity-field__input").value;

		if (Object.keys(this.featuredProductVariants).length > 1) {
			let selectedValues = this.querySelectorAll(".featured-product__radios-container");

			selectedVariant = matchVariant(selectedValues, this.featuredProductVariants);

			this.querySelector(".featured-product__price").innerHTML = `<p class="price--actual">${selectedVariant.price}</p>`;

			if (Object.keys(this.featuredProductImages).length > 1) {
				this.querySelector(".slide").innerHTML = "";
				this.querySelector(".featured-product-slider__thumbnails").innerHTML = "";

				for (vkey in this.featuredProductImages) {
					if (this.featuredProductImages[vkey].alt && this.featuredProductImages[vkey].alt.includes("#color:")) {
						let altLastPart = this.featuredProductImages[vkey].alt.split("#color:")[1];
						if (selectedVariant.title.includes(altLastPart)) {
							this.querySelector(".slide").innerHTML += `
									<div class="item reveal">
										<div class="item-picture media">
											<img
												srcset="${this.featuredProductImages[vkey].src}"
												alt=""${this.featuredProductImages[vkey].alt}"
												width="${this.featuredProductImages[vkey].with}"
												height="${this.featuredProductImages[vkey].alt}"
												class="full"
												loading="lazy"
											>
										</div>
									</div>
							    `;
							this.querySelector(".featured-product-slider__thumbnails").innerHTML += `
										<div class="thumbnail">
											<div class="thumbnail-picture media">
												<img
													srcset="${this.featuredProductImages[vkey].src}"
													alt=""${this.featuredProductImages[vkey].alt}"
													width="${this.featuredProductImages[vkey].with}"
													height="${this.featuredProductImages[vkey].alt}"
													class="full"
													loading="lazy"
												>
											</div>
										</div>
								`;
						}
					} else {
						this.querySelector(".slide").innerHTML += `
							<div class="item reveal">
								<div class="item-picture media">
									<img
										srcset="${this.featuredProductImages[vkey].src}"
										alt=""${this.featuredProductImages[vkey].alt}"
										width="${this.featuredProductImages[vkey].with}"
										height="${this.featuredProductImages[vkey].alt}"
										class="full"
										loading="lazy"
									>
								</div>
							</div>
							`;
						this.querySelector(".featured-product-slider__thumbnails").innerHTML += `
								<div class="thumbnail">
									<div class="thumbnail-picture media">
										<img
											srcset="${this.featuredProductImages[vkey].src}"
											alt=""${this.featuredProductImages[vkey].alt}"
											width="${this.featuredProductImages[vkey].with}"
											height="${this.featuredProductImages[vkey].alt}"
											class="full"
											loading="lazy"
										>
									</div>
								</div>
							`;
					}
				}
			}

			let inventory = selectedVariant.inventory;

			if (inventory > 0) {
				if (this.querySelector("#featured-product-add-to-cart").classList.contains("sold-out")) {
					this.querySelector("#featured-product-add-to-cart").classList.remove("sold-out");
					this.querySelector("#featured-product-add-to-cart").innerHTML = "ADD TO CART";
					this.querySelector("#featured-product-buy-now").style.display = "block";
				}
			} else if (inventory === 0) {
				this.querySelector("#featured-product-add-to-cart").classList.add("sold-out");
				this.querySelector("#featured-product-add-to-cart").innerHTML = "SOLD OUT";
				this.querySelector("#featured-product-buy-now").style.display = "none";
			}

			// this.querySelector("#featured-product-buy-now").href = `/cart/${selectedVariant.id}:${quantity}`;

			let injectedFunction = `sendToCart(${selectedVariant.id},${quantity})`;
			this.querySelector("#featured-product-add-to-cart").setAttribute("onclick", injectedFunction);

			this.querySelector(".featured-product__quantity-field #quantity-field").addEventListener("click", () => {
				quantity = this.querySelector(".featured-product__quantity-field .quantity-field__input").value;
				// this.querySelector("#featured-product-buy-now").href = `/cart/${selectedVariant.id}:${quantity}`;
				let injectedFunction = `sendToCart(${selectedVariant.id},${quantity})`;
				this.querySelector("#featured-product-add-to-cart").setAttribute("onclick", injectedFunction);
			});
		} else if (Object.keys(this.featuredProductVariants).length === 1) {
			selectedVariant = Object.keys(this.featuredProductVariants)[0];
			if (Object.keys(this.featuredProductImages).length > 0) {
				this.querySelector(".slide").innerHTML = "";
				this.querySelector(".featured-product-slider__thumbnails").innerHTML = "";
				for (var vkey in this.featuredProductImages) {
					this.querySelector(".slide").innerHTML += `
									<div class="item reveal">
										<div class="item-picture media">
											<img
												srcset="${this.featuredProductImages[vkey].src}"
												alt=""${this.featuredProductImages[vkey].alt}"
												width="${this.featuredProductImages[vkey].with}"
												height="${this.featuredProductImages[vkey].alt}"
												class="full"
												loading="lazy"
											>
										</div>
									</div>
									`;
					this.querySelector(".featured-product-slider__thumbnails").innerHTML += `
										<div class="thumbnail">
											<div class="thumbnail-picture media">
												<img
													srcset="${this.featuredProductImages[vkey].src}"
													alt=""${this.featuredProductImages[vkey].alt}"
													width="${this.featuredProductImages[vkey].with}"
													height="${this.featuredProductImages[vkey].alt}"
													class="full"
													loading="lazy"
												>
											</div>
										</div>
									`;
				}
			}
			// this.querySelector("#featured-product-buy-now").href = `/cart/${selectedVariant}:${quantity}`;

			let injectedFunction = `sendToCart(${selectedVariant},${quantity})`;
			this.querySelector("#featured-product-add-to-cart").setAttribute("onclick", injectedFunction);

			this.querySelector(".featured-product__quantity-field #quantity-field").addEventListener("click", () => {
				quantity = this.querySelector(".featured-product__quantity-field .quantity-field__input").value;
				// this.querySelector("#featured-product-buy-now").href = `/cart/${selectedVariant}:${quantity}`;
				let injectedFunction = `sendToCart(${selectedVariant},${quantity})`;
				this.querySelector("#featured-product-add-to-cart").setAttribute("onclick", injectedFunction);
			});
		}
	}
}

customElements.define("featured-product", FeaturedProduct);

class FeaturedProductSlider extends FeaturedProduct {
	constructor() {
		super();
	}

	connectedCallback() {
		this.sectionId = this.querySelector("[data-section-id]").dataset.sectionId;
		this.featuredProductVariantSelectorType = this.querySelector("[data-featured-product-variant-selector-type]").dataset.featuredProductVariantSelectorType;
		this.featuredProductColorSelectorType = this.querySelector("[data-featured-product-color-selector-type]").dataset.featuredProductColorSelectorType;

		this.featuredProductImages = JSON.parse(localStorage.getItem(`featuredProductImages-${this.sectionId}`));
		this.featuredProductVariants = JSON.parse(localStorage.getItem(`featuredProductVariants-${this.sectionId}`));
		this.featuredProductOptions = JSON.parse(localStorage.getItem(`featuredProductOptions-${this.sectionId}`));

		window.addEventListener("load", () => {
			if (Object.keys(this.featuredProductImages).length > 0) {
				this.loadSlider();
			}
		});

		if (Object.keys(this.featuredProductImages).length > 0) {
			let component = document.querySelector(`featured-product.${this.querySelector(".featured-product-slider").dataset.sectionId}`);
			component.querySelectorAll(".featured-product__radios-container").forEach((selectorContainer) => {
				selectorContainer.addEventListener("change", () => {
					this.loadSlider();
				});
			});
		}
	}

	loadSlider() {
		let section = document.querySelector(`featured-product.${this.sectionId}`);
		let slidesContainer = this.querySelector(".featured-product-slider__slides-container");
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

		let indicators = this.querySelectorAll(".featured-product-slider__indicators span");
		let thumbnails = this.querySelectorAll(".featured-product-slider__thumbnails .thumbnail");
		thumbnails[0].classList.add("active");
		thumbnails.forEach((thumbnail, index) => {
			thumbnail.setAttribute("data-slide-to", index);
		});

		travelToItem(indicators, ".featured-product-slider__indicators span", ".featured-product-slider__thumbnails .thumbnail");
		travelToItem(thumbnails, ".featured-product-slider__thumbnails .thumbnail", ".featured-product-slider__indicators span");

		setMaxScroll();

		function loadIndicators() {
			let indicatorsContainer = section.querySelector(".featured-product-slider__indicators");
			indicatorsContainer.innerHTML = "";
			items.forEach((item, index) => {
				if (index === 0) {
					indicatorsContainer.innerHTML += `<span data-slide-to="${index}" class="active"></span>`;
				} else {
					indicatorsContainer.innerHTML += `<span data-slide-to="${index}"></span>`;
				}
			});

			items[0].classList.add("active");
		}

		function pushActiveClass(className, direction) {
			let activeELement = section.querySelector(`${className}.active`);

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

			pushActiveClass(".featured-product-slider__slides-container .slide .item", "next");
			pushActiveClass(".featured-product-slider__indicators span", "next");
			pushActiveClass(".featured-product-slider__thumbnails .thumbnail", "next");
		}

		function movePrev() {
			let translatePrev = getTranslateX("prev");
			slide.style.transform = `translateX(${translatePrev}px)`;

			pushActiveClass(".featured-product-slider__slides-container .slide .item", "prev");
			pushActiveClass(".featured-product-slider__indicators span", "prev");

			pushActiveClass(".featured-product-slider__thumbnails .thumbnail", "prev");
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

					section.querySelector(`${actualItem}.active`).classList.remove("active");

					for (let i = 0; i < Math.abs(step); i++) {
						if (step < 0) {
							let translateNext = getTranslateX("next");
							slide.style.transform = `translateX(${translateNext}px)`;

							pushActiveClass(".featured-product-slider__slides-container .slide .item", "next");
							pushActiveClass(`${follower}`, "next");
						} else if (step > 0) {
							let translatePrev = getTranslateX("prev");
							slide.style.transform = `translateX(${translatePrev}px)`;

							pushActiveClass(".featured-product-slider__slides-container .slide .item", "prev");
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

		section.querySelectorAll(".featured-product__radios-container").forEach((selectorContainer) => {
			selectorContainer.addEventListener("change", () => {
				next.removeEventListener("click", moveNext);
				prev.removeEventListener("click", movePrev);
			});
		});
	}
}

customElements.define("featured-product-slider", FeaturedProductSlider);
