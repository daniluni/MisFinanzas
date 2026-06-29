const Dashboard = {
  init() {
    this.balanceEl = document.getElementById('balanceAmount');
    this.incomeEl = document.getElementById('totalIngresos');
    this.expenseEl = document.getElementById('totalEgresos');
    this.balanceMensualEl = document.getElementById('balanceMensual');
    this.balanceLabelEl = document.getElementById('balanceLabel');
  },

  render() {
    const transacciones = Store.getCollection('transacciones');
    const saldo = Store.get('saldo') || { monto: 0 };

    const month = Utils.getCurrentMonth();
    const monthTxs = transacciones.filter((t) => t.fecha.startsWith(month));
    const totalIngresos = monthTxs
      .filter((t) => t.tipo === 'ingreso')
      .reduce((sum, t) => sum + t.monto, 0);
    const totalEgresos = monthTxs
      .filter((t) => t.tipo === 'egreso')
      .reduce((sum, t) => sum + t.monto, 0);

    this.balanceEl.textContent = Utils.formatCurrency(saldo.monto);
    this.incomeEl.textContent = Utils.formatCurrency(totalIngresos);
    this.expenseEl.textContent = Utils.formatCurrency(totalEgresos);
    this.balanceMensualEl.textContent = Utils.formatCurrency(totalIngresos - totalEgresos);
    this.balanceMensualEl.style.color = totalIngresos >= totalEgresos ? 'var(--color-ingreso)' : 'var(--color-egreso)';

    const dateStr = saldo.ultimaActualizacion
      ? Utils.formatDateLong(saldo.ultimaActualizacion)
      : 'Sin actualizar';
    this.balanceLabelEl.textContent = `Actualizado: ${dateStr}`;

    this._renderCharts(transacciones);
    this._renderRecent(transacciones);
  },

  _renderCharts(transacciones) {
    const categorias = Store.getCollection('categorias');
    const catMap = Object.fromEntries(categorias.map((c) => [c.id, c]));

    const month = Utils.getCurrentMonth();
    const egresosMes = transacciones.filter(
      (t) => t.tipo === 'egreso' && t.fecha.startsWith(month)
    );

    const pieData = [];
    const catGroups = {};
    egresosMes.forEach((t) => {
      if (!catGroups[t.idCategoria]) catGroups[t.idCategoria] = 0;
      catGroups[t.idCategoria] += t.monto;
    });
    Object.entries(catGroups).forEach(([catId, total]) => {
      const cat = catMap[catId];
      if (cat) {
        pieData.push({ nombre: cat.nombre, valor: total, color: cat.color });
      }
    });
    pieData.sort((a, b) => b.valor - a.valor);

    Charts.renderPieChart('pieChart', pieData);

    const monthlyData = this._getMonthlyData(transacciones, 6);
    Charts.renderBarChart('barChart', monthlyData);
  },

  _getMonthlyData(transacciones, monthsBack) {
    const data = [];
    const now = new Date();
    for (let i = monthsBack - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const prefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthTxs = transacciones.filter((t) => t.fecha.startsWith(prefix));
      const ingresos = monthTxs
        .filter((t) => t.tipo === 'ingreso')
        .reduce((s, t) => s + t.monto, 0);
      const egresos = monthTxs
        .filter((t) => t.tipo === 'egreso')
        .reduce((s, t) => s + t.monto, 0);
      data.push({ label: Utils.getMonthName(prefix), ingresos, egresos });
    }
    return data;
  },

  _renderRecent(transacciones) {
    const container = document.getElementById('recentTransactions');
    const sorted = [...transacciones]
      .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.fechaCreacion.localeCompare(a.fechaCreacion))
      .slice(0, 5);

    if (sorted.length === 0) {
      container.innerHTML = `<div class="empty-state"><div class="empty-state__icon">📭</div><div class="empty-state__text">No hay transacciones aún</div></div>`;
      return;
    }

    const categorias = Store.getCollection('categorias');
    const catMap = Object.fromEntries(categorias.map((c) => [c.id, c]));

    container.innerHTML = `
      <table class="transactions-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Descripción</th>
            <th>Categoría</th>
            <th>Monto</th>
          </tr>
        </thead>
        <tbody>
          ${sorted
            .map((t) => {
              const cat = catMap[t.idCategoria] || { nombre: '—', color: '#95a5a6' };
              const sign = t.tipo === 'ingreso' ? '+' : '-';
              const cls = t.tipo === 'ingreso' ? 'tx-amount--ingreso' : 'tx-amount--egreso';
              return `<tr>
                <td>${Utils.formatDateShort(t.fecha)}</td>
                <td>${Utils.escapeHtml(t.descripcion || '—')}</td>
                <td><span class="tx-category" style="background:${cat.color}">${Utils.escapeHtml(cat.nombre)}</span></td>
                <td class="${cls}">${sign}${Utils.formatCurrency(t.monto)}</td>
              </tr>`;
            })
            .join('')}
        </tbody>
      </table>`;
  },
};
