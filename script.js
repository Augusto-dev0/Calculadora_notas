/* =========================================
   SISTEMA ACADÊMICO — script.js
   Melhorias aplicadas:
   ✔ Sanitização XSS (escapeHTML)
   ✔ prefers-color-scheme na primeira visita
   ✔ Nota necessária > 10 → reprovado direto
   ✔ Estado do último cálculo salvo para PDF
   ✔ Validação de nome em todos os modos
   ✔ Acessibilidade (aria-label, role, aria-live)
========================================= */

/* ─── CONFIGURAÇÃO DE INSTITUIÇÕES ─── */
const universidades = {
  publica:       { nome: "Instituição Pública",               media: 7,    modelo: "media2" },
  privada:       { nome: "Instituição Privada",               media: 6,    modelo: "media2" },
  personalizada: { nome: "Média Personalizada",               media: null, modelo: "media2" },
  naosei:        { nome: "Não sei a média (Simular 6 e 7)",   media: null, modelo: "naosei" },
  modelo3:       { nome: "Modelo 3 Notas (N1+N2+Final) ÷ 3", media: 7,    modelo: "media3" },
};

/* ─── ESTADO ─── */
let historico      = JSON.parse(localStorage.getItem("acad_historico")) || [];
let ultimoResultado = null; // Estado do último cálculo (usado no PDF)

/* ─── UTILIDADES ─── */

/**
 * Sanitiza texto para inserção segura no innerHTML.
 * Previne ataques XSS.
 */
function escapeHTML(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

/* ─── INICIALIZAR SELECT ─── */
const selectUni = document.getElementById("universidade");

Object.entries(universidades).forEach(([key, val]) => {
  const opt = document.createElement("option");
  opt.value = key;
  opt.textContent = val.nome;
  selectUni.appendChild(opt);
});

selectUni.addEventListener("change", () => {
  const rowPersonalizada = document.getElementById("row-personalizada");
  const isPersonalizada  = selectUni.value === "personalizada";
  rowPersonalizada.style.display = isPersonalizada ? "block" : "none";
  if (!isPersonalizada) {
    document.getElementById("mediaPersonalizada").value = "";
    document.getElementById("err-media-custom").textContent = "";
  }
});

/* ─── TOAST ─── */
function showToast(msg, tipo = "ok") {
  const toast = document.getElementById("toast");
  const icon  = document.getElementById("toastIcon");
  document.getElementById("toastMsg").textContent = msg;

  const mapa = {
    ok:    { cls: "fa-circle-check",         cor: "var(--success)" },
    aviso: { cls: "fa-triangle-exclamation", cor: "var(--warning)" },
    erro:  { cls: "fa-circle-xmark",         cor: "var(--danger)"  },
    info:  { cls: "fa-circle-info",          cor: "var(--accent)"  },
  };
  const t = mapa[tipo] || mapa.ok;
  icon.className = `fas ${t.cls}`;
  icon.style.color = t.cor;
  toast.style.borderLeftColor = t.cor;
  toast.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove("show"), 3400);
}

/* ─── VALIDAÇÃO ─── */
function setError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}

function clearErrors() {
  ["err-nome", "err-n1", "err-n2", "err-media-custom"].forEach(id => setError(id, ""));
  ["nome", "n1", "n2", "mediaPersonalizada"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove("invalid");
  });
}

function markInvalid(inputId, errId, msg) {
  const el = document.getElementById(inputId);
  if (el) {
    el.classList.add("invalid");
    el.focus();
  }
  setError(errId, msg);
}

/* ─── CALCULAR ─── */
function calcular() {
  clearErrors();

  const nome   = document.getElementById("nome").value.trim();
  const uniKey = selectUni.value;
  const regra  = universidades[uniKey];
  const n1Raw  = document.getElementById("n1").value;
  const n2Raw  = document.getElementById("n2").value;
  const nfRaw  = document.getElementById("nfinal").value;

  const n1 = parseFloat(n1Raw);
  const n2 = parseFloat(n2Raw);
  const nf = parseFloat(nfRaw);

  let hasError = false;
  let firstInvalidId = null;

  // Validação das notas
  if (n1Raw === "" || isNaN(n1) || n1 < 0 || n1 > 10) {
    markInvalid("n1", "err-n1", "Nota inválida (0 a 10).");
    if (!firstInvalidId) firstInvalidId = "n1";
    hasError = true;
  }
  if (n2Raw === "" || isNaN(n2) || n2 < 0 || n2 > 10) {
    markInvalid("n2", "err-n2", "Nota inválida (0 a 10).");
    if (!firstInvalidId) firstInvalidId = "n2";
    hasError = true;
  }
  if (uniKey === "personalizada") {
    const mpVal = parseFloat(document.getElementById("mediaPersonalizada").value);
    if (isNaN(mpVal) || mpVal < 0 || mpVal > 10) {
      markInvalid("mediaPersonalizada", "err-media-custom", "Informe a média (0 a 10).");
      if (!firstInvalidId) firstInvalidId = "mediaPersonalizada";
      hasError = true;
    }
  }

  if (hasError) {
    if (firstInvalidId) document.getElementById(firstInvalidId)?.focus();
    showToast("Corrija os campos destacados.", "aviso");
    return;
  }

  /* ─── MODO: NÃO SEI A MÉDIA ─── */
  if (uniKey === "naosei") {
    const mediaParcial = (n1 + n2) / 2;
    const nec6 = parseFloat(((6 * 2) - mediaParcial).toFixed(2));
    const nec7 = parseFloat(((7 * 2) - mediaParcial).toFixed(2));

    // Salva estado para o PDF
    ultimoResultado = {
      nome:      nome || "Não informado",
      regra,
      n1, n2, nf,
      status:    "simulacao",
      mediaUsada: mediaParcial,
      mediaExigida: null,
      nec6, nec7,
    };

    mostrarVeredicto("simulacao", "📊", "Simulação", `Média parcial: ${mediaParcial.toFixed(2)}`);
    mostrarDetalhes([
      { label: "Aluno",          value: nome || "Não informado" },
      { label: "Média Parcial",  value: mediaParcial.toFixed(2) },
      { label: "Para média 6.0", value: nec6 > 10 ? "Impossível atingir" : `Precisa tirar ${nec6.toFixed(2)}` },
      { label: "Para média 7.0", value: nec7 > 10 ? "Impossível atingir" : `Precisa tirar ${nec7.toFixed(2)}` },
    ]);
    esconderProgresso();
    adicionarHistorico(nome, "simulacao", mediaParcial, regra.nome, null);
    showToast("Simulação calculada!", "info");
    return;
  }

  /* ─── DEMAIS MODOS ─── */
  let mediaExigida = regra.media;
  if (uniKey === "personalizada") {
    mediaExigida = parseFloat(document.getElementById("mediaPersonalizada").value);
  }

  const mediaParcial = (n1 + n2) / 2;
  let mediaFinal = null;
  let necessario = null;
  let status;

  if (regra.modelo === "media2") {
    if (!isNaN(nf)) {
      mediaFinal = (mediaParcial + nf) / 2;
    } else {
      necessario = parseFloat(((mediaExigida * 2) - mediaParcial).toFixed(2));
    }
  }

  if (regra.modelo === "media3") {
    if (!isNaN(nf)) {
      mediaFinal = (n1 + n2 + nf) / 3;
    } else {
      necessario = parseFloat(((mediaExigida * 3) - (n1 + n2)).toFixed(2));
    }
  }

  const mediaUsada = mediaFinal !== null ? mediaFinal : mediaParcial;

  // Define status — incluindo caso em que necessário > 10
  if (necessario !== null && necessario > 10) {
    // Matematicamente impossível aprovar no exame final
    status = "reprovado";
    necessario = null; // Não faz sentido mostrar a nota
  } else if (mediaParcial >= mediaExigida && isNaN(nf) && regra.modelo === "media2") {
    status = "aprovado";
  } else if (mediaFinal !== null) {
    status = mediaFinal >= mediaExigida ? "aprovado" : "reprovado";
  } else {
    status = "pendente";
  }

  // Salva estado para o PDF
  ultimoResultado = {
    nome: nome || "Não informado",
    regra,
    n1, n2, nf,
    status,
    mediaUsada,
    mediaExigida,
    necessario,
    mediaFinal,
  };

  // Mensagem do veredicto
  const veredictoMap = {
    aprovado:  { icon: "✅", label: "Aprovado!",    extra: `Média: ${mediaUsada.toFixed(2)}` },
    reprovado: { icon: "❌", label: "Reprovado",    extra: mediaFinal != null ? `Média Final: ${mediaFinal.toFixed(2)}` : "Nota necessária impossível de atingir" },
    pendente:  { icon: "📘", label: "Exame Final",  extra: `Precisa tirar ${necessario?.toFixed(2)}` },
  };
  const v = veredictoMap[status];
  mostrarVeredicto(status, v.icon, v.label, v.extra);

  // Linha de detalhes
  const detalhesList = [
    { label: "Aluno",         value: nome || "Não informado" },
    { label: "Instituição",   value: regra.nome },
    { label: "Nota 1",        value: n1.toFixed(1) },
    { label: "Nota 2",        value: n2.toFixed(1) },
  ];
  if (!isNaN(nf)) detalhesList.push({ label: "Exame Final",  value: nf.toFixed(1) });
  detalhesList.push({ label: "Média Exigida", value: mediaExigida.toFixed(1) });
  if (necessario !== null) detalhesList.push({ label: "Necessário na Final", value: necessario.toFixed(2) });
  mostrarDetalhes(detalhesList);

  // Barra de progresso
  mostrarProgresso(mediaUsada, mediaExigida, status);

  adicionarHistorico(nome, status, mediaUsada, regra.nome, mediaExigida);
  showToast(
    status === "aprovado"  ? "Parabéns, aprovado! 🎉" :
    status === "reprovado" ? "Infelizmente reprovado." :
    "Calcule a nota do exame final.",
    status === "aprovado"  ? "ok"   :
    status === "reprovado" ? "erro" : "aviso"
  );
}

/* ─── RENDER RESULTADO ─── */
function mostrarVeredicto(tipo, icon, label, extra) {
  const card      = document.getElementById("result-card");
  const veredicto = document.getElementById("veredicto");

  veredicto.className = `veredicto ${tipo}`;
  veredicto.innerHTML = `
    <div class="v-icon" aria-hidden="true">${escapeHTML(icon)}</div>
    <div class="v-label">${escapeHTML(label)}</div>
    <div class="v-media">${escapeHTML(extra)}</div>
  `;

  card.style.display = "block";
  card.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function mostrarDetalhes(itens) {
  const el = document.getElementById("result-details");
  el.innerHTML = itens.map(i => `
    <div class="detail-item">
      <span class="d-label">${escapeHTML(i.label)}</span>
      <span class="d-value">${escapeHTML(String(i.value))}</span>
    </div>
  `).join("");
}

function mostrarProgresso(media, exigida, status) {
  const section = document.getElementById("progress-section");
  const bar     = document.getElementById("progress-bar");
  const marker  = document.getElementById("progress-marker");
  const valor   = document.getElementById("progress-valor");
  const track   = document.getElementById("progressTrack");

  section.style.display = "block";

  const pct    = Math.min((media / 10) * 100, 100);
  const mkrPct = Math.min((exigida / 10) * 100, 100);

  bar.className = `progress-bar-fill fill-${status}`;
  bar.style.width = "0";
  setTimeout(() => { bar.style.width = pct + "%"; }, 60);

  marker.style.left = mkrPct + "%";
  marker.setAttribute("data-label", `Mín: ${exigida}`);
  valor.textContent = media.toFixed(2);

  // Acessibilidade na barra
  track.setAttribute("aria-valuenow", media.toFixed(2));
  track.setAttribute("aria-valuetext", `${media.toFixed(2)} de 10 — mínimo exigido: ${exigida}`);
}

function esconderProgresso() {
  const section = document.getElementById("progress-section");
  if (section) section.style.display = "none";
}

/* ─── HISTÓRICO ─── */
function adicionarHistorico(nome, status, media, tipo, exigida) {
  historico.unshift({
    nome:    nome || "Sem nome",
    status,
    media:   media ? media.toFixed(2) : "—",
    tipo,
    exigida,
    hora:    new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
  });
  if (historico.length > 20) historico.pop();
  localStorage.setItem("acad_historico", JSON.stringify(historico));
  renderHistorico();
}

function renderHistorico() {
  const el = document.getElementById("historico");
  if (!el) return;

  if (historico.length === 0) {
    el.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon" aria-hidden="true"><i class="fas fa-book-open"></i></div>
        <p>Nenhum cálculo realizado ainda.</p>
        <small>Preencha o formulário e clique em Calcular.</small>
      </div>`;
    return;
  }

  const iconMap = {
    aprovado:  "fa-circle-check",
    reprovado: "fa-circle-xmark",
    pendente:  "fa-hourglass-half",
    simulacao: "fa-chart-bar",
  };

  // Usa escapeHTML em todos os dados vindos do usuário
  el.innerHTML = historico.map(h => `
    <div class="hist-item" role="listitem">
      <div class="hist-badge ${escapeHTML(h.status)}" aria-hidden="true">
        <i class="fas ${iconMap[h.status] || "fa-circle"}"></i>
      </div>
      <div class="hist-info">
        <div class="hist-nome">${escapeHTML(h.nome)}</div>
        <div class="hist-detalhe">${escapeHTML(h.tipo)} · ${escapeHTML(h.hora)}</div>
      </div>
      <div class="hist-media" aria-label="Média: ${escapeHTML(h.media)}">${escapeHTML(h.media)}</div>
    </div>
  `).join("");
}

function limparHistorico() {
  if (!historico.length) return;
  if (confirm("Limpar todo o histórico?")) {
    historico = [];
    localStorage.removeItem("acad_historico");
    renderHistorico();
    showToast("Histórico limpo.", "info");
  }
}

/* ─── LIMPAR FORMULÁRIO ─── */
function limparFormulario() {
  clearErrors();
  ["nome", "n1", "n2", "nfinal", "mediaPersonalizada"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  selectUni.value = "publica";
  document.getElementById("row-personalizada").style.display = "none";
  document.getElementById("result-card").style.display = "none";
  ultimoResultado = null;
  document.getElementById("nome").focus();
  showToast("Formulário limpo.", "info");
}

/* ─── TEMA ─── */
function toggleDark() {
  const isDark = document.body.classList.toggle("dark");
  document.getElementById("themeIcon").className = isDark ? "fas fa-sun" : "fas fa-moon";
  document.getElementById("themeBtn").setAttribute("aria-label",
    isDark ? "Mudar para tema claro" : "Mudar para tema escuro"
  );
  localStorage.setItem("acad_tema", isDark ? "dark" : "light");
}

(function initTema() {
  const salvo       = localStorage.getItem("acad_tema");
  const prefereDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  // Respeita a preferência do SO na primeira visita (fix: prefers-color-scheme)
  if (salvo === "dark" || (!salvo && prefereDark)) {
    document.body.classList.add("dark");
    const ic = document.getElementById("themeIcon");
    const btn = document.getElementById("themeBtn");
    if (ic) ic.className = "fas fa-sun";
    if (btn) btn.setAttribute("aria-label", "Mudar para tema claro");
  }
})();

/* ─── GERAR PDF ─── */
function gerarPDF() {
  // Usa o estado salvo do último cálculo — evita inconsistência com o DOM
  if (!ultimoResultado) {
    showToast("Calcule primeiro antes de gerar o PDF.", "aviso");
    return;
  }

  const r = ultimoResultado;
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210, H = 297, ML = 20, MR = 20;

  const C = {
    bg:      [16, 19, 26],
    surface: [22, 27, 37],
    surface2:[28, 34, 48],
    accent:  [91, 142, 214],
    success: [59, 168, 104],
    danger:  [224, 82, 82],
    warning: [224, 160, 48],
    text:    [232, 230, 224],
    muted:   [90, 98, 120],
    border:  [42, 51, 72],
    white:   [255, 255, 255],
  };

  const F = c => doc.setFillColor(c[0], c[1], c[2]);
  const S = c => doc.setDrawColor(c[0], c[1], c[2]);
  const T = c => doc.setTextColor(c[0], c[1], c[2]);

  // Fundo
  F(C.bg);      doc.rect(0, 0, W, H, "F");
  F(C.surface); doc.rect(0, 0, W, 54, "F");

  // Linha acento topo
  doc.setFillColor(C.accent[0], C.accent[1], C.accent[2]);
  doc.rect(0, 0, W, 3, "F");

  // Logo
  F(C.accent); doc.roundedRect(ML, 12, 26, 26, 3, 3, "F");
  T(C.white); doc.setFontSize(9); doc.setFont("helvetica", "bold");
  doc.text("SA", ML + 13, 27, { align: "center" });

  // Título
  T(C.text); doc.setFontSize(17); doc.setFont("helvetica", "bold");
  doc.text("SISTEMA ACADÊMICO", ML + 33, 24);
  T(C.muted); doc.setFontSize(7.5); doc.setFont("helvetica", "normal");
  doc.text("Boletim de Notas · " + new Date().getFullYear(), ML + 33, 32);

  T(C.muted); doc.setFontSize(7);
  doc.text("Emitido em: " + new Date().toLocaleString("pt-BR"), W - MR, 20, { align: "right" });

  S(C.accent); doc.setLineWidth(0.4);
  doc.line(ML, 55, W - MR, 55);

  // Dados do aluno
  const campos = [
    ["Aluno",       r.nome],
    ["Instituição", r.regra.nome],
    ["Nota 1",      !isNaN(r.n1) ? r.n1.toFixed(1) : "—"],
    ["Nota 2",      !isNaN(r.n2) ? r.n2.toFixed(1) : "—"],
    ["Exame Final", !isNaN(r.nf) ? r.nf.toFixed(1) : "Não realizado"],
  ];

  T(C.text); doc.setFontSize(9.5); doc.setFont("helvetica", "bold");
  doc.text("DADOS DO ALUNO", ML, 68);
  S(C.border); doc.setLineWidth(0.25);
  doc.line(ML, 71, W - MR, 71);

  let rY = 80;
  campos.forEach(([label, valor], i) => {
    if (i % 2 === 0) {
      F(C.surface);
      doc.rect(ML, rY - 3.5, W - ML - MR, 11, "F");
    }
    T(C.muted); doc.setFont("helvetica", "bold"); doc.setFontSize(6.5);
    doc.text(label.toUpperCase(), ML + 4, rY + 3);
    T(C.text); doc.setFont("helvetica", "bold"); doc.setFontSize(9);
    doc.text(String(valor), W - MR - 4, rY + 3, { align: "right" });
    S(C.border); doc.setLineWidth(0.2);
    doc.line(ML, rY + 7.5, W - MR, rY + 7.5);
    rY += 11;
  });

  // Resultado
  rY += 12;
  const statusLabels = {
    aprovado:  "APROVADO",
    reprovado: "REPROVADO",
    pendente:  "EXAME FINAL",
    simulacao: "SIMULAÇÃO",
  };

  const resColor =
    r.status === "aprovado"  ? C.success :
    r.status === "reprovado" ? C.danger  :
    r.status === "simulacao" ? C.accent  : C.warning;

  F(C.surface2); doc.roundedRect(ML, rY, W - ML - MR, 30, 4, 4, "F");
  doc.setFillColor(resColor[0], resColor[1], resColor[2]);
  doc.roundedRect(ML, rY, 5, 30, 2, 2, "F");

  T(resColor); doc.setFont("helvetica", "bold"); doc.setFontSize(13);
  doc.text(statusLabels[r.status] || r.status.toUpperCase(), ML + 13, rY + 13);

  const mediaLabel = r.mediaUsada != null ? `Média: ${r.mediaUsada.toFixed(2)}` : "";
  const exigidaLabel = r.mediaExigida != null ? ` · Mínimo: ${r.mediaExigida.toFixed(1)}` : "";
  T(C.muted); doc.setFont("helvetica", "normal"); doc.setFontSize(8);
  doc.text(mediaLabel + exigidaLabel, ML + 13, rY + 22);

  // Footer
  F(C.surface); doc.rect(0, H - 14, W, 14, "F");
  S(C.border);  doc.setLineWidth(0.3);
  doc.line(0, H - 14, W, H - 14);
  T(C.muted); doc.setFontSize(6.5); doc.setFont("helvetica", "normal");
  doc.text("Sistema Acadêmico © " + new Date().getFullYear() + " — github.com/Augusto-dev0", ML, H - 5);
  doc.text("Página 1 de 1", W - MR, H - 5, { align: "right" });

  const nomeArq = `Boletim_${r.nome.replace(/\s+/g, "_")}.pdf`;
  doc.save(nomeArq);
  showToast("Boletim PDF gerado!", "ok");
}

/* ─── INICIALIZAR ─── */
renderHistorico();
document.getElementById("nome").focus();
