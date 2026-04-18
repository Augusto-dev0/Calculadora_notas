<div align="center">

<img src="imagens/Academico.ico" width="64" alt="Logo Sistema Acadêmico" />

# Sistema Acadêmico — Calculadora de Notas

**Calcule médias, simule exames finais e exporte boletins em PDF.**  
Projeto front-end puro · Sem dependências de servidor · 100% no navegador

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)
[![jsPDF](https://img.shields.io/badge/jsPDF-FF0000?style=flat-square&logo=adobe-acrobat-reader&logoColor=white)](https://github.com/parallax/jsPDF)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## 📋 Sobre o Projeto

O **Sistema Acadêmico** é uma calculadora de notas desenvolvida para estudantes que precisam acompanhar seu desempenho ao longo do semestre. Com uma interface limpa e intuitiva, é possível informar as notas, escolher o modelo de avaliação da sua instituição e obter em segundos o status de aprovação, a nota necessária no exame final e um boletim exportável em PDF.

Todo o processamento acontece no próprio navegador — nenhum dado é enviado para servidores.

---

## ✨ Funcionalidades

- **Cálculo de média** para instituições públicas (7.0), privadas (6.0) ou com média personalizada
- **Modelo de 3 notas** `(N1 + N2 + Final) ÷ 3`
- **Simulação dupla** para quem não sabe a média exigida — calcula automaticamente o necessário para 6.0 e 7.0
- **Detecção inteligente de reprovação** — se a nota necessária no exame for matematicamente impossível (> 10), o sistema avisa imediatamente
- **Barra de progresso animada** com marcador da nota mínima exigida
- **Exportação de boletim em PDF** com design profissional via jsPDF
- **Histórico de consultas** salvo localmente (até 20 entradas via `localStorage`)
- **Tema claro / escuro** com detecção automática da preferência do sistema operacional (`prefers-color-scheme`)
- **Totalmente responsivo** — funciona bem em celular, tablet e desktop

---

## 🖼️ Preview

| Tema Claro | Tema Escuro |
|:-----------:|:-----------:|
| *(adicione um screenshot aqui)* | *(adicione um screenshot aqui)* |

> **Dica:** Use a tecla `F12` → aba **Device Toolbar** no Chrome para simular o visual mobile.

---

## 🚀 Como Usar

Não há instalação. Basta abrir o arquivo no navegador.

```bash
# 1. Clone o repositório
git clone https://github.com/Augusto-dev0/Calculadora_notas.git

Ou acesse diretamente pelo GitHub Pages (se habilitado):  
`https://augusto-dev0.github.io/Calculadora_notas/`

---

## 🗂️ Estrutura do Projeto

```
calculadora-de-notas/
├── index.html        # Estrutura HTML semântica e acessível
├── style.css         # Design system completo com variáveis CSS
├── script.js         # Lógica de cálculo, validação e geração de PDF
├── imagens/
│   └── Academico.ico # Favicon do projeto
└── README.md
```

---

## ⚙️ Modelos de Cálculo Suportados

| Modelo | Fórmula | Média Padrão |
|--------|---------|-------------|
| Instituição Pública | `(N1 + N2) ÷ 2` | 7.0 |
| Instituição Privada | `(N1 + N2) ÷ 2` | 6.0 |
| Média Personalizada | `(N1 + N2) ÷ 2` | Definida pelo usuário |
| Modelo 3 Notas | `(N1 + N2 + Final) ÷ 3` | 7.0 |
| Simular (não sei a média) | `(N1 + N2) ÷ 2` | Simula 6.0 e 7.0 |

**Regra do Exame Final (modelos de 2 notas):**  
`Nota Necessária = (Média Exigida × 2) − Média Parcial`

Se o resultado for superior a 10, o sistema exibe **reprovação imediata** — sem mostrar uma nota impossível.

---

## 🛠️ Tecnologias

| Tecnologia | Uso |
|-----------|-----|
| HTML5 semântico | Estrutura e acessibilidade (`aria-*`, `role`) |
| CSS3 com variáveis | Design system, temas claro/escuro, animações |
| JavaScript puro (ES6+) | Lógica, validação, localStorage, sanitização XSS |
| [jsPDF 2.5](https://github.com/parallax/jsPDF) | Geração do boletim em PDF no cliente |
| [Font Awesome 6](https://fontawesome.com/) | Ícones |
| Google Fonts — Syne + Instrument Sans | Tipografia |

---

## 🔒 Segurança

- **Sanitização XSS** — todos os dados inseridos pelo usuário passam por `escapeHTML()` antes de serem inseridos no DOM via `innerHTML`, prevenindo injeção de scripts maliciosos.
- **Sem backend** — nenhum dado trafega pela rede; tudo fica no dispositivo do usuário.

---

## ♿ Acessibilidade

- Semântica HTML com `<header>`, `<main>`, `<footer>`, `<section>` e `aria-labelledby`
- Mensagens de erro com `role="alert"` e `aria-live="polite"`
- Toast de notificação com `role="alert"` e `aria-live="assertive"`
- Barra de progresso com `role="progressbar"`, `aria-valuenow` e `aria-valuetext` descritivo
- Botão de tema com `aria-label` atualizado dinamicamente
- Suporte a `prefers-reduced-motion` — animações desativadas para quem prefere

---

## 📄 Licença

Distribuído sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">

Desenvolvido por [**Luiz Augusto**](https://github.com/Augusto-dev0) · 2026

</div>
