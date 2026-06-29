const Transactions = {
  _editingId: null,

  init() {
    this.overlay = document.getElementById('txFormOverlay');
    this.form = document.getElementById('txForm');
    this.titleEl = document.getElementById('txFormTitle');
    this.submitBtn = document.getElementById('txFormSubmit');

    document.getElementById('btnNuevaTransaccion').addEventListener('click', () => this.open());
    document.getElementById('txFormCancel').addEventListener('click', () => this.close());
    document.getElementById('txFormCancel2').addEventListener('click', () => this.close());
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });

    document.querySelectorAll('.form-type-toggle__btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.form-type-toggle__btn').forEach((b) => b.classList.remove('form-type-toggle__btn--active'));
        btn.classList.add('form-type-toggle__btn--active');
        this._populateCategorias(btn.dataset.tipo);
      });
    });

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this._save();
    });

    document.getElementById('filterTipo').addEventListener('change', () => this.render());
    document.getElementById('filterCategoria').addEventListener('change', () => this.render());
    document.getElementById('filterFechaDesde').addEventListener('change', () => this.render());
    document.getElementById('filterFechaHasta').addEventListener('change', () => this.render());
  },

  open(transaccion) {
    this._editingId = transaccion ? transaccion.id : null;
    this.titleEl.textContent = transaccion ? 'Editar Transacción' : 'Nueva Transacción';
    this.submitBtn.textContent = transaccion ? 'Guardar Cambios' : 'Agregar';

    if (transaccion) {
      this._setTipo(transaccion.tipo);
      document.getElementById('txMonto').value = transaccion.monto;
      document.getElementById('txDescripcion').value = transaccion.descripcion;
      document.getElementById('txFecha').value = transaccion.fecha;
      this._populateCategorias(transaccion.tipo, transaccion.idCategoria);
    } else {
      const activeTipo = document.querySelector('.form-type-toggle__btn--active');
      const tipo = activeTipo ? activeTipo.dataset.tipo : 'egreso';
      this._setTipo(tipo);
      document.getElementById('txMonto').value = '';
      document.getElementById('txDescripcion').value = '';
      document.getElementById('txFecha').value = Utils.getTodayISO();
      this._populateCategorias(tipo);
    }

    this.overlay.classList.add('modal-overlay--open');
    document.getElementById('txDescripcion').focus();
  },

  close() {
    this.overlay.classList.remove('modal-overlay--open');
    this._editingId = null;
    this.form.reset();
  },

  _setTipo(tipo) {
    document.querySelectorAll('.form-type-toggle__btn').forEach((b) => {
      b.classList.toggle('form-type-toggle__btn--active', b.dataset.tipo === tipo);
    });
  },

  _populateCategorias(tipo, selectedId) {
    const select = document.getElementById('txCategoria');
    const categorias = Store.getCollection('categorias').filter(
      (c) => c.tipo === tipo || c.tipo === 'ambos'
    );
    select.innerHTML = '<option value="">Seleccionar categoría</option>';
    categorias.forEach((c) => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.nombre;
      select.appendChild(opt);
    });
    if (selectedId) select.value = selectedId;
  },

  _save() {
    const tipoEl = document.querySelector('.form-type-toggle__btn--active');
    const tipo = tipoEl ? tipoEl.dataset.tipo : 'egreso';
    const monto = parseFloat(document.getElementById('txMonto').value);
    const descripcion = document.getElementById('txDescripcion').value.trim();
    const fecha = document.getElementById('txFecha').value;
    const idCategoria = document.getElementById('txCategoria').value;

    if (!monto || monto <= 0) {
      alert('Ingresa un monto válido mayor a 0.');
      return;
    }
    if (!idCategoria) {
      alert('Selecciona una categoría.');
      return;
    }

    if (this._editingId) {
      Store.updateInCollection('transacciones', this._editingId, {
        tipo, monto, descripcion, fecha, idCategoria,
      });
    } else {
      const tx = Models.crearTransaccion({ tipo, monto, descripcion, fecha, idCategoria });
      Store.addToCollection('transacciones', tx);
    }

    this.close();
    document.dispatchEvent(new CustomEvent('data:change'));
  },

  render() {
    const container = document.getElementById('transactionsList');
    let transacciones = Store.getCollection('transacciones');
    const categorias = Store.getCollection('categorias');
    const catMap = Object.fromEntries(categorias.map((c) => [c.id, c]));

    const filterTipo = document.getElementById('filterTipo').value;
    const filterCat = document.getElementById('filterCategoria').value;
    const filterDesde = document.getElementById('filterFechaDesde').value;
    const filterHasta = document.getElementById('filterFechaHasta').value;

    if (filterTipo) transacciones = transacciones.filter((t) => t.tipo === filterTipo);
    if (filterCat) transacciones = transacciones.filter((t) => t.idCategoria === filterCat);
    if (filterDesde) transacciones = transacciones.filter((t) => t.fecha >= filterDesde);
    if (filterHasta) transacciones = transacciones.filter((t) => t.fecha <= filterHasta);

    transacciones.sort((a, b) => b.fecha.localeCompare(a.fecha) || b.fechaCreacion.localeCompare(a.fechaCreacion));

    if (transacciones.length === 0) {
      container.innerHTML = `<div class="empty-state"><div class="empty-state__icon">📭</div><div class="empty-state__text">No hay transacciones</div></div>`;
      return;
    }

    container.innerHTML = `
      <table class="transactions-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Tipo</th>
            <th>Descripción</th>
            <th>Categoría</th>
            <th>Monto</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${transacciones
            .map((t) => {
              const cat = catMap[t.idCategoria] || { nombre: '—', color: '#95a5a6' };
              const tipoLabel = t.tipo === 'ingreso' ? 'Ingreso' : 'Egreso';
              const sign = t.tipo === 'ingreso' ? '+' : '-';
              const cls = t.tipo === 'ingreso' ? 'tx-amount--ingreso' : 'tx-amount--egreso';
              return `<tr>
                <td>${Utils.formatDateShort(t.fecha)}</td>
                <td>${tipoLabel}</td>
                <td>${Utils.escapeHtml(t.descripcion || '—')}</td>
                <td><span class="tx-category" style="background:${cat.color}">${Utils.escapeHtml(cat.nombre)}</span></td>
                <td class="${cls}">${sign}${Utils.formatCurrency(t.monto)}</td>
                <td>
                  <div class="tx-actions">
                    <button data-tx-edit="${t.id}" title="Editar">✏️</button>
                    <button data-tx-delete="${t.id}" title="Eliminar" style="color:var(--color-danger)">🗑️</button>
                  </div>
                </td>
              </tr>`;
            })
            .join('')}
        </tbody>
      </table>`;

    container.querySelectorAll('[data-tx-edit]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tx = Store.getById('transacciones', btn.dataset.txEdit);
        if (tx) this.open(tx);
      });
    });

    container.querySelectorAll('[data-tx-delete]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (confirm('¿Eliminar esta transacción?')) {
          Store.removeFromCollection('transacciones', btn.dataset.txDelete);
          document.dispatchEvent(new CustomEvent('data:change'));
        }
      });
    });
  },

  populateFilterCategorias() {
    const select = document.getElementById('filterCategoria');
    const categorias = Store.getCollection('categorias');
    select.innerHTML = '<option value="">Todas las categorías</option>';
    categorias.forEach((c) => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.nombre;
      select.appendChild(opt);
    });
  },
};
