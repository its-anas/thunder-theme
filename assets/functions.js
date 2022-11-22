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
		icon.nextElementSibling.classList.add("clicked");
	} else {
		icon.classList.remove("shop-the-look__icon-rotate");
		icon.nextElementSibling.classList.remove("clicked");
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

// ANCHOR: Menu drawer - height and padding

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

function showDrawer() {
	updateCartDrawer().then(() => {
		setCartState();
		lockPage();
		document.querySelector("cart-component").classList.remove("hidden");
		document.querySelector("cart-component").classList.add("active");
	});
}

function setCartState() {
	fetch("/cart.js")
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

				setTimeout(() => {
					document.querySelector(".cart-drawer__interaction--empty").classList.remove("hide");
					document.querySelector(".cart-drawer__interaction--empty").classList.add("show");
				}, 300);

				setTimeout(() => {
					updateFreeShippingBar(data.total_price);
					addCartRecommendedProducts(data.items);
				}, 500);
			} else if (cartItemsCount > 0) {
				updateFreeShippingBar(data.total_price);
				addCartRecommendedProducts(data.items);

				if (document.querySelector(".recommended-products.desktop-only")) {
					setTimeout(() => {
						document.querySelector(".recommended-products.desktop-only").classList.add("active");
					}, 500);
				}

				document.querySelector(".cart-drawer__interaction--empty").classList.remove("show");
				document.querySelector(".cart-drawer__interaction--empty").classList.add("hide");

				setTimeout(() => {
					document.querySelector(".cart-drawer__products").classList.remove("hide");
					document.querySelector(".cart-drawer__products").classList.add("show");
					document.querySelector(".cart-drawer__interaction--filled").classList.remove("hide");
					document.querySelector(".cart-drawer__interaction--filled").classList.add("show");
					document.querySelector(".free-shipping-reminder").classList.remove("hide");
					document.querySelector(".free-shipping-reminder").classList.add("show");
				}, 300);
			}
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
											<p class="product-name">${product.title.substring(15, length)}...</p>
											<p class="price--actual">${formatMoney(product.price)}</p>
										</div>
										<a href="${product.url}" class="button--link">VIEW PRODUCT</a>
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
											<p class="product-name">${product.title.substring(15, length)}...</p>
											<p class="price--actual">${formatMoney(product.price)}</p>
										<a href="${product.url}" class="button--link">VIEW PRODUCT</a>
										</div>
									</div>
								`;
						});
					}
				}
			});
	});
}

function sendToCart(itemId, quantity) {
	let formData = {
		items: [
			{
				id: itemId,
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
