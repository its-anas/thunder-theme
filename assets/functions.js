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
