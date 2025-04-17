// js/main.js

const API_FUNCIONARIOS = "https://borba-backend.onrender.com/api/funcionarios";
const API_PRODUTOS     = "https://borba-backend.onrender.com/api/produtos";
const API_FINANCEIRO   = "https://borba-backend.onrender.com/api/financeiro";

let funcionarioSelecionado = null;

/**********************
 * AUXILIARES DE ACESSO RÁPIDO
 **********************/
function toggleQuickMenu() {
  const menu   = document.getElementById('quick-menu');
  const aberto = menu.classList.toggle('open');
  Array.from(menu.children).forEach((btn, i) => {
    btn.style.transitionDelay = aberto ? `${i * 50}ms` : '0ms';
  });
  highlightActive();
}

function highlightActive() {
  const atual = location.pathname.split('/').pop();
  Array.from(document.getElementById('quick-menu').children).forEach(btn => {
    const destino = btn.getAttribute('onclick')
                      .match(/'(.+)'/)[1]
                      .split('/').pop();
    if (destino === atual) {
      btn.classList.add('bg-[#103b2b]','text-white','dark:bg-white','dark:text-[#103b2b]');
      btn.classList.remove('border');
    } else {
      btn.classList.remove('bg-[#103b2b]','text-white','dark:bg-white','dark:text-[#103b2b]');
      btn.classList.add('border');
    }
  });
}

/**********************
 * FUNCIONÁRIOS
 **********************/
async function getFuncionarios() {
  const res = await fetch(API_FUNCIONARIOS);
  return res.json();
}

async function salvarFuncionarioAPI(nome) {
  const res = await fetch(API_FUNCIONARIOS, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, foto: "foto-perfil.png", consumo: 0 })
  });
  return res.json();
}

async function atualizarConsumoAPI(id, valor) {
  await fetch(`${API_FUNCIONARIOS}/${id}/consumo`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ valor })
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

  funcionarios.forEach(f => {
    lista.innerHTML += `
      <div class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl p-4 shadow flex items-center space-x-4 transition">
        <img src="assets/img/${f.foto}" alt="Foto" class="w-14 h-14 rounded-full object-cover" />
        <div class="flex-1">
          <h2 class="font-semibold">${f.nome}</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">Consumo no mês:</p>
          <p class="font-bold text-[#103b2b] dark:text-white">R$ ${f.consumo.toFixed(2)}</p>
        </div>
        <div class="flex flex-col gap-2">
          <button onclick="abrirModalConsumo('${f._id}','${f.nome}')"
            class="text-sm bg-[#103b2b] text-white px-3 py-1 rounded-xl hover:opacity-90">➕</button>
          <button onclick="removerFuncionario('${f._id}','${f.nome}')"
            class="text-red-600 hover:text-red-800 text-lg">🗑️</button>
        </div>
      </div>`;
  });
}

function abrirModalConsumo(id,nome) {
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
    return alert("Insira um valor válido.");
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

async function removerFuncionario(id,nome) {
  if (!confirm(`Deseja excluir ${nome}?`)) return;
  await removerFuncionarioAPI(id);
  renderizarFuncionarios();
}

/**********************
 * ESTOQUE
 **********************/
async function getProdutos() {
  const res = await fetch(API_PRODUTOS);
  return res.json();
}

async function salvarProdutoAPI(produto) {
  const res = await fetch(API_PRODUTOS, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(produto)
  });
  return res.json();
}

async function removerProdutoAPI(id) {
  await fetch(`${API_PRODUTOS}/${id}`, { method: "DELETE" });
}

// envia a nova quantidade absoluta para PATCH /api/produtos/:id
async function updateQuantidadeAPI(id, quantidade) {
  const res = await fetch(`${API_PRODUTOS}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantidade })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message);
  }
  return res.json();
}

// abre um prompt para trocar a quantidade absoluta
async function editarProduto(id, nome, atual) {
  const entrada = prompt(
    `Produto: ${nome}\nQuantidade atual: ${atual}\n\nDigite a nova quantidade:`
  );
  const novaQt = parseInt(entrada, 10);
  if (isNaN(novaQt) || novaQt < 0) {
    return alert("Quantidade inválida.");
  }
  await updateQuantidadeAPI(id, novaQt);
  renderizarTabela();
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
  const nome       = document.getElementById("produto-nome").value;
  const categoria  = document.getElementById("produto-categoria").value;
  const quantidade = parseInt(document.getElementById("produto-quantidade").value, 10);
  if (!nome || !categoria || isNaN(quantidade)) {
    return alert("Preencha todos os campos corretamente.");
  }
  await salvarProdutoAPI({ nome, categoria, quantidade });
  fecharModal();
  renderizarTabela();
}

async function removerProduto(id) {
  if (!confirm("Tem certeza que deseja remover este produto?")) return;
  await removerProdutoAPI(id);
  renderizarTabela();
}

async function renderizarTabela() {
  const tbody = document.getElementById("tabela-estoque");
  if (!tbody) return;

  const produtos = await getProdutos();
  let emFalta = 0;
  tbody.innerHTML = produtos.map(p => {
    if (p.quantidade === 0) emFalta++;
    return `
      <tr class="border-t">
        <td class="p-4">${p.nome}</td>
        <td class="p-4">${p.categoria}</td>
        <td class="p-4">${p.quantidade}</td>
        <td class="p-4 ${p.quantidade === 0 ? 'text-red-600' : 'text-green-600'}">
          ${p.quantidade === 0 ? 'Em falta' : 'Disponível'}
        </td>
        <td class="p-4 flex items-center space-x-2">
          <button onclick="editarProduto('${p._id}','${p.nome}',${p.quantidade})"
            class="text-blue-600 hover:text-blue-800">✏️</button>
          <button onclick="removerProduto('${p._id}')"
            class="text-red-600 hover:text-red-800">🗑️</button>
        </td>
      </tr>`;
  }).join('');

  document.getElementById("total-produtos").textContent     = produtos.length;
  document.getElementById("produtos-em-falta").textContent = emFalta;
}

/**********************
 * FINANCEIRO
 **********************/
async function getLancamentosAPI() {
  const res = await fetch(API_FINANCEIRO);
  return res.json();
}

async function salvarLancamentoAPI(dados) {
  const res = await fetch(API_FINANCEIRO, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados)
  });
  return res.json();
}

async function removerLancamentoAPI(id) {
  await fetch(`${API_FINANCEIRO}/${id}`, { method: "DELETE" });
}

async function renderizarLancamentos() {
  const tbody    = document.getElementById("tabela-lancamentos");
  const receitas = document.getElementById("total-receitas");
  const despesas = document.getElementById("total-despesas");
  const saldo    = document.getElementById("saldo-atual");
  if (!tbody || !receitas || !despesas || !saldo) return;

  const lancs = await getLancamentosAPI();
  let r = 0, d = 0;
  tbody.innerHTML = lancs.map(l => {
    if (l.tipo === "receita") r += l.valor; else d += l.valor;
    return `
      <tr class="border-t">
        <td class="p-4">${l.data}</td>
        <td class="p-4">${l.descricao}</td>
        <td class="p-4 ${l.tipo==='receita'?'text-green-600':'text-red-600'}">${l.tipo}</td>
        <td class="p-4">R$ ${l.valor.toFixed(2)}</td>
        <td class="p-4">
          <button onclick="removerLancamento('${l._id}')"
            class="text-red-600 hover:text-red-800">🗑️</button>
        </td>
      </tr>`;
  }).join('');

  receitas.textContent = `R$ ${r.toFixed(2)}`;
  despesas.textContent = `R$ ${d.toFixed(2)}`;
  saldo.textContent    = `R$ ${(r - d).toFixed(2)}`;
}

function abrirModalFinanceiro() {
  document.getElementById("modal-financeiro").classList.remove("hidden");
}
function fecharModalFinanceiro() {
  document.getElementById("modal-financeiro").classList.add("hidden");
  document.getElementById("desc-fin").value  = "";
  document.getElementById("valor-fin").value = "";
  document.getElementById("tipo-fin").value  = "receita";
}

async function salvarLancamento() {
  const desc  = document.getElementById("desc-fin").value;
  const valor = parseFloat(document.getElementById("valor-fin").value);
  const tipo  = document.getElementById("tipo-fin").value;
  const data  = new Date().toLocaleDateString("pt-BR");
  if (!desc || isNaN(valor) || valor <= 0) {
    return alert("Preencha todos os campos corretamente.");
  }
  await salvarLancamentoAPI({ data, descricao: desc, tipo, valor });
  fecharModalFinanceiro();
  renderizarLancamentos();
}

async function removerLancamento(id) {
  if (!confirm("Deseja remover este lançamento?")) return;
  await removerLancamentoAPI(id);
  renderizarLancamentos();
}

/**********************
 * RELATÓRIOS
 **********************/
async function filtrarRelatorio() {
  const inicio = document.getElementById("data-inicio")?.value;
  const fim    = document.getElementById("data-fim")?.value;
  const tabela = document.getElementById("tabela-relatorio");
  const rEl    = document.getElementById("total-receitas-rel");
  const dEl    = document.getElementById("total-despesas-rel");
  const sEl    = document.getElementById("saldo-rel");
  if (!tabela || !rEl || !dEl || !sEl) return;

  const lancs = await getLancamentosAPI();
  let r = 0, d = 0;
  const filt = lancs.filter(l => {
    const [day,month,year] = l.data.split("/");
    const dt = new Date(`${year}-${month}-${day}`);
    const si = inicio ? new Date(inicio) : null;
    const sf = fim    ? new Date(fim)    : null;
    return (!si || dt >= si) && (!sf || dt <= sf);
  });

  tabela.innerHTML = filt.map(l => {
    if (l.tipo==="receita") r += l.valor; else d += l.valor;
    return `
      <tr class="border-t">
        <td class="p-4">${l.data}</td>
        <td class="p-4">${l.descricao}</td>
        <td class="p-4 ${l.tipo==='receita'?'text-green-600':'text-red-600'}">${l.tipo}</td>
        <td class="p-4">R$ ${l.valor.toFixed(2)}</td>
      </tr>`;
  }).join('');

  rEl.textContent = `R$ ${r.toFixed(2)}`;
  dEl.textContent = `R$ ${d.toFixed(2)}`;
  sEl.textContent = `R$ ${(r - d).toFixed(2)}`;
}

/**********************
 * INICIALIZAÇÃO
 **********************/
window.addEventListener("DOMContentLoaded", () => {
  highlightActive();
  const path = location.pathname;
  if (path.includes("funcionarios")) renderizarFuncionarios();
  if (path.includes("estoque"))       renderizarTabela();
  if (path.includes("financeiro"))    renderizarLancamentos();
  if (path.includes("relatorios"))    filtrarRelatorio();
});
