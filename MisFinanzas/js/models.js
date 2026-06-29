const Models = {
  defaultCategorias: [
    { id: Utils.uuid(), nombre: 'Sueldo', tipo: 'ingreso', color: '#27ae60' },
    { id: Utils.uuid(), nombre: 'Freelance', tipo: 'ingreso', color: '#2ecc71' },
    { id: Utils.uuid(), nombre: 'Inversiones', tipo: 'ingreso', color: '#1abc9c' },
    { id: Utils.uuid(), nombre: 'Otros Ingresos', tipo: 'ingreso', color: '#95a5a6' },
    { id: Utils.uuid(), nombre: 'Alimentación', tipo: 'egreso', color: '#e74c3c' },
    { id: Utils.uuid(), nombre: 'Transporte', tipo: 'egreso', color: '#e67e22' },
    { id: Utils.uuid(), nombre: 'Vivienda', tipo: 'egreso', color: '#f39c12' },
    { id: Utils.uuid(), nombre: 'Servicios', tipo: 'egreso', color: '#f1c40f' },
    { id: Utils.uuid(), nombre: 'Entretenimiento', tipo: 'egreso', color: '#9b59b6' },
    { id: Utils.uuid(), nombre: 'Salud', tipo: 'egreso', color: '#3498db' },
    { id: Utils.uuid(), nombre: 'Educación', tipo: 'egreso', color: '#2980b9' },
    { id: Utils.uuid(), nombre: 'Otros Gastos', tipo: 'egreso', color: '#95a5a6' },
  ],

  PRESET_TRANSACCIONES: [
    { tipo: 'ingreso', monto: 1200000, descripcion: 'Sueldo mensual', fecha: '2026-05-30', categoriaNombre: 'Sueldo' },
    { tipo: 'ingreso', monto: 350000, descripcion: 'Proyecto web freelance', fecha: '2026-06-05', categoriaNombre: 'Freelance' },
    { tipo: 'egreso', monto: 180000, descripcion: 'Arriendo departamento', fecha: '2026-06-01', categoriaNombre: 'Vivienda' },
    { tipo: 'egreso', monto: 65000, descripcion: 'Cuenta de luz + agua', fecha: '2026-06-03', categoriaNombre: 'Servicios' },
    { tipo: 'egreso', monto: 120000, descripcion: 'Supermercado mensual', fecha: '2026-06-06', categoriaNombre: 'Alimentación' },
    { tipo: 'egreso', monto: 25000, descripcion: 'Bencina', fecha: '2026-06-08', categoriaNombre: 'Transporte' },
    { tipo: 'egreso', monto: 35000, descripcion: 'Cena restaurante', fecha: '2026-06-12', categoriaNombre: 'Entretenimiento' },
    { tipo: 'egreso', monto: 15000, descripcion: 'Consulta médica', fecha: '2026-06-15', categoriaNombre: 'Salud' },
  ],

  initDefaults() {
    if (!Store.get('categorias')) {
      Store.set('categorias', this.defaultCategorias);
    }
    if (!Store.get('transacciones')) {
      const cats = Store.getCollection('categorias');
      const catMap = Object.fromEntries(cats.map((c) => [c.nombre, c.id]));
      const txs = this.PRESET_TRANSACCIONES.map((t) => this.crearTransaccion({
        ...t,
        idCategoria: catMap[t.categoriaNombre] || '',
      }));
      Store.set('transacciones', txs);
    }
    if (!Store.get('saldo')) {
      Store.set('saldo', { monto: 850000, ultimaActualizacion: Utils.getTodayISO() });
    }
  },

  crearTransaccion(data) {
    return {
      id: Utils.uuid(),
      tipo: data.tipo,
      monto: parseFloat(data.monto),
      descripcion: (data.descripcion || '').trim(),
      fecha: data.fecha || Utils.getTodayISO(),
      idCategoria: data.idCategoria,
      fechaCreacion: new Date().toISOString(),
    };
  },

  crearCategoria(data) {
    return {
      id: Utils.uuid(),
      nombre: data.nombre.trim(),
      tipo: data.tipo,
      color: data.color,
    };
  },
};
