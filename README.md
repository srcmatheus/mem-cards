# MemCards - Flashcard Sheet Web App

Aplicação web Single Page Application (SPA) minimalista, leve e moderna para criação, edição e impressão de folhas de cards de memorização (flashcards) organizados em formato padrão **A4 Sulfite (3 colunas x 4 linhas = 12 cards por folha)**.

![MemCards Preview](https://img.shields.io/badge/A4_Sulfite-3x4_Grid-6366f1) ![Vanilla JS](https://img.shields.io/badge/Vanilla_JS-ES6+-yellow) ![CSS3 Print](https://img.shields.io/badge/CSS3-Print_Otimizado-blue) ![Built with AI](https://img.shields.io/badge/Built_with-AI-purple)

---

## 🎯 Objetivo do Projeto

Eu, por ser acadêmico de Engenharia de Software, senti a necessidade de criar flashcards com pequenas informações para memorização do conteúdo. Porém, era muito trabalhoso criar tudo manualmente e os sites que encontrei que ofereciam flashcards geralmente eram complexos, muito detalhados e poluídos. Resolvi então criar este pequeno projeto que tem o intuito de gerar rápidos flashcards de forma prática e sem distrações.

---

## 🤖 Desenvolvido com IA & Filosofia Minimalista

Este projeto foi **construído inteiramente com o auxílio de Inteligência Artificial**. A escolha da stack (HTML5, CSS3 e JavaScript Vanilla sem frameworks ou ferramentas de build complexas) foi feita intencionalmente por se tratar de algo simples, intuitivo e leve, reforçando o objetivo do projeto de ser extremamente **minimalista**, focado e fácil de usar/executar em qualquer navegador.

---

## 🚀 Funcionalidades

- **Gerenciamento de Folhas A4**: Adicione novas folhas A4 em branco com 12 cards e exclua folhas desnecessárias com 1 clique.
- **Edição em Tempo Real**: Altere títulos e corpo de texto em qualquer card instantaneamente.
- **Botão de Limpeza Rápida ('X')**: Limpe rapidamente o conteúdo de um card individual sem afetar os demais.
- **Impressão Otimizada (`window.print()`)**: Regras `@media print` exclusivas para garantir que cada folha A4 física ocupe exatamente 1 página de PDF sem elementos de interface ou botões.
- **Guias de Corte Visíveis**: Bordas tracejadas finas em cada card que servem como referência de corte após a impressão.
- **Persistência Local (localStorage)**: Seus rascunhos são salvos automaticamente no navegador para você não perder seu trabalho.

---

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura semântica SPA.
- **CSS3**: Layouts com Flexbox, CSS Grid, variáveis de design e regras avançadas de `@media print`. Sem dependências ou frameworks pesados.
- **JavaScript (Vanilla JS ES6+)**: Manipulação limpa da DOM nativa e escopo reativo sem necessidade de etapas de compilação ou bundlers.

---

## 📁 Estrutura de Arquivos

```text
/
├── index.html   # Estrutura da SPA e Navbar
├── styles.css   # Sistema de design, layout A4 e CSS de impressão
├── app.js       # Gerenciamento de estado, interatividade e localStorage
├── spec.md      # Documento de especificação do projeto
└── README.md    # Documentação do projeto
```

---

## 💻 Como Executar

Como é uma aplicação Single Page pura em HTML/CSS/JS, basta abrir o arquivo `index.html` em qualquer navegador moderno.

### Opção 1: Abrir diretamente no navegador
Dê um duplo clique no arquivo `index.html` ou abra via terminal:
```bash
xdg-open index.html # no Linux
# ou
open index.html # no macOS
```

### Opção 2: Servidor local (Opcional)
Se preferir rodar em um servidor HTTP local:
```bash
npx serve .
# ou
python3 -m http.server 8000
```
Em seguida, acesse `http://localhost:8000`.

---

## 🖨️ Como Imprimir / Salvar em PDF

1. Clique no botão **"Imprimir / Gerar PDF"** na barra superior (Navbar).
2. Na janela de impressão do seu navegador:
   - Selecione **"Salvar como PDF"** ou escolha sua impressora.
   - Certifique-se de que o tamanho do papel esteja configurado como **A4**.
   - Defina as margens como **Padrão** ou **Nenhuma** (o CSS já aplica o espaçamento ideal).
   - Ative a opção **"Gráficos de segundo plano"** caso deseje manter a estética original.
3. Clique em **Salvar** ou **Imprimir**. Cada folha A4 em tela será renderizada em exatamente 1 página física!
