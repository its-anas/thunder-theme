// ANCHOR: On load

const headerPadding = document.querySelector(".header-section").classList.contains("boxed") ? "+ 8px" : "";

window.addEventListener("load", () => {
	updateCartDrawer();
	endButtonsLoadingAnimation(0);
	setDropdownPadding();
});

const scrollObserver = new IntersectionObserver((entries) => {
	entries.forEach((entry) => {
		if (entry.isIntersecting) {
			entry.target.classList.add("reveal");
		}
	});
});

document.querySelectorAll("[reveal-on-scroll]").forEach((section) => {
	if (section.classList.contains("announcement")) {
		setTimeout(() => {
			scrollObserver.observe(section);
		}, 500);
	} else {
		scrollObserver.observe(section);
	}
});

if (Shopify.designMode) {
	document.addEventListener("shopify:section:load", (event) => {
		document.querySelectorAll("[reveal-on-scroll]").forEach((section) => {
			scrollObserver.observe(section);
		});
	});
}

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

function endButtonsLoadingAnimation(timeout) {
	setTimeout(() => {
		if (document.querySelector(".loading-spinner.active")) {
			document.querySelectorAll(".loading-spinner.active").forEach((spinner) => {
				spinner.classList.remove("active");
			});
		}
	}, timeout);
}

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

async function sendToCart(itemId, quantity) {
	let variantId = parseInt(itemId);

	let formData = {
		items: [
			{
				id: variantId,
				quantity: quantity,
			},
		],
	};

	await fetch(window.Shopify.routes.root + "cart/add.js", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(formData),
	})
		.then((response) => {
			if (cartType === "drawer" && !window.location.pathname.includes("/cart")) {
				updateCartDrawer().then(() => {
					showCartDrawer();
					endButtonsLoadingAnimation(800);
				});
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

function showCartDrawer() {
	if (document.querySelector("cart-component").classList.contains("hidden")) {
		document.querySelector("cart-component").classList.remove("hidden");
		document.querySelector("cart-component").classList.add("active");
		lockPage();
	}
}

async function updateCartDrawer() {
	await fetch(window.Shopify.routes.root + "cart.js")
		.then((resp) => resp.json())
		.then((data) => {
			let cartItemsCount = data.items.length;
			let itemList = [];

			if (data.item_count === 0) {
				document.querySelector(".cart-drawer__products").classList.remove("show");
				document.querySelector(".cart-drawer__products").classList.add("hide");
				document.querySelector(".cart-drawer__interaction--filled").classList.remove("show");
				document.querySelector(".cart-drawer__interaction--filled").classList.add("hide");
				document.querySelector(".free-shipping-reminder").classList.remove("show");
				document.querySelector(".free-shipping-reminder").classList.add("hide");
				document.querySelector(".cart-drawer__interaction--empty").classList.remove("hide");
				document.querySelector(".cart-drawer__interaction--empty").classList.add("show");

				document.getElementById("header__icons-cart__item-count").classList.add("hidden");
				setTimeout(() => {
					updateFreeShippingBar(data.total_price);
					document.getElementById("header__icons-cart__item-count").innerHTML = data.item_count;
				}, 500);
			} else if (data.item_count > 0) {
				updateFreeShippingBar(data.total_price);
				document.querySelector(".cart-drawer__interaction--empty").classList.remove("show");
				document.querySelector(".cart-drawer__interaction--empty").classList.add("hide");
				document.querySelector(".cart-drawer__products").classList.remove("hide");
				document.querySelector(".cart-drawer__products").classList.add("show");
				document.querySelector(".cart-drawer__interaction--filled").classList.remove("hide");
				document.querySelector(".cart-drawer__interaction--filled").classList.add("show");
				document.querySelector(".free-shipping-reminder").classList.remove("hide");
				document.querySelector(".free-shipping-reminder").classList.add("show");
				document.getElementById("header__icons-cart__item-count").innerHTML = data.item_count;
				document.getElementById("header__icons-cart__item-count").classList.remove("hidden");
			}

			document.querySelector(".cart-drawer__products-list").innerHTML = "";
			data.items.forEach((item) => {
				let variantTitle = item.variant_title !== null ? `<p class="product-variant">${item.variant_title}</p>` : "";
				let itemImage =
					item.image !== null
						? `<img srcset="${item.featured_image.url}" loading="lazy" alt="${item.featured_image.alt}" width="${item.featured_image.width}" height="${item.featured_image.height}" class="cover">`
						: "<svg class='placeholder' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 525.5 525.5'><path d='M375.5 345.2c0-.1 0-.1 0 0 0-.1 0-.1 0 0-1.1-2.9-2.3-5.5-3.4-7.8-1.4-4.7-2.4-13.8-.5-19.8 3.4-10.6 3.6-40.6 1.2-54.5-2.3-14-12.3-29.8-18.5-36.9-5.3-6.2-12.8-14.9-15.4-17.9 8.6-5.6 13.3-13.3 14-23 0-.3 0-.6.1-.8.4-4.1-.6-9.9-3.9-13.5-2.1-2.3-4.8-3.5-8-3.5h-54.9c-.8-7.1-3-13-5.2-17.5-6.8-13.9-12.5-16.5-21.2-16.5h-.7c-8.7 0-14.4 2.5-21.2 16.5-2.2 4.5-4.4 10.4-5.2 17.5h-48.5c-3.2 0-5.9 1.2-8 3.5-3.2 3.6-4.3 9.3-3.9 13.5 0 .2 0 .5.1.8.7 9.8 5.4 17.4 14 23-2.6 3.1-10.1 11.7-15.4 17.9-6.1 7.2-16.1 22.9-18.5 36.9-2.2 13.3-1.2 47.4 1 54.9 1.1 3.8 1.4 14.5-.2 19.4-1.2 2.4-2.3 5-3.4 7.9-4.4 11.6-6.2 26.3-5 32.6 1.8 9.9 16.5 14.4 29.4 14.4h176.8c12.9 0 27.6-4.5 29.4-14.4 1.2-6.5-.5-21.1-5-32.7zm-97.7-178c.3-3.2.8-10.6-.2-18 2.4 4.3 5 10.5 5.9 18h-5.7zm-36.3-17.9c-1 7.4-.5 14.8-.2 18h-5.7c.9-7.5 3.5-13.7 5.9-18zm4.5-6.9c0-.1.1-.2.1-.4 4.4-5.3 8.4-5.8 13.1-5.8h.7c4.7 0 8.7.6 13.1 5.8 0 .1 0 .2.1.4 3.2 8.9 2.2 21.2 1.8 25h-30.7c-.4-3.8-1.3-16.1 1.8-25zm-70.7 42.5c0-.3 0-.6-.1-.9-.3-3.4.5-8.4 3.1-11.3 1-1.1 2.1-1.7 3.4-2.1l-.6.6c-2.8 3.1-3.7 8.1-3.3 11.6 0 .2 0 .5.1.8.3 3.5.9 11.7 10.6 18.8.3.2.8.2 1-.2.2-.3.2-.8-.2-1-9.2-6.7-9.8-14.4-10-17.7 0-.3 0-.6-.1-.8-.3-3.2.5-7.7 3-10.5.8-.8 1.7-1.5 2.6-1.9h155.7c1 .4 1.9 1.1 2.6 1.9 2.5 2.8 3.3 7.3 3 10.5 0 .2 0 .5-.1.8-.3 3.6-1 13.1-13.8 20.1-.3.2-.5.6-.3 1 .1.2.4.4.6.4.1 0 .2 0 .3-.1 13.5-7.5 14.3-17.5 14.6-21.3 0-.3 0-.5.1-.8.4-3.5-.5-8.5-3.3-11.6l-.6-.6c1.3.4 2.5 1.1 3.4 2.1 2.6 2.9 3.5 7.9 3.1 11.3 0 .3 0 .6-.1.9-1.5 20.9-23.6 31.4-65.5 31.4h-43.8c-41.8 0-63.9-10.5-65.4-31.4zm91 89.1h-7c0-1.5 0-3-.1-4.2-.2-12.5-2.2-31.1-2.7-35.1h3.6c.8 0 1.4-.6 1.4-1.4v-14.1h2.4v14.1c0 .8.6 1.4 1.4 1.4h3.7c-.4 3.9-2.4 22.6-2.7 35.1v4.2zm65.3 11.9h-16.8c-.4 0-.7.3-.7.7 0 .4.3.7.7.7h16.8v2.8h-62.2c0-.9-.1-1.9-.1-2.8h33.9c.4 0 .7-.3.7-.7 0-.4-.3-.7-.7-.7h-33.9c-.1-3.2-.1-6.3-.1-9h62.5v9zm-12.5 24.4h-6.3l.2-1.6h5.9l.2 1.6zm-5.8-4.5l1.6-12.3h2l1.6 12.3h-5.2zm-57-19.9h-62.4v-9h62.5c0 2.7 0 5.8-.1 9zm-62.4 1.4h62.4c0 .9-.1 1.8-.1 2.8H194v-2.8zm65.2 0h7.3c0 .9.1 1.8.1 2.8H259c.1-.9.1-1.8.1-2.8zm7.2-1.4h-7.2c.1-3.2.1-6.3.1-9h7c0 2.7 0 5.8.1 9zm-7.7-66.7v6.8h-9v-6.8h9zm-8.9 8.3h9v.7h-9v-.7zm0 2.1h9v2.3h-9v-2.3zm26-1.4h-9v-.7h9v.7zm-9 3.7v-2.3h9v2.3h-9zm9-5.9h-9v-6.8h9v6.8zm-119.3 91.1c-2.1-7.1-3-40.9-.9-53.6 2.2-13.5 11.9-28.6 17.8-35.6 5.6-6.5 13.5-15.7 15.7-18.3 11.4 6.4 28.7 9.6 51.8 9.6h6v14.1c0 .8.6 1.4 1.4 1.4h5.4c.3 3.1 2.4 22.4 2.7 35.1 0 1.2.1 2.6.1 4.2h-63.9c-.8 0-1.4.6-1.4 1.4v16.1c0 .8.6 1.4 1.4 1.4H256c-.8 11.8-2.8 24.7-8 33.3-2.6 4.4-4.9 8.5-6.9 12.2-.4.7-.1 1.6.6 1.9.2.1.4.2.6.2.5 0 1-.3 1.3-.8 1.9-3.7 4.2-7.7 6.8-12.1 5.4-9.1 7.6-22.5 8.4-34.7h7.8c.7 11.2 2.6 23.5 7.1 32.4.2.5.8.8 1.3.8.2 0 .4 0 .6-.2.7-.4 1-1.2.6-1.9-4.3-8.5-6.1-20.3-6.8-31.1H312l-2.4 18.6c-.1.4.1.8.3 1.1.3.3.7.5 1.1.5h9.6c.4 0 .8-.2 1.1-.5.3-.3.4-.7.3-1.1l-2.4-18.6H333c.8 0 1.4-.6 1.4-1.4v-16.1c0-.8-.6-1.4-1.4-1.4h-63.9c0-1.5 0-2.9.1-4.2.2-12.7 2.3-32 2.7-35.1h5.2c.8 0 1.4-.6 1.4-1.4v-14.1h6.2c23.1 0 40.4-3.2 51.8-9.6 2.3 2.6 10.1 11.8 15.7 18.3 5.9 6.9 15.6 22.1 17.8 35.6 2.2 13.4 2 43.2-1.1 53.1-1.2 3.9-1.4 8.7-1 13-1.7-2.8-2.9-4.4-3-4.6-.2-.3-.6-.5-.9-.6h-.5c-.2 0-.4.1-.5.2-.6.5-.8 1.4-.3 2 0 0 .2.3.5.8 1.4 2.1 5.6 8.4 8.9 16.7h-42.9v-43.8c0-.8-.6-1.4-1.4-1.4s-1.4.6-1.4 1.4v44.9c0 .1-.1.2-.1.3 0 .1 0 .2.1.3v9c-1.1 2-3.9 3.7-10.5 3.7h-7.5c-.4 0-.7.3-.7.7 0 .4.3.7.7.7h7.5c5 0 8.5-.9 10.5-2.8-.1 3.1-1.5 6.5-10.5 6.5H210.4c-9 0-10.5-3.4-10.5-6.5 2 1.9 5.5 2.8 10.5 2.8h67.4c.4 0 .7-.3.7-.7 0-.4-.3-.7-.7-.7h-67.4c-6.7 0-9.4-1.7-10.5-3.7v-54.5c0-.8-.6-1.4-1.4-1.4s-1.4.6-1.4 1.4v43.8h-43.6c4.2-10.2 9.4-17.4 9.5-17.5.5-.6.3-1.5-.3-2s-1.5-.3-2 .3c-.1.2-1.4 2-3.2 5 .1-4.9-.4-10.2-1.1-12.8zm221.4 60.2c-1.5 8.3-14.9 12-26.6 12H174.4c-11.8 0-25.1-3.8-26.6-12-1-5.7.6-19.3 4.6-30.2H197v9.8c0 6.4 4.5 9.7 13.4 9.7h105.4c8.9 0 13.4-3.3 13.4-9.7v-9.8h44c4 10.9 5.6 24.5 4.6 30.2z'></path><path d='M286.1 359.3c0 .4.3.7.7.7h14.7c.4 0 .7-.3.7-.7 0-.4-.3-.7-.7-.7h-14.7c-.3 0-.7.3-.7.7zm5.3-145.6c13.5-.5 24.7-2.3 33.5-5.3.4-.1.6-.5.4-.9-.1-.4-.5-.6-.9-.4-8.6 3-19.7 4.7-33 5.2-.4 0-.7.3-.7.7 0 .4.3.7.7.7zm-11.3.1c.4 0 .7-.3.7-.7 0-.4-.3-.7-.7-.7H242c-19.9 0-35.3-2.5-45.9-7.4-.4-.2-.8 0-.9.3-.2.4 0 .8.3.9 10.8 5 26.4 7.5 46.5 7.5h38.1zm-7.2 116.9c.4.1.9.1 1.4.1 1.7 0 3.4-.7 4.7-1.9 1.4-1.4 1.9-3.2 1.5-5-.2-.8-.9-1.2-1.7-1.1-.8.2-1.2.9-1.1 1.7.3 1.2-.4 2-.7 2.4-.9.9-2.2 1.3-3.4 1-.8-.2-1.5.3-1.7 1.1s.2 1.5 1 1.7z'></path><path d='M275.5 331.6c-.8 0-1.4.6-1.5 1.4 0 .8.6 1.4 1.4 1.5h.3c3.6 0 7-2.8 7.7-6.3.2-.8-.4-1.5-1.1-1.7-.8-.2-1.5.4-1.7 1.1-.4 2.3-2.8 4.2-5.1 4zm5.4 1.6c-.6.5-.6 1.4-.1 2 1.1 1.3 2.5 2.2 4.2 2.8.2.1.3.1.5.1.6 0 1.1-.3 1.3-.9.3-.7-.1-1.6-.8-1.8-1.2-.5-2.2-1.2-3-2.1-.6-.6-1.5-.6-2.1-.1zm-38.2 12.7c.5 0 .9 0 1.4-.1.8-.2 1.3-.9 1.1-1.7-.2-.8-.9-1.3-1.7-1.1-1.2.3-2.5-.1-3.4-1-.4-.4-1-1.2-.8-2.4.2-.8-.3-1.5-1.1-1.7-.8-.2-1.5.3-1.7 1.1-.4 1.8.1 3.7 1.5 5 1.2 1.2 2.9 1.9 4.7 1.9z'></path><path d='M241.2 349.6h.3c.8 0 1.4-.7 1.4-1.5s-.7-1.4-1.5-1.4c-2.3.1-4.6-1.7-5.1-4-.2-.8-.9-1.3-1.7-1.1-.8.2-1.3.9-1.1 1.7.7 3.5 4.1 6.3 7.7 6.3zm-9.7 3.6c.2 0 .3 0 .5-.1 1.6-.6 3-1.6 4.2-2.8.5-.6.5-1.5-.1-2s-1.5-.5-2 .1c-.8.9-1.8 1.6-3 2.1-.7.3-1.1 1.1-.8 1.8 0 .6.6.9 1.2.9z'></path></svg>";

				let line_level_discount_allocations = item.line_level_discount_allocations;
				let discountsHtml = "";
				line_level_discount_allocations.forEach((discount_allocation) => {
					let discountTitle = discount_allocation.discount_application.title;
					let discountAmount = formatMoney(discount_allocation.amount);
					discountsHtml += `
						<div class="discount-tag">
							<svg width="12" height="12" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg" >
								<path d="M7.92736 16.0347C8.6205 16.7278 9.74908 16.7278 10.4422 16.0347L15.9607 10.5162C16.6538 9.82306 16.6538 8.69448 15.9607 8.00134L9.03816 1.07881C8.7006 0.749395 8.24795 0.564507 7.77629 0.5634L2.25782 0.5634C1.28031 0.5634 0.48053 1.36318 0.48053 2.34069V7.85916C0.48053 8.33014 0.667145 8.78335 1.00483 9.11215L7.92736 16.0347V16.0347ZM4.25726 3.22933C4.55187 3.22933 4.8344 3.34636 5.04272 3.55468C5.25104 3.76299 5.36807 4.04553 5.36807 4.34013C5.36807 4.63474 5.25104 4.91727 5.04272 5.12559C4.8344 5.33391 4.55187 5.45094 4.25726 5.45094C3.96266 5.45094 3.68012 5.33391 3.47181 5.12559C3.26349 4.91727 3.14646 4.63474 3.14646 4.34013C3.14646 4.04553 3.26349 3.76299 3.47181 3.55468C3.68012 3.34636 3.96266 3.22933 4.25726 3.22933Z" fill="var(--background-color)"></path>
							</svg>
							<span> ${discountTitle} (-${discountAmount}) </span>
						</div>
					`;
				});

				let price = formatMoney(item.final_line_price);
				let secondPrice = item.original_line_price > item.final_line_price ? formatMoney(item.original_line_price) : "";
				let discountedPriceClass = item.original_line_price > item.final_line_price ? "price--discounted" : "";

				let prices = `
						<p class="price--actual ${discountedPriceClass}">${price}</p>
						<p class="price--compare-at">${secondPrice}</p>
				`;

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
						<div class="cart-page__product-prices mobile-only">${prices}</div>
						${discountsHtml}
						<div class="quantity"> 
							<quantity-field class="quantity" data-variant-id="${item.variant_id}">
								<div class="quantity-field cart" id="quantity-field">
									<button type="button" class="quantity-field__minus" id="quantity-field__minus">-</button>
										<input
										type="quantity"
										class="quantity-field__input disabled"
										id="quantity-field__input"
										name="quantity"
										min="1"
										value="${item.quantity}"
										data-variant-id="${item.variant_id}"
										>
									<button type="button" class="quantity-field__plus" id="quantity-field__plus">+</button>
								</div>
								<a class="remove mobile-only">
								<div class="loading-spinner">
									<svg class="mini" viewBox="25 25 50 50">
									<circle  stroke="var(--icon-color)" cx="50" cy="50" r="20"></circle>
									</svg>
								</div>
								<svg class="rm-icon" width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M8.71678 7.78444V18.6032L17.0342 18.6137V7.7832M8.71678 7.78444H6.21533M8.71678 7.78444H11.0416L13.0369 7.7832L17.0342 7.7832M17.0342 7.7832H19.5292" stroke="var(--icon-color)"/>
									<path d="M9.53809 6.79688H16.2578" stroke="var(--icon-color)"/>
									<path d="M14.3414 16.6045L14.3414 9.88672M11.3965 16.6045L11.3965 9.88672" stroke="var(--icon-color)"/>
								</svg>
							</a>
							</quantity-field>
						</div>
						</div>
						<div class="cart-drawer__product__details-side tablet-desktop-only" data-variant-id="${item.variant_id}">
						<div class="cart-page__product-prices tablet-desktop-only">${prices}</div>
							<a class="remove tablet-desktop-only">
								<div class="loading-spinner">
									<svg class="mini" viewBox="25 25 50 50">
									<circle  stroke="var(--icon-color)" cx="50" cy="50" r="20"></circle>
									</svg>
								</div>
								<svg class="rm-icon" width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M8.71678 7.78444V18.6032L17.0342 18.6137V7.7832M8.71678 7.78444H6.21533M8.71678 7.78444H11.0416L13.0369 7.7832L17.0342 7.7832M17.0342 7.7832H19.5292" stroke="var(--icon-color)"/>
									<path d="M9.53809 6.79688H16.2578" stroke="var(--icon-color)"/>
									<path d="M14.3414 16.6045L14.3414 9.88672M11.3965 16.6045L11.3965 9.88672" stroke="var(--icon-color)"/>
								</svg>
							</a>
						</div>
						</div>`);
			});

			itemList.forEach((item) => {
				document.querySelector(".cart-drawer__products-list").innerHTML += item;
			});

			let cartDiscounts = data.cart_level_discount_applications;
			let cartDiscountsHTML = "";
			cartDiscounts.forEach((discount_application) => {
				let discountTitle = discount_application.title;
				let discountAmount = formatMoney(discount_application.total_allocated_amount);
				cartDiscountsHTML += `
					<div class="bottom">
						<div class="discount-tag">
							<svg width="12" height="12" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M7.92736 16.0347C8.6205 16.7278 9.74908 16.7278 10.4422 16.0347L15.9607 10.5162C16.6538 9.82306 16.6538 8.69448 15.9607 8.00134L9.03816 1.07881C8.7006 0.749395 8.24795 0.564507 7.77629 0.5634L2.25782 0.5634C1.28031 0.5634 0.48053 1.36318 0.48053 2.34069V7.85916C0.48053 8.33014 0.667145 8.78335 1.00483 9.11215L7.92736 16.0347V16.0347ZM4.25726 3.22933C4.55187 3.22933 4.8344 3.34636 5.04272 3.55468C5.25104 3.76299 5.36807 4.04553 5.36807 4.34013C5.36807 4.63474 5.25104 4.91727 5.04272 5.12559C4.8344 5.33391 4.55187 5.45094 4.25726 5.45094C3.96266 5.45094 3.68012 5.33391 3.47181 5.12559C3.26349 4.91727 3.14646 4.63474 3.14646 4.34013C3.14646 4.04553 3.26349 3.76299 3.47181 3.55468C3.68012 3.34636 3.96266 3.22933 4.25726 3.22933Z" fill="var(--background-color)"></path>
							</svg>
							<span>${discountTitle}</span>
						</div>
						<span> -${discountAmount}</span>
					</div>
				`;
			});

			document.querySelector(".cart-drawer__interaction--filled .buttons").insertAdjacentHTML("beforeBegin", cartDiscountsHTML);

			document.querySelectorAll(".cart-drawer__interaction .cart-drawer__interaction--filled .buttons .button").forEach((button, index) => {
				let buttonText = button.innerHTML.includes("- ") ? button.innerHTML.split("- ")[0] : button.innerHTML;
				if (index === 0) {
					button.innerHTML = `${buttonText} - ${data.item_count} ITEMS`;
				} else if (index === 1) {
					button.innerHTML = `${buttonText} - ${formatMoney(data.total_price)}`;
				}
			});
			document.querySelectorAll(".cart-drawer__product .remove").forEach((icon) => {
				icon.addEventListener("click", () => {
					showSpinner(icon);
					let variantId = icon.parentNode.getAttribute("data-variant-id");
					updateCartQuantity(variantId, 0).then(updateCartDrawer);
				});
			});
			document.querySelectorAll(".cart-drawer__product").forEach((field) => {
				field.addEventListener("click", (event) => {
					if (event.target.classList.contains("quantity-field__minus") || event.target.classList.contains("quantity-field__plus")) {
						let input = field.querySelector("input");
						let variantId = input.getAttribute("data-variant-id");
						let quantity = input.value;

						showSpinner(field);
						updateCartQuantity(variantId, quantity).then(updateCartDrawer);
					}
				});
			});
		});
}

const showSpinner = (icon) => {
	if (icon.querySelector(".loading-spinner")) {
		icon.querySelectorAll(".loading-spinner").forEach((spinner) => {
			spinner.classList.add("active");
		});
	}
	if (icon.querySelector(".rm-icon")) {
		icon.querySelectorAll(".rm-icon").forEach((rmIcon) => {
			rmIcon.classList.add("hide");
		});
	}
};

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
	let amount = formatMoney(freeShippingThreshold - cartAmount);
	let firstMessage = freeShippingBarFirstMessage.replace("{x}", amount);

	let freeShippingMessage = cartAmount < freeShippingThreshold ? firstMessage : freeShippingBarSecondMessage;

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

function matchVariant(allSelectedVariants, allAvailableVariants) {
	let variantsNames = [];
	let matchedVariant;

	if (allSelectedVariants.length === 1) {
		let variantValue;
		variantValue = allSelectedVariants[0].querySelector("select").value;
		variantsNames = [`${variantValue}`];
	} else if (allSelectedVariants.length === 2) {
		let variantValue1;
		let variantValue2;
		variantValue1 = allSelectedVariants[0].querySelector("select").value;
		variantValue2 = allSelectedVariants[1].querySelector("select").value;
		variantsNames = [`${variantValue1} / ${variantValue2}`, `${variantValue2} / ${variantValue1}`];
	} else if (allSelectedVariants.length === 3) {
		let variantValue1;
		let variantValue2;
		let variantValue3;
		variantValue1 = allSelectedVariants[0].querySelector("select").value;
		variantValue2 = allSelectedVariants[1].querySelector("select").value;
		variantValue3 = allSelectedVariants[2].querySelector("select").value;
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

// ANCHOR: Shop the look

class ShopTheLook extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		this.time;
		this.autoOpen = this.getAttribute("data-auto-open");
		this.desktopIcons = this.querySelectorAll(".shop-the-look__box.tablet-desktop-only .shop-the-look__icon");

		this.icons = this.querySelectorAll(".shop-the-look__icon");
		this.addEventListener("click", (event) => {
			this.icons.forEach((icon) => {
				if (icon.contains(event.target)) {
					this.handleSelectedIcon(icon);
				}
				if (event.target.classList.contains("cl-icon")) {
					this.hideAllSelectorsContent();
				}
			});
		});

		if (this.autoOpen === "true") {
			this.autoOpenSelectors();
		}
	}

	autoOpenSelectors() {
		let index = 0;
		this.time = setInterval(() => {
			const icon = this.desktopIcons[index];
			this.hideAllSelectorsContent();
			this.showSelectorContent(icon);
			index++;
			if (index >= this.desktopIcons.length) {
				index = 0;
			}
		}, 5000);
	}

	showSelectorContent(icon) {
		icon.classList.add("rotate");
		if (icon.nextElementSibling) {
			icon.nextElementSibling.classList.add("active");
		} else if (icon.dataset.blockId) {
			this.querySelector(`[content-popup="${icon.dataset.blockId}"]`).classList.add("active");
		}
	}

	hideSelectorContent(icon) {
		icon.classList.remove("rotate");
		if (icon.nextElementSibling) {
			icon.nextElementSibling.classList.remove("active");
		} else if (icon.dataset.blockId) {
			this.querySelector(`[content-popup="${icon.dataset.blockId}"]`).classList.remove("active");
		}
	}

	hideAllSelectorsContent() {
		this.icons.forEach((i) => {
			this.hideSelectorContent(i);
		});
	}

	handleSelectedIcon(icon) {
		if (!icon.classList.contains("rotate")) {
			this.hideAllSelectorsContent();
			this.showSelectorContent(icon);
		} else {
			this.hideSelectorContent(icon);
		}
		clearInterval(this.time);
	}
}

customElements.define("shop-the-look", ShopTheLook);

// ANCHOR: Menu drawer

let extraPadding = document.querySelector(".header-section").classList.contains("boxed") ? 15 : 8;
let announcementHeight = document.querySelector(".announcement") ? document.querySelector(".announcement").offsetHeight : 0;
let allChildHeights = [];
let menuChildContainer = document.querySelectorAll(".menu__childs");
let height = 0;
let margin = 32;

function setDropdownPadding() {
	document.querySelectorAll(".menu__dropdown-wrapper").forEach((dropdown) => {
		let dropdownPadding = headerLayout === "header_first" ? `calc(${announcementHeight}px + ${extraPadding}px)` : `${extraPadding}px`;
		dropdown.style.paddingTop = dropdownPadding;
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

window.addEventListener("resize", () => {
	setDropdownPadding();
});

if (Shopify.designMode) {
	document.addEventListener("shopify:section:load", (event) => {
		setDropdownPadding();
	});

	document.addEventListener("shopify:section:reorder", (event) => {
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

	showMenuDrawer() {
		this.classList.remove("hidden");
		this.classList.add("active");
		lockPage();
	}

	hideMenuDrawer() {
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
				this.showMenuDrawer();
			} else if (this.classList.contains("active")) {
				this.hideMenuDrawer();
			}
		});

		document.querySelector(".theme-overlay").addEventListener("click", () => {
			if (this.classList.contains("active")) {
				this.hideMenuDrawer();
			}
		});

		this.closeIcon.addEventListener("click", () => {
			this.hideMenuDrawer();
		});

		if (Shopify.designMode) {
			document.addEventListener("shopify:section:load", (event) => {
				event.target.classList.forEach((i) => {
					if (headerStyle === "drawer") {
						if (i === "main-header") {
							this.style.height = `calc(100% - ${document.querySelector(".header-section").offsetHeight}px ${headerPadding})`;
							this.showMenuDrawer();
						}
					}
				});
			});

			document.addEventListener("shopify:section:reorder", (event) => {
				event.target.classList.forEach((i) => {
					if (headerStyle === "drawer") {
						if (i === "main-header") {
							this.style.height = `calc(100% - ${document.querySelector(".header-section").offsetHeight}px ${headerPadding})`;
							this.showMenuDrawer();
						}
					}
				});
			});

			document.addEventListener("shopify:section:select", (event) => {
				event.target.classList.forEach((i) => {
					if (headerStyle === "drawer") {
						if (i === "main-header") {
							this.style.height = `calc(100% - ${document.querySelector(".header-section").offsetHeight}px ${headerPadding})`;
							this.showMenuDrawer();
						}
					}
				});
			});

			document.addEventListener("shopify:section:deselect", (event) => {
				event.target.classList.forEach((i) => {
					if (headerStyle === "drawer") {
						if (i === "main-header") {
							this.style.height = `calc(100% - ${document.querySelector(".header-section").offsetHeight}px ${headerPadding})`;
							this.showMenuDrawer();
						}
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
			parent.querySelector(".menu-mobile__parent-title").addEventListener("click", () => {
				let childsHeight = parent.querySelector(".menu-mobile__parent-childs").scrollHeight;
				if (!parent.querySelector(".menu-mobile__parent-childs").classList.contains("active")) {
					parent.querySelector(".menu-mobile__parent-childs").style.height = `${childsHeight}px`;
					parent.querySelector(".menu-mobile__parent-childs").classList.add("active");
				} else {
					parent.querySelector(".menu-mobile__parent-childs").style.height = "0px";
					parent.querySelector(".menu-mobile__parent-childs").classList.remove("active");
				}
			});

			parent.querySelectorAll(".menu-mobile__child").forEach((child) => {
				child.querySelector(".menu-mobile__child-title").addEventListener("click", () => {
					let grandchildsHeight = child.querySelector(".menu-mobile__child-childs").scrollHeight;
					let childsHeight = parent.querySelector(".menu-mobile__parent-childs").scrollHeight;
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

// ANCHOR: Recommended products section
class RecommendedProducts extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		fetch(this.dataset.url)
			.then((response) => response.text())
			.then((text) => {
				const html = document.createElement("div");
				html.innerHTML = text;
				const recommendations = html.querySelector("recommended-products");

				if (recommendations && recommendations.innerHTML.trim().length) {
					this.innerHTML = recommendations.innerHTML;
				}

				if (recommendations.querySelector(".slide")) {
					if (recommendations.querySelector(".slide").childElementCount === 0) {
						document.querySelector(`.${this.dataset.sectionId}`).remove();
					}
				}
			})
			.catch((e) => {
				console.error(e);
			});
	}
}

customElements.define("recommended-products", RecommendedProducts);

// ANCHOR: Slider component
class SliderComponent extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = "<slot></slot>";
		if (this.querySelector("recently-viewed-component") || this.querySelector("recommended-products")) {
			setTimeout(() => {
				this.loadSlider();
			}, 2000);
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

				let actualTranslate = parseInt(slide.style.transform === "translateX(0px)" ? 0 : slide.style.transform.match(/[-]{0,1}[\d]*[.]{0,1}[\d]+/g)[0]);
				let newTranslate = 0;

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
		const limit = this.input.dataset.limit;
		if (!searchTerm.length) {
			this.close();
			return;
		}
		this.getSearchResults(searchTerm, limit);
	}

	getSearchResults(searchTerm, limit) {
		this.showSpinner();
		fetch(window.Shopify.routes.root + `search/suggest?q=${searchTerm}&resources[type]=product&resources[limit]=${limit}&section_id=section-predictive-search`)
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
				setTimeout(() => {
					this.hideSpinner();
				}, 300);
			})
			.catch((error) => {
				this.close();
				setTimeout(() => {
					this.hideSpinner();
				}, 300);
				throw error;
			});
	}

	open() {
		this.querySelector(".preload").classList.add("hidden");
		setTimeout(() => {
			this.querySelector(".buttons").style.height = "auto";
			this.querySelector(".search-form__results").style.height = "auto";
			document.querySelector(".search-form__container").style.height = "100%";
			this.querySelector(".preload").style.height = "0";
			this.querySelector(".preload").style.padding = "0";
		}, 300);
		setTimeout(() => {
			this.querySelector(".search-form__results").classList.remove("hidden");
			this.querySelector(".buttons").classList.remove("hidden");
		}, 300);
	}

	close() {
		this.querySelector(".search-form__results").classList.add("hidden");
		this.querySelector(".buttons").classList.add("hidden");
		setTimeout(() => {
			this.querySelector(".buttons").style.height = "0";
			this.querySelector(".search-form__results").style.height = "0";
			document.querySelector(".search-form__container").style.height = "auto";
			this.querySelector(".preload").style.height = "auto";
			this.querySelector(".preload").style.padding = "0.5rem";
		}, 300);
		setTimeout(() => {
			this.querySelector(".preload").classList.remove("hidden");
		}, 300);
		setTimeout(() => {
			this.querySelector(".search-results__results-list").innerHTML = "";
		}, 1000);
	}

	debounce(fn, wait) {
		let t;
		return (...args) => {
			clearTimeout(t);
			t = setTimeout(() => fn.apply(this, args), wait);
		};
	}

	showSpinner() {
		if (document.querySelector(".search-drawer__close")) {
			document.querySelector(".search-drawer__close .loading-spinner").classList.add("active");
			if (document.querySelector(".search-drawer__close .cl-icon")) {
				document.querySelector(".search-drawer__close .cl-icon").classList.add("hide");
			}
		}
	}

	hideSpinner() {
		if (document.querySelector(".search-drawer__close")) {
			document.querySelector(".search-drawer__close .loading-spinner").classList.remove("active");
			if (document.querySelector(".search-drawer__close .cl-icon")) {
				document.querySelector(".search-drawer__close .cl-icon").classList.remove("hide");
			}
		}
	}
}

customElements.define("predictive-search", PredictiveSearch);

// ANCHOR: Search drawer

window.addEventListener("load", () => {
	document.querySelector(".search-drawer").style.height = `calc(100% - ${document.querySelector(".header-section").offsetHeight}px ${headerPadding})`;
});

class SearchDrawer extends HTMLElement {
	constructor() {
		super();

		this.searchDrawer = this.querySelector(".search-drawer");
		this.closeIcon = this.searchDrawer.querySelector(".search-drawer__close");
		this.inputField = this.searchDrawer.querySelector(".search-form__input");

		this.decideDrawerAction();
	}

	showSearchDrawer() {
		this.resetSearch();
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

		if (Shopify.designMode) {
			document.addEventListener("shopify:section:load", (event) => {
				event.target.classList.forEach((i) => {
					if (i === "main-search-drawer") {
						this.searchDrawer.style.height = `calc(100% - ${document.querySelector(".header-section").offsetHeight}px ${headerPadding})`;
						this.showSearchDrawer();
					}
				});
			});

			document.addEventListener("shopify:section:reorder", (event) => {
				event.target.classList.forEach((i) => {
					if (i === "main-search-drawer") {
						this.searchDrawer.style.height = `calc(100% - ${document.querySelector(".header-section").offsetHeight}px ${headerPadding})`;
						this.showSearchDrawer();
					}
				});
			});

			document.addEventListener("shopify:section:select", (event) => {
				event.target.classList.forEach((i) => {
					if (i === "main-search-drawer") {
						this.searchDrawer.style.height = `calc(100% - ${document.querySelector(".header-section").offsetHeight}px ${headerPadding})`;
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

// ANCHOR: Cart drawer

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
			this.querySelector(".cart-drawer__note-popup").classList.remove("hidden");
			this.querySelector(".cart-drawer__note-popup").classList.add("active");
		} else if ((!this.querySelector(".cart-drawer__note-popup").contains(event.target) && this.querySelector(".cart-drawer__note-popup").classList.contains("active")) || this.querySelector(".cart-drawer__note-popup #note-close-icon").contains(event.target)) {
			this.querySelector(".cart-drawer__note-popup").classList.remove("active");
			this.querySelector(".cart-drawer__note-popup").classList.add("hidden");
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
					this.querySelector(".cart-drawer__note-popup").classList.remove("active");
					this.querySelector(".cart-drawer__note-popup").classList.add("hidden");
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

	hideCartDrawer() {
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

		if (document.querySelector(".header__icons-cart").getAttribute("for") === "drawer" && !window.location.pathname.includes("/cart")) {
			document.querySelector(".header__icons-cart").addEventListener("click", () => {
				if (this.classList.contains("hidden")) {
					showCartDrawer();
				} else if (this.classList.contains("active")) {
					this.hideCartDrawer();
				}
			});

			document.addEventListener("click", (event) => {
				if ((document.querySelector("cart-component").classList.contains("active") && document.querySelector(".header__icons-search").contains(event.target)) || (document.querySelector("cart-component").classList.contains("active") && document.querySelector(".header__icons-drawer").contains(event.target))) {
					this.classList.remove("active");
					this.classList.add("hidden");
				}
			});

			document.querySelector(".theme-overlay").addEventListener("click", () => {
				if (this.classList.contains("active")) {
					this.hideCartDrawer();
				}
			});

			this.closeIcon.addEventListener("click", () => {
				this.hideCartDrawer();
			});

			let cartButtons = this.querySelector(".cart-drawer__interaction--filled");
			cartButtons.querySelector("button").addEventListener("click", () => {
				cartButtons.querySelector("button .loading-spinner").classList.add("active");
			});

			if (Shopify.designMode) {
				document.addEventListener("shopify:section:load", (event) => {
					event.target.classList.forEach((i) => {
						if (i === "main-cart-drawer") {
							this.style.height = `calc(100% - ${document.querySelector(".header-section").offsetHeight}px ${headerPadding})`;
							showCartDrawer();
						}
					});
				});

				document.addEventListener("shopify:section:reorder", (event) => {
					event.target.classList.forEach((i) => {
						if (i === "main-cart-drawer") {
							this.style.height = `calc(100% - ${document.querySelector(".header-section").offsetHeight}px ${headerPadding})`;
							showCartDrawer();
						}
					});
				});

				document.addEventListener("shopify:section:select", (event) => {
					event.target.classList.forEach((i) => {
						if (i === "main-cart-drawer") {
							this.style.height = `calc(100% - ${document.querySelector(".header-section").offsetHeight}px ${headerPadding})`;
							showCartDrawer();
						}
					});
				});

				document.addEventListener("shopify:section:deselect", (event) => {
					event.target.classList.forEach((i) => {
						if (i === "main-cart-drawer") {
							this.style.height = `calc(100% - ${document.querySelector(".header-section").offsetHeight}px ${headerPadding})`;
							showCartDrawer();
						}
					});
				});
			}
		}
	}
}

customElements.define("cart-component", CartComponent);

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

		this.form = this.querySelector("form");
		this.decideDrawerAction();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = "<slot></slot>";
	}

	saveInCookie(state) {
		let popupMessage = state;
		let message = JSON.stringify(popupMessage);
		if (!Shopify.designMode) {
			// let expiry = new Date(400 * 24 * 60 * 60 * 1000 + Date.parse(new Date()));
			document.cookie = "popupCookie" + "=" + message + "; path=/; domain=." + window.location.hostname;
		}
	}

	openPopupDrawer() {
		if (this.cookie !== "closed" || Shopify.designMode) {
			document.querySelector(".header-section").style.zIndex = "98";
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
			document.querySelector(".header-section").style.zIndex = "110";
		}, 300);

		this.saveInCookie("closed");
	}

	decideDrawerAction() {
		this.form.addEventListener("submit", () => {
			this.saveInCookie("sent");
		});

		if (this.cookie === "sent") {
			this.openPopupDrawer();
		} else if (!Shopify.designMode && this.drawer.classList.contains("hidden")) {
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

		document.querySelector(".popup__link").addEventListener("click", () => {
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
				let productAvailability = products[product].availability;
				let productImage = products[product].image;
				let productImageAlt = products[product].image_alt;
				let productImageWidth = products[product].image_width;
				let productImageHeight = products[product].image_height;
				let productPrices = products[product].price;
				let productPriceDifference = products[product].price_difference;
				let productPriceDifferenceWithCurrency = products[product].price_difference_with_currency;
				let date_difference = products[product].date_difference;
				let variant_first_id = parseInt(products[product].variant_first_id);
				let handle = products[product].handle;
				let variants_size = parseInt(products[product].variants_size);
				let variants_inventory = JSON.stringify(products[product].variants_inventory);

				let productWithVariants = variants_size > 1 ? "with" : "without";
				let newTagClass = newTag === "true" && date_difference < parseInt(newTagTime) ? " tag--animated-hover" : "";
				let itemElement = document.createElement("div");
				let saleTag = productPriceDifference <= 0 ? "" : `<p class="tag--animated tag-text">${saleText} ${productPriceDifferenceWithCurrency}</p>`;
				let productPlaceholder =
					"<svg class='placeholder' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 525.5 525.5'><path d='M375.5 345.2c0-.1 0-.1 0 0 0-.1 0-.1 0 0-1.1-2.9-2.3-5.5-3.4-7.8-1.4-4.7-2.4-13.8-.5-19.8 3.4-10.6 3.6-40.6 1.2-54.5-2.3-14-12.3-29.8-18.5-36.9-5.3-6.2-12.8-14.9-15.4-17.9 8.6-5.6 13.3-13.3 14-23 0-.3 0-.6.1-.8.4-4.1-.6-9.9-3.9-13.5-2.1-2.3-4.8-3.5-8-3.5h-54.9c-.8-7.1-3-13-5.2-17.5-6.8-13.9-12.5-16.5-21.2-16.5h-.7c-8.7 0-14.4 2.5-21.2 16.5-2.2 4.5-4.4 10.4-5.2 17.5h-48.5c-3.2 0-5.9 1.2-8 3.5-3.2 3.6-4.3 9.3-3.9 13.5 0 .2 0 .5.1.8.7 9.8 5.4 17.4 14 23-2.6 3.1-10.1 11.7-15.4 17.9-6.1 7.2-16.1 22.9-18.5 36.9-2.2 13.3-1.2 47.4 1 54.9 1.1 3.8 1.4 14.5-.2 19.4-1.2 2.4-2.3 5-3.4 7.9-4.4 11.6-6.2 26.3-5 32.6 1.8 9.9 16.5 14.4 29.4 14.4h176.8c12.9 0 27.6-4.5 29.4-14.4 1.2-6.5-.5-21.1-5-32.7zm-97.7-178c.3-3.2.8-10.6-.2-18 2.4 4.3 5 10.5 5.9 18h-5.7zm-36.3-17.9c-1 7.4-.5 14.8-.2 18h-5.7c.9-7.5 3.5-13.7 5.9-18zm4.5-6.9c0-.1.1-.2.1-.4 4.4-5.3 8.4-5.8 13.1-5.8h.7c4.7 0 8.7.6 13.1 5.8 0 .1 0 .2.1.4 3.2 8.9 2.2 21.2 1.8 25h-30.7c-.4-3.8-1.3-16.1 1.8-25zm-70.7 42.5c0-.3 0-.6-.1-.9-.3-3.4.5-8.4 3.1-11.3 1-1.1 2.1-1.7 3.4-2.1l-.6.6c-2.8 3.1-3.7 8.1-3.3 11.6 0 .2 0 .5.1.8.3 3.5.9 11.7 10.6 18.8.3.2.8.2 1-.2.2-.3.2-.8-.2-1-9.2-6.7-9.8-14.4-10-17.7 0-.3 0-.6-.1-.8-.3-3.2.5-7.7 3-10.5.8-.8 1.7-1.5 2.6-1.9h155.7c1 .4 1.9 1.1 2.6 1.9 2.5 2.8 3.3 7.3 3 10.5 0 .2 0 .5-.1.8-.3 3.6-1 13.1-13.8 20.1-.3.2-.5.6-.3 1 .1.2.4.4.6.4.1 0 .2 0 .3-.1 13.5-7.5 14.3-17.5 14.6-21.3 0-.3 0-.5.1-.8.4-3.5-.5-8.5-3.3-11.6l-.6-.6c1.3.4 2.5 1.1 3.4 2.1 2.6 2.9 3.5 7.9 3.1 11.3 0 .3 0 .6-.1.9-1.5 20.9-23.6 31.4-65.5 31.4h-43.8c-41.8 0-63.9-10.5-65.4-31.4zm91 89.1h-7c0-1.5 0-3-.1-4.2-.2-12.5-2.2-31.1-2.7-35.1h3.6c.8 0 1.4-.6 1.4-1.4v-14.1h2.4v14.1c0 .8.6 1.4 1.4 1.4h3.7c-.4 3.9-2.4 22.6-2.7 35.1v4.2zm65.3 11.9h-16.8c-.4 0-.7.3-.7.7 0 .4.3.7.7.7h16.8v2.8h-62.2c0-.9-.1-1.9-.1-2.8h33.9c.4 0 .7-.3.7-.7 0-.4-.3-.7-.7-.7h-33.9c-.1-3.2-.1-6.3-.1-9h62.5v9zm-12.5 24.4h-6.3l.2-1.6h5.9l.2 1.6zm-5.8-4.5l1.6-12.3h2l1.6 12.3h-5.2zm-57-19.9h-62.4v-9h62.5c0 2.7 0 5.8-.1 9zm-62.4 1.4h62.4c0 .9-.1 1.8-.1 2.8H194v-2.8zm65.2 0h7.3c0 .9.1 1.8.1 2.8H259c.1-.9.1-1.8.1-2.8zm7.2-1.4h-7.2c.1-3.2.1-6.3.1-9h7c0 2.7 0 5.8.1 9zm-7.7-66.7v6.8h-9v-6.8h9zm-8.9 8.3h9v.7h-9v-.7zm0 2.1h9v2.3h-9v-2.3zm26-1.4h-9v-.7h9v.7zm-9 3.7v-2.3h9v2.3h-9zm9-5.9h-9v-6.8h9v6.8zm-119.3 91.1c-2.1-7.1-3-40.9-.9-53.6 2.2-13.5 11.9-28.6 17.8-35.6 5.6-6.5 13.5-15.7 15.7-18.3 11.4 6.4 28.7 9.6 51.8 9.6h6v14.1c0 .8.6 1.4 1.4 1.4h5.4c.3 3.1 2.4 22.4 2.7 35.1 0 1.2.1 2.6.1 4.2h-63.9c-.8 0-1.4.6-1.4 1.4v16.1c0 .8.6 1.4 1.4 1.4H256c-.8 11.8-2.8 24.7-8 33.3-2.6 4.4-4.9 8.5-6.9 12.2-.4.7-.1 1.6.6 1.9.2.1.4.2.6.2.5 0 1-.3 1.3-.8 1.9-3.7 4.2-7.7 6.8-12.1 5.4-9.1 7.6-22.5 8.4-34.7h7.8c.7 11.2 2.6 23.5 7.1 32.4.2.5.8.8 1.3.8.2 0 .4 0 .6-.2.7-.4 1-1.2.6-1.9-4.3-8.5-6.1-20.3-6.8-31.1H312l-2.4 18.6c-.1.4.1.8.3 1.1.3.3.7.5 1.1.5h9.6c.4 0 .8-.2 1.1-.5.3-.3.4-.7.3-1.1l-2.4-18.6H333c.8 0 1.4-.6 1.4-1.4v-16.1c0-.8-.6-1.4-1.4-1.4h-63.9c0-1.5 0-2.9.1-4.2.2-12.7 2.3-32 2.7-35.1h5.2c.8 0 1.4-.6 1.4-1.4v-14.1h6.2c23.1 0 40.4-3.2 51.8-9.6 2.3 2.6 10.1 11.8 15.7 18.3 5.9 6.9 15.6 22.1 17.8 35.6 2.2 13.4 2 43.2-1.1 53.1-1.2 3.9-1.4 8.7-1 13-1.7-2.8-2.9-4.4-3-4.6-.2-.3-.6-.5-.9-.6h-.5c-.2 0-.4.1-.5.2-.6.5-.8 1.4-.3 2 0 0 .2.3.5.8 1.4 2.1 5.6 8.4 8.9 16.7h-42.9v-43.8c0-.8-.6-1.4-1.4-1.4s-1.4.6-1.4 1.4v44.9c0 .1-.1.2-.1.3 0 .1 0 .2.1.3v9c-1.1 2-3.9 3.7-10.5 3.7h-7.5c-.4 0-.7.3-.7.7 0 .4.3.7.7.7h7.5c5 0 8.5-.9 10.5-2.8-.1 3.1-1.5 6.5-10.5 6.5H210.4c-9 0-10.5-3.4-10.5-6.5 2 1.9 5.5 2.8 10.5 2.8h67.4c.4 0 .7-.3.7-.7 0-.4-.3-.7-.7-.7h-67.4c-6.7 0-9.4-1.7-10.5-3.7v-54.5c0-.8-.6-1.4-1.4-1.4s-1.4.6-1.4 1.4v43.8h-43.6c4.2-10.2 9.4-17.4 9.5-17.5.5-.6.3-1.5-.3-2s-1.5-.3-2 .3c-.1.2-1.4 2-3.2 5 .1-4.9-.4-10.2-1.1-12.8zm221.4 60.2c-1.5 8.3-14.9 12-26.6 12H174.4c-11.8 0-25.1-3.8-26.6-12-1-5.7.6-19.3 4.6-30.2H197v9.8c0 6.4 4.5 9.7 13.4 9.7h105.4c8.9 0 13.4-3.3 13.4-9.7v-9.8h44c4 10.9 5.6 24.5 4.6 30.2z'></path><path d='M286.1 359.3c0 .4.3.7.7.7h14.7c.4 0 .7-.3.7-.7 0-.4-.3-.7-.7-.7h-14.7c-.3 0-.7.3-.7.7zm5.3-145.6c13.5-.5 24.7-2.3 33.5-5.3.4-.1.6-.5.4-.9-.1-.4-.5-.6-.9-.4-8.6 3-19.7 4.7-33 5.2-.4 0-.7.3-.7.7 0 .4.3.7.7.7zm-11.3.1c.4 0 .7-.3.7-.7 0-.4-.3-.7-.7-.7H242c-19.9 0-35.3-2.5-45.9-7.4-.4-.2-.8 0-.9.3-.2.4 0 .8.3.9 10.8 5 26.4 7.5 46.5 7.5h38.1zm-7.2 116.9c.4.1.9.1 1.4.1 1.7 0 3.4-.7 4.7-1.9 1.4-1.4 1.9-3.2 1.5-5-.2-.8-.9-1.2-1.7-1.1-.8.2-1.2.9-1.1 1.7.3 1.2-.4 2-.7 2.4-.9.9-2.2 1.3-3.4 1-.8-.2-1.5.3-1.7 1.1s.2 1.5 1 1.7z'></path><path d='M275.5 331.6c-.8 0-1.4.6-1.5 1.4 0 .8.6 1.4 1.4 1.5h.3c3.6 0 7-2.8 7.7-6.3.2-.8-.4-1.5-1.1-1.7-.8-.2-1.5.4-1.7 1.1-.4 2.3-2.8 4.2-5.1 4zm5.4 1.6c-.6.5-.6 1.4-.1 2 1.1 1.3 2.5 2.2 4.2 2.8.2.1.3.1.5.1.6 0 1.1-.3 1.3-.9.3-.7-.1-1.6-.8-1.8-1.2-.5-2.2-1.2-3-2.1-.6-.6-1.5-.6-2.1-.1zm-38.2 12.7c.5 0 .9 0 1.4-.1.8-.2 1.3-.9 1.1-1.7-.2-.8-.9-1.3-1.7-1.1-1.2.3-2.5-.1-3.4-1-.4-.4-1-1.2-.8-2.4.2-.8-.3-1.5-1.1-1.7-.8-.2-1.5.3-1.7 1.1-.4 1.8.1 3.7 1.5 5 1.2 1.2 2.9 1.9 4.7 1.9z'></path><path d='M241.2 349.6h.3c.8 0 1.4-.7 1.4-1.5s-.7-1.4-1.5-1.4c-2.3.1-4.6-1.7-5.1-4-.2-.8-.9-1.3-1.7-1.1-.8.2-1.3.9-1.1 1.7.7 3.5 4.1 6.3 7.7 6.3zm-9.7 3.6c.2 0 .3 0 .5-.1 1.6-.6 3-1.6 4.2-2.8.5-.6.5-1.5-.1-2s-1.5-.5-2 .1c-.8.9-1.8 1.6-3 2.1-.7.3-1.1 1.1-.8 1.8 0 .6.6.9 1.2.9z'></path></svg>";
				let itemImage = productImage.includes("error") ? productPlaceholder : `<img srcset="${productImage}" loading="lazy" alt="${productImageAlt}" width="${productImageWidth}" height="${productImageHeight}" class="${imageStyle}" >`;

				itemElement.classList.add("item");

				let tag = productAvailability === "true" ? saleTag : `<p class="tag--disabled tag-text">${soldOutText}</p>`;

				itemElement.innerHTML = `
						<div class="recently-viewed__image corner-border">
						${tag}
							<a href="${productUrl}" class="media corner-border-target">
								${itemImage}
							</a>
						</div>
						<div class="recently-viewed__container"> 
							<p class="text ${newTagClass}">
								${productTitle}
							</p>
						<div class="recently-viewed__price"> 
							${productPrices}
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

		if (totalSlides > 1) {
			next.style.display = "block";
			prev.style.display = "block";
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

		this.querySelector(".slideshow__box").addEventListener("mouseover", () => {
			loop(false);
		});
		this.querySelector(".slideshow__box").addEventListener("mouseout", () => {
			if (this.autoPlay === "true") {
				loop(true);
			}
		});
		this.querySelector(".next").addEventListener("mouseover", () => {
			loop(false);
		});
		this.querySelector(".next").addEventListener("mouseout", () => {
			if (this.autoPlay === "true") {
				loop(true);
			}
		});
		this.querySelector(".prev").addEventListener("mouseover", () => {
			loop(false);
		});
		this.querySelector(".prev").addEventListener("mouseout", () => {
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

		this.featuredProductImages = JSON.parse(localStorage.getItem(`featuredProductImages-${this.sectionId}`));
		this.featuredProductVariants = JSON.parse(localStorage.getItem(`featuredProductVariants-${this.sectionId}`));
		this.featuredProductOptions = JSON.parse(localStorage.getItem(`featuredProductOptions-${this.sectionId}`));

		this.loadFeaturedProductContent();

		if (Shopify.designMode) {
			document.addEventListener("shopify:section:load", (event) => {
				this.loadFeaturedProductContent();
			});
			document.addEventListener("shopify:section:reorder", (event) => {
				this.loadFeaturedProductContent();
			});
			document.addEventListener("shopify:section:select", (event) => {
				this.loadFeaturedProductContent();
			});
			document.addEventListener("shopify:section:deselect", (event) => {
				this.loadFeaturedProductContent();
			});
		}
	}

	loadFeaturedProductContent() {
		if (Object.keys(this.featuredProductImages).length == 0) {
			this.querySelector(".slide").innerHTML = `
				<div class="item">
					<div class="item-picture media">
						<svg class='placeholder' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 525.5 525.5'><path d='M375.5 345.2c0-.1 0-.1 0 0 0-.1 0-.1 0 0-1.1-2.9-2.3-5.5-3.4-7.8-1.4-4.7-2.4-13.8-.5-19.8 3.4-10.6 3.6-40.6 1.2-54.5-2.3-14-12.3-29.8-18.5-36.9-5.3-6.2-12.8-14.9-15.4-17.9 8.6-5.6 13.3-13.3 14-23 0-.3 0-.6.1-.8.4-4.1-.6-9.9-3.9-13.5-2.1-2.3-4.8-3.5-8-3.5h-54.9c-.8-7.1-3-13-5.2-17.5-6.8-13.9-12.5-16.5-21.2-16.5h-.7c-8.7 0-14.4 2.5-21.2 16.5-2.2 4.5-4.4 10.4-5.2 17.5h-48.5c-3.2 0-5.9 1.2-8 3.5-3.2 3.6-4.3 9.3-3.9 13.5 0 .2 0 .5.1.8.7 9.8 5.4 17.4 14 23-2.6 3.1-10.1 11.7-15.4 17.9-6.1 7.2-16.1 22.9-18.5 36.9-2.2 13.3-1.2 47.4 1 54.9 1.1 3.8 1.4 14.5-.2 19.4-1.2 2.4-2.3 5-3.4 7.9-4.4 11.6-6.2 26.3-5 32.6 1.8 9.9 16.5 14.4 29.4 14.4h176.8c12.9 0 27.6-4.5 29.4-14.4 1.2-6.5-.5-21.1-5-32.7zm-97.7-178c.3-3.2.8-10.6-.2-18 2.4 4.3 5 10.5 5.9 18h-5.7zm-36.3-17.9c-1 7.4-.5 14.8-.2 18h-5.7c.9-7.5 3.5-13.7 5.9-18zm4.5-6.9c0-.1.1-.2.1-.4 4.4-5.3 8.4-5.8 13.1-5.8h.7c4.7 0 8.7.6 13.1 5.8 0 .1 0 .2.1.4 3.2 8.9 2.2 21.2 1.8 25h-30.7c-.4-3.8-1.3-16.1 1.8-25zm-70.7 42.5c0-.3 0-.6-.1-.9-.3-3.4.5-8.4 3.1-11.3 1-1.1 2.1-1.7 3.4-2.1l-.6.6c-2.8 3.1-3.7 8.1-3.3 11.6 0 .2 0 .5.1.8.3 3.5.9 11.7 10.6 18.8.3.2.8.2 1-.2.2-.3.2-.8-.2-1-9.2-6.7-9.8-14.4-10-17.7 0-.3 0-.6-.1-.8-.3-3.2.5-7.7 3-10.5.8-.8 1.7-1.5 2.6-1.9h155.7c1 .4 1.9 1.1 2.6 1.9 2.5 2.8 3.3 7.3 3 10.5 0 .2 0 .5-.1.8-.3 3.6-1 13.1-13.8 20.1-.3.2-.5.6-.3 1 .1.2.4.4.6.4.1 0 .2 0 .3-.1 13.5-7.5 14.3-17.5 14.6-21.3 0-.3 0-.5.1-.8.4-3.5-.5-8.5-3.3-11.6l-.6-.6c1.3.4 2.5 1.1 3.4 2.1 2.6 2.9 3.5 7.9 3.1 11.3 0 .3 0 .6-.1.9-1.5 20.9-23.6 31.4-65.5 31.4h-43.8c-41.8 0-63.9-10.5-65.4-31.4zm91 89.1h-7c0-1.5 0-3-.1-4.2-.2-12.5-2.2-31.1-2.7-35.1h3.6c.8 0 1.4-.6 1.4-1.4v-14.1h2.4v14.1c0 .8.6 1.4 1.4 1.4h3.7c-.4 3.9-2.4 22.6-2.7 35.1v4.2zm65.3 11.9h-16.8c-.4 0-.7.3-.7.7 0 .4.3.7.7.7h16.8v2.8h-62.2c0-.9-.1-1.9-.1-2.8h33.9c.4 0 .7-.3.7-.7 0-.4-.3-.7-.7-.7h-33.9c-.1-3.2-.1-6.3-.1-9h62.5v9zm-12.5 24.4h-6.3l.2-1.6h5.9l.2 1.6zm-5.8-4.5l1.6-12.3h2l1.6 12.3h-5.2zm-57-19.9h-62.4v-9h62.5c0 2.7 0 5.8-.1 9zm-62.4 1.4h62.4c0 .9-.1 1.8-.1 2.8H194v-2.8zm65.2 0h7.3c0 .9.1 1.8.1 2.8H259c.1-.9.1-1.8.1-2.8zm7.2-1.4h-7.2c.1-3.2.1-6.3.1-9h7c0 2.7 0 5.8.1 9zm-7.7-66.7v6.8h-9v-6.8h9zm-8.9 8.3h9v.7h-9v-.7zm0 2.1h9v2.3h-9v-2.3zm26-1.4h-9v-.7h9v.7zm-9 3.7v-2.3h9v2.3h-9zm9-5.9h-9v-6.8h9v6.8zm-119.3 91.1c-2.1-7.1-3-40.9-.9-53.6 2.2-13.5 11.9-28.6 17.8-35.6 5.6-6.5 13.5-15.7 15.7-18.3 11.4 6.4 28.7 9.6 51.8 9.6h6v14.1c0 .8.6 1.4 1.4 1.4h5.4c.3 3.1 2.4 22.4 2.7 35.1 0 1.2.1 2.6.1 4.2h-63.9c-.8 0-1.4.6-1.4 1.4v16.1c0 .8.6 1.4 1.4 1.4H256c-.8 11.8-2.8 24.7-8 33.3-2.6 4.4-4.9 8.5-6.9 12.2-.4.7-.1 1.6.6 1.9.2.1.4.2.6.2.5 0 1-.3 1.3-.8 1.9-3.7 4.2-7.7 6.8-12.1 5.4-9.1 7.6-22.5 8.4-34.7h7.8c.7 11.2 2.6 23.5 7.1 32.4.2.5.8.8 1.3.8.2 0 .4 0 .6-.2.7-.4 1-1.2.6-1.9-4.3-8.5-6.1-20.3-6.8-31.1H312l-2.4 18.6c-.1.4.1.8.3 1.1.3.3.7.5 1.1.5h9.6c.4 0 .8-.2 1.1-.5.3-.3.4-.7.3-1.1l-2.4-18.6H333c.8 0 1.4-.6 1.4-1.4v-16.1c0-.8-.6-1.4-1.4-1.4h-63.9c0-1.5 0-2.9.1-4.2.2-12.7 2.3-32 2.7-35.1h5.2c.8 0 1.4-.6 1.4-1.4v-14.1h6.2c23.1 0 40.4-3.2 51.8-9.6 2.3 2.6 10.1 11.8 15.7 18.3 5.9 6.9 15.6 22.1 17.8 35.6 2.2 13.4 2 43.2-1.1 53.1-1.2 3.9-1.4 8.7-1 13-1.7-2.8-2.9-4.4-3-4.6-.2-.3-.6-.5-.9-.6h-.5c-.2 0-.4.1-.5.2-.6.5-.8 1.4-.3 2 0 0 .2.3.5.8 1.4 2.1 5.6 8.4 8.9 16.7h-42.9v-43.8c0-.8-.6-1.4-1.4-1.4s-1.4.6-1.4 1.4v44.9c0 .1-.1.2-.1.3 0 .1 0 .2.1.3v9c-1.1 2-3.9 3.7-10.5 3.7h-7.5c-.4 0-.7.3-.7.7 0 .4.3.7.7.7h7.5c5 0 8.5-.9 10.5-2.8-.1 3.1-1.5 6.5-10.5 6.5H210.4c-9 0-10.5-3.4-10.5-6.5 2 1.9 5.5 2.8 10.5 2.8h67.4c.4 0 .7-.3.7-.7 0-.4-.3-.7-.7-.7h-67.4c-6.7 0-9.4-1.7-10.5-3.7v-54.5c0-.8-.6-1.4-1.4-1.4s-1.4.6-1.4 1.4v43.8h-43.6c4.2-10.2 9.4-17.4 9.5-17.5.5-.6.3-1.5-.3-2s-1.5-.3-2 .3c-.1.2-1.4 2-3.2 5 .1-4.9-.4-10.2-1.1-12.8zm221.4 60.2c-1.5 8.3-14.9 12-26.6 12H174.4c-11.8 0-25.1-3.8-26.6-12-1-5.7.6-19.3 4.6-30.2H197v9.8c0 6.4 4.5 9.7 13.4 9.7h105.4c8.9 0 13.4-3.3 13.4-9.7v-9.8h44c4 10.9 5.6 24.5 4.6 30.2z'></path><path d='M286.1 359.3c0 .4.3.7.7.7h14.7c.4 0 .7-.3.7-.7 0-.4-.3-.7-.7-.7h-14.7c-.3 0-.7.3-.7.7zm5.3-145.6c13.5-.5 24.7-2.3 33.5-5.3.4-.1.6-.5.4-.9-.1-.4-.5-.6-.9-.4-8.6 3-19.7 4.7-33 5.2-.4 0-.7.3-.7.7 0 .4.3.7.7.7zm-11.3.1c.4 0 .7-.3.7-.7 0-.4-.3-.7-.7-.7H242c-19.9 0-35.3-2.5-45.9-7.4-.4-.2-.8 0-.9.3-.2.4 0 .8.3.9 10.8 5 26.4 7.5 46.5 7.5h38.1zm-7.2 116.9c.4.1.9.1 1.4.1 1.7 0 3.4-.7 4.7-1.9 1.4-1.4 1.9-3.2 1.5-5-.2-.8-.9-1.2-1.7-1.1-.8.2-1.2.9-1.1 1.7.3 1.2-.4 2-.7 2.4-.9.9-2.2 1.3-3.4 1-.8-.2-1.5.3-1.7 1.1s.2 1.5 1 1.7z'></path><path d='M275.5 331.6c-.8 0-1.4.6-1.5 1.4 0 .8.6 1.4 1.4 1.5h.3c3.6 0 7-2.8 7.7-6.3.2-.8-.4-1.5-1.1-1.7-.8-.2-1.5.4-1.7 1.1-.4 2.3-2.8 4.2-5.1 4zm5.4 1.6c-.6.5-.6 1.4-.1 2 1.1 1.3 2.5 2.2 4.2 2.8.2.1.3.1.5.1.6 0 1.1-.3 1.3-.9.3-.7-.1-1.6-.8-1.8-1.2-.5-2.2-1.2-3-2.1-.6-.6-1.5-.6-2.1-.1zm-38.2 12.7c.5 0 .9 0 1.4-.1.8-.2 1.3-.9 1.1-1.7-.2-.8-.9-1.3-1.7-1.1-1.2.3-2.5-.1-3.4-1-.4-.4-1-1.2-.8-2.4.2-.8-.3-1.5-1.1-1.7-.8-.2-1.5.3-1.7 1.1-.4 1.8.1 3.7 1.5 5 1.2 1.2 2.9 1.9 4.7 1.9z'></path><path d='M241.2 349.6h.3c.8 0 1.4-.7 1.4-1.5s-.7-1.4-1.5-1.4c-2.3.1-4.6-1.7-5.1-4-.2-.8-.9-1.3-1.7-1.1-.8.2-1.3.9-1.1 1.7.7 3.5 4.1 6.3 7.7 6.3zm-9.7 3.6c.2 0 .3 0 .5-.1 1.6-.6 3-1.6 4.2-2.8.5-.6.5-1.5-.1-2s-1.5-.5-2 .1c-.8.9-1.8 1.6-3 2.1-.7.3-1.1 1.1-.8 1.8 0 .6.6.9 1.2.9z'></path></svg>
					</div>
				</div>
			`;
			this.querySelector(".featured-product-slider__thumbnails").innerHTML = `
					<div class="thumbnail">
						<div class="thumbnail-picture media">
							<svg class='placeholder' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 525.5 525.5'><path d='M375.5 345.2c0-.1 0-.1 0 0 0-.1 0-.1 0 0-1.1-2.9-2.3-5.5-3.4-7.8-1.4-4.7-2.4-13.8-.5-19.8 3.4-10.6 3.6-40.6 1.2-54.5-2.3-14-12.3-29.8-18.5-36.9-5.3-6.2-12.8-14.9-15.4-17.9 8.6-5.6 13.3-13.3 14-23 0-.3 0-.6.1-.8.4-4.1-.6-9.9-3.9-13.5-2.1-2.3-4.8-3.5-8-3.5h-54.9c-.8-7.1-3-13-5.2-17.5-6.8-13.9-12.5-16.5-21.2-16.5h-.7c-8.7 0-14.4 2.5-21.2 16.5-2.2 4.5-4.4 10.4-5.2 17.5h-48.5c-3.2 0-5.9 1.2-8 3.5-3.2 3.6-4.3 9.3-3.9 13.5 0 .2 0 .5.1.8.7 9.8 5.4 17.4 14 23-2.6 3.1-10.1 11.7-15.4 17.9-6.1 7.2-16.1 22.9-18.5 36.9-2.2 13.3-1.2 47.4 1 54.9 1.1 3.8 1.4 14.5-.2 19.4-1.2 2.4-2.3 5-3.4 7.9-4.4 11.6-6.2 26.3-5 32.6 1.8 9.9 16.5 14.4 29.4 14.4h176.8c12.9 0 27.6-4.5 29.4-14.4 1.2-6.5-.5-21.1-5-32.7zm-97.7-178c.3-3.2.8-10.6-.2-18 2.4 4.3 5 10.5 5.9 18h-5.7zm-36.3-17.9c-1 7.4-.5 14.8-.2 18h-5.7c.9-7.5 3.5-13.7 5.9-18zm4.5-6.9c0-.1.1-.2.1-.4 4.4-5.3 8.4-5.8 13.1-5.8h.7c4.7 0 8.7.6 13.1 5.8 0 .1 0 .2.1.4 3.2 8.9 2.2 21.2 1.8 25h-30.7c-.4-3.8-1.3-16.1 1.8-25zm-70.7 42.5c0-.3 0-.6-.1-.9-.3-3.4.5-8.4 3.1-11.3 1-1.1 2.1-1.7 3.4-2.1l-.6.6c-2.8 3.1-3.7 8.1-3.3 11.6 0 .2 0 .5.1.8.3 3.5.9 11.7 10.6 18.8.3.2.8.2 1-.2.2-.3.2-.8-.2-1-9.2-6.7-9.8-14.4-10-17.7 0-.3 0-.6-.1-.8-.3-3.2.5-7.7 3-10.5.8-.8 1.7-1.5 2.6-1.9h155.7c1 .4 1.9 1.1 2.6 1.9 2.5 2.8 3.3 7.3 3 10.5 0 .2 0 .5-.1.8-.3 3.6-1 13.1-13.8 20.1-.3.2-.5.6-.3 1 .1.2.4.4.6.4.1 0 .2 0 .3-.1 13.5-7.5 14.3-17.5 14.6-21.3 0-.3 0-.5.1-.8.4-3.5-.5-8.5-3.3-11.6l-.6-.6c1.3.4 2.5 1.1 3.4 2.1 2.6 2.9 3.5 7.9 3.1 11.3 0 .3 0 .6-.1.9-1.5 20.9-23.6 31.4-65.5 31.4h-43.8c-41.8 0-63.9-10.5-65.4-31.4zm91 89.1h-7c0-1.5 0-3-.1-4.2-.2-12.5-2.2-31.1-2.7-35.1h3.6c.8 0 1.4-.6 1.4-1.4v-14.1h2.4v14.1c0 .8.6 1.4 1.4 1.4h3.7c-.4 3.9-2.4 22.6-2.7 35.1v4.2zm65.3 11.9h-16.8c-.4 0-.7.3-.7.7 0 .4.3.7.7.7h16.8v2.8h-62.2c0-.9-.1-1.9-.1-2.8h33.9c.4 0 .7-.3.7-.7 0-.4-.3-.7-.7-.7h-33.9c-.1-3.2-.1-6.3-.1-9h62.5v9zm-12.5 24.4h-6.3l.2-1.6h5.9l.2 1.6zm-5.8-4.5l1.6-12.3h2l1.6 12.3h-5.2zm-57-19.9h-62.4v-9h62.5c0 2.7 0 5.8-.1 9zm-62.4 1.4h62.4c0 .9-.1 1.8-.1 2.8H194v-2.8zm65.2 0h7.3c0 .9.1 1.8.1 2.8H259c.1-.9.1-1.8.1-2.8zm7.2-1.4h-7.2c.1-3.2.1-6.3.1-9h7c0 2.7 0 5.8.1 9zm-7.7-66.7v6.8h-9v-6.8h9zm-8.9 8.3h9v.7h-9v-.7zm0 2.1h9v2.3h-9v-2.3zm26-1.4h-9v-.7h9v.7zm-9 3.7v-2.3h9v2.3h-9zm9-5.9h-9v-6.8h9v6.8zm-119.3 91.1c-2.1-7.1-3-40.9-.9-53.6 2.2-13.5 11.9-28.6 17.8-35.6 5.6-6.5 13.5-15.7 15.7-18.3 11.4 6.4 28.7 9.6 51.8 9.6h6v14.1c0 .8.6 1.4 1.4 1.4h5.4c.3 3.1 2.4 22.4 2.7 35.1 0 1.2.1 2.6.1 4.2h-63.9c-.8 0-1.4.6-1.4 1.4v16.1c0 .8.6 1.4 1.4 1.4H256c-.8 11.8-2.8 24.7-8 33.3-2.6 4.4-4.9 8.5-6.9 12.2-.4.7-.1 1.6.6 1.9.2.1.4.2.6.2.5 0 1-.3 1.3-.8 1.9-3.7 4.2-7.7 6.8-12.1 5.4-9.1 7.6-22.5 8.4-34.7h7.8c.7 11.2 2.6 23.5 7.1 32.4.2.5.8.8 1.3.8.2 0 .4 0 .6-.2.7-.4 1-1.2.6-1.9-4.3-8.5-6.1-20.3-6.8-31.1H312l-2.4 18.6c-.1.4.1.8.3 1.1.3.3.7.5 1.1.5h9.6c.4 0 .8-.2 1.1-.5.3-.3.4-.7.3-1.1l-2.4-18.6H333c.8 0 1.4-.6 1.4-1.4v-16.1c0-.8-.6-1.4-1.4-1.4h-63.9c0-1.5 0-2.9.1-4.2.2-12.7 2.3-32 2.7-35.1h5.2c.8 0 1.4-.6 1.4-1.4v-14.1h6.2c23.1 0 40.4-3.2 51.8-9.6 2.3 2.6 10.1 11.8 15.7 18.3 5.9 6.9 15.6 22.1 17.8 35.6 2.2 13.4 2 43.2-1.1 53.1-1.2 3.9-1.4 8.7-1 13-1.7-2.8-2.9-4.4-3-4.6-.2-.3-.6-.5-.9-.6h-.5c-.2 0-.4.1-.5.2-.6.5-.8 1.4-.3 2 0 0 .2.3.5.8 1.4 2.1 5.6 8.4 8.9 16.7h-42.9v-43.8c0-.8-.6-1.4-1.4-1.4s-1.4.6-1.4 1.4v44.9c0 .1-.1.2-.1.3 0 .1 0 .2.1.3v9c-1.1 2-3.9 3.7-10.5 3.7h-7.5c-.4 0-.7.3-.7.7 0 .4.3.7.7.7h7.5c5 0 8.5-.9 10.5-2.8-.1 3.1-1.5 6.5-10.5 6.5H210.4c-9 0-10.5-3.4-10.5-6.5 2 1.9 5.5 2.8 10.5 2.8h67.4c.4 0 .7-.3.7-.7 0-.4-.3-.7-.7-.7h-67.4c-6.7 0-9.4-1.7-10.5-3.7v-54.5c0-.8-.6-1.4-1.4-1.4s-1.4.6-1.4 1.4v43.8h-43.6c4.2-10.2 9.4-17.4 9.5-17.5.5-.6.3-1.5-.3-2s-1.5-.3-2 .3c-.1.2-1.4 2-3.2 5 .1-4.9-.4-10.2-1.1-12.8zm221.4 60.2c-1.5 8.3-14.9 12-26.6 12H174.4c-11.8 0-25.1-3.8-26.6-12-1-5.7.6-19.3 4.6-30.2H197v9.8c0 6.4 4.5 9.7 13.4 9.7h105.4c8.9 0 13.4-3.3 13.4-9.7v-9.8h44c4 10.9 5.6 24.5 4.6 30.2z'></path><path d='M286.1 359.3c0 .4.3.7.7.7h14.7c.4 0 .7-.3.7-.7 0-.4-.3-.7-.7-.7h-14.7c-.3 0-.7.3-.7.7zm5.3-145.6c13.5-.5 24.7-2.3 33.5-5.3.4-.1.6-.5.4-.9-.1-.4-.5-.6-.9-.4-8.6 3-19.7 4.7-33 5.2-.4 0-.7.3-.7.7 0 .4.3.7.7.7zm-11.3.1c.4 0 .7-.3.7-.7 0-.4-.3-.7-.7-.7H242c-19.9 0-35.3-2.5-45.9-7.4-.4-.2-.8 0-.9.3-.2.4 0 .8.3.9 10.8 5 26.4 7.5 46.5 7.5h38.1zm-7.2 116.9c.4.1.9.1 1.4.1 1.7 0 3.4-.7 4.7-1.9 1.4-1.4 1.9-3.2 1.5-5-.2-.8-.9-1.2-1.7-1.1-.8.2-1.2.9-1.1 1.7.3 1.2-.4 2-.7 2.4-.9.9-2.2 1.3-3.4 1-.8-.2-1.5.3-1.7 1.1s.2 1.5 1 1.7z'></path><path d='M275.5 331.6c-.8 0-1.4.6-1.5 1.4 0 .8.6 1.4 1.4 1.5h.3c3.6 0 7-2.8 7.7-6.3.2-.8-.4-1.5-1.1-1.7-.8-.2-1.5.4-1.7 1.1-.4 2.3-2.8 4.2-5.1 4zm5.4 1.6c-.6.5-.6 1.4-.1 2 1.1 1.3 2.5 2.2 4.2 2.8.2.1.3.1.5.1.6 0 1.1-.3 1.3-.9.3-.7-.1-1.6-.8-1.8-1.2-.5-2.2-1.2-3-2.1-.6-.6-1.5-.6-2.1-.1zm-38.2 12.7c.5 0 .9 0 1.4-.1.8-.2 1.3-.9 1.1-1.7-.2-.8-.9-1.3-1.7-1.1-1.2.3-2.5-.1-3.4-1-.4-.4-1-1.2-.8-2.4.2-.8-.3-1.5-1.1-1.7-.8-.2-1.5.3-1.7 1.1-.4 1.8.1 3.7 1.5 5 1.2 1.2 2.9 1.9 4.7 1.9z'></path><path d='M241.2 349.6h.3c.8 0 1.4-.7 1.4-1.5s-.7-1.4-1.5-1.4c-2.3.1-4.6-1.7-5.1-4-.2-.8-.9-1.3-1.7-1.1-.8.2-1.3.9-1.1 1.7.7 3.5 4.1 6.3 7.7 6.3zm-9.7 3.6c.2 0 .3 0 .5-.1 1.6-.6 3-1.6 4.2-2.8.5-.6.5-1.5-.1-2s-1.5-.5-2 .1c-.8.9-1.8 1.6-3 2.1-.7.3-1.1 1.1-.8 1.8 0 .6.6.9 1.2.9z'></path></svg>
						</div>
					</div>
			`;
		}

		this.querySelector("#featured-product-add-to-cart").addEventListener("click", () => {
			this.querySelector("#featured-product-add-to-cart .loading-spinner").classList.add("active");
		});

		let section = this.querySelector(".featured-product__container");
		if (this.querySelector(".featured-product__buttons")) {
			const targetNode = this.querySelector(".featured-product__buttons");
			const config = { childList: true, subtree: true };
			const observer = new MutationObserver(callback);
			observer.observe(targetNode, config);

			function callback(mutationList, observer) {
				for (const mutation of mutationList) {
					if (mutation.type === "childList" && mutation.target.className === "shopify-payment-button" && mutation.addedNodes.length > 0) {
						setTimeout(() => {
							section.querySelector(".shopify-payment-button__button").innerHTML += `<span></span> <span></span> <span></span> <span></span>`;
							observer.disconnect();
						}, 500);
					}
				}
			}
		}

		if (Object.keys(this.featuredProductVariants).length > 1) {
			this.runVariant();
		} else if (Object.keys(this.featuredProductVariants).length === 1) {
			this.setVariant();
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
									<div class="item">
										<div class="item-picture media">
											<img
												srcset="${this.featuredProductImages[vkey].src}"
												alt=""${this.featuredProductImages[vkey].alt}"
												width="${this.featuredProductImages[vkey].with}"
												height="${this.featuredProductImages[vkey].alt}"
												class="contain"
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
													class="contain"
													loading="lazy"
												>
											</div>
										</div>
								`;
						}
					} else {
						this.querySelector(".slide").innerHTML += `
							<div class="item">
								<div class="item-picture media">
									<img
										srcset="${this.featuredProductImages[vkey].src}"
										alt=""${this.featuredProductImages[vkey].alt}"
										width="${this.featuredProductImages[vkey].with}"
										height="${this.featuredProductImages[vkey].alt}"
										class="contain"
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
											class="contain"
											loading="lazy"
										>
									</div>
								</div>
							`;
					}
				}
			}

			let inventory = selectedVariant.inventory;

			if (selectedVariant.inventory_management === "shopify") {
				if (inventory > 0) {
					if (this.querySelector("#featured-product-add-to-cart").classList.contains("sold-out")) {
						this.querySelector("#featured-product-add-to-cart").classList.remove("sold-out");
						this.querySelector("#featured-product-add-to-cart").innerHTML = `<span></span> <span></span> <span></span> <span></span>${addToCartText}<div class="loading-spinner" style="background-color:var(--primary-button-background-color);"> <svg viewBox="25 25 50 50"> <circle stroke="var(--primary-button-text-color)" cx="50" cy="50" r="20"></circle> </svg> </div>`;
						this.querySelector("#featured-product-buy-now").style.display = "block";
					}
				} else if (inventory === 0) {
					this.querySelector("#featured-product-add-to-cart").classList.add("sold-out");
					this.querySelector("#featured-product-add-to-cart").innerHTML = soldOutText;
					this.querySelector("#featured-product-buy-now").style.display = "none";
				}
			}

			let injectedFunction = `sendToCart(${selectedVariant.id},${quantity})`;
			this.querySelector("#featured-product-add-to-cart").setAttribute("onclick", injectedFunction);
			this.querySelector("#featured-product-buy-now input[name='id']").setAttribute("value", selectedVariant.id);

			this.querySelector(".featured-product__quantity-field #quantity-field").addEventListener("click", () => {
				quantity = this.querySelector(".featured-product__quantity-field .quantity-field__input").value;
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
									<div class="item">
										<div class="item-picture media">
											<img
												srcset="${this.featuredProductImages[vkey].src}"
												alt=""${this.featuredProductImages[vkey].alt}"
												width="${this.featuredProductImages[vkey].with}"
												height="${this.featuredProductImages[vkey].alt}"
												class="contain"
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
													class="contain"
													loading="lazy"
												>
											</div>
										</div>
									`;
				}
			}

			let injectedFunction = `sendToCart(${selectedVariant},${quantity})`;
			this.querySelector("#featured-product-add-to-cart").setAttribute("onclick", injectedFunction);

			this.querySelector(".featured-product__quantity-field #quantity-field").addEventListener("click", () => {
				quantity = this.querySelector(".featured-product__quantity-field .quantity-field__input").value;
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

		this.featuredProductImages = JSON.parse(localStorage.getItem(`featuredProductImages-${this.sectionId}`));
		this.featuredProductVariants = JSON.parse(localStorage.getItem(`featuredProductVariants-${this.sectionId}`));
		this.featuredProductOptions = JSON.parse(localStorage.getItem(`featuredProductOptions-${this.sectionId}`));

		window.addEventListener("load", () => {
			if (Object.keys(this.featuredProductImages).length > 0) {
				this.loadSlider();
			}
		});

		if (Shopify.designMode) {
			document.addEventListener("shopify:section:load", (event) => {
				this.loadSlider();
			});
			document.addEventListener("shopify:section:reorder", (event) => {
				this.loadSlider();
			});
			document.addEventListener("shopify:section:select", (event) => {
				this.loadSlider();
			});
			document.addEventListener("shopify:section:deselect", (event) => {
				this.loadSlider();
			});
		}

		if (Object.keys(this.featuredProductImages).length > 0) {
			let component = document.querySelector(`featured-product.${this.querySelector(".featured-product-slider").dataset.sectionId}`);
			component.querySelectorAll(".featured-product__radios-container").forEach((selectorContainer) => {
				selectorContainer.addEventListener("change", () => {
					this.loadSlider();
				});
			});
		}

		this.querySelector(`.${this.sectionId} .zoom-icon`).addEventListener("click", () => {
			document.querySelector(`.${this.sectionId} .featured-product__pictures`).classList.toggle("zoom-in");
		});
		document.querySelector(`.${this.sectionId} .featured-product__close`).addEventListener("click", () => {
			document.querySelector(`.${this.sectionId} .featured-product__pictures`).classList.toggle("zoom-in");
		});
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
			updateTranslate();
		}

		function movePrev() {
			let translatePrev = getTranslateX("prev");
			slide.style.transform = `translateX(${translatePrev}px)`;

			pushActiveClass(".featured-product-slider__slides-container .slide .item", "prev");
			pushActiveClass(".featured-product-slider__indicators span", "prev");
			pushActiveClass(".featured-product-slider__thumbnails .thumbnail", "prev");
			updateTranslate();
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

		function updateTranslate() {
			itemWidth = item.offsetWidth;
			let actualActiveItemIndex = parseInt(section.querySelector(`.featured-product-slider__indicators .active`).getAttribute("data-slide-to"));
			newTranslate = actualActiveItemIndex * itemWidth * -1;
			slide.style.transform = `translateX(${newTranslate}px)`;
		}

		section.querySelector(`.zoom-icon`).addEventListener("click", () => {
			updateTranslate();
		});
		section.querySelector(`.featured-product__close`).addEventListener("click", () => {
			updateTranslate();
		});
		window.addEventListener("resize", () => {
			updateTranslate();
		});

		document.querySelectorAll(".featured-product-slider__indicators").forEach((indicator) => {
			indicator.addEventListener("click", () => {
				updateTranslate();
			});
		});

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

// ANCHOR: Localization Form

class LocalizationForm extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		this.form = this.querySelector("form");
		this.querySelector("select").addEventListener("change", (e) => {
			this.querySelector("input[id=hidden_value]").value = e.target.value;
			this.form.submit();
		});
	}
}

customElements.define("localization-form", LocalizationForm);
