let mediaQueries = [window.matchMedia("screen and (max-width: 750px)"), window.matchMedia("screen and (min-width: 751px) and (max-width: 1024px)"), window.matchMedia("screen and (min-width: 1025px)")];
let domainName = window.location.hostname;
let actualDate = new Date().getTime();

// ANCHOR: Shop the look
let icons = document.querySelectorAll(".shop-the-look__icon");

document.addEventListener("click", (event) => {
        icons.forEach((icon) => {
                if (!icon.contains(event.target)) {
                        icon.classList.remove("shop-the-look__icon-rotate");
                        if (icon.nextElementSibling) {
                                icon.nextElementSibling.classList.remove("clicked");
                        }
                } else if (icon.contains(event.target)) {
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
        });
});

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
        document.querySelector(".search-drawer").style.height = `calc(100% - ${document.querySelector(".header-section").offsetHeight}px + 15px)`;
});

window.addEventListener("resize", () => {
        document.querySelector(".search-drawer").style.height = `calc(100% - ${document.querySelector(".header-section").offsetHeight}px + 15px)`;
});

// ANCHOR: Menu drawer

let extraPadding = document.querySelector(".header-section").classList.contains("boxed") ? 15 : 0;

window.addEventListener("load", () => {
        document.querySelector(".menu__dropdown-wrapper").style.paddingTop = `calc(${document.querySelector(".announcement").offsetHeight}px + ${extraPadding}px)`;
});

window.addEventListener("resize", () => {
        document.querySelector(".menu__dropdown-wrapper").style.paddingTop = `calc(${document.querySelector(".announcement").offsetHeight}px + ${extraPadding}px)`;
});
