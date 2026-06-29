# MisFinanzas — Documento de Planeación

## 1. Descripción

Aplicación web SPA para control de finanzas personales. Permite registrar ingresos y egresos, gestionar un saldo manual, categorizar transacciones y visualizar resúmenes con gráficos. Desarrollada con HTML5, CSS3 vanilla y JavaScript. Datos persistidos en localStorage.

## 2. Estructura del proyecto

```
/MisFinanzas/
  index.html          # Shell SPA
  plan.md             # Documento de planeación
  css/
    reset.css         # Normalización de estilos
    variables.css     # CSS custom properties
    layout.css        # Header, tabs, dashboard grid, tabla
    components.css    # Botones, cards, formularios, modales
    responsive.css    # Media queries, dark mode, print
  js/
    app.js            # Inicialización, navegación, eventos globales
    store.js          # Capa de persistencia (localStorage)
    models.js         # Fábricas de datos y valores por defecto
    transactions.js   # CRUD de transacciones, listado con filtros
    dashboard.js      # Saldo, resumen mensual, tarjetas, gráficos
    config.js         # Gestión de categorías
    charts.js         # Gráficos con Canvas API (pie + barras)
    utils.js          # Utilidades: UUID, formato moneda/fechas
```

## 3. Modelo de datos

### Transacción (`localStorage.transacciones`)
```json
{
  "id": "uuid",
  "tipo": "ingreso | egreso",
  "monto": 0.00,
  "descripcion": "string (max 200)",
  "fecha": "YYYY-MM-DD",
  "idCategoria": "uuid",
  "fechaCreacion": "ISO 8601"
}
```

### Categoría (`localStorage.categorias`)
```json
{
  "id": "uuid",
  "nombre": "string",
  "tipo": "ingreso | egreso",
  "color": "#hex"
}
```

### Saldo (`localStorage.saldo`)
```json
{
  "monto": 0.00,
  "ultimaActualizacion": "YYYY-MM-DD"
}
```

## 4. Funcionalidades (Historias de Usuario)

| ID | Historia |
|----|----------|
| HU01 | Como usuario, quiero establecer mi saldo actual manualmente |
| HU02 | Como usuario, quiero registrar ingresos con monto, descripción, fecha y categoría |
| HU03 | Como usuario, quiero registrar egresos con monto, descripción, fecha y categoría |
| HU04 | Como usuario, quiero ver el dashboard con saldo, total de ingresos/egresos del mes |
| HU05 | Como usuario, quiero ver un gráfico circular de gastos por categoría |
| HU06 | Como usuario, quiero ver un gráfico de barras con ingresos vs egresos mensuales |
| HU07 | Como usuario, quiero editar o eliminar transacciones existentes |
| HU08 | Como usuario, quiero filtrar transacciones por tipo, categoría y rango de fechas |
| HU09 | Como usuario, quiero gestionar categorías (crear, editar, eliminar) |
| HU10 | Como usuario, quiero que los datos persistan al recargar la página |
| HU11 | Como usuario, quiero una interfaz responsive adaptable a cualquier dispositivo |

## 5. Diseño UI

- **Paleta**: Fondo `#f5f6fa`, header `#2c3e50`, accent `#3498db`
- **Saldo**: Display grande y centrado con botón de edición
- **Cards**: Ingresos (verde), Gastos (rojo), Balance (azul)
- **Gráficos**: Pie chart (gastos por categoría con dona), bar chart (ingresos vs egresos por mes)
- **Transacciones**: Tabla responsive con filas coloreadas

## 6. Categorías por defecto

| Nombre | Tipo | Color |
|--------|------|-------|
| Sueldo | Ingreso | `#27ae60` |
| Freelance | Ingreso | `#2ecc71` |
| Inversiones | Ingreso | `#1abc9c` |
| Otros Ingresos | Ingreso | `#95a5a6` |
| Alimentación | Gasto | `#e74c3c` |
| Transporte | Gasto | `#e67e22` |
| Vivienda | Gasto | `#f39c12` |
| Servicios | Gasto | `#f1c40f` |
| Entretenimiento | Gasto | `#9b59b6` |
| Salud | Gasto | `#3498db` |
| Educación | Gasto | `#2980b9` |
| Otros Gastos | Gasto | `#95a5a6` |
