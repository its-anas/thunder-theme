const faqSections = document.querySelectorAll(".faq__section");
faqSections.forEach((section) => {
  section.addEventListener("click", () => {
    const answer = section.childNodes[3];
    const answerHeight = section.childNodes[3].scrollHeight;
    section.classList.toggle("active");
    if (section.classList.contains("active")) {
      answer.style.height = answerHeight + 20 + "px";
    } else {
      answer.style.height = "0px";
    }
  });
});

// let fixedDays = 1 * (24 * 60 * 60 * 1000);
// let fixedHours = 24 * (60 * 60 * 1000);
// let fixedMinutes = 60 * (60 * 1000);
// let fixedSeconds = 60 * 1000;
// let fixedCountdownDate = fixedDays + fixedHours + fixedMinutes + fixedSeconds;
// let countdownType = "fixed";

// let countdownDate =
//   countdownType === "fixed"
//     ? fixedCountdownDate + new Date().getTime()
//     : new Date("Sept 12, 2022 19:33:41").getTime();

// let coundownCounter = setInterval(() => {
//   let dateNow = new Date().getTime();
//   let dateDifference = countdownDate - dateNow;
//   let days = Math.floor(dateDifference / (1000 * 60 * 60 * 24));
//   let hours = Math.floor(
//     (dateDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
//   );
//   let minutes = Math.floor((dateDifference % (1000 * 60 * 60)) / (1000 * 60));
//   let seconds = Math.floor((dateDifference % (1000 * 60)) / 1000);

//   document.querySelector(".days").innerHTML = days < 10 ? `0${days}` : days;
//   document.querySelector(".hours").innerHTML = hours < 10 ? `0${hours}` : hours;
//   document.querySelector(".minutes").innerHTML =
//     minutes < 10 ? `0${minutes}` : minutes;
//   document.querySelector(".seconds").innerHTML =
//     seconds < 10 ? `0${seconds}` : seconds;

//   if (dateDifference < 0) {
//     clearInterval(coundownCounter);
//     document.querySelector(".countdown-timer__timers").classList.add("hidden");
//     document.querySelector(".countdown-timer__message").classList.add("shown");
//   }
// });

// let timeInSecs;
// let ticker;
// let fixedCountdownDate = 1;
// let countdownType = "fixed";

// let countdownDate =
//   countdownType === "fixed"
//     ? fixedCountdownDate
//     : (new Date("Sept 12, 2022 20:13:00").getTime() - new Date().getTime()) /
//       1000;

// function startTimer(seconds) {
//   timeInSecs = parseInt(seconds);
//   ticker = setInterval("tick()", 1000);
// }

// function tick() {
//   let seconds = timeInSecs;
//   if (seconds > 0) {
//     timeInSecs--;
//   } else {
//     clearInterval(ticker);
//     startTimer(countdownDate);
//   }

//   let days = Math.floor(seconds / 86400);
//   seconds %= 86400;
//   let hours = Math.floor(seconds / 3600);
//   seconds %= 3600;
//   var minutes = Math.floor(seconds / 60);
//   seconds %= 60;

//   document.querySelector(".days").innerHTML = days < 10 ? `0${days}` : days;
//   document.querySelector(".hours").innerHTML = hours < 10 ? `0${hours}` : hours;
//   document.querySelector(".minutes").innerHTML =
//     minutes < 10 ? `0${minutes}` : minutes;
//   document.querySelector(".seconds").innerHTML =
//     seconds < 10 ? `0${seconds}` : seconds;
// }

// startTimer(countdownDate);

// function startTimer(type, days, hours, mins, secs, date) {
//   let countdownType = type;
//   let fixedDays = days * (24 * 60 * 60 * 1000);
//   let fixedHours = hours * (60 * 60 * 1000);
//   let fixedMinutes = mins * (60 * 1000);
//   let fixedSeconds = secs * 1000;
//   let fixedCountdownDate = fixedDays + fixedHours + fixedMinutes + fixedSeconds;

//   let countdownDate =
//     countdownType === "repeated"
//       ? fixedCountdownDate + new Date().getTime()
//       : new Date(date).getTime();
//   let coundownCounter = setInterval(() => {
//     let dateNow = new Date().getTime();
//     let dateDifference = countdownDate - dateNow;
//     let days = Math.floor(dateDifference / (1000 * 60 * 60 * 24));
//     let hours = Math.floor(
//       (dateDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
//     );
//     let minutes = Math.floor((dateDifference % (1000 * 60 * 60)) / (1000 * 60));
//     let seconds = Math.floor((dateDifference % (1000 * 60)) / 1000);

//     document.querySelector(".countdown-timer__timers>.days").innerHTML =
//       days < 10 ? `0${days}` : days;
//     document.querySelector(".hours").innerHTML =
//       hours < 10 ? `0${hours}` : hours;
//     document.querySelector(".minutes").innerHTML =
//       minutes < 10 ? `0${minutes}` : minutes;
//     document.querySelector(".seconds").innerHTML =
//       seconds < 10 ? `0${seconds}` : seconds;

//     if (dateDifference < 0) {
//       clearInterval(coundownCounter);
//       document
//         .querySelector(".countdown-timer__timers")
//         .classList.add("hidden");
//       document
//         .querySelector(".countdown-timer__message")
//         .classList.add("shown");
//     }
//   });
// }

function countdownTimer(id, timeInMinutes, timeInDate, cookieName) {
  function getTimeRemaining(endtime) {
    const total = Date.parse(endtime) - Date.parse(new Date());
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));

    return {
      total,
      days,
      hours,
      minutes,
      seconds,
    };
  }

  function initializeClock(endtime) {
    const clock = document.getElementById(id);
    const daysSpan = clock.querySelector(".days");
    const hoursSpan = clock.querySelector(".hours");
    const minutesSpan = clock.querySelector(".minutes");
    const secondsSpan = clock.querySelector(".seconds");

    function updateClock() {
      const t = getTimeRemaining(endtime);

      daysSpan.innerHTML = t.days;
      hoursSpan.innerHTML = ("0" + t.hours).slice(-2);
      minutesSpan.innerHTML = ("0" + t.minutes).slice(-2);
      secondsSpan.innerHTML = ("0" + t.seconds).slice(-2);

      if (t.total >= 0) {
        document
          .querySelector(".countdown-timer__timers")
          .classList.add("shown");
        document
          .querySelector(".countdown-timer__message")
          .classList.add("hidden");
      }

      if (t.total <= 0) {
        clearInterval(timeinterval);
      }
    }

    updateClock();
    const timeinterval = setInterval(updateClock, 1000);
  }

  // 1) Merchant set a date
  // It expires and shows a message (Show small code)

  // 2) Merchant set a delay
  // User visit
  // IT expires after the deadline
  // When user refresh it start over (Show long code10 )

  // 3) Merchant set a delay
  // User visit
  // IT expires after the deadline
  // When user refresh it shows message (remove saveCookie from line 206)

  // 1) if the merchant set the deadline based on repeated range
  // let deadline;
  // const currentTime = Date.parse(new Date());
  // timeIndate =
  //   new Date(timeInDate).getTime() / (1000 * 60) -
  //   new Date().getTime() / (1000 * 60);
  // deadline = new Date(currentTime + timeIndate * 60 * 1000);

  // 2) if the merchant set the countdown deadline to be based on the user first visit and saved in cookies
  let deadline = document.cookie
    .split("; ")
    .find((row) => row.startsWith(cookieName + "="))
    ?.split("=")[1];

  function saveCookie() {
    const currentTime = Date.parse(new Date());
    deadline = new Date(currentTime + timeInMinutes * 60 * 1000);
    domainName = window.location.hostname;
    document.cookie =
      cookieName + "=" + deadline + "; path=/; domain=." + domainName;
  }

  if (document.cookie && deadline) {
    actualDate = new Date().getTime();
    deadlineDate = new Date(deadline).getTime();

    if (actualDate > deadlineDate) {
      // 3) if the merchant want the deadline to be refreshed after the the first one is expired (never ending countdown timer)
      saveCookie();
    } else {
      deadline;
    }
  } else {
    saveCookie();
  }

  initializeClock(deadline);
}
