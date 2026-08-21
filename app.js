/**
 * MemCards - Flashcard Sheet Web App
 * App Logic & State Management (Vanilla JS ES6+)
 */

const STORAGE_KEY = 'memcards_sheets_v1';
const THEME_STORAGE_KEY = 'memcards_theme_v1';
const CARDS_PER_SHEET = 12;

const TITLE_MAX_LENGTH = 32;
const CONTENT_MAX_LENGTH = 320;

const CONTENT_FONT_SIZES = ['0.92rem', '0.85rem', '0.78rem', '0.72rem', '0.66rem', '0.60rem', '0.55rem', '0.50rem'];

// --- Dynamic Layout Scaling & Character Limits ---
function adjustTitleLayout(textarea) {
  if (!textarea) return;
  const isMultiLine = textarea.value.length > 16 || textarea.value.includes('\n');
  textarea.rows = isMultiLine ? 2 : 1;
  textarea.style.fontSize = '1.05rem';
  textarea.style.height = 'auto';
  textarea.style.height = (isMultiLine ? 48 : 26) + 'px';
}

function adjustContentFontSize(textarea) {
  if (!textarea) return;
  textarea.style.fontSize = CONTENT_FONT_SIZES[0];
  if (!textarea.clientHeight) return;

  let i = 0;
  while (textarea.scrollHeight > textarea.clientHeight && i < CONTENT_FONT_SIZES.length - 1) {
    i++;
    textarea.style.fontSize = CONTENT_FONT_SIZES[i];
  }
}

function adjustAllSheetFontSizes() {
  document.querySelectorAll('.card-title-input').forEach(adjustTitleLayout);
  document.querySelectorAll('.card-content-input').forEach(adjustContentFontSize);
}

function updateCardCounter(cardEl, titleInput, contentInput) {
  const counterEl = cardEl.querySelector('.card-counter');
  if (!counterEl) return;

  const isTitleFocused = document.activeElement === titleInput;
  if (isTitleFocused) {
    const len = titleInput.value.length;
    counterEl.textContent = `Tít: ${len}/${TITLE_MAX_LENGTH}`;
    counterEl.classList.toggle('warning', len >= TITLE_MAX_LENGTH - 4);
  } else {
    const len = contentInput.value.length;
    counterEl.textContent = `${len}/${CONTENT_MAX_LENGTH}`;
    counterEl.classList.toggle('warning', len >= CONTENT_MAX_LENGTH - 20);
  }
}

// --- State ---
let state = {
  sheets: []
};

// --- Theme Management ---
function getPreferredTheme() {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') {
    return saved;
  }
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (e) {
    console.warn('Unable to save theme preference:', e);
  }

  const themeBtn = document.getElementById('btn-theme-toggle');
  if (themeBtn) {
    const nextThemeLabel = theme === 'dark' ? 'Modo Claro' : 'Modo Escuro';
    themeBtn.setAttribute('title', `Alternar para ${nextThemeLabel}`);
    themeBtn.setAttribute('aria-label', `Alternar para ${nextThemeLabel}`);
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  if (document.startViewTransition) {
    document.startViewTransition(() => setTheme(newTheme));
  } else {
    setTheme(newTheme);
  }
}

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
  if (state.sheets.length <= 1) return;

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
      if (titleInput) {
        titleInput.value = '';
        adjustTitleLayout(titleInput);
      }
      if (contentInput) {
        contentInput.value = '';
        adjustContentFontSize(contentInput);
      }
      updateCardCounter(cardEl, titleInput, contentInput);
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

  const canDelete = state.sheets.length > 1;

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
      ${canDelete ? `
      <button class="btn btn-danger-subtle btn-delete-sheet" title="Excluir esta folha">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
        Excluir Folha
      </button>
      ` : ''}
    `;

    // Attach delete sheet event listener if button exists
    const deleteBtn = headerEl.querySelector('.btn-delete-sheet');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => deleteSheet(sheet.id));
    }

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

      // Title Input (Textarea for automatic horizontal line wrapping)
      const titleInput = document.createElement('textarea');
      titleInput.rows = 1;
      titleInput.className = 'card-title-input';
      titleInput.placeholder = 'Título...';
      titleInput.maxLength = TITLE_MAX_LENGTH;
      titleInput.value = card.title || '';

      // Prevent manual Enter breaks in title, allowing smooth auto-wrap
      titleInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
        }
      });

      // Content Textarea
      const contentInput = document.createElement('textarea');
      contentInput.className = 'card-content-input';
      contentInput.placeholder = 'Conteúdo do card...';
      contentInput.maxLength = CONTENT_MAX_LENGTH;
      contentInput.value = card.content || '';

      // Card Character Counter
      const counterEl = document.createElement('span');
      counterEl.className = 'card-counter';

      titleInput.addEventListener('input', (e) => {
        handleInput(sheetIndex, cardIndex, 'title', e.target.value);
        adjustTitleLayout(titleInput);
        adjustContentFontSize(contentInput);
        updateCardCounter(cardEl, titleInput, contentInput);
      });
      titleInput.addEventListener('focus', () => updateCardCounter(cardEl, titleInput, contentInput));
      titleInput.addEventListener('blur', () => updateCardCounter(cardEl, titleInput, contentInput));

      contentInput.addEventListener('input', (e) => {
        handleInput(sheetIndex, cardIndex, 'content', e.target.value);
        adjustContentFontSize(contentInput);
        updateCardCounter(cardEl, titleInput, contentInput);
      });
      contentInput.addEventListener('focus', () => updateCardCounter(cardEl, titleInput, contentInput));
      contentInput.addEventListener('blur', () => updateCardCounter(cardEl, titleInput, contentInput));

      cardEl.appendChild(clearBtn);
      cardEl.appendChild(titleInput);
      cardEl.appendChild(contentInput);
      cardEl.appendChild(counterEl);
      updateCardCounter(cardEl, titleInput, contentInput);
      gridEl.appendChild(cardEl);
    });

    sheetEl.appendChild(headerEl);
    sheetEl.appendChild(gridEl);
    container.appendChild(sheetEl);
  });

  // Adjust font sizes for all cards once appended to DOM layout
  requestAnimationFrame(() => {
    adjustAllSheetFontSizes();
  });
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  // Theme Setup
  const initialTheme = getPreferredTheme();
  setTheme(initialTheme);

  loadState();
  render();

  // Button Listeners
  const btnThemeToggle = document.getElementById('btn-theme-toggle');
  const btnAddNav = document.getElementById('btn-add-sheet-nav');
  const btnAddBottom = document.getElementById('btn-add-sheet-bottom');
  const btnPrintNav = document.getElementById('btn-print-nav');

  if (btnThemeToggle) btnThemeToggle.addEventListener('click', toggleTheme);
  if (btnAddNav) btnAddNav.addEventListener('click', addSheet);
  if (btnAddBottom) btnAddBottom.addEventListener('click', addSheet);
  if (btnPrintNav) btnPrintNav.addEventListener('click', () => window.print());

  window.addEventListener('resize', adjustAllSheetFontSizes);
  window.addEventListener('beforeprint', () => {
    document.querySelectorAll('.card-title-input').forEach((titleEl) => {
      const isMulti = titleEl.value.length > 16 || titleEl.value.includes('\n');
      titleEl.rows = isMulti ? 2 : 1;
    });
  });
});
