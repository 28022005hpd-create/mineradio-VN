'use strict';

(function initMineradioLanguageUi() {
  const LEGACY_SELECT_ID = 'mineradio-language-select';
  const SWITCHER_ID = 'mineradio-language-switcher';
  const BUTTON_ID = 'mineradio-language-button';
  const MENU_ID = 'mineradio-language-menu';
  const HOME_HEADING_ID = 'home-listen-heading';

  const LANGUAGE_COPY = {
    vi: { code: 'VI', name: 'Tiếng Việt', other: 'Tiếng Anh' },
    en: { code: 'EN', name: 'English', other: 'Vietnamese' }
  };

  let root = null;
  let button = null;
  let menu = null;
  let legacySelect = null;
  let homeHeadingObserver = null;

  function currentLanguage() {
    try {
      if (window.MineradioI18n && typeof window.MineradioI18n.getLanguage === 'function') {
        return window.MineradioI18n.getLanguage() === 'en' ? 'en' : 'vi';
      }
    } catch (_) { }
    try { return localStorage.getItem('mineradio.language') === 'en' ? 'en' : 'vi'; } catch (_) { }
    return 'vi';
  }

  function languageLabel(language) {
    return language === 'en' ? 'LISTENING TODAY' : 'NGHE HÔM NAY';
  }

  function installStyles() {
    if (document.getElementById('mineradio-language-ui-style')) return;
    const style = document.createElement('style');
    style.id = 'mineradio-language-ui-style';
    style.textContent = `
      #${LEGACY_SELECT_ID} {
        display: none !important;
      }

      #${SWITCHER_ID} {
        position: relative;
        z-index: 740;
        margin: 0 4px;
        display: inline-flex;
        align-items: center;
        -webkit-app-region: no-drag;
      }

      #${BUTTON_ID} {
        height: 30px;
        min-width: 64px;
        padding: 0 10px 0 11px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        border: 1px solid rgba(255,255,255,.08);
        border-radius: 999px;
        background: rgba(4,8,10,.42);
        color: rgba(224,250,255,.76);
        box-shadow: inset 0 1px 0 rgba(255,255,255,.025);
        font: 760 10.5px/1 var(--font-sans, Inter, sans-serif);
        letter-spacing: .08em;
        cursor: pointer;
        outline: none;
        -webkit-app-region: no-drag;
        transition: background .18s ease, color .18s ease, transform .18s ease,
          border-color .18s ease, box-shadow .18s ease;
      }

      #${BUTTON_ID} .mineradio-language-dot {
        width: 6px;
        height: 6px;
        flex: 0 0 auto;
        border-radius: 50%;
        background: rgba(255,255,255,.30);
        box-shadow: 0 0 0 rgba(255,83,103,0);
        transition: background .18s ease, box-shadow .18s ease;
      }

      #${BUTTON_ID} .mineradio-language-chevron {
        width: 7px;
        height: 7px;
        flex: 0 0 auto;
        border-right: 1.4px solid currentColor;
        border-bottom: 1.4px solid currentColor;
        transform: translateY(-2px) rotate(45deg);
        transition: transform .2s cubic-bezier(.16,1,.3,1);
      }

      #${BUTTON_ID}:hover,
      #${BUTTON_ID}:focus-visible,
      #${SWITCHER_ID}.is-open #${BUTTON_ID} {
        color: #fff;
        border-color: rgba(255,83,103,.34);
        background: rgba(255,83,103,.10);
        transform: translateY(-1px);
      }

      #${SWITCHER_ID}.is-open #${BUTTON_ID} {
        border-color: rgba(255,83,103,.48);
        box-shadow: 0 12px 34px rgba(255,83,103,.08), inset 0 1px 0 rgba(255,255,255,.07);
      }

      #${SWITCHER_ID}.is-open #${BUTTON_ID} .mineradio-language-dot {
        background: #ff5367;
        box-shadow: 0 0 14px rgba(255,83,103,.52);
      }

      #${SWITCHER_ID}.is-open #${BUTTON_ID} .mineradio-language-chevron {
        transform: translateY(2px) rotate(225deg);
      }

      #${MENU_ID} {
        position: absolute;
        top: calc(100% + 8px);
        right: 0;
        width: 158px;
        padding: 6px;
        border: 1px solid rgba(255,255,255,.12);
        border-radius: 15px;
        background: rgba(6,10,13,.88);
        box-shadow: 0 18px 48px rgba(0,0,0,.40), inset 0 1px 0 rgba(255,255,255,.07);
        backdrop-filter: blur(18px) saturate(1.18);
        -webkit-backdrop-filter: blur(18px) saturate(1.18);
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transform: translate3d(0,-7px,0) scale(.97);
        transform-origin: 100% 0;
        transition: opacity .16s ease, transform .2s cubic-bezier(.16,1,.3,1), visibility 0s linear .2s;
        -webkit-app-region: no-drag;
      }

      #${SWITCHER_ID}.is-open #${MENU_ID} {
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
        transform: translate3d(0,0,0) scale(1);
        transition-delay: 0s;
      }

      #${MENU_ID} .mineradio-language-option {
        width: 100%;
        min-height: 38px;
        padding: 0 10px;
        display: grid;
        grid-template-columns: 28px 1fr 14px;
        align-items: center;
        gap: 7px;
        border: 0;
        border-radius: 10px;
        background: transparent;
        color: rgba(238,247,250,.70);
        text-align: left;
        cursor: pointer;
        outline: none;
        font-family: var(--font-sans, Inter, sans-serif);
        transition: background .15s ease, color .15s ease, transform .15s ease;
      }

      #${MENU_ID} .mineradio-language-option:hover,
      #${MENU_ID} .mineradio-language-option:focus-visible {
        color: #fff;
        background: rgba(255,255,255,.065);
      }

      #${MENU_ID} .mineradio-language-option[aria-checked="true"] {
        color: #fff;
        background: rgba(255,83,103,.10);
      }

      .mineradio-language-option-code {
        color: rgba(255,255,255,.92);
        font-size: 10px;
        font-weight: 820;
        letter-spacing: .09em;
      }

      .mineradio-language-option-name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 11px;
        font-weight: 620;
        letter-spacing: 0;
      }

      .mineradio-language-option-check {
        width: 7px;
        height: 7px;
        justify-self: center;
        border-radius: 50%;
        background: transparent;
        box-shadow: none;
      }

      .mineradio-language-option[aria-checked="true"] .mineradio-language-option-check {
        background: #ff5367;
        box-shadow: 0 0 12px rgba(255,83,103,.58);
      }

      #${HOME_HEADING_ID}.mineradio-i18n-stable-heading::before {
        content: attr(data-locale-label);
      }

      @media (prefers-reduced-motion: reduce) {
        #${BUTTON_ID},
        #${BUTTON_ID} .mineradio-language-chevron,
        #${MENU_ID},
        #${MENU_ID} .mineradio-language-option {
          transition: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function setOpen(open) {
    if (!root || !button) return;
    root.classList.toggle('is-open', !!open);
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      const selected = menu && menu.querySelector('.mineradio-language-option[aria-checked="true"]');
      if (selected) setTimeout(function () { selected.focus({ preventScroll: true }); }, 0);
    }
  }

  function stabilizeHomeHeading() {
    const heading = document.getElementById(HOME_HEADING_ID);
    if (!heading) return;
    const label = languageLabel(currentLanguage());
    heading.classList.add('mineradio-i18n-stable-heading');
    heading.setAttribute('data-locale-label', label);
    heading.setAttribute('aria-label', label);
    if (heading.textContent) heading.textContent = '';

    if (!homeHeadingObserver) {
      homeHeadingObserver = new MutationObserver(function () {
        const target = document.getElementById(HOME_HEADING_ID);
        if (!target) return;
        if (target.textContent) target.textContent = '';
      });
    }
    homeHeadingObserver.disconnect();
    homeHeadingObserver.observe(heading, { childList: true, characterData: true, subtree: true });
  }

  function updateUi() {
    const lang = currentLanguage();
    if (legacySelect && legacySelect.value !== lang) legacySelect.value = lang;
    if (button) {
      const code = button.querySelector('.mineradio-language-code');
      if (code) code.textContent = LANGUAGE_COPY[lang].code;
      button.setAttribute('aria-label', lang === 'en' ? 'Language: English' : 'Ngôn ngữ: Tiếng Việt');
      button.setAttribute('title', lang === 'en' ? 'Change language' : 'Đổi ngôn ngữ');
    }
    if (menu) {
      const vi = menu.querySelector('[data-language="vi"]');
      const en = menu.querySelector('[data-language="en"]');
      if (vi) {
        vi.setAttribute('aria-checked', lang === 'vi' ? 'true' : 'false');
        const name = vi.querySelector('.mineradio-language-option-name');
        if (name) name.textContent = lang === 'en' ? 'Vietnamese' : 'Tiếng Việt';
      }
      if (en) {
        en.setAttribute('aria-checked', lang === 'en' ? 'true' : 'false');
        const name = en.querySelector('.mineradio-language-option-name');
        if (name) name.textContent = lang === 'vi' ? 'Tiếng Anh' : 'English';
      }
    }
    stabilizeHomeHeading();
  }

  function chooseLanguage(language) {
    if (language !== 'vi' && language !== 'en') return;
    setOpen(false);
    try {
      if (window.MineradioI18n && typeof window.MineradioI18n.setLanguage === 'function') {
        window.MineradioI18n.setLanguage(language);
        return;
      }
    } catch (_) { }
    if (legacySelect) {
      legacySelect.value = language;
      legacySelect.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  function buildSwitcher() {
    legacySelect = document.getElementById(LEGACY_SELECT_ID);
    if (!legacySelect || document.getElementById(SWITCHER_ID)) return;

    legacySelect.setAttribute('aria-hidden', 'true');
    legacySelect.tabIndex = -1;

    root = document.createElement('div');
    root.id = SWITCHER_ID;

    button = document.createElement('button');
    button.id = BUTTON_ID;
    button.type = 'button';
    button.setAttribute('aria-haspopup', 'menu');
    button.setAttribute('aria-controls', MENU_ID);
    button.setAttribute('aria-expanded', 'false');
    button.innerHTML = '<span class="mineradio-language-dot" aria-hidden="true"></span>' +
      '<span class="mineradio-language-code">VI</span>' +
      '<span class="mineradio-language-chevron" aria-hidden="true"></span>';

    menu = document.createElement('div');
    menu.id = MENU_ID;
    menu.setAttribute('role', 'menu');
    menu.innerHTML =
      '<button class="mineradio-language-option" type="button" role="menuitemradio" data-language="vi" aria-checked="false">' +
        '<span class="mineradio-language-option-code">VI</span>' +
        '<span class="mineradio-language-option-name">Tiếng Việt</span>' +
        '<span class="mineradio-language-option-check" aria-hidden="true"></span>' +
      '</button>' +
      '<button class="mineradio-language-option" type="button" role="menuitemradio" data-language="en" aria-checked="false">' +
        '<span class="mineradio-language-option-code">EN</span>' +
        '<span class="mineradio-language-option-name">English</span>' +
        '<span class="mineradio-language-option-check" aria-hidden="true"></span>' +
      '</button>';

    root.appendChild(button);
    root.appendChild(menu);
    legacySelect.parentNode.insertBefore(root, legacySelect);

    button.addEventListener('click', function (event) {
      event.stopPropagation();
      setOpen(!root.classList.contains('is-open'));
    });

    menu.addEventListener('click', function (event) {
      const option = event.target.closest('.mineradio-language-option');
      if (!option) return;
      event.stopPropagation();
      chooseLanguage(option.getAttribute('data-language'));
    });

    menu.addEventListener('keydown', function (event) {
      const options = Array.from(menu.querySelectorAll('.mineradio-language-option'));
      if (!options.length) return;
      const index = Math.max(0, options.indexOf(document.activeElement));
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const delta = event.key === 'ArrowDown' ? 1 : -1;
        options[(index + delta + options.length) % options.length].focus();
      } else if (event.key === 'Enter' || event.key === ' ') {
        const active = document.activeElement.closest && document.activeElement.closest('.mineradio-language-option');
        if (active) {
          event.preventDefault();
          chooseLanguage(active.getAttribute('data-language'));
        }
      } else if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        button.focus({ preventScroll: true });
      }
    });

    document.addEventListener('pointerdown', function (event) {
      if (root && !root.contains(event.target)) setOpen(false);
    }, true);

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && root && root.classList.contains('is-open')) {
        setOpen(false);
        button.focus({ preventScroll: true });
      }
    });

    updateUi();
  }

  function init() {
    installStyles();
    buildSwitcher();
    stabilizeHomeHeading();
    setTimeout(stabilizeHomeHeading, 0);
    setTimeout(stabilizeHomeHeading, 120);
    setTimeout(stabilizeHomeHeading, 600);
  }

  window.addEventListener('mineradio:languagechange', function () {
    updateUi();
    setTimeout(updateUi, 0);
    setTimeout(updateUi, 120);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
