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
