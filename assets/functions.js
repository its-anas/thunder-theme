let mediaQueries = [window.matchMedia("screen and (max-width: 750px)"), window.matchMedia("screen and (min-width: 751px) and (max-width: 1024px)"), window.matchMedia("screen and (min-width: 1025px)")];
let domainName = window.location.hostname;
let actualDate = new Date().getTime();

/**---------------------Lazy load the background-images---------------------**/
// document.addEventListener("DOMContentLoaded", function () {
//         let lazyloadImages;

//         if ("IntersectionObserver" in window) {
//                 lazyloadImages = document.querySelectorAll(".lazy");
//                 let imageObserver = new IntersectionObserver(function (entries, observer) {
//                         entries.forEach(function (entry) {
//                                 if (entry.isIntersecting) {
//                                         let image = entry.target;
//                                         image.classList.remove("lazy");
//                                         imageObserver.unobserve(image);
//                                 }
//                         });
//                 });

//                 lazyloadImages.forEach(function (image) {
//                         imageObserver.observe(image);
//                 });
//         } else {
//                 let lazyloadThrottleTimeout;
//                 lazyloadImages = document.querySelectorAll(".lazy");

//                 function lazyload() {
//                         if (lazyloadThrottleTimeout) {
//                                 clearTimeout(lazyloadThrottleTimeout);
//                         }

//                         lazyloadThrottleTimeout = setTimeout(function () {
//                                 let scrollTop = window.pageYOffset;
//                                 lazyloadImages.forEach(function (img) {
//                                         if (img.offsetTop < window.innerHeight + scrollTop) {
//                                                 img.src = img.dataset.src;
//                                                 img.classList.remove("lazy");
//                                         }
//                                 });
//                                 if (lazyloadImages.length == 0) {
//                                         document.removeEventListener("scroll", lazyload);
//                                         window.removeEventListener("resize", lazyload);
//                                         window.removeEventListener("orientationChange", lazyload);
//                                 }
//                         }, 20);
//                 }

//                 document.addEventListener("scroll", lazyload);
//                 window.addEventListener("resize", lazyload);
//                 window.addEventListener("orientationChange", lazyload);
//         }
// });

// ANCHOR: Shop the look
let icons = document.querySelectorAll(".shop-the-look__icon");

icons.forEach((icon) => {
        icon.addEventListener("click", () => {
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
        });
});

document.addEventListener("click", (event) => {
        icons.forEach((icon) => {
                if (!icon.contains(event.target)) {
                        icon.classList.remove("shop-the-look__icon-rotate");
                        if (icon.nextElementSibling) {
                                icon.nextElementSibling.classList.remove("clicked");
                        }
                }
        });
});

// ANCHOR: Search drawer
let searchDrawer = document.querySelector(".search-drawer");

window.addEventListener("load", (event) => {
        document.querySelector(".search-drawer").style.height = `calc(100% - ${document.querySelector(".header-section").offsetHeight}px + 15px)`;
});
for (let i = 0; i < mediaQueries.length; i++) {
        mediaQueries[i].addEventListener("change", () => {
                document.querySelector(".search-drawer").style.height = `calc(100% - ${document.querySelector(".header-section").offsetHeight}px + 15px)`;
        });
}

function showSearchDrawer() {
        document.querySelector(".search-drawer").classList.remove("hidden");
        document.querySelector(".search-drawer").classList.add("active");
        document.querySelector("html").classList.add("lock");
        document.querySelector(".theme-overlay").classList.remove("hidden");
}

function hideSearchDrawer() {
        document.querySelector(".search-drawer").classList.remove("active");
        document.querySelector(".search-drawer").classList.add("hidden");
        document.querySelector("html").classList.remove("lock");
        document.querySelector(".theme-overlay").classList.add("hidden");
}

function resetSearch() {
        document.querySelector(".search-section__input").value = "";
        document.querySelector(".search-section__results").classList.add("hidden");
}

document.addEventListener("shopify:section:load", function (event) {
        event.target.classList.forEach((i) => {
                if (i === "section-search-drawer") {
                        document.querySelector(".search-drawer").style.height = `calc(100% - ${document.querySelector(".header-section").offsetHeight}px + 15px)`;
                        showSearchDrawer();
                }
        });
});

document.addEventListener("shopify:section:select", function (event) {
        event.target.classList.forEach((i) => {
                if (i === "section-search-drawer") {
                        document.querySelector(".search-drawer").style.height = `calc(100% - ${document.querySelector(".header-section").offsetHeight}px + 15px)`;
                        showSearchDrawer();
                }
        });
});

document.addEventListener("shopify:section:deselect", function (event) {
        event.target.classList.forEach((i) => {
                if (i === "section-search-drawer") {
                        hideSearchDrawer();
                }
        });
});

document.addEventListener("click", (event) => {
        if (document.querySelector("#header__search-icon").contains(event.target)) {
                if (searchDrawer.classList.contains("hidden")) {
                        showSearchDrawer();
                } else {
                        hideSearchDrawer();
                }
        } else if (!searchDrawer.contains(event.target)) {
                hideSearchDrawer();
                resetSearch();
        }
});

document.querySelector(".search-section__close").addEventListener("click", () => {
        hideSearchDrawer();
        resetSearch();
});

document.querySelector(".search-section__input").addEventListener("input", (event) => {
        if (event.target.value.length > 0) {
                document.querySelector(".preload").classList.add("hidden");
        } else {
                document.querySelector(".preload").classList.remove("hidden");
        }
});
