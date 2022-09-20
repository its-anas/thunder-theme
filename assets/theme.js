/**============================================
 *               * ANCHOR: FAQ section
 *=============================================**/
/* 
The code above does the following:
1. Select all the faq__tab class elements and store them in a variable called faqTabs.
2. Loop through each of the faqTabs elements.
3. Select the answer by using the childNodes property and store it in a variable called answer.
4. Get the height of the answer by using the scrollHeight property and store it in a variable called answerHeight.
5. Add an event listener to each of the faqTabs elements.
6. When the faqTabs element is clicked, toggle the classList of tab to active.
7. If the tab has the active classList, then set the height of the answer to answerHeight + 20px, otherwise set it to 0px.  
*/

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
/* 
The "countdownTimer" function has five arguments:
1. "countdownType" - this can be either "date" or "time".
2. "timeInDate" - this is the date when the countdown should end. This variable only works if the "countdownType" variable is set to "date".
3. "timeInMinutes" - this is the time in minutes when the countdown should end. This variable only works if the "countdownType" variable is set to "time".
4. "afterExpirationTimeOnly" - this can be either "showMessage" or "repeatCountdown".
5. "id" - this is the ID of the countdown timer HTML element.
6. "cookieName" - this is the name of the cookie. This variable only works if the "countdownType" variable is set to "time".

The code above does the following:
1. The code checks if the countdown type is "date" or "time".
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
5. The code finally creates a function that updates the clock every second.
*/

domainName = window.location.hostname;
actualDate = new Date().getTime();

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

                                document.cookie = cookieName + "=" + deadline + "; path=/; domain=." + domainName;
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
/* 
Here is the explanation for the code above:
1. We get all the video boxes (the ones that contain the thumbnail and the video)
2. We loop through each video box
3. We get the thumbnail and the video in the box
4. When the user clicks on the thumbnail, we get the original video src and add &autoplay=1 to it (this is the magic that makes the video autoplay)
5. We show the video and hide the thumbnail
6. When the video ends, we reset the video src and hide the video and show the thumbnail again 
*/

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
 *               * ANCHOR: Slideshow
 *=============================================**/
/* 
Here is the explanation for the code above:
1. First, we select all the elements we need to manipulate and other variables we need to use.
2. We create and call a function that will load the indicators dynamically.
3. We create two functions, one will slide to the next slide and the other to the previous slide.
4. We add event listeners to the next and previous button that will call the slideToNext or slideToPrev function.
5. We create and call a function that will start the loop, that will slide the slides automatically when passing it the true parameter..
6. We add an event listener to the slideshow that will stop the loop when the mouse is on top of it and restarts it when the mouse is not on top of it.
7. We add an event listener to the slideshow container that will check if the transition is finished and if it is finished, it will check the direction and move the slides to the next or to the previous slide.
8. We create and call a function that will update the indicators.
9. We select all the indicators and add an event listener that will check which indicator was clicked and will slide the slides to the clicked indicator. 
*/

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
                let prev = this.querySelector(".chevrons .prev");
                let next = this.querySelector(".chevrons .next");
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

/**============================================
 *               * ANCHOR: Multi icon
 *=============================================**/
/* 
Here is the explanation for the code above:
1. The function updateSliderInfo() is called at the beginning of the code to get the width of the icons, the container which holds the icons, and the maximum scroll left value of the icons container.
2. An event listener is added to the icons container to check if the scroll left value equals 0, which means the icons container is scrolled all the way to the left, then the previous button should be hidden. If the scroll left value is greater than 0, the previous button should be shown.
3. Then the same thing happens with the next button, if the scroll left value equals the maximum scroll left value, the next button should be hidden. If the scroll left value is less than the maximum scroll left value, the next button should be shown.
4. The function toggleButtons() is called at the beginning of the code to check if the total width of the icons is less than or equal to the width of the container. If it is, the previous and next buttons are hidden, and the icons are centered.
5. An event listener is added to the window to call the toggleButtons() function when the window is resized.
6. The scrollLeftAnimate() function is used to animate the scrolling of the icons container.
7. The prev and next buttons are given event listeners to call the scrollLeftAnimate() function when clicked. 
*/

class multiIcon extends HTMLElement {
        constructor() {
                super();
        }
        connectedCallback() {
                this.attachShadow({ mode: "open" });
                this.shadowRoot.innerHTML = "<slot></slot>";
                this.loadSlider();
        }
        loadSlider() {
                let iconsContainer = this.querySelector(".multi-icon__container");
                let icon = this.querySelector(".multi-icon__icon");
                let icons = this.querySelectorAll(".multi-icon__icon");
                let prev = this.querySelector(".prev");
                let next = this.querySelector(".next");
                let iconWidth;
                let iconsWidth;
                let iconsContainerWidth;
                let maxSlideScroll;

                function updateSliderInfo() {
                        iconWidth = icon.offsetWidth;
                        iconsWidth = icons.length * iconWidth;
                        iconsContainerWidth = iconsContainer.clientWidth;
                        maxSlideScroll = iconsWidth - iconsContainerWidth;
                }
                updateSliderInfo();

                iconsContainer.addEventListener("scroll", () => {
                        if (Math.round(iconsContainer.scrollLeft) === 0) {
                                prev.style.display = "none";
                        }
                        if (Math.round(iconsContainer.scrollLeft) > 0) {
                                prev.style.display = "block";
                        }
                        if (Math.round(iconsContainer.scrollLeft) >= maxSlideScroll) {
                                next.style.display = "none";
                        }
                        if (Math.round(iconsContainer.scrollLeft) < maxSlideScroll) {
                                next.style.display = "block";
                        }
                });
                let event = new Event("scroll");
                iconsContainer.dispatchEvent(event);

                function toggleButtons() {
                        updateSliderInfo();
                        if (iconsWidth <= iconsContainerWidth) {
                                prev.style.display = "none";
                                next.style.display = "none";
                                iconsContainer.style.justifyContent = "center";
                        }

                        if (iconsWidth >= iconsContainerWidth) {
                                next.style.display = "block";
                                iconsContainer.style.justifyContent = "flex-start";
                        }
                }
                toggleButtons();
                window.addEventListener("resize", toggleButtons);

                function scrollLeftAnimate(elem, unit) {
                        let time = 300;
                        let from = elem.scrollLeft; //
                        let start = new Date().getTime();
                        let timer = setInterval(function () {
                                let step = Math.min(1, (new Date().getTime() - start) / time);
                                elem.scrollLeft = step * unit + from;

                                if (step === 1) {
                                        clearInterval(timer);
                                }
                        });
                }

                prev.addEventListener("click", function () {
                        updateSliderInfo();
                        if (iconsContainer.scrollLeft > 0) {
                                scrollLeftAnimate(iconsContainer, -iconWidth * 1);
                        }
                });

                next.addEventListener("click", function () {
                        updateSliderInfo();
                        if (iconsContainer.scrollLeft < maxSlideScroll) {
                                scrollLeftAnimate(iconsContainer, iconWidth * 1);
                        }
                });
        }
}

customElements.define("multi-icon", multiIcon);
