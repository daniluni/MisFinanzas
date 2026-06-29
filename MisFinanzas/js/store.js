const Store = {
  _prefix: 'misfinanzas_',

  _key(name) {
    return this._prefix + name;
  },

  get(name) {
    try {
      const data = localStorage.getItem(this._key(name));
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  set(name, value) {
    try {
      localStorage.setItem(this._key(name), JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  remove(name) {
    try {
      localStorage.removeItem(this._key(name));
      return true;
    } catch {
      return false;
    }
  },

  getCollection(name) {
    return this.get(name) || [];
  },

  addToCollection(name, item) {
    const col = this.getCollection(name);
    col.push(item);
    return this.set(name, col);
  },

  updateInCollection(name, id, updates) {
    const col = this.getCollection(name);
    const idx = col.findIndex((item) => item.id === id);
    if (idx === -1) return false;
    col[idx] = { ...col[idx], ...updates };
    return this.set(name, col);
  },

  removeFromCollection(name, id) {
    const col = this.getCollection(name);
    const filtered = col.filter((item) => item.id !== id);
    return this.set(name, filtered);
  },

  getById(name, id) {
    const col = this.getCollection(name);
    return col.find((item) => item.id === id) || null;
  },
};
