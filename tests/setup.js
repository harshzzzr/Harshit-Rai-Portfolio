import '@testing-library/jest-dom';
import { vi } from 'vitest';

// 1. Storage Mock for Node 25 / jsdom compatibility
const createStorageMock = () => {
  let store = {};
  return {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index) => Object.keys(store)[index] || null,
  };
};

const storageMock = createStorageMock();

Object.defineProperty(window, 'localStorage', {
  value: storageMock,
  configurable: true,
  writable: true,
});
Object.defineProperty(globalThis, 'localStorage', {
  value: storageMock,
  configurable: true,
  writable: true,
});

Object.defineProperty(window, 'sessionStorage', {
  value: storageMock,
  configurable: true,
  writable: true,
});
Object.defineProperty(globalThis, 'sessionStorage', {
  value: storageMock,
  configurable: true,
  writable: true,
});

// 2. Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// 3. Mock window.scrollTo
window.scrollTo = () => {};

// 4. Mock Firebase config for deterministic offline unit testing
vi.mock('../src/firebase/config', () => ({
  app: null,
  db: null,
  storage: null,
  auth: null,
  isFirebaseConfigured: false,
}));
