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
                this.showHide();
        }
        showHide() {
                this.tabs = document.querySelectorAll(".faq__tab");
                this.tabs.forEach((tab) => {
                        const answer = tab.querySelector(".faq__answer");
                        const answerHeight = answer.scrollHeight;
                        tab.addEventListener("click", () => {
                                if (!tab.classList.contains("active")) {
                                        this.tabs.forEach((tb) => {
                                                hideTab(tb);
                                        });
                                        tab.classList.add("active");
                                        answer.style.height = answerHeight + 20 + "px";
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
function countdownTimer(countdownType, timeInDate, timeInMinutes, afterExpirationTimeOnly, id, cookieName) {
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

        function initializeClock(endTime) {
                const clock = document.getElementById(id);
                const daysSpan = clock.querySelector(".days");
                const hoursSpan = clock.querySelector(".hours");
                const minutesSpan = clock.querySelector(".minutes");
                const secondsSpan = clock.querySelector(".seconds");

                function updateClock() {
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
                        domainName = window.location.hostname;
                        document.cookie = cookieName + "=" + deadline + "; path=/; domain=." + domainName;
                }

                if (document.cookie && deadline) {
                        actualDate = new Date().getTime();
                        deadlineDate = new Date(deadline).getTime();
                        if (actualDate > deadlineDate) {
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
                this.playVideo();
        }
        playVideo() {
                this.thumbnail = document.querySelector(".video-with-text__thumbnail");
                this.video = document.querySelector(".video");
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

function slideshow() {
        let slideshow = document.querySelector(".slideshow");
        let slideshowContainer = document.querySelector(".slideshow__container");
        let slideshowSlides = document.querySelectorAll(".slideshow__container .slideshow__slide");
        let prev = document.querySelector(".slideshow__chevron .prev");
        let next = document.querySelector(".slideshow__chevron .next");
        let totalSlides = slideshowSlides.length;
        let step = 100 / totalSlides;
        let activeSlide = 0;
        let activeIndicator = 0;
        let direction = -1;
        let jump = 1;
        let interval = 4000;
        let time;

        function loadIndicators() {
                slideshowSlides.forEach((slide, index) => {
                        if (index === 0) {
                                document.querySelector(".slideshow__indicators").innerHTML += `<span data-slide-to="${index}" class="active"></span>`;
                        } else {
                                document.querySelector(".slideshow__indicators").innerHTML += `<span data-slide-to="${index}"></span>`;
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
                slideshowContainer.style.transform = `translateX(-${step}%)`;
        }

        function slideToPrev() {
                if (direction === -1) {
                        direction = 1;
                        slideshowContainer.append(slideshowContainer.firstElementChild);
                } else if (direction === 1) {
                        direction = 1;
                }

                slideshow.style.justifyContent = "flex-end";
                slideshowContainer.style.transform = `translateX(${step}%)`;
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

        slideshow.addEventListener("mouseover", () => {
                loop(false);
        });

        slideshow.addEventListener("mouseout", () => {
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

                                document.querySelector(".slideshow__indicators span.active").classList.remove("active");
                                document.querySelectorAll(".slideshow__indicators span")[activeSlide].classList.add("active");
                        }

                        updateIndicators();
                }
        });

        let indicators = document.querySelectorAll(".slideshow__indicators span");

        indicators.forEach((item) => {
                item.addEventListener("click", (e) => {
                        let slideTo = parseInt(e.target.dataset.slideTo);

                        indicators.forEach((item, index) => {
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
