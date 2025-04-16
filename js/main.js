const API_FUNCIONARIOS = "https://borba-backend.onrender.com/api/funcionarios";
const API_PRODUTOS = "https://borba-backend.onrender.com/api/produtos";
const API_FINANCEIRO = "https://borba-backend.onrender.com/api/financeiro";

let funcionarioSelecionado = null;

/**********************
 * FUNCIONÁRIOS
 **********************/
async function getFuncionarios() {
  const res = await fetch(API_FUNCIONARIOS);
  return await res.json();
}

async function salvarFuncionarioAPI(nome) {
  const novo = { nome, foto: "foto-perfil.png", consumo: 0 };
  const res = await fetch(API_FUNCIONARIOS, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(novo),
  });
  return await res.json();
}

async function atualizarConsumoAPI(id, valor) {
  await fetch(`${API_FUNCIONARIOS}/${id}/consumo`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ valor }),
  });
}

async function removerFuncionarioAPI(id) {
  await fetch(`${API_FUNCIONARIOS}/${id}`, { method: "DELETE" });
}

async function renderizarFuncionarios() {
  const lista = document.getElementById("lista-funcionarios");
  if (!lista) return;

  const funcionarios = await getFuncionarios();
  lista.innerHTML = "";

  funcionarios.forEach((f) => {
    lista.innerHTML += `
      <div class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl p-4 shadow flex items-center space-x-4 transition">
        <img src="assets/img/${f.foto || 'foto-perfil.png'}" alt="Foto" class="w-14 h-14 rounded-full object-cover" />
        <div class="flex-1">
          <h2 class="font-semibold">${f.nome}</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">Consumo no mês:</p>
          <p class="font-bold text-[#103b2b] dark:text-white">R$ ${f.consumo.toFixed(2)}</p>
        </div>
        <div class="flex flex-col gap-2">
          <button onclick="abrirModalConsumo('${f._id}', '${f.nome}')" class="text-sm bg-[#103b2b] text-white px-3 py-1 rounded-xl hover:opacity-90">➕</button>
          <button onclick="removerFuncionario('${f._id}', '${f.nome}')" class="text-red-600 hover:text-red-800 text-lg">🗑️</button>
        </div>
      </div>`;
  });
}

function abrirModalConsumo(id, nome) {
  funcionarioSelecionado = id;
  document.getElementById("modal-funcionario").textContent = `Funcionário: ${nome}`;
  document.getElementById("modal-consumo").classList.remove("hidden");
}

function fecharModalConsumo() {
  document.getElementById("modal-consumo").classList.add("hidden");
  document.getElementById("consumo-valor").value = "";
}

async function registrarConsumo() {
  const valor = parseFloat(document.getElementById("consumo-valor").value);
  if (isNaN(valor) || valor <= 0) {
    alert("Insira um valor válido.");
    return;
  }
  await atualizarConsumoAPI(funcionarioSelecionado, valor);
  fecharModalConsumo();
  renderizarFuncionarios();
}

async function adicionarFuncionario() {
  const nome = prompt("Nome do novo funcionário:");
  if (!nome) return;
  await salvarFuncionarioAPI(nome);
  renderizarFuncionarios();
}

async function removerFuncionario(id, nome) {
  if (confirm(`Deseja excluir ${nome}?`)) {
    await removerFuncionarioAPI(id);
    renderizarFuncionarios();
  }
}

/**********************
 * ESTOQUE
 **********************/
async function getProdutos() {
  const res = await fetch(API_PRODUTOS);
  return await res.json();
}

async function salvarProdutoAPI(produto) {
  const res = await fetch(API_PRODUTOS, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(produto),
  });
  return await res.json();
}

async function removerProdutoAPI(id) {
  await fetch(`${API_PRODUTOS}/${id}`, { method: "DELETE" });
}

function abrirModal() {
  document.getElementById("modal-produto").classList.remove("hidden");
}

function fecharModal() {
  document.getElementById("modal-produto").classList.add("hidden");
  document.getElementById("produto-nome").value = "";
  document.getElementById("produto-categoria").value = "";
  document.getElementById("produto-quantidade").value = "";
}

async function salvarProduto() {
  const nome = document.getElementById("produto-nome").value;
  const categoria = document.getElementById("produto-categoria").value;
  const quantidade = parseInt(document.getElementById("produto-quantidade").value);

  if (!nome || !categoria || isNaN(quantidade)) {
    alert("Preencha todos os campos corretamente.");
    return;
  }

  await salvarProdutoAPI({ nome, categoria, quantidade });
  fecharModal();
  renderizarTabela();
}

async function removerProduto(id) {
  if (confirm("Tem certeza que deseja remover este produto?")) {
    await removerProdutoAPI(id);
    renderizarTabela();
  }
}

async function renderizarTabela() {
  const tbody = document.getElementById("tabela-estoque");
  if (!tbody) return;

  const produtos = await getProdutos();
  tbody.innerHTML = "";
  let emFalta = 0;

  produtos.forEach((p) => {
    if (p.quantidade === 0) emFalta++;
    tbody.innerHTML += `
      <tr class="border-t">
        <td class="p-4">${p.nome}</td>
        <td class="p-4">${p.categoria}</td>
        <td class="p-4">${p.quantidade}</td>
        <td class="p-4 ${p.quantidade === 0 ? 'text-red-600' : 'text-green-600'}">
          ${p.quantidade === 0 ? 'Em falta' : 'Disponível'}
        </td>
        <td class="p-4">
          <button onclick="removerProduto('${p._id}')" class="text-red-600 hover:text-red-800">🗑️</button>
        </td>
      </tr>`;
  });

  document.getElementById("total-produtos").textContent = produtos.length;
  document.getElementById("produtos-em-falta").textContent = emFalta;
}

/**********************
 * FINANCEIRO
 **********************/
async function getLancamentosAPI() {
  const res = await fetch(API_FINANCEIRO);
  return await res.json();
}

async function salvarLancamentoAPI(dados) {
  const res = await fetch(API_FINANCEIRO, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
  return await res.json();
}

async function removerLancamentoAPI(id) {
  await fetch(`${API_FINANCEIRO}/${id}`, { method: "DELETE" });
}

async function renderizarLancamentos() {
  const tbody = document.getElementById("tabela-lancamentos");
  const receitas = document.getElementById("total-receitas");
  const despesas = document.getElementById("total-despesas");
  const saldo = document.getElementById("saldo-atual");

  if (!tbody || !receitas || !despesas || !saldo) return;

  const lancs = await getLancamentosAPI();
  let totalReceita = 0;
  let totalDespesa = 0;
  tbody.innerHTML = "";

  lancs.forEach((l) => {
    if (l.tipo === "receita") totalReceita += l.valor;
    else totalDespesa += l.valor;

    tbody.innerHTML += `
      <tr class="border-t">
        <td class="p-4">${l.data}</td>
        <td class="p-4">${l.descricao}</td>
        <td class="p-4 ${l.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}">${l.tipo}</td>
        <td class="p-4">R$ ${l.valor.toFixed(2)}</td>
        <td class="p-4">
          <button onclick="removerLancamento('${l._id}')" class="text-red-600 hover:text-red-800">🗑️</button>
        </td>
      </tr>`;
  });

  receitas.textContent = `R$ ${totalReceita.toFixed(2)}`;
  despesas.textContent = `R$ ${totalDespesa.toFixed(2)}`;
  saldo.textContent = `R$ ${(totalReceita - totalDespesa).toFixed(2)}`;
}

function abrirModalFinanceiro() {
  document.getElementById("modal-financeiro").classList.remove("hidden");
}

function fecharModalFinanceiro() {
  document.getElementById("modal-financeiro").classList.add("hidden");
  document.getElementById("desc-fin").value = "";
  document.getElementById("valor-fin").value = "";
  document.getElementById("tipo-fin").value = "receita";
}

async function salvarLancamento() {
  const desc = document.getElementById("desc-fin").value;
  const valor = parseFloat(document.getElementById("valor-fin").value);
  const tipo = document.getElementById("tipo-fin").value;
  const data = new Date().toLocaleDateString("pt-BR");

  if (!desc || isNaN(valor) || valor <= 0) {
    alert("Preencha todos os campos corretamente.");
    return;
  }

  const novo = { data, descricao: desc, tipo, valor };
  await salvarLancamentoAPI(novo);
  fecharModalFinanceiro();
  renderizarLancamentos();
}

async function removerLancamento(id) {
  if (confirm("Deseja remover este lançamento?")) {
    await removerLancamentoAPI(id);
    renderizarLancamentos();
  }
}

/**********************
 * RELATÓRIOS
 **********************/
async function filtrarRelatorio() {
  const dataInicio = document.getElementById("data-inicio")?.value;
  const dataFim = document.getElementById("data-fim")?.value;
  const tabela = document.getElementById("tabela-relatorio");
  const receitasEl = document.getElementById("total-receitas-rel");
  const despesasEl = document.getElementById("total-despesas-rel");
  const saldoEl = document.getElementById("saldo-rel");

  if (!tabela || !receitasEl || !despesasEl || !saldoEl) return;

  const lancs = await getLancamentosAPI();
  let receitas = 0;
  let despesas = 0;

  const filtrados = lancs.filter((l) => {
    const [dia, mes, ano] = l.data.split("/");
    const dataLanc = new Date(`${ano}-${mes}-${dia}`);
    const inicio = dataInicio ? new Date(dataInicio) : null;
    const fim = dataFim ? new Date(dataFim) : null;
    return (!inicio || dataLanc >= inicio) && (!fim || dataLanc <= fim);
  });

  tabela.innerHTML = "";
  filtrados.forEach((l) => {
    if (l.tipo === "receita") receitas += l.valor;
    else despesas += l.valor;

    tabela.innerHTML += `
      <tr class="border-t">
        <td class="p-4">${l.data}</td>
        <td class="p-4">${l.descricao}</td>
        <td class="p-4 ${l.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}">${l.tipo}</td>
        <td class="p-4">R$ ${l.valor.toFixed(2)}</td>
      </tr>`;
  });

  receitasEl.textContent = `R$ ${receitas.toFixed(2)}`;
  despesasEl.textContent = `R$ ${despesas.toFixed(2)}`;
  saldoEl.textContent = `R$ ${(receitas - despesas).toFixed(2)}`;
}

/**********************
 * AUTENTICAÇÃO
 **********************/
function validarToken() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "../login.html";
  }
}

function criarBotaoLogout() {
  const btn = document.createElement("button");
  btn.textContent = "🚪 Sair";
  btn.title = "Logout";
  btn.className =
    "fixed top-6 right-20 z-50 bg-white dark:bg-gray-800 text-[#103b2b] dark:text-white px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 shadow hover:bg-red-100 dark:hover:bg-red-900 transition";
  btn.onclick = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "../login.html";
  };
  document.body.appendChild(btn);
}

/**********************
 * INICIALIZAÇÃO
 **********************/
window.addEventListener("DOMContentLoaded", () => {
  validarToken();
  criarBotaoLogout();

  const path = window.location.pathname;
  if (path.includes("funcionarios")) renderizarFuncionarios();
  if (path.includes("estoque")) renderizarTabela();
  if (path.includes("financeiro")) renderizarLancamentos();
  if (path.includes("relatorios")) filtrarRelatorio();
});
