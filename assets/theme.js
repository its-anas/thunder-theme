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

function countdownTimer(
  coundownType,
  timeInDate,
  timeInMinutes,
  afterExpirationTimeOnly,
  id,
  cookieName
) {
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

      daysSpan.innerHTML = ("0" + t.days).slice(-2);
      hoursSpan.innerHTML = ("0" + t.hours).slice(-2);
      minutesSpan.innerHTML = ("0" + t.minutes).slice(-2);
      secondsSpan.innerHTML = ("0" + t.seconds).slice(-2);

      if (t.total >= 0) {
        clock.querySelector(".countdown-timer__timers").classList.add("shown");
        clock
          .querySelector(".countdown-timer__message")
          .classList.add("hidden");
      }

      if (t.total <= 0) {
        clearInterval(timeinterval);
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

    updateClock();
    const timeinterval = setInterval(updateClock, 1000);
  }

  if (coundownType === "date") {
    let deadline;
    const currentTime = Date.parse(new Date());
    timeIndate =
      new Date(timeInDate).getTime() / (1000 * 60) -
      new Date().getTime() / (1000 * 60);
    deadline = new Date(currentTime + timeIndate * 60 * 1000);
    initializeClock(deadline);
  } else if (coundownType === "time") {
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
        if (afterExpirationTimeOnly === "repeatCountdown") {
          saveCookie();
        } else {
        }
      } else {
        deadline;
      }
    } else {
      saveCookie();
    }
    initializeClock(deadline);
  }
}
