/**============================================
 *               * ANCHOR: FAQ section
 *=============================================**/
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
                                        this.tabs.forEach((tb) => {
                                                hideTab(tb);
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

/**============================================
 *               * ANCHOR: Countdown timer section
 *=============================================**/
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

class countdownTimer extends HTMLElement {
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
                        const timeInterval = setInterval(updateClock, 1000);
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
                                if (deadline < 0) {
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

customElements.define("countdown-timer", countdownTimer);

/**============================================
 *               * ANCHOR: Video with text section
 *=============================================**/
/* 1. We get all the video boxes (the ones that contain the thumbnail and the video)
2. We loop through each video box
3. We get the thumbnail and the video in the box
4. When the user clicks on the thumbnail, we get the original video src and add &autoplay=1 to it (this is the magic that makes the video autoplay)
5. We show the video and hide the thumbnail
6. When the video ends, we reset the video src and hide the video and show the thumbnail again */

class videoWithText extends HTMLElement {
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

customElements.define("video-with-text", videoWithText);

/**============================================
 *               * ANCHOR: Slideshow section
 *=============================================**/
/* 1. First, we select all the elements we need to manipulate and other variables we need to use.
2. We create and call a function that will load the indicators dynamically.
3. We create two functions, one will slide to the next slide and the other to the previous slide.
4. We add event listeners to the next and previous button that will call the slideToNext or slideToPrev function.
5. We create and call a function that will start the loop, that will slide the slides automatically when passing it the true parameter..
6. We add an event listener to the slideshow that will stop the loop when the mouse is on top of it and restarts it when the mouse is not on top of it.
7. We add an event listener to the slideshow container that will check if the transition is finished and if it is finished, it will check the direction and move the slides to the next or to the previous slide.
8. We create and call a function that will update the indicators.
9. We select all the indicators and add an event listener that will check which indicator was clicked and will slide the slides to the clicked indicator. */

class slideshow extends HTMLElement {
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
                let step = 100 / totalSlides;
                let activeSlide = 0;
                let activeIndicator = 0;
                let direction = -1;
                let jump = 1;
                let interval = 4000;
                let time;

                if (totalSlides <= 1) {
                        next.style = "display: none";
                        prev.style = "display: none";
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
                next.addEventListener("click", () => {
                        slideToNext();
                });
                prev.addEventListener("click", () => {
                        slideToPrev();
                });

                function loop(status) {
                        if (status === true) {
                                time = setInterval(() => {
                                        slideToNext();
                                }, interval);
                        } else {
                                clearInterval(time);
                        }
                }
                loop(true);

                this.addEventListener("mouseover", () => {
                        loop(false);
                });
                this.addEventListener("mouseout", () => {
                        loop(true);
                });

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
                                        slideshowContainer.style.transition = "all ease 1s";
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
        }
}

customElements.define("slideshow-section", slideshow);

// /**============================================
//  *               * ANCHOR: Slider component
//  =============================================**/
/* Here is the explanation for the code above:
1. The first function (setMaxScroll) is called when the page loads and then every time the window is resized or the media queries are changed. It sets the maxSliderScroll variable which is used to calculate the maximum scroll amount for the slider. It also sets the visibility of the next/prev buttons depending on the number of items found and the number of items displayed. 
2. The getTranslateX function calculates the new translateX value for the slider depending on the type of action (next or prev). This is used in the moveNext and movePrev functions. These functions also hide and show the next/prev buttons depending on the new translateX value.
3. The event listeners for the next/prev buttons and the media queries call the setMaxScroll function. */
class sliderSection extends HTMLElement {
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

                for (let i = 0; i < mediaQueries.length; i++) {
                        mediaQueries[i].addEventListener("change", setMaxScroll);
                        setMaxScroll(mediaQueries[i]);
                }

                window.addEventListener("resize", setMaxScroll);
                next.addEventListener("click", moveNext);
                prev.addEventListener("click", movePrev);
        }
}
customElements.define("slider-section", sliderSection);

