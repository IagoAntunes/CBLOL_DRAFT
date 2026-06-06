import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Client-side Source Code Protection and Advanced Anti-Inspection
if (typeof window !== 'undefined') {
  // Disable right-click context menu
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  }, { capture: true });

  // Disable common developer tools keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Disable F12 Key
    if (e.key === 'F12') {
      e.preventDefault();
      return false;
    }

    // Disable Ctrl+Shift+I / Cmd+Opt+I (Inspect Elements), Ctrl+Shift+J / Cmd+Opt+J (Console), Ctrl+Shift+C / Cmd+Opt+C (Selector)
    if (
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
      (e.metaKey && e.altKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c'))
    ) {
      e.preventDefault();
      return false;
    }

    // Disable Ctrl+U / Cmd+U (View HTML Source Code)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u')) {
      e.preventDefault();
      return false;
    }

    // Disable Ctrl+S / Cmd+S (Save Website File Node) to keep bundle inaccessible offline
    if ((e.ctrlKey || e.metaKey) && (e.key === 'S' || e.key === 's')) {
      e.preventDefault();
      return false;
    }
  }, { capture: true });

  // Continuous active debugger loop to block and choke DevTools inspectors
  const freezeDevTools = () => {
    setInterval(() => {
      try {
        const check = function() {
          return false;
        };
        const constructor = check.constructor;
        const test = constructor("debugger");
        test();
      } catch (err) {}
    }, 100);
  };
  
  // Clear the console constantly to make it extremely clean and silent
  setInterval(() => {
    console.clear();
    console.log("%cProteção Ativa: Inspeção de código desativada para este aplicativo.", "color: #ef4444; font-size: 14px; font-weight: bold;");
  }, 1000);

  // Execute the freeze trap
  freezeDevTools();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
