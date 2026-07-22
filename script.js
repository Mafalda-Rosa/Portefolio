// Ações para o About Me
const btnAbout = document.getElementById("btnAbout");
const aboutSection = document.getElementById("aboutSection");

btnAbout.addEventListener("click", () => {
  aboutSection.classList.toggle("hidden");
});

// Ações para o Contact Me
const btnContact = document.getElementById("btnContact");
const contactSection = document.getElementById("contactSection");

btnContact.addEventListener("click", () => {
  contactSection.classList.toggle("hidden");
});
