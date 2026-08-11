/**
 * MemCards - Flashcard Sheet Web App
 * App Logic & State Management (Vanilla JS ES6+)
 */

const STORAGE_KEY = 'memcards_sheets_v1';
const CARDS_PER_SHEET = 12;

// --- State ---
let state = {
  sheets: []
};

// --- Helper Functions ---
function createEmptyCards() {
  return Array.from({ length: CARDS_PER_SHEET }, () => ({
    title: '',
    content: ''
  }));
}

function generateId() {
  return 'sheet_' + Math.random().toString(36).substr(2, 9);
}

// --- Persistence ---
function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.sheets));
  } catch (e) {
    console.warn('Unable to save to localStorage:', e);
  }
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        state.sheets = parsed;
        return;
      }
    }
  } catch (e) {
    console.warn('Error reading from localStorage:', e);
  }
  // Default initial sheet
  state.sheets = [
    {
      id: generateId(),
      cards: createEmptyCards()
    }
  ];
}

// --- Action Handlers ---
function addSheet() {
  const newSheet = {
    id: generateId(),
    cards: createEmptyCards()
  };
  state.sheets.push(newSheet);
  saveState();
  render();

  // Scroll to new sheet
  setTimeout(() => {
    const sheetElements = document.querySelectorAll('.a4-sheet');
    const lastSheet = sheetElements[sheetElements.length - 1];
    if (lastSheet) {
      lastSheet.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 50);
}

function deleteSheet(sheetId) {
  const sheetIndex = state.sheets.findIndex(s => s.id === sheetId);
  if (sheetIndex === -1) return;

  const hasContent = state.sheets[sheetIndex].cards.some(c => c.title.trim() !== '' || c.content.trim() !== '');

  if (hasContent) {
    const confirmDelete = confirm(`Tem certeza que deseja excluir a Folha ${sheetIndex + 1}? O conteúdo dos cards será perdido.`);
    if (!confirmDelete) return;
  }

  state.sheets.splice(sheetIndex, 1);

  // Guarantee at least one sheet exists
  if (state.sheets.length === 0) {
    state.sheets.push({
      id: generateId(),
      cards: createEmptyCards()
    });
  }

  saveState();
  render();
}

function clearCard(sheetIndex, cardIndex) {
  const card = state.sheets[sheetIndex]?.cards[cardIndex];
  if (!card) return;

  card.title = '';
  card.content = '';
  saveState();

  // DOM direct update to preserve user focus where possible
  const sheetEl = document.querySelectorAll('.a4-sheet')[sheetIndex];
  if (sheetEl) {
    const cardEls = sheetEl.querySelectorAll('.flashcard');
    const cardEl = cardEls[cardIndex];
    if (cardEl) {
      const titleInput = cardEl.querySelector('.card-title-input');
      const contentInput = cardEl.querySelector('.card-content-input');
      if (titleInput) titleInput.value = '';
      if (contentInput) contentInput.value = '';
    }
  }
}

function handleInput(sheetIndex, cardIndex, field, value) {
  if (state.sheets[sheetIndex] && state.sheets[sheetIndex].cards[cardIndex]) {
    state.sheets[sheetIndex].cards[cardIndex][field] = value;
    saveState();
  }
}

// --- DOM Rendering ---
function render() {
  const container = document.getElementById('sheets-container');
  if (!container) return;

  container.innerHTML = '';

  state.sheets.forEach((sheet, sheetIndex) => {
    const sheetEl = document.createElement('article');
    sheetEl.className = 'a4-sheet';
    sheetEl.dataset.sheetId = sheet.id;

    // Header (Screen View)
    const headerEl = document.createElement('header');
    headerEl.className = 'sheet-header';
    headerEl.innerHTML = `
      <div class="sheet-title">
        <span>Folha ${sheetIndex + 1}</span>
        <span class="sheet-badge">12 Cards</span>
      </div>
      <button class="btn btn-danger-subtle btn-delete-sheet" title="Excluir esta folha">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
        Excluir Folha
      </button>
    `;

    // Attach delete sheet event listener
    const deleteBtn = headerEl.querySelector('.btn-delete-sheet');
    deleteBtn.addEventListener('click', () => deleteSheet(sheet.id));

    // Cards Grid (3x4)
    const gridEl = document.createElement('div');
    gridEl.className = 'cards-grid';

    sheet.cards.forEach((card, cardIndex) => {
      const cardEl = document.createElement('div');
      cardEl.className = 'flashcard';

      // Clear Card Button
      const clearBtn = document.createElement('button');
      clearBtn.className = 'card-delete-btn';
      clearBtn.title = 'Limpar conteúdo do card';
      clearBtn.setAttribute('aria-label', 'Limpar conteúdo do card');
      clearBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      `;
      clearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        clearCard(sheetIndex, cardIndex);
      });

      // Title Input
      const titleInput = document.createElement('input');
      titleInput.type = 'text';
      titleInput.className = 'card-title-input';
      titleInput.placeholder = 'Título...';
      titleInput.value = card.title || '';
      titleInput.addEventListener('input', (e) => {
        handleInput(sheetIndex, cardIndex, 'title', e.target.value);
      });

      // Content Textarea
      const contentInput = document.createElement('textarea');
      contentInput.className = 'card-content-input';
      contentInput.placeholder = 'Conteúdo do card...';
      contentInput.value = card.content || '';
      contentInput.addEventListener('input', (e) => {
        handleInput(sheetIndex, cardIndex, 'content', e.target.value);
      });

      cardEl.appendChild(clearBtn);
      cardEl.appendChild(titleInput);
      cardEl.appendChild(contentInput);
      gridEl.appendChild(cardEl);
    });

    sheetEl.appendChild(headerEl);
    sheetEl.appendChild(gridEl);
    container.appendChild(sheetEl);
  });
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  render();

  // Button Listeners
  const btnAddNav = document.getElementById('btn-add-sheet-nav');
  const btnAddBottom = document.getElementById('btn-add-sheet-bottom');
  const btnPrintNav = document.getElementById('btn-print-nav');

  if (btnAddNav) btnAddNav.addEventListener('click', addSheet);
  if (btnAddBottom) btnAddBottom.addEventListener('click', addSheet);
  if (btnPrintNav) btnPrintNav.addEventListener('click', () => window.print());
});
