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

				itemElement.classList.add("item");

				itemElement.innerHTML = `
                                      <div class="recently-viewed__image">
                                      ${saleTag}
                                      <div class="quick-add-icon"
									     id="quick-add-button"
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
                                                <img srcset="${productImage}" loading="lazy" alt="${productImageAlt}" width="${productImageWidth}" height="${productImageHeight}" class="${imageStyle}" >
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