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
// a function that get it parameter's values from the section directly and insert back the time
function countdownTimer(
  countdownType,
  timeInDate,
  timeInMinutes,
  afterExpirationTimeOnly,
  id,
  cookieName
) {
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
        clock
          .querySelector(".countdown-timer__message")
          .classList.add("hidden");
      }
      // if time end time is reached, clear the interval
      if (t.total <= 0) {
        clearInterval(timeInterval);
        // show the end message only if the merchant want.
        if (afterExpirationTimeOnly === "showMessage") {
          clock
            .querySelector(".countdown-timer__timers")
            .classList.remove("shown");
          clock
            .querySelector(".countdown-timer__message")
            .classList.remove("hidden");
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
      document.cookie =
        cookieName + "=" + deadline + "; path=/; domain=." + domainName;
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
 *               * ANCHOR: Video hero section
 *=============================================**/
