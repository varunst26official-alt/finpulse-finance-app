import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { useLifeOSStore } from '@/stores/lifeosStore';
import { LifeOSSection } from '@/types/lifeos';

export interface ModalRecord {
  id: string;
  onClose: () => void;
  pushedHistory: boolean;
  section: string;
}

// Global modal stack (LIFO)
const modalStack: ModalRecord[] = [];

// Flag to indicate that a popstate was initiated by our code (programmatic)
let isProgrammaticPop = false;
let isInitialized = false;

// Track section navigation history for root back navigation
const sectionHistory: LifeOSSection[] = [];

/**
 * Generate a slugified modal URL parameter
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/**
 * Get current section from store
 */
function getCurrentSection(): LifeOSSection {
  try {
    return useLifeOSStore.getState().currentSection || 'overview';
  } catch {
    return 'overview';
  }
}

/**
 * Synchronize the browser/webview URL hash with the active section and open drawers
 */
function updateUrlHash(section: string, activeModalId?: string, replace = false) {
  if (typeof window === 'undefined') return;

  const modalParam = activeModalId ? `?drawer=${encodeURIComponent(activeModalId)}` : '';
  const targetHash = `#/${section}${modalParam}`;

  if (window.location.hash !== targetHash) {
    if (replace) {
      window.history.replaceState({ section, modalId: activeModalId }, '', targetHash);
    } else {
      window.history.pushState({ section, modalId: activeModalId }, '', targetHash);
    }
  }
}

/**
 * Register a modal when it opens
 */
export function registerModal(
  rawId: string,
  onClose: () => void,
  options?: { preventUrlPush?: boolean }
): () => void {
  if (typeof window === 'undefined') return () => {};

  const id = slugify(rawId || 'drawer');
  const section = getCurrentSection();

  // If already registered at the top of the stack, just update onClose handler
  const existingIndex = modalStack.findIndex((m) => m.id === id);
  if (existingIndex !== -1) {
    modalStack[existingIndex].onClose = onClose;
    return () => unregisterModal(id);
  }

  const shouldPushUrl = !options?.preventUrlPush;

  if (shouldPushUrl) {
    updateUrlHash(section, id, false);
  }

  modalStack.push({
    id,
    onClose,
    pushedHistory: shouldPushUrl,
    section,
  });

  return () => unregisterModal(id);
}

/**
 * Unregister a modal when it closes (e.g. from React state change, backdrop click, or unmount)
 */
export function unregisterModal(rawId: string, wasClosedByBack = false) {
  if (typeof window === 'undefined') return;

  const id = slugify(rawId || 'drawer');
  const index = modalStack.findIndex((m) => m.id === id);
  if (index === -1) return;

  const [removed] = modalStack.splice(index, 1);
  const section = getCurrentSection();

  if (removed && removed.pushedHistory && !wasClosedByBack) {
    // Modal was closed by UI (X button, backdrop, cancel/save button), NOT by hardware/browser back.
    // Clean up history stack so we don't leave dangling modal history entries.
    isProgrammaticPop = true;
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback: replace state with section URL
      const nextActiveModal = modalStack[modalStack.length - 1];
      updateUrlHash(section, nextActiveModal?.id, true);
    }
    setTimeout(() => {
      isProgrammaticPop = false;
    }, 120);
  } else if (modalStack.length > 0) {
    // If there is still an underlying modal open, restore its URL
    const nextActiveModal = modalStack[modalStack.length - 1];
    updateUrlHash(section, nextActiveModal.id, true);
  } else {
    // No more modals open, restore clean section URL
    updateUrlHash(section, undefined, true);
  }
}

/**
 * Handle Back Button action (invoked by Android hardware back button or browser popstate)
 * Returns true if a modal or page navigation was handled, false otherwise.
 */
export function handleBackAction(): boolean {
  if (modalStack.length > 0) {
    // Pop the topmost modal
    const topModal = modalStack.pop();
    if (topModal) {
      // Mark as closed by back so unregisterModal doesn't trigger another history.back()
      try {
        topModal.onClose();
      } catch (err) {
        console.error('Error closing modal on back:', err);
      }

      if (topModal.pushedHistory) {
        isProgrammaticPop = true;
        if (window.history.length > 1) {
          window.history.back();
        } else {
          updateUrlHash(getCurrentSection(), undefined, true);
        }
        setTimeout(() => {
          isProgrammaticPop = false;
        }, 120);
      }
      return true; // Successfully handled closing the drawer!
    }
  }

  // If no modals are open, check if we have section history to go back to
  if (sectionHistory.length > 1) {
    sectionHistory.pop(); // Remove current section
    const prevSection = sectionHistory[sectionHistory.length - 1];
    if (prevSection) {
      try {
        useLifeOSStore.getState().setCurrentSection(prevSection);
        updateUrlHash(prevSection, undefined, true);
        return true;
      } catch {
        // Fall through
      }
    }
  }

  return false; // Nothing in app stack to handle
}

/**
 * Inform the navigation system that the user switched sections
 */
export function syncSectionWithUrl(section: LifeOSSection) {
  if (typeof window === 'undefined') return;

  const lastRecorded = sectionHistory[sectionHistory.length - 1];
  if (lastRecorded !== section) {
    sectionHistory.push(section);
  }

  // Update hash if not already on this section and no modal is currently pushing
  if (modalStack.length === 0) {
    updateUrlHash(section, undefined, false);
  }
}

/**
 * Parse URL hash on initial load to restore section or open drawer
 */
function parseInitialHash() {
  if (typeof window === 'undefined') return;

  try {
    const hash = window.location.hash || '';
    if (!hash.startsWith('#/')) return;

    const [sectionPart] = hash.slice(2).split('?');
    const validSections: LifeOSSection[] = [
      'overview',
      'finance',
      'wellness',
      'productivity',
      'learning',
      'lifeadmin',
      'appadmin',
    ];

    if (validSections.includes(sectionPart as LifeOSSection)) {
      useLifeOSStore.getState().setCurrentSection(sectionPart as LifeOSSection);
      if (sectionHistory.length === 0 || sectionHistory[sectionHistory.length - 1] !== sectionPart) {
        sectionHistory.push(sectionPart as LifeOSSection);
      }
    }
  } catch (err) {
    console.warn('Could not parse initial hash:', err);
  }
}

/**
 * Initialize the universal Back Button & URL Navigation system
 */
export function initModalBackSystem() {
  if (isInitialized || typeof window === 'undefined') return;
  isInitialized = true;

  // 1. Initial URL inspection
  parseInitialHash();

  // Ensure initial section is in history
  const initialSection = getCurrentSection();
  if (sectionHistory.length === 0) {
    sectionHistory.push(initialSection);
  }
  if (!window.location.hash) {
    updateUrlHash(initialSection, undefined, true);
  }

  // 2. Browser / WebView popstate listener
  window.addEventListener('popstate', () => {
    if (isProgrammaticPop) {
      isProgrammaticPop = false;
      return;
    }

    if (modalStack.length > 0) {
      // Top modal was open, close it
      const topModal = modalStack.pop();
      if (topModal) {
        try {
          topModal.onClose();
        } catch (err) {
          console.error('Error executing onClose in popstate:', err);
        }
      }
      return;
    }

    // Inspect if hash changed to another section
    parseInitialHash();
  });

  // 3. Android Hardware Back Button listener via Capacitor
  if (Capacitor.isNativePlatform()) {
    try {
      CapApp.addListener('backButton', ({ canGoBack }) => {
        const handled = handleBackAction();

        if (!handled) {
          // If no modals were open and we are on the root section, exit or minimize app
          if (getCurrentSection() === 'overview' || !canGoBack) {
            CapApp.exitApp();
          } else {
            // Try going back in WebView history
            window.history.back();
          }
        }
      });
    } catch (err) {
      console.warn('Could not attach Capacitor backButton listener:', err);
    }
  }
}
