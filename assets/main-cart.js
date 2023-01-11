document.querySelectorAll(".cart-page__product quantity-field").forEach((field) => {
	field.addEventListener("click", (event) => {
		if (event.target.classList.contains("quantity-field__minus") || event.target.classList.contains("quantity-field__plus")) {
			showSpinner(field);
			let input = field.querySelector("input");
			let variantId = input.getAttribute("data-variant-id");
			let quantity = input.value;

			updateCartQuantity(variantId, quantity).then(() => {
				window.location.reload();
			});
		}
	});
});

document.querySelectorAll(".cart-page__product .remove").forEach((icon) => {
	icon.addEventListener("click", () => {
		showSpinner(icon);
		let variantId = icon.getAttribute("data-variant-id");
		updateCartQuantity(variantId, 0).then(() => {
			window.location.reload();
		});
	});
});

const showSpinner = (icon) => {
	if (icon.querySelector(".loading-spinner")) {
		icon.querySelector(".loading-spinner").classList.add("active");
		if (icon.querySelector(".rm-icon")) {
			icon.querySelector(".rm-icon").classList.add("hide");
		}
	}
};
