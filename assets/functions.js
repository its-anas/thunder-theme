/**---------------------Media queries---------------------**/
let mediaQueries = [window.matchMedia("screen and (max-width: 750px)"), window.matchMedia("screen and (min-width: 751px) and (max-width: 1024px)"), window.matchMedia("screen and (min-width: 1025px)")];

/**---------------------Actual date and domain name---------------------**/
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

document.querySelectorAll("img").forEach((img) => {
        img.addEventListener("load", () => {
                img.classList.add("reveal");
        });
});
