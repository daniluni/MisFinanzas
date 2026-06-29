(function () {
  'use strict';

  function init() {
    Models.initDefaults();

    setupNavigation();
    setupBalanceEditor();

    Dashboard.init();
    Transactions.init();
    Config.init();

    refreshAll();
  }

  function setupNavigation() {
    document.querySelectorAll('.app-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.app-tab').forEach((t) => t.classList.remove('app-tab--active'));
        tab.classList.add('app-tab--active');

        document.querySelectorAll('.app-view').forEach((v) => v.classList.remove('app-view--active'));
        const target = document.getElementById(tab.dataset.view);
        if (target) target.classList.add('app-view--active');

        if (tab.dataset.view === 'viewTransactions') {
          Transactions.populateFilterCategorias();
          Transactions.render();
        }
      });
    });
  }

  function setupBalanceEditor() {
    document.getElementById('btnEditBalance').addEventListener('click', () => {
      const saldo = Store.get('saldo') || { monto: 0 };
      const nuevo = prompt('Ingresa tu saldo actual:', saldo.monto);
      if (nuevo === null) return;
      const monto = parseFloat(nuevo);
      if (isNaN(monto)) {
        alert('Ingresa un número válido.');
        return;
      }
      Store.set('saldo', { monto, ultimaActualizacion: Utils.getTodayISO() });
      document.dispatchEvent(new CustomEvent('data:change'));
    });
  }

  function refreshAll() {
    Dashboard.render();
    if (document.getElementById('viewTransactions').classList.contains('app-view--active')) {
      Transactions.populateFilterCategorias();
      Transactions.render();
    }
  }

  document.addEventListener('data:change', () => {
    refreshAll();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
