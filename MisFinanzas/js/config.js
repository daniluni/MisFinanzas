const Config = {
  _editingId: null,

  init() {
    document.getElementById('btnConfig').addEventListener('click', () => this.open());
    document.getElementById('configCancel').addEventListener('click', () => this.close());
    document.getElementById('configCancel2').addEventListener('click', () => this.close());
    document.getElementById('configOverlay').addEventListener('click', (e) => {
      if (e.target === document.getElementById('configOverlay')) this.close();
    });

    const form = document.getElementById('catForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nombre = document.getElementById('catNombre').value.trim();
      const tipo = document.getElementById('catTipo').value;
      const color = document.getElementById('catColor').value;

      if (!nombre) {
        alert('El nombre es obligatorio.');
        return;
      }

      if (this._editingId) {
        Store.updateInCollection('categorias', this._editingId, { nombre, tipo, color });
      } else {
        Store.addToCollection('categorias', Models.crearCategoria({ nombre, tipo, color }));
      }

      form.reset();
      document.getElementById('catColor').value = '#3498db';
      this._editingId = null;
      document.getElementById('catFormSubmit').textContent = 'Agregar';
      this._render();
      document.dispatchEvent(new CustomEvent('data:change'));
    });
  },

  open() {
    document.getElementById('configOverlay').classList.add('modal-overlay--open');
    this._render();
  },

  close() {
    document.getElementById('configOverlay').classList.remove('modal-overlay--open');
    this._editingId = null;
    document.getElementById('catForm').reset();
    document.getElementById('catColor').value = '#3498db';
    document.getElementById('catFormSubmit').textContent = 'Agregar';
  },

  _render() {
    const container = document.getElementById('categoriasList');
    const categorias = Store.getCollection('categorias');

    if (categorias.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="empty-state__text">No hay categorías</div></div>';
      return;
    }

    container.innerHTML = categorias
      .map(
        (c) => `
      <div class="config-item">
        <div class="config-item__color" style="background:${c.color}"></div>
        <div class="config-item__info">
          <div class="config-item__name">${Utils.escapeHtml(c.nombre)}</div>
          <div class="config-item__type">${c.tipo === 'ingreso' ? 'Ingreso' : c.tipo === 'egreso' ? 'Gasto' : 'Ambos'}</div>
        </div>
        <div class="config-item__actions">
          <button class="btn btn--sm btn--secondary" data-cat-edit="${c.id}">Editar</button>
          <button class="btn btn--sm btn--danger" data-cat-delete="${c.id}">Eliminar</button>
        </div>
      </div>
    `
      )
      .join('');

    container.querySelectorAll('[data-cat-edit]').forEach((btn) => {
      btn.addEventListener('click', () => this._edit(btn.dataset.catEdit));
    });
    container.querySelectorAll('[data-cat-delete]').forEach((btn) => {
      btn.addEventListener('click', () => this._delete(btn.dataset.catDelete));
    });
  },

  _edit(id) {
    const cat = Store.getById('categorias', id);
    if (!cat) return;
    this._editingId = id;
    document.getElementById('catNombre').value = cat.nombre;
    document.getElementById('catTipo').value = cat.tipo;
    document.getElementById('catColor').value = cat.color;
    document.getElementById('catFormSubmit').textContent = 'Actualizar';
  },

  _delete(id) {
    if (!confirm('¿Eliminar esta categoría?')) return;
    Store.removeFromCollection('categorias', id);
    this._render();
    document.dispatchEvent(new CustomEvent('data:change'));
  },
};
