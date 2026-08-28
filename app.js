/**
 * MemCards - Flashcard Sheet Web App
 * App Logic & State Management (Vanilla JS ES6+)
 */

const STORAGE_KEY = 'memcards_sheets_v1';
const DECKS_STORAGE_KEY = 'memcards_decks_v2';
const THEME_STORAGE_KEY = 'memcards_theme_v1';
const CARDS_PER_SHEET = 12;
const MAX_SHEETS_PER_DECK = 10;

const TITLE_MAX_LENGTH = 32;
const CONTENT_MAX_LENGTH = 320;

const CONTENT_FONT_SIZES = ['0.92rem', '0.85rem', '0.78rem', '0.72rem', '0.66rem', '0.60rem', '0.55rem', '0.50rem'];

// --- Toast Notifications ---
function showToast(message, type = 'danger', title = null, duration = 4000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const defaultTitle = type === 'danger' ? 'Atenção' : 'Notificação';
  const displayTitle = title || defaultTitle;

  toast.innerHTML = `
    <div class="toast-icon">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    </div>
    <div class="toast-body">
      <span class="toast-title">${displayTitle}</span>
      <span class="toast-message">${message}</span>
    </div>
    <button class="toast-close" title="Fechar notificação" aria-label="Fechar notificação">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
    <div class="toast-progress"></div>
  `;

  const closeBtn = toast.querySelector('.toast-close');
  const removeToast = () => {
    if (toast.classList.contains('toast-hiding')) return;
    toast.classList.add('toast-hiding');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  };

  if (closeBtn) {
    closeBtn.addEventListener('click', removeToast);
  }

  setTimeout(removeToast, duration);
  container.appendChild(toast);
}

// --- State ---
let state = {
  activeDeckId: null,
  decks: []
};

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

function generateId(prefix = 'id') {
  return prefix + '_' + Math.random().toString(36).substr(2, 9);
}

function createDefaultDeck(name = 'Minhas Folhas de Estudo') {
  return {
    id: generateId('deck'),
    name: name,
    updatedAt: Date.now(),
    sheets: [
      {
        id: generateId('sheet'),
        cards: createEmptyCards()
      }
    ]
  };
}

function getActiveDeck() {
  let active = state.decks.find(d => d.id === state.activeDeckId);
  if (!active && state.decks.length > 0) {
    active = state.decks[0];
    state.activeDeckId = active.id;
  }
  return active;
}

// --- Persistence & Migration ---
function saveState() {
  try {
    localStorage.setItem(DECKS_STORAGE_KEY, JSON.stringify({
      activeDeckId: state.activeDeckId,
      decks: state.decks
    }));
  } catch (e) {
    console.warn('Unable to save to localStorage:', e);
  }
}

function loadState() {
  try {
    const savedNew = localStorage.getItem(DECKS_STORAGE_KEY);
    if (savedNew) {
      const parsed = JSON.parse(savedNew);
      if (parsed && Array.isArray(parsed.decks) && parsed.decks.length > 0) {
        state.decks = parsed.decks;
        state.activeDeckId = parsed.activeDeckId || parsed.decks[0].id;
        return;
      }
    }

    // Try legacy v1 migration
    const legacySaved = localStorage.getItem(STORAGE_KEY);
    if (legacySaved) {
      const legacySheets = JSON.parse(legacySaved);
      if (Array.isArray(legacySheets) && legacySheets.length > 0) {
        const migratedDeck = {
          id: generateId('deck'),
          name: 'Minhas Folhas de Estudo',
          updatedAt: Date.now(),
          sheets: legacySheets
        };
        state.decks = [migratedDeck];
        state.activeDeckId = migratedDeck.id;
        saveState();
        return;
      }
    }
  } catch (e) {
    console.warn('Error reading from localStorage:', e);
  }

  // Default initial deck
  const defaultDeck = createDefaultDeck();
  state.decks = [defaultDeck];
  state.activeDeckId = defaultDeck.id;
  saveState();
}

// --- Action Handlers ---
function createDeck() {
  const count = state.decks.length + 1;
  const newDeck = createDefaultDeck(`Grupo de Folhas ${count}`);
  state.decks.unshift(newDeck);
  state.activeDeckId = newDeck.id;
  saveState();
  render();

  // Focus title input
  setTimeout(() => {
    const titleInput = document.getElementById('deck-title-input');
    if (titleInput) {
      titleInput.focus();
      titleInput.select();
    }
  }, 100);
}

function selectDeck(deckId) {
  if (state.activeDeckId === deckId) return;
  state.activeDeckId = deckId;
  saveState();
  render();

  const viewport = document.querySelector('.viewport-container');
  if (viewport) {
    viewport.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function deleteDeck(deckId) {
  const deckIndex = state.decks.findIndex(d => d.id === deckId);
  if (deckIndex === -1) return;

  const targetDeck = state.decks[deckIndex];
  const hasCardsContent = targetDeck.sheets.some(s =>
    s.cards.some(c => c.title.trim() !== '' || c.content.trim() !== '')
  );

  if (hasCardsContent) {
    const confirmDelete = confirm(`Tem certeza que deseja excluir o grupo "${targetDeck.name}"? Todo o conteúdo das folhas será perdido.`);
    if (!confirmDelete) return;
  }

  state.decks.splice(deckIndex, 1);

  if (state.decks.length === 0) {
    const freshDeck = createDefaultDeck();
    state.decks.push(freshDeck);
    state.activeDeckId = freshDeck.id;
  } else if (state.activeDeckId === deckId) {
    state.activeDeckId = state.decks[Math.max(0, deckIndex - 1)].id;
  }

  saveState();
  render();
}

function updateActiveDeckName(newName) {
  const activeDeck = getActiveDeck();
  if (!activeDeck) return;

  activeDeck.name = newName;
  activeDeck.updatedAt = Date.now();
  saveState();

  updateDeckStatsBadge();
  renderSidebar();
}

function addSheet() {
  const activeDeck = getActiveDeck();
  if (!activeDeck) return;

  if (activeDeck.sheets.length >= MAX_SHEETS_PER_DECK) {
    showToast(`Limite máximo de ${MAX_SHEETS_PER_DECK} folhas por grupo atingido!`, 'danger', 'Limite Atingido');
    return;
  }

  const newSheet = {
    id: generateId('sheet'),
    cards: createEmptyCards()
  };
  activeDeck.sheets.push(newSheet);
  activeDeck.updatedAt = Date.now();
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
  const activeDeck = getActiveDeck();
  if (!activeDeck || activeDeck.sheets.length <= 1) return;

  const sheetIndex = activeDeck.sheets.findIndex(s => s.id === sheetId);
  if (sheetIndex === -1) return;

  const deletedSheetNumber = sheetIndex + 1;
  const hasContent = activeDeck.sheets[sheetIndex].cards.some(c => c.title.trim() !== '' || c.content.trim() !== '');

  if (hasContent) {
    const confirmDelete = confirm(`Tem certeza que deseja excluir a Folha ${deletedSheetNumber}? O conteúdo dos cards será perdido.`);
    if (!confirmDelete) return;
  }

  activeDeck.sheets.splice(sheetIndex, 1);
  activeDeck.updatedAt = Date.now();

  saveState();
  render();

  showToast(`Folha ${deletedSheetNumber} foi excluída do grupo.`, 'danger', 'Folha Excluída');
}

function clearCard(sheetIndex, cardIndex) {
  const activeDeck = getActiveDeck();
  const card = activeDeck?.sheets[sheetIndex]?.cards[cardIndex];
  if (!card) return;

  card.title = '';
  card.content = '';
  activeDeck.updatedAt = Date.now();
  saveState();

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
  const activeDeck = getActiveDeck();
  if (activeDeck && activeDeck.sheets[sheetIndex] && activeDeck.sheets[sheetIndex].cards[cardIndex]) {
    activeDeck.sheets[sheetIndex].cards[cardIndex][field] = value;
    activeDeck.updatedAt = Date.now();
    saveState();
  }
}

// --- DOM Rendering ---
function updateDeckStatsBadge() {
  const activeDeck = getActiveDeck();
  const badgeEl = document.getElementById('deck-stats-badge');
  if (!badgeEl || !activeDeck) return;

  const sheetsCount = activeDeck.sheets.length;
  const cardsCount = sheetsCount * CARDS_PER_SHEET;
  const isMax = sheetsCount >= MAX_SHEETS_PER_DECK;
  badgeEl.textContent = `${sheetsCount} ${sheetsCount === 1 ? 'folha' : 'folhas'}${isMax ? ' (máx 10)' : ''} • ${cardsCount} cards`;
}

function renderSidebar() {
  const listEl = document.getElementById('sidebar-decks-list');
  const countEl = document.getElementById('sidebar-decks-count');
  if (!listEl) return;

  listEl.innerHTML = '';
  if (countEl) countEl.textContent = state.decks.length;

  state.decks.forEach((deck) => {
    const isActive = deck.id === state.activeDeckId;
    const li = document.createElement('li');
    li.className = `sidebar-deck-item ${isActive ? 'active' : ''}`;

    const sheetsCount = deck.sheets.length;
    const cardsCount = sheetsCount * CARDS_PER_SHEET;

    li.innerHTML = `
      <button class="sidebar-deck-btn" title="${deck.name || 'Grupo sem nome'}">
        <span class="sidebar-deck-title">${deck.name || 'Grupo sem nome'}</span>
        <span class="sidebar-deck-meta">${sheetsCount} ${sheetsCount === 1 ? 'folha' : 'folhas'} (${cardsCount} cards)</span>
      </button>
      <button class="sidebar-deck-delete-btn" title="Excluir este grupo" aria-label="Excluir este grupo">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
    `;

    const btnSelect = li.querySelector('.sidebar-deck-btn');
    if (btnSelect) {
      btnSelect.addEventListener('click', () => {
        selectDeck(deck.id);
        closeSidebar();
      });
    }

    const btnDelete = li.querySelector('.sidebar-deck-delete-btn');
    if (btnDelete) {
      btnDelete.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteDeck(deck.id);
      });
    }

    listEl.appendChild(li);
  });
}

function renderViewport() {
  const activeDeck = getActiveDeck();
  if (!activeDeck) return;

  // Deck Title Input & Stats
  const deckTitleInput = document.getElementById('deck-title-input');
  if (deckTitleInput) {
    deckTitleInput.value = activeDeck.name || '';
  }
  updateDeckStatsBadge();

  // Sheets Container
  const container = document.getElementById('sheets-container');
  if (!container) return;

  container.innerHTML = '';

  const canDeleteSheet = activeDeck.sheets.length > 1;

  activeDeck.sheets.forEach((sheet, sheetIndex) => {
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
      ${canDeleteSheet ? `
      <button class="btn btn-danger-subtle btn-delete-sheet" title="Excluir esta folha">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
        Excluir Folha
      </button>
      ` : ''}
    `;

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

      // Title Input
      const titleInput = document.createElement('textarea');
      titleInput.rows = 1;
      titleInput.className = 'card-title-input';
      titleInput.placeholder = 'Título...';
      titleInput.maxLength = TITLE_MAX_LENGTH;
      titleInput.value = card.title || '';

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

      // Card Counter
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

  requestAnimationFrame(() => {
    adjustAllSheetFontSizes();
  });
}

function render() {
  renderViewport();
  renderSidebar();
}

// --- Sidebar Management ---
function openSidebar() {
  const sidebar = document.getElementById('sidebar-menu');
  const overlay = document.getElementById('sidebar-overlay');
  const btnHamburger = document.getElementById('btn-hamburger');

  if (sidebar) {
    sidebar.classList.add('open');
    sidebar.setAttribute('aria-hidden', 'false');
  }
  if (overlay) {
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
  }
  if (btnHamburger) {
    btnHamburger.classList.add('is-active');
    btnHamburger.setAttribute('aria-expanded', 'true');
  }
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar-menu');
  const overlay = document.getElementById('sidebar-overlay');
  const btnHamburger = document.getElementById('btn-hamburger');

  if (sidebar) {
    sidebar.classList.remove('open');
    sidebar.setAttribute('aria-hidden', 'true');
  }
  if (overlay) {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
  }
  if (btnHamburger) {
    btnHamburger.classList.remove('is-active');
    btnHamburger.setAttribute('aria-expanded', 'false');
  }
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar-menu');
  if (sidebar && sidebar.classList.contains('open')) {
    closeSidebar();
  } else {
    openSidebar();
  }
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  // Theme Setup
  const initialTheme = getPreferredTheme();
  setTheme(initialTheme);

  loadState();
  render();

  // Deck Title Input listener
  const deckTitleInput = document.getElementById('deck-title-input');
  if (deckTitleInput) {
    deckTitleInput.addEventListener('input', (e) => {
      updateActiveDeckName(e.target.value);
    });
  }

  // Sidebar New Deck listener
  const btnSidebarNewDeck = document.getElementById('btn-sidebar-new-deck');
  if (btnSidebarNewDeck) {
    btnSidebarNewDeck.addEventListener('click', () => {
      createDeck();
      closeSidebar();
    });
  }

  // Button Listeners
  const btnThemeToggle = document.getElementById('btn-theme-toggle');
  const btnAddNav = document.getElementById('btn-add-sheet-nav');
  const btnAddBottom = document.getElementById('btn-add-sheet-bottom');
  const btnPrintNav = document.getElementById('btn-print-nav');
  const btnHamburger = document.getElementById('btn-hamburger');
  const btnSidebarClose = document.getElementById('btn-sidebar-close');
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  const navItemInicio = document.getElementById('nav-item-inicio');

  if (btnThemeToggle) btnThemeToggle.addEventListener('click', toggleTheme);
  if (btnAddNav) btnAddNav.addEventListener('click', addSheet);
  if (btnAddBottom) btnAddBottom.addEventListener('click', addSheet);
  if (btnPrintNav) btnPrintNav.addEventListener('click', () => window.print());

  // Sidebar Listeners
  if (btnHamburger) btnHamburger.addEventListener('click', toggleSidebar);
  if (btnSidebarClose) btnSidebarClose.addEventListener('click', closeSidebar);
  if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

  // Close sidebar on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeSidebar();
    }
  });

  // Clicking "Início" smooth-scrolls to top and closes sidebar
  if (navItemInicio) {
    navItemInicio.addEventListener('click', (e) => {
      e.preventDefault();
      closeSidebar();
      const viewport = document.querySelector('.viewport-container');
      if (viewport) {
        viewport.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  window.addEventListener('resize', adjustAllSheetFontSizes);
  window.addEventListener('beforeprint', () => {
    document.querySelectorAll('.card-title-input').forEach((titleEl) => {
      const isMulti = titleEl.value.length > 16 || titleEl.value.includes('\n');
      titleEl.rows = isMulti ? 2 : 1;
    });
  });
});
