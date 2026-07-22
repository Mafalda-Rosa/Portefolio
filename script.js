const btnAbout = document.getElementById("btnAbout");
const aboutSection = document.getElementById("aboutSection");

btnAbout.addEventListener("click", () => {
  aboutSection.classList.toggle("hidden");
});
