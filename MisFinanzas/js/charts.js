const Charts = {
  _currentPieChart: null,
  _currentBarChart: null,

  renderPieChart(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.parentElement.getBoundingClientRect();
    const size = Math.min(rect.width - 48, 300);
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const radius = Math.min(cx, cy) - 16;

    ctx.clearRect(0, 0, size, size);

    if (!data || data.length === 0) {
      ctx.fillStyle = '#b2bec3';
      ctx.font = '14px ' + getComputedStyle(document.body).fontFamily;
      ctx.textAlign = 'center';
      ctx.fillText('Sin datos', cx, cy);
      return;
    }

    const total = data.reduce((sum, d) => sum + d.valor, 0);
    if (total === 0) {
      ctx.fillStyle = '#b2bec3';
      ctx.font = '14px ' + getComputedStyle(document.body).fontFamily;
      ctx.textAlign = 'center';
      ctx.fillText('Sin gastos', cx, cy);
      return;
    }

    let startAngle = -Math.PI / 2;
    data.forEach((item) => {
      const sliceAngle = (item.valor / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = item.color;
      ctx.fill();
      startAngle += sliceAngle;
    });

    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.55, 0, Math.PI * 2);
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--color-surface').trim() || '#ffffff';
    ctx.fill();

    ctx.fillStyle = '#2d3436';
    ctx.font = 'bold 18px ' + getComputedStyle(document.body).fontFamily;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(Utils.formatCurrency(total), cx, cy - 8);
    ctx.font = '12px ' + getComputedStyle(document.body).fontFamily;
    ctx.fillStyle = '#636e72';
    ctx.fillText('Total gastos', cx, cy + 14);

    this._renderLegend(canvas.parentElement, data);
  },

  _renderLegend(container, data) {
    let legendEl = container.querySelector('.chart-legend');
    if (!legendEl) {
      legendEl = document.createElement('div');
      legendEl.className = 'chart-legend';
      legendEl.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;justify-content:center';
      container.appendChild(legendEl);
    }
    legendEl.innerHTML = data
      .filter((d) => d.valor > 0)
      .map(
        (d) =>
          `<span style="display:inline-flex;align-items:center;gap:4px;font-size:0.75rem;color:#636e72">
            <span style="width:10px;height:10px;border-radius:2px;background:${d.color};display:inline-block"></span>
            ${Utils.escapeHtml(d.nombre)}: ${Utils.formatCurrency(d.valor)}
          </span>`
      )
      .join('');
  },

  renderBarChart(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.parentElement.getBoundingClientRect();
    const width = Math.max(rect.width - 48, 300);
    const height = 240;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const padding = { top: 20, bottom: 30, left: 10, right: 10 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    if (!data || data.length === 0) {
      ctx.fillStyle = '#b2bec3';
      ctx.font = '14px ' + getComputedStyle(document.body).fontFamily;
      ctx.textAlign = 'center';
      ctx.fillText('Sin datos', width / 2, height / 2);
      return;
    }

    const maxVal = Math.max(...data.flatMap((d) => [d.ingresos, d.egresos]), 1);
    const barWidth = Math.min(chartW / data.length / 3, 24);
    const groupWidth = chartW / data.length;

    ctx.textAlign = 'center';
    ctx.font = '10px ' + getComputedStyle(document.body).fontFamily;

    data.forEach((item, i) => {
      const x = padding.left + i * groupWidth + groupWidth / 2;

      const ingHeight = (item.ingresos / maxVal) * chartH;
      const egHeight = (item.egresos / maxVal) * chartH;

      ctx.fillStyle = '#27ae60';
      ctx.fillRect(x - barWidth - 2, padding.top + chartH - ingHeight, barWidth, ingHeight);

      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(x + 2, padding.top + chartH - egHeight, barWidth, egHeight);

      ctx.fillStyle = '#636e72';
      ctx.fillText(item.label, x, height - 6);
    });

    ctx.fillStyle = '#27ae60';
    ctx.fillRect(width - 100, 6, 10, 10);
    ctx.fillStyle = '#636e72';
    ctx.font = '11px ' + getComputedStyle(document.body).fontFamily;
    ctx.textAlign = 'left';
    ctx.fillText('Ingresos', width - 86, 16);

    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(width - 100, 22, 10, 10);
    ctx.fillStyle = '#636e72';
    ctx.fillText('Egresos', width - 86, 32);
  },

  destroy() {
    const pies = document.querySelectorAll('.chart-legend');
    pies.forEach((el) => el.remove());
  },
};
