// SECTION: FAQ
/* 1. Select all the faq__tab class elements and store them in a variable called faqTabs.
2. Loop through each of the faqTabs elements.
3. Select the answer by using the childNodes property and store it in a variable called answer.
4. Get the height of the answer by using the scrollHeight property and store it in a variable called answerHeight.
5. Add an event listener to each of the faqTabs elements.
6. When the faqTabs element is clicked, toggle the classList of tab to active.
7. If the tab has the active classList, then set the height of the answer to answerHeight + 20px, otherwise set it to 0px.  */

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

// SECTION: Countdown timer
/* 1. The code checks if the countdown type is "date" or "time".
2. If it is "date", the code sets the deadline to the date specified in the "timeInDate" variable.
3. If it is "time":
3.1 the code checks if the cookie exists. 
3.1.1 If it does, the code checks if the current date is greater than the cookie date. 
3.1.1.1 If it is, the code checks if the "afterExpirationTimeOnly" variable is set to "repeatCountdown". 
3.1.1.1.1 If it is, the code saves a new cookie with the current date plus the time specified in the "timeInMinutes" variable. 
3.1.1.2 If the "afterExpirationTimeOnly" variable is not set to "repeatCountdown", the code does nothing. 
3.1.2 If the current date is not greater than the cookie date, the code does nothing. 
3.2 If the cookie does not exist, the code saves a new cookie with the current date plus the time specified in the "timeInMinutes" variable.
4. The code then initializes the clock.
5. The code finally creates a function that updates the clock every second.*/

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

// SECTION: Video with text
/* 1. We get all the video boxes (the ones that contain the thumbnail and the video)
2. We loop through each video box
3. We get the thumbnail and the video in the box
4. When the user clicks on the thumbnail, we get the original video src and add &autoplay=1 to it (this is the magic that makes the video autoplay)
5. We show the video and hide the thumbnail
6. When the video ends, we reset the video src and hide the video and show the thumbnail again */

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

// SECTION: Slideshow
/* 1. First, we select all the elements we need to manipulate and other variables we need to use.
2. We create and call a function that will load the indicators dynamically.
3. We create two functions, one will slide to the next slide and the other to the previous slide.
4. We add event listeners to the next and previous button that will call the slideToNext or slideToPrev function.
5. We create and call a function that will start the loop, that will slide the slides automatically when passing it the true parameter..
6. We add an event listener to the slideshow that will stop the loop when the mouse is on top of it and restarts it when the mouse is not on top of it.
7. We add an event listener to the slideshow container that will check if the transition is finished and if it is finished, it will check the direction and move the slides to the next or to the previous slide.
8. We create and call a function that will update the indicators.
9. We select all the indicators and add an event listener that will check which indicator was clicked and will slide the slides to the clicked indicator. */

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

                if (totalSlides <= 1) {
                        next.style.display = "none";
                        prev.style.display = "none";
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
                                console.log("clicked");
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

                this.addEventListener("mouseover", () => {
                        loop(false);
                });
                this.addEventListener("mouseout", () => {
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

// SECTION: Announcement bar

class Announcement extends HTMLElement {
        constructor() {
                super();
        }
        connectedCallback() {
                this.attachShadow({ mode: "open" });
                this.shadowRoot.innerHTML = "<slot></slot>";
                this.loadSlideshow();
        }
        loadSlideshow() {
                let announcement = this.querySelector(".announcement");
                let announcementContainer = this.querySelector(".announcement__container");
                let announcementSlides = this.querySelectorAll(".announcement__container .announcement__slide");
                let prev = this.querySelector(".prev");
                let next = this.querySelector(".next");
                let totalSlides = announcementSlides.length;
                let step = 100 / totalSlides;
                this.delayTime = parseInt(this.getAttribute("data-delay-time"));
                this.autoPlay = this.getAttribute("data-autoplay");
                let activeSlide = 0;
                let activeIndicator = 0;
                let direction = -1;
                let jump = 1;
                let interval = this.delayTime;
                let time;

                if (totalSlides <= 1) {
                        if (next) {
                                next.style.display = "none";
                        }
                        if (prev) {
                                prev.style.display = "none";
                        }
                }

                function slideToNext() {
                        if (direction === -1) {
                                direction = -1;
                        } else if (direction === 1) {
                                direction = -1;
                                announcementContainer.prepend(announcementContainer.lastElementChild);
                        }
                        if (announcement) {
                                announcement.style.justifyContent = "flex-start";
                        }
                        if (totalSlides <= 1) {
                        } else {
                                announcementContainer.style.transform = `translateX(-${step}%)`;
                        }
                }

                function slideToPrev() {
                        if (direction === -1) {
                                direction = 1;
                                announcementContainer.append(announcementContainer.firstElementChild);
                        } else if (direction === 1) {
                                direction = 1;
                        }
                        announcement.style.justifyContent = "flex-end";
                        if (totalSlides <= 1) {
                        } else {
                                announcementContainer.style.transform = `translateX(${step}%)`;
                        }
                }
                if (next) {
                        next.addEventListener("click", () => {
                                slideToNext();
                        });
                }
                if (prev) {
                        prev.addEventListener("click", () => {
                                slideToPrev();
                        });
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

                this.addEventListener("mouseover", () => {
                        loop(false);
                });

                this.addEventListener("mouseout", () => {
                        if (this.autoPlay === "true") {
                                loop(true);
                        }
                });

                if (announcementContainer) {
                        announcementContainer.addEventListener("transitionend", (event) => {
                                if (event.target.className == "announcement__container") {
                                        if (direction === -1) {
                                                if (jump > 1) {
                                                        for (let i = 0; i < jump; i++) {
                                                                activeSlide++;
                                                                announcementContainer.append(announcementContainer.firstElementChild);
                                                        }
                                                } else {
                                                        activeSlide++;
                                                        announcementContainer.append(announcementContainer.firstElementChild);
                                                }
                                        } else if (direction === 1) {
                                                if (jump > 1) {
                                                        for (let i = 0; i < jump; i++) {
                                                                activeSlide--;
                                                                announcementContainer.prepend(announcementContainer.lastElementChild);
                                                        }
                                                } else {
                                                        activeSlide--;
                                                        announcementContainer.prepend(announcementContainer.lastElementChild);
                                                }
                                        }
                                        announcementContainer.style.transition = "none";
                                        announcementContainer.style.transform = "translateX(0%)";
                                        setTimeout(() => {
                                                jump = 1;
                                                announcementContainer.style.transition = "all 0.8s cubic-bezier(0.45, 0.05, 0.55, 0.95)";
                                        });
                                }
                        });
                }
        }
}

customElements.define("announcement-bar", Announcement);

// ANCHOR: Slider component
/* Here is the explanation for the code above:
1. The first function (setMaxScroll) is called when the page loads and then every time the window is resized or the media queries are changed. It sets the maxSliderScroll variable which is used to calculate the maximum scroll amount for the slider. It also sets the visibility of the next/prev buttons depending on the number of items found and the number of items displayed. 
2. The getTranslateX function calculates the new translateX value for the slider depending on the type of action (next or prev). This is used in the moveNext and movePrev functions. These functions also hide and show the next/prev buttons depending on the new translateX value.
3. The event listeners for the next/prev buttons and the media queries call the setMaxScroll function. */

class SliderComponent extends HTMLElement {
        constructor() {
                super();
        }

        connectedCallback() {
                this.attachShadow({ mode: "open" });
                this.shadowRoot.innerHTML = "<slot></slot>";
                this.loadSlider();
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

// ANCHOR: Recently viewed
/* 1. First, we check if the cookie exists. If it does, we parse it into an array.
2. If the array is not empty, we reverse it to make sure the last visited products are shown first. We also get the number of items that we want to show.
3. We loop through the array and get the product information we need.
4. We create an item element, add the appropriate classes to it, and add the HTML for each product.
5. If the array is empty, we hide the section using the display property. */

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
                                let newTagClass = newTag === "true" && date_difference < parseInt(newTagTime) ? " tag--animated-hover" : "";
                                let itemElement = document.createElement("div");
                                let saleTag = productPriceDifference <= 0 ? "" : `<p class="tag--normal tag-text">SAVE ${productPriceDifferenceWithCurrency}</p>`;

                                itemElement.classList.add("item");

                                itemElement.innerHTML = `
                                      <div class="recently-viewed__image">
                                      ${saleTag}
                                      <div class="quick-add-icon">
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
                                          <p class="text price--normal">${productPrice}</p>
                                          <p class="text price--sale">${productCompareAtPrice}</p>
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

// ANCHOR: Predictive search

// class PredictiveSearch extends HTMLElement {
//         constructor() {
//                 super();

//                 this.input = this.querySelector('input[type="search"]');
//                 this.icon = this.querySelector(".search-section__icon");
//                 this.predictiveSearchResults = this.querySelector("#predictive-search");

//                 this.input.addEventListener(
//                         "input",
//                         this.debounce((event) => {
//                                 this.onChange(event);
//                         }, 300).bind(this)
//                 );

//                 if (this.icon !== null) {
//                         this.icon.addEventListener("click", () => {
//                                 window.location.href = "/search?q=" + this.input.value;
//                         });
//                 }

//                 this.searchDrawer = this.querySelector(".search-drawer");
//                 this.closeIcon = this.searchDrawer.querySelector(".search-section__close");
//                 this.inputField = this.searchDrawer.querySelector(".search-section__input");

//                 this.decideDrawerAction();
//         }

//         onChange() {
//                 const searchTerm = this.input.value.trim();
//                 if (!searchTerm.length) {
//                         this.close();
//                         return;
//                 }

//                 this.getSearchResults(searchTerm);
//         }

//         getSearchResults(searchTerm) {
//                 fetch(`/search/suggest?q=${searchTerm}&resources[type]=product&resources[limit]=8&section_id=predictive-search`)
//                         .then((response) => {
//                                 if (!response.ok) {
//                                         var error = new Error(response.status);
//                                         this.close();
//                                         throw error;
//                                 }

//                                 return response.text();
//                         })
//                         .then((text) => {
//                                 const resultsMarkup = new DOMParser().parseFromString(text, "text/html").querySelector("#shopify-section-predictive-search").innerHTML;
//                                 this.predictiveSearchResults.innerHTML = resultsMarkup;
//                                 this.open();
//                         })
//                         .catch((error) => {
//                                 this.close();
//                                 throw error;
//                         });
//         }

//         open() {
//                 this.querySelector(".search-section__results").classList.remove("hidden");
//         }

//         close() {
//                 this.querySelector(".search-section__results").classList.add("hidden");
//         }

//         debounce(fn, wait) {
//                 let t;
//                 return (...args) => {
//                         clearTimeout(t);
//                         t = setTimeout(() => fn.apply(this, args), wait);
//                 };
//         }

//         showSearchDrawer() {
//                 this.searchDrawer.classList.remove("hidden");
//                 this.searchDrawer.classList.add("active");
//                 document.querySelector(".theme-overlay").style.zIndex = "99";
//                 this.searchDrawer.style.zIndex = "100";
//                 lockPage();
//         }

//         hideSearchDrawer() {
//                 this.searchDrawer.classList.remove("active");
//                 this.searchDrawer.classList.add("hidden");
//                 this.searchDrawer.style.zIndex = "98";
//                 unlockPage();
//                 document.querySelector(".theme-overlay").style.zIndex = "-1";
//         }

//         resetSearch() {
//                 this.inputField.value = "";
//                 this.searchDrawer.querySelector(".search-section__results").classList.add("hidden");
//         }

//         decideDrawerAction() {
//                 document.addEventListener("click", (event) => {
//                         if (document.querySelector("#header__search-icon").contains(event.target)) {
//                                 this.showSearchDrawer();
//                         } else if (!this.searchDrawer.querySelector(".search-drawer__container").contains(event.target) && document.querySelector(".popup__container").classList.contains("hidden")) {
//                                 this.hideSearchDrawer();
//                                 this.resetSearch();
//                         }
//                 });

//                 this.closeIcon.addEventListener("click", () => {
//                         this.hideSearchDrawer();
//                         this.resetSearch();
//                 });

//                 this.inputField.addEventListener("input", (event) => {
//                         if (event.target.value.length > 0) {
//                                 this.searchDrawer.querySelector(".preload").classList.add("hidden");
//                         } else {
//                                 this.searchDrawer.querySelector(".preload").classList.remove("hidden");
//                         }
//                 });

//                 if (Shopify.designMode) {
//                         document.addEventListener("shopify:section:load", (event) => {
//                                 event.target.classList.forEach((i) => {
//                                         if (i === "section-search-drawer") {
//                                                 this.searchDrawer.style.height = `calc(100% - ${document.querySelector(".header-section").offsetHeight}px + 15px)`;
//                                                 this.showSearchDrawer();
//                                         }
//                                 });
//                         });

//                         document.addEventListener("shopify:section:select", (event) => {
//                                 event.target.classList.forEach((i) => {
//                                         if (i === "section-search-drawer") {
//                                                 this.searchDrawer.style.height = `calc(100% - ${document.querySelector(".header-section").offsetHeight}px + 15px)`;
//                                                 this.showSearchDrawer();
//                                         }
//                                 });
//                         });

//                         document.addEventListener("shopify:section:deselect", (event) => {
//                                 event.target.classList.forEach((i) => {
//                                         if (i === "section-search-drawer") {
//                                                 this.hideSearchDrawer();
//                                         }
//                                 });
//                         });
//                 }
//         }
// }

// customElements.define("predictive-search", PredictiveSearch);

// ANCHOR:  Popup component

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
                this.decideDrawerAction();

                this.attachShadow({ mode: "open" });
                this.shadowRoot.innerHTML = "<slot></slot>";
        }

        saveInCookie() {
                let popupMessage = "closed";
                let message = JSON.stringify(popupMessage);
                if (!Shopify.designMode) {
                        // let expiry = new Date(400 * 24 * 60 * 60 * 1000 + Date.parse(new Date()));
                        document.cookie = "popupCookie" + "=" + message + "; path=/; domain=." + window.location.hostname;
                }
        }

        openPopupDrawer() {
                if (this.cookie !== "closed" || Shopify.designMode) {
                        this.querySelector(".popup").style.display = "flex";
                        this.querySelector(".popup").style.zIndex = "102";

                        setTimeout(() => {
                                lockPage();

                                document.querySelector(".theme-overlay").style.zIndex = "101";
                                this.drawer.classList.remove("hidden");
                                this.drawer.classList.add("active");

                                setTimeout(() => {
                                        if (this.drawer.querySelector(".popup__picture")) {
                                                this.drawer.querySelector(".popup__picture").classList.add("slide-in");
                                        }
                                        this.drawer.querySelector(".popup__content").classList.add("slide-in");

                                        setTimeout(() => {
                                                this.drawer.classList.add("border");
                                        }, 1000);
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
                        document.querySelector(".theme-overlay").style.zIndex = "-1";
                        this.drawer.classList.remove("border");
                }, 300);

                this.saveInCookie();
        }

        decideDrawerAction() {
                if (!Shopify.designMode && this.drawer.classList.contains("hidden")) {
                        setTimeout(() => {
                                this.openPopupDrawer();
                        }, this.delayTime);
                }

                if (Shopify.designMode) {
                        document.addEventListener("shopify:section:select", (event) => {
                                event.target.classList.forEach((i) => {
                                        if (i === "section-popup") {
                                                this.openPopupDrawer();
                                        }
                                });
                        });
                        document.addEventListener("shopify:section:deselect", (event) => {
                                event.target.classList.forEach((i) => {
                                        if (i === "section-popup") {
                                                this.hidePopupDrawer();
                                        }
                                });
                        });
                }
                setTimeout(() => {
                        document.addEventListener("click", (event) => {
                                if ((!this.drawer.contains(event.target) && this.drawer.classList.contains("active")) || this.drawer.querySelector(".popup__link").contains(event.target) || this.drawer.querySelector(".popup__close").contains(event.target)) {
                                        this.hidePopupDrawer();
                                }
                        });
                }, this.delayTime);
        }
}

customElements.define("popup-component", PopupComponent);

// ANCHOR:  Openable element

class OpenableElement extends HTMLElement {
        constructor() {
                super();
        }

        connectedCallback() {
                this.attachShadow({ mode: "open" });
                this.shadowRoot.innerHTML = "<slot></slot>";
                this.decideDrawerAction();
        }

        showDrawer(selector) {
                document.querySelector(`openable-element:has(${selector})`).classList.remove("hidden");
                document.querySelector(`openable-element:has(${selector})`).classList.add("active");
                document.querySelector(".theme-overlay").style.zIndex = "99";
                document.querySelector(".header-section").style.zIndex = "100";
                this.style.zIndex = "100";
                lockPage();
        }

        hideDrawer() {
                this.classList.remove("active");
                this.classList.add("hidden");
                setTimeout(() => {
                        this.style.zIndex = "98";
                        document.querySelector(".theme-overlay").style.zIndex = "-1";
                        document.querySelector(".header-section").style.zIndex = "98";
                }, 300);
                unlockPage();
        }

        decideDrawerAction() {
                this.closeIcon = this.querySelector("#close-icon");
                this.header = document.querySelector(".header-section");

                let extraPadding = this.header.classList.contains("boxed") ? 15 : 0;

                window.addEventListener("load", () => {
                        this.style.height = `calc(100% - ${document.querySelector(".header-section").offsetHeight}px + ${extraPadding}px)`;
                });

                window.addEventListener("resize", () => {
                        this.style.height = `calc(100% - ${document.querySelector(".header-section").offsetHeight}px + ${extraPadding}px)`;
                });

                document.addEventListener("click", (event) => {
                        if (document.querySelector(".header__icons-drawer").contains(event.target)) {
                                this.showDrawer(".menu-mobile");
                        } else if (document.querySelector(".header__icons-cart").contains(event.target)) {
                                this.showDrawer(".cart-drawer");

                                if (this.querySelector(".recommended-products.desktop-only")) {
                                        setTimeout(() => {
                                                this.querySelector(".recommended-products.desktop-only").classList.add("active");
                                        }, 800);
                                }
                        } else if (!this.contains(event.target) && document.querySelector(".popup__container").classList.contains("hidden")) {
                                this.hideDrawer();

                                this.querySelector(".recommended-products.desktop-only").classList.remove("active");
                        }
                });

                this.closeIcon.addEventListener("click", () => {
                        this.hideDrawer();
                });

                if (Shopify.designMode) {
                        document.addEventListener("shopify:section:load", (event) => {
                                event.target.classList.forEach((i) => {
                                        if (i === "openable-element") {
                                                this.style.height = `calc(100% - ${document.querySelector(".header-section").offsetHeight}px + 15px)`;
                                                this.showDrawer();
                                        }
                                });
                        });

                        document.addEventListener("shopify:section:select", (event) => {
                                event.target.classList.forEach((i) => {
                                        if (i === "openable-element") {
                                                this.style.height = `calc(100% - ${document.querySelector(".header-section").offsetHeight}px + 15px)`;
                                                this.showDrawer();
                                        }
                                });
                        });

                        document.addEventListener("shopify:section:deselect", (event) => {
                                event.target.classList.forEach((i) => {
                                        if (i === "openable-element") {
                                                this.hideDrawer();
                                        }
                                });
                        });
                }
        }
}

customElements.define("openable-element", OpenableElement);

// ANCHOR:  Menu mobile
class MenuMobile extends HTMLElement {
        constructor() {
                super();
        }
        connectedCallback() {
                // this.attachShadow({ mode: "open" });
                // this.shadowRoot.innerHTML = "<slot></slot>";
                this.showHide();
        }
        showHide() {
                this.querySelectorAll(".menu-mobile__parent").forEach((parent) => {
                        let childsHeight = parent.querySelector(".menu-mobile__parent-childs").scrollHeight;

                        parent.querySelector(".menu-mobile__parent-title").addEventListener("click", () => {
                                if (!parent.querySelector(".menu-mobile__parent-childs").classList.contains("active")) {
                                        parent.querySelector(".menu-mobile__parent-childs").style.height = `${childsHeight}px`;
                                        parent.querySelector(".menu-mobile__parent-childs").classList.add("active");
                                } else {
                                        parent.querySelector(".menu-mobile__parent-childs").style.height = "0px";
                                        parent.querySelector(".menu-mobile__parent-childs").classList.remove("active");
                                }
                        });

                        parent.querySelectorAll(".menu-mobile__child").forEach((child) => {
                                let grandchildsHeight = child.querySelector(".menu-mobile__child-childs").scrollHeight;
                                child.querySelector(".menu-mobile__child-title").addEventListener("click", () => {
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

// class MenuMobile extends HTMLElement {
//         constructor() {
//                 super();
//         }
//         connectedCallback() {
//                 // this.attachShadow({ mode: "open" });
//                 // this.shadowRoot.innerHTML = "<slot></slot>";
//                 this.showHide();
//         }
//         showHide() {
//                 this.querySelectorAll(".menu-mobile__parent").forEach((parent) => {

//                         function setHeight() {
//                                 let childsHeight = parent.querySelector(".menu-mobile__parent-childs").scrollHeight;
//                                 parent.querySelector(".menu-mobile__parent-childs").style.height = `${childsHeight}px`;
//                         }

//                         async function asyncCall() {
//                                 await setHeight();
//                                 parent.querySelector(".menu-mobile__parent-childs").classList.add("active");
//                         }

//                         parent.querySelector(".menu-mobile__parent-title").addEventListener("click", () => {
//                                 if (!parent.querySelector(".menu-mobile__parent-childs").classList.contains("active")) {
//                                         asyncCall();
//                                 } else {
//                                         parent.querySelector(".menu-mobile__parent-childs").style.height = "0px";
//                                         parent.querySelector(".menu-mobile__parent-childs").classList.remove("active");
//                                 }
//                         });

//                         parent.querySelectorAll(".menu-mobile__child").forEach((child) => {
//                                 let grandchildsHeight = child.querySelector(".menu-mobile__child-childs").scrollHeight;
//                                 child.querySelector(".menu-mobile__child-title").addEventListener("click", () => {
//                                         if (!child.querySelector(".menu-mobile__child-childs").classList.contains("active")) {
//                                                 parent.querySelector(".menu-mobile__parent-childs").style.height = `${childsHeight + grandchildsHeight}px`;
//                                                 child.querySelector(".menu-mobile__child-childs").style.height = `${grandchildsHeight}px`;
//                                                 child.querySelector(".menu-mobile__child-childs").classList.add("active");
//                                         } else {
//                                                 parent.querySelector(".menu-mobile__parent-childs").style.height = `${childsHeight}px`;
//                                                 child.querySelector(".menu-mobile__child-childs").style.height = "0px";
//                                                 child.querySelector(".menu-mobile__child-childs").classList.remove("active");
//                                         }
//                                 });
//                         });
//                 });
//         }
// }
