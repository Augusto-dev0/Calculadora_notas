<div align="center">

<img src="imagens/Academico.ico" width="72" alt="Logo Sistema Acadêmico" />

# Sistema Acadêmico · Calculadora de Notas

Calcule médias, simule exames finais e exporte seu boletim em PDF.  
Front-end puro · Sem servidor · 100% no navegador.

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)
[![jsPDF](https://img.shields.io/badge/jsPDF-FF0000?style=flat-square&logo=adobe-acrobat-reader&logoColor=white)](https://github.com/parallax/jsPDF)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**[▶ Acessar o projeto](https://augusto-dev0.github.io/Calculadora_notas/)**

</div>

---

## O que é

O **Sistema Acadêmico** é uma calculadora de notas para estudantes que querem acompanhar seu desempenho sem planilha e sem complicação. Informe as notas, escolha o modelo da sua instituição e veja em segundos: sua média, se você passou, quanto precisa tirar no exame final e exporte tudo num boletim em PDF.

Nenhum dado sai do seu dispositivo. Processamento 100% local.

---

## Funcionalidades

- **Múltiplos modelos de avaliação** · instituição pública (7,0), privada (6,0), personalizada ou modelo de 3 notas
- **Simulação dupla** · se você não sabe a média exigida, calcula automaticamente para 6,0 e 7,0
- **Detecção de reprovação imediata** · se a nota necessária no exame for matematicamente impossível (> 10), o sistema avisa na hora
- **Barra de progresso animada** com marcador da nota mínima exigida
- **Exportação em PDF** com design profissional via jsPDF
- **Histórico de consultas** salvo localmente (até 20 entradas via `localStorage`)
- **Tema claro / escuro** com detecção automática via `prefers-color-scheme`
- **Totalmente responsivo** · funciona em celular, tablet e desktop

---

## Como usar

Sem instalação. Abra e use.

```bash
# Clone o repositório
git clone https://github.com/Augusto-dev0/Calculadora_notas.git

# Abra o arquivo no navegador
open index.html
```

Ou acesse diretamente pelo GitHub Pages:  
🔗 `https://augusto-dev0.github.io/Calculadora_notas/`

---

## Modelos de cálculo

| Modelo | Fórmula | Média mínima |
|--------|---------|:---:|
| Instituição Pública | `(N1 + N2) ÷ 2` | 7,0 |
| Instituição Privada | `(N1 + N2) ÷ 2` | 6,0 |
| Personalizada | `(N1 + N2) ÷ 2` | Livre |
| 3 Notas | `(N1 + N2 + Final) ÷ 3` | 7,0 |
| Simulação | `(N1 + N2) ÷ 2` | Simula 6,0 e 7,0 |

**Cálculo do exame final:**  
`Nota necessária = (Média exigida × 2) − Média parcial`

Se o resultado for maior que 10 → **reprovação direta**, sem exibir nota impossível.

---

## Estrutura do projeto

```
calculadora-de-notas/
├── index.html     # Estrutura semântica e acessível
├── style.css      # Design system com variáveis CSS e temas
├── script.js      # Lógica de cálculo, validação, PDF e localStorage
├── imagens/
│   └── Academico.ico
└── README.md
```

---

## Tecnologias

| Tecnologia | Uso |
|-----------|-----|
| HTML5 semântico | Estrutura e acessibilidade (`aria-*`, `role`) |
| CSS3 com variáveis | Design system, tema claro/escuro, animações |
| JavaScript ES6+ | Lógica, validação, localStorage, sanitização XSS |
| [jsPDF 2.5](https://github.com/parallax/jsPDF) | Geração de PDF no cliente |
| [Font Awesome 6](https://fontawesome.com/) | Ícones |
| Google Fonts — Syne + Instrument Sans | Tipografia |

---

## Segurança e acessibilidade

**Segurança**
- Sanitização XSS via `escapeHTML()` em todos os inputs antes de qualquer inserção no DOM
- Sem backend — nenhum dado trafega pela rede

**Acessibilidade**
- Semântica correta com `<header>`, `<main>`, `<footer>`, `<section>`
- Mensagens de erro com `role="alert"` e `aria-live="polite"`
- Barra de progresso com `role="progressbar"` e `aria-valuetext` descritivo
- Suporte a `prefers-reduced-motion` — animações desativadas quando o usuário prefere

---

## Licença

MIT veja o arquivo [LICENSE](LICENSE).

---

<div align="center">

Desenvolvido por [**Luiz Augusto**](https://github.com/Augusto-dev0) · 2026

</div>
