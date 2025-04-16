// auth.js

function verificarAutenticacao(nivelNecessario = null) {
    const token = localStorage.getItem("token");
    const nivel = localStorage.getItem("nivel");
    const usuario = localStorage.getItem("usuario");
  
    if (!token || !nivel || !usuario) {
      window.location.href = "login.html";
      return;
    }
  
    if (nivelNecessario && nivel !== nivelNecessario) {
      alert("Você não tem permissão para acessar esta página.");
      window.location.href = "index.html";
      return;
    }
  
    const elUsuario = document.getElementById("usuario-logado");
    if (elUsuario) elUsuario.textContent = usuario;
  }
  
  function logout() {
    localStorage.clear();
    window.location.href = "login.html";
  }
  