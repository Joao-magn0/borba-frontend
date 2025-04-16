const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");

const JWT_SECRET = process.env.JWT_SECRET || "segredo-borba";

// Registrar
router.post("/register", async (req, res) => {
  const { usuario, senha, hierarquia } = req.body;

  if (!usuario || !senha || !hierarquia) {
    return res.status(400).json({ message: "Preencha todos os campos." });
  }

  try {
    const existeUsuario = await Usuario.findOne({ usuario });
    if (existeUsuario) {
      return res.status(400).json({ message: "Usuário já existe." });
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    const novoUsuario = new Usuario({ usuario, senha: senhaHash, hierarquia });
    await novoUsuario.save();

    res.status(201).json({ message: "Usuário registrado com sucesso." });
  } catch (error) {
    res.status(500).json({ message: "Erro no servidor." });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Preencha todos os campos." });
  }

  try {
    const usuario = await Usuario.findOne({ usuario: username });
    if (!usuario) {
      return res.status(400).json({ message: "Usuário não encontrado." });
    }

    const senhaCorreta = await bcrypt.compare(password, usuario.senha);
    if (!senhaCorreta) {
      return res.status(400).json({ message: "Senha incorreta." });
    }

    const token = jwt.sign({ id: usuario._id, hierarquia: usuario.hierarquia }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token, username: usuario.usuario, hierarquia: usuario.hierarquia });
  } catch (error) {
    res.status(500).json({ message: "Erro no login." });
  }
});

module.exports = router;
