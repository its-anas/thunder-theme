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
