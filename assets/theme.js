document.addEventListener("DOMContentLoaded", theDomHasLoaded, false);

/**============================================
 *               * ANCHOR: FAQ section
 *=============================================**/
// select all FAQ tabs in the page
const faqTabs = document.querySelectorAll(".faq__tab");
// loop over each tab
faqTabs.forEach((tab) => {
    // select answer and get it's height
    const answer = tab.childNodes[3];
    const answerHeight = tab.childNodes[3].scrollHeight;
    // listen to click events on each tab
    tab.addEventListener("click", () => {
        // open the selected tab if it's closed. Close it if it's opened.
        tab.classList.toggle("active");
        // add the height to the answer plus 20px for top and bottom padding that is set in CSS class "".faq__tab.active > .faq__answer"
        if (tab.classList.contains("active")) {
            answer.style.height = answerHeight + 20 + "px";
        } else {
            answer.style.height = "0px";
        }
    });
});

/**============================================
 *               * ANCHOR: Countdown timer section
 *=============================================**/
// a function that get the countdown timer parameter's values directly from the countdown-timer.liquid section and insert back the time
function countdownTimer(countdownType, timeInDate, timeInMinutes, afterExpirationTimeOnly, id, cookieName) {
    // a function to calculate how much time is left
    function getTimeRemaining(endTime) {
        // subtract the actual timestamp from the end time timestamp
        const total = Date.parse(endTime) - Date.parse(new Date());
        // convert timestamp to time units
        const days = Math.floor(total / (1000 * 60 * 60 * 24));
        const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((total / 1000 / 60) % 60);
        const seconds = Math.floor((total / 1000) % 60);

        // return time units as variables
        return {
            total,
            days,
            hours,
            minutes,
            seconds,
        };
    }

    // a function to add the time to countdown timer
    function initializeClock(endTime) {
        // select the countdown timer section and the time units elements
        const clock = document.getElementById(id);
        const daysSpan = clock.querySelector(".days");
        const hoursSpan = clock.querySelector(".hours");
        const minutesSpan = clock.querySelector(".minutes");
        const secondsSpan = clock.querySelector(".seconds");
        // a function to insert time units in HTML
        function updateClock() {
            // get how much time is left and add each unit to it's element with 0 as prefix
            const t = getTimeRemaining(endTime);
            daysSpan.innerHTML = t.days < 100 ? ("0" + t.days).slice(-2) : t.days;
            hoursSpan.innerHTML = ("0" + t.hours).slice(-2);
            minutesSpan.innerHTML = ("0" + t.minutes).slice(-2);
            secondsSpan.innerHTML = ("0" + t.seconds).slice(-2);
            // if end time is not reached, show the timer and hide the end message
            if (t.total >= 0) {
                clock.querySelector(".countdown-timer__timers").classList.add("shown");
                clock.querySelector(".countdown-timer__message").classList.add("hidden");
            }
            // if time end time is reached, clear the interval
            if (t.total <= 0) {
                clearInterval(timeInterval);
                // show the end message only if the merchant want.
                if (afterExpirationTimeOnly === "showMessage") {
                    clock.querySelector(".countdown-timer__timers").classList.remove("shown");
                    clock.querySelector(".countdown-timer__message").classList.remove("hidden");
                }
            }
        }
        // run the function that insert time unites in HTML
        updateClock();
        // make the function run once every second
        const timeInterval = setInterval(updateClock, 1000);
    }

    // option 1: if the merchant want the deadline to be based on a date in the future
    if (countdownType === "date") {
        // initialize the clock based on the deadline it got from timeInDate that is set by the merchant
        let deadline = timeInDate;
        initializeClock(deadline);
        // option 2: if the merchant want the deadline to be based on the user first visit
    } else if (countdownType === "time") {
        // get the cookie with the name declared by countdown-timer.liquid file in the function parameter cookieName
        let deadline = document.cookie
            .split("; ")
            .find((row) => row.startsWith(cookieName + "="))
            ?.split("=")[1];
        // a function to add the timeInMinutes that is set by the merchant to the actual time of the user first visit and save it in cookies
        function saveCookie() {
            // get the current timestamp
            const currentTime = Date.parse(new Date());
            // convert timeInMinutes to timestamp
            deadline = new Date(timeInMinutes * 60 * 1000 + currentTime);
            // get the domain name of the website
            domainName = window.location.hostname;
            document.cookie = cookieName + "=" + deadline + "; path=/; domain=." + domainName;
        }
        // if the website have cookies and if the deadline declared before is in cookies
        if (document.cookie && deadline) {
            // get the actual timestamp, and deadline timestamp from cookies
            actualDate = new Date().getTime();
            deadlineDate = new Date(deadline).getTime();
            // if the deadline timestamp is reached
            if (actualDate > deadlineDate) {
                // and if the merchant want the countdown to be repeated, create a new deadline based on the new date from user.
                if (afterExpirationTimeOnly === "repeatCountdown") {
                    saveCookie();
                }
            }
            // if the website doesn't have cookies and/or if the deadline declared before is not in cookies, then add deadline to the user first time visit and save in cookies
        } else {
            saveCookie();
        }
        initializeClock(deadline);
    }
}

/**============================================
 *               * ANCHOR: Video with text section
 *=============================================**/
// select all video-box elements in the page
const videoBoxs = document.querySelectorAll(".video-with-text__video-box");
// loop over each video-box
videoBoxs.forEach((box) => {
    // select the thumbnail and video elements and get the video src value
    const thumbnail = box.querySelector(".video-with-text__thumbnail");
    const video = box.querySelector(".video");
    const originalVideoSrc = video.src;
    // listen to click events on the thumbnail
    thumbnail.addEventListener("click", () => {
        // after the click, add autoplay to the video to play it, hide the thumbnail and show the video
        video.src = originalVideoSrc + "&autoplay=1";
        thumbnail.classList.add("hidden");
        video.classList.add("shown");
    });
});

/**============================================
 *               * ANCHOR: Slideshow
 *=============================================**/
// a function for slideshow to run only when the section is used
function slideshow() {
    // select the section, container, items, and chevrons
    let slideshow = document.querySelector(".slideshow");
    let slideshowContainer = document.querySelector(".slideshow__container");
    let slideshowSlides = document.querySelectorAll(".slideshow__container .slideshow__slide");
    let prev = document.querySelector(".slideshow__chevron .prev");
    let next = document.querySelector(".slideshow__chevron .next");
    // declare extra required variable to be used later
    let totalSlides = slideshowSlides.length;
    let step = 100 / totalSlides;
    let activeSlide = 0;
    let activeIndicator = 0;
    let direction = -1;
    let jump = 1;
    let interval = 4000;
    let time;

    // a function to initialize the indicators and make the first one active
    function loadIndicators() {
        // for each slide
        slideshowSlides.forEach((slide, index) => {
            // if the index of the slide in array is 0, add an indicator with the index number plus the class active
            if (index === 0) {
                document.querySelector(".slideshow__indicators").innerHTML += `<span data-slide-to="${index}" class="active"></span>`;
                // if the index is not 0, add an indicator with the index number
            } else {
                document.querySelector(".slideshow__indicators").innerHTML += `<span data-slide-to="${index}"></span>`;
            }
        });
    }
    // run the function to load the indicators
    loadIndicators();

    // a function that move the container to the next slide when clicking on the next chevron
    function slideToNext() {
        // if the direction is from right to left
        if (direction === -1) {
            // leave the direction like that
            direction = -1;
            // if the direction is from left to right
        } else if (direction === 1) {
            // reverse the direction
            direction = -1;
            // and add the last slide to the beginning
            slideshowContainer.prepend(slideshowContainer.lastElementChild);
        }
        // let the slideshow start from the right to left
        slideshow.style.justifyContent = "flex-start";
        // move to the next slide
        slideshowContainer.style.transform = `translateX(-${step}%)`;
    }

    // a function that move the container to the previous slide when clicking on the previous chevron
    function slideToPrev() {
        // if the direction is from right to left
        if (direction === -1) {
            // reverse the direction
            direction = 1;
            // and add the first slide to the end
            slideshowContainer.append(slideshowContainer.firstElementChild);
            // if the direction is from left to right
        } else if (direction === 1) {
            // leave the direction like that
            direction = 1;
        }
        // let the slideshow start from the left to right
        slideshow.style.justifyContent = "flex-end";
        // move to the previous slide
        slideshowContainer.style.transform = `translateX(${step}%)`;
    }

    // listen to clicks on chevrons
    next.addEventListener("click", () => {
        // if next chevron is clicked move actual slide to next slide
        slideToNext();
    });
    prev.addEventListener("click", () => {
        // if previous chevron is clicked move actual slide to previous slide
        slideToPrev();
    });

    // a function that run the loop and pause it
    function loop(status) {
        // if loop(true)
        if (status === true) {
            // move the actual slide to the next one once each 'interval'
            time = setInterval(() => {
                slideToNext();
            }, interval);
            // if loop(false) clear the interval
        } else {
            clearInterval(time);
        }
    }
    // play the loop
    loop(true);

    // pause the loop on hover
    slideshow.addEventListener("mouseover", () => {
        loop(false);
    });
    // play the loop again when mouse is not on hover anymore
    slideshow.addEventListener("mouseout", () => {
        loop(true);
    });

    // listen to when the transition ends on slideshow container
    slideshowContainer.addEventListener("transitionend", (event) => {
        // to avoid event bubbling filter by event.target
        if (event.target.className == "slideshow__container") {
            if (direction === -1) {
                // if the direction is from right to left
                // if it's set to not move from element to element directly and skipping an element or more
                if (jump > 1) {
                    for (let i = 0; i < jump; i++) {
                        // for every item in the jump loop add 1 to activeSlide
                        activeSlide++;
                        // and add the first item to the beginning of the slideshow container
                        slideshowContainer.append(slideshowContainer.firstElementChild);
                    }
                    // if it's set to move from element to element directly
                } else {
                    // add 1 to activeSlide
                    activeSlide++;
                    // add the first item to the beginning of the slideshow container
                    slideshowContainer.append(slideshowContainer.firstElementChild);
                }
                // if the direction is from left to right
            } else if (direction === 1) {
                // if it's set to not move from element to element directly and skipping an element or more
                if (jump > 1) {
                    for (let i = 0; i < jump; i++) {
                        // for every item in the jump loop subtract 1 from activeSlide
                        activeSlide--;
                        // and add the last item of the slideshow container to it's start
                        slideshowContainer.prepend(slideshowContainer.lastElementChild);
                    }
                    // if it's set to move from element to element directly
                } else {
                    // subtract 1 from activeSlide
                    activeSlide--;
                    // add the last item of the slideshow container to it's start
                    slideshowContainer.prepend(slideshowContainer.lastElementChild);
                }
            }

            // set the slideshow container transition to none and set translateX to 0
            slideshowContainer.style.transition = "none";
            slideshowContainer.style.transform = "translateX(0%)";

            // set a timer
            setTimeout(() => {
                jump = 1;
                // add transition to the slideshow container
                slideshowContainer.style.transition = "all ease 1s";
            });
            // a function that updates the indicators
            function updateIndicators() {
                // if the active slide is before the last appended item
                if (activeSlide > totalSlides - 1) {
                    // put it in the first place
                    activeSlide = 0;
                    // if the active slide is less that 0
                } else if (activeSlide < 0) {
                    // put it before the last appended item
                    activeSlide = totalSlides - 1;
                }
                // remove the active class from the indicator that have it, and add that class to the active slide
                document.querySelector(".slideshow__indicators span.active").classList.remove("active");
                document.querySelectorAll(".slideshow__indicators span")[activeSlide].classList.add("active");
            }
            // run the function to update the indicator
            updateIndicators();
        }
    });

    // select all indicators
    let indicators = document.querySelectorAll(".slideshow__indicators span");
    // listen to clicks on every indicator
    indicators.forEach((item) => {
        item.addEventListener("click", (e) => {
            // select the data-set in the span
            let slideTo = parseInt(e.target.dataset.slideTo);
            // find the indicator with the class name 'active' then declare it's index in a variable
            indicators.forEach((item, index) => {
                if (item.classList.contains("active")) {
                    activeIndicator = index;
                }
            });
            // if indicator number in data-set minus the index number is more than 1
            if (slideTo - activeIndicator > 1) {
                // then get the jump number and use it to move to the next slide
                jump = slideTo - activeIndicator;
                step = jump * step;
                slideToNext();
                // if indicator number in data-set minus the index number equal 1
            } else if (slideTo - activeIndicator === 1) {
                // move to the next slide
                slideToNext();
                // if indicator number in data-set minus the index number is less than 1
            } else if (slideTo - activeIndicator < 0) {
                // if the absolute number in the result is more than 1
                if (Math.abs(slideTo - activeIndicator) > 1) {
                    // then get the jump number and use it to move to the previous slide
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
