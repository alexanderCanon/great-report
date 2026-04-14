# Orden de Servicio y Reparación - Taller Pirri 🏍️

Una plantilla interactiva y profesional para generar órdenes de servicio y reparación, diseñada específicamente para ser utilizada de forma local en el navegador o integrada dentro de futuros sistemas web. Permite registrar datos del cliente, vehículo, repuestos y mano de obra. 

## ✨ Características Principales
- **Cálculo Automático**: Totaliza en tiempo real los costos de repuestos, mano de obra y el monto general.
- **Filas Dinámicas**: Puedes agregar o quitar ítems tanto en la sección de piezas como en la de servicio.
- **Exportación a PDF en 1 clic**: Utiliza `html2pdf.js` para capturar la vista de escritorio y guardarla como documento vectorial PDF directo, sin menús molestos ni encabezados/pies de página del navegador.
- **Diseño Mobile-First**: Cuenta con vistas optimizadas que apilan los controles para permitir el fácil llenado en pantallas de hasta 6.7 pulgadas y dispositivos móviles.
- **Fidelidad de Impresión**: El sistema garantiza que las configuraciones móviles no afecten la impresión o la generación del PDF, manteniendo en todo momento la cuadriculación formal tipo formato carta.

## 🛠️ Tecnologías Utilizadas
El proyecto tiene una arquitectura libre de compiladores, usando tecnologías vainilla separadas en sus responsabilidades:
- `index.html`: Estructura semántica del reporte y formulario.
- `styles.css`: Sistema de colores formales, cuadriculación mediante CSS Grid, utilidades Flexbox, e intercepciones de reglas de `@media (max-width)` interactivo y `@media print`.
- `app.js`: Encargado de inyectar inputs interactivos al DOM, calcular aritmética de las tablas y comunicarse con la dependencia de de PDF.
- [html2pdf.js](https://ekoopmans.github.io/html2pdf.js/): Dependencia inyectada mediante CDN para la impresión de documentos directos en Producción.

## 🚀 Uso
No requiere instalación, entorno de Node.js ni servidor local.
1. Simplemente haz doble clic sobre el archivo `index.html` para abrirlo en cualquier navegador web moderno (Chrome, Edge, Firefox, Safari).
2. Ingresa los datos.
3. Haz clic en **⬇ Generar PDF**.
