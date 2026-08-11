# SPEC.md - Flashcard Sheet Web App

## 1. Visão Geral
Aplicação web Single Page Application (SPA) minimalista e leve para criação, edição e impressão de folhas de cards de memorização (flashcards) organizados em formato padrão A4 Sulfite.

## 2. Stack Tecnológica
- **HTML5:** Estrutura semântica da SPA.
- **CSS3:** Flexbox, CSS Grid, variáveis CSS e regras `@media print`. Sem frameworks externos (Bootstrap/Tailwind).
- **JavaScript:** Vanilla JS (ES6+), manipulação da DOM nativa e modular, sem frameworks (React/Vue).
- **Impressão/PDF:** Suporte nativo via `window.print()` customizado com CSS Print Styles.

## 3. Arquitetura de Interface & Layout (UI/UX)
- **Barra Superior (Navbar):**
  - Fixa no topo da tela.
  - Contém o título do app e botões de ação: "Adicionar Folha" e "Imprimir / Gerar PDF".
  - Espaço reservado para futuro suporte a abas e persistência de folhas salvas.
- **Área de Trabalho (Viewport Container):**
  - Container centralizado com `overflow-y: auto` e altura dinâmica (`calc(100vh - navbar_height)`).
  - Rolagem vertical realizada **exclusivamente dentro do container** (a página externa permanece fixa).
- **Folha Sulfite (A4 Canvas):**
  - Dimensões proporcionais ao papel A4 no visualizador.
  - Borda delimitadora e sombra sutil (`box-shadow`) para separar cada folha.
  - Cabeçalho de folha com botão "Excluir Folha".
- **Grid de Cards (12 por folha):**
  - Layout CSS Grid rígido: 3 colunas x 4 linhas por folha.
  - Total exato de 12 cards por folha.
- **Componente Card:**
  - Cantos arredondados (`border-radius`), bordas visíveis de delimitação de corte.
  - Botão circular no canto superior esquerdo com ícone 'X' para remover/limpar o card.
  - Campo 1: Título (Input/Textarea sem bordas chamativas).
  - Campo 2: Texto/Conteúdo (Textarea para o corpo do card).

## 4. Requisitos Funcionais
- **RF01 - Gerenciamento de Folhas:** Permitir adicionar novas folhas A4 em branco abaixo da atual e excluir folhas existentes.
- **RF02 - Gerenciamento de Cards:** Editar título e texto em tempo real em qualquer um dos 12 cards da folha.
- **RF03 - Exclusão de Card:** Limpar/remover o conteúdo do card ao clicar no botão 'X'.
- **RF04 - Exportação/Impressão:** Disparar o comando `window.print()`.
- **RF05 - Regras de Impressão (`@media print`):**
  - Ocultar Navbar, botões de exclusão de folha, ícones 'X' e sombras.
  - Forçar que cada folha A4 física ocupe exatamente 1 página de PDF (`break-after: page`).
  - Manter as bordas dos cards visíveis para servir de guia de corte após a impressão.

## 5. Estrutura de Arquivos do Projeto
```text
/
├── index.html
├── styles.css
├── app.js
├── SPEC.md
└── README.md