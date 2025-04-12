// js/tema.js

// Ativa modo escuro baseado no localStorage
tailwind.config = { darkMode: 'class' };
if (localStorage.getItem('dark-mode') === 'true') {
  document.documentElement.classList.add('dark');
}

// Se existir o botão no HTML, controla o clique e ícone
window.addEventListener("DOMContentLoaded", () => {
  const icon = document.getElementById("icon-darkmode");
  if (icon) {
    icon.textContent = document.documentElement.classList.contains("dark") ? "☀️" : "🌙";
    icon.onclick = () => {
      document.documentElement.classList.toggle("dark");
      const isDark = document.documentElement.classList.contains("dark");
      localStorage.setItem("dark-mode", isDark);
      icon.textContent = isDark ? "☀️" : "🌙";
    };
  }
});
