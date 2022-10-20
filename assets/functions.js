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

window.addEventListener("load", (event) => {
        document.querySelector(".search-drawer").style.height = `calc(100% - ${document.querySelector(".header-section").offsetHeight}px + 15px)`;
});

document.addEventListener("click", (event) => {
        if (document.querySelector("#header__search-icon").contains(event.target)) {
                if (document.querySelector(".search-drawer__container").classList.contains("hidden")) {
                        document.querySelector(".search-drawer__container").classList.remove("hidden");
                        document.querySelector(".search-drawer__container").classList.add("active");
                } else {
                        document.querySelector(".search-drawer__container").classList.add("hidden");
                        document.querySelector(".search-drawer__container").classList.remove("active");
                }
        } else if (!document.querySelector(".search-drawer__container").contains(event.target)) {
                document.querySelector(".search-drawer__container").classList.remove("active");
                document.querySelector(".search-drawer__container").classList.add("hidden");
        }
});

document.querySelector(".search-section__close").addEventListener("click", () => {
        document.querySelector(".search-drawer__container").classList.add("hidden");
        document.querySelector(".search-drawer__container").classList.remove("active");
});

document.querySelector(".search-section__input").addEventListener("input", (event) => {
        if (event.target.value.length > 0) {
                document.querySelector(".preload").style.display = "none";
        } else {
                document.querySelector(".preload").style.display = "flex";
        }
});
