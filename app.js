let repCounter = 0;
    let obraCounter = 0;

    // Set today's date
    document.getElementById('meta-fecha').value = new Date().toISOString().slice(0, 10);

    // Seed initial rows
    for (let i = 0; i < 3; i++) addRow('repuestos');
    for (let i = 0; i < 3; i++) addRow('mano-obra');

    function addRow(section) {
      const body = document.getElementById(section + '-body');
      const id = section === 'repuestos' ? ++repCounter : ++obraCounter;
      const key = section + '-' + id;

      const wrap = document.createElement('div');
      wrap.className = 'item-row-wrap';
      wrap.id = 'wrap-' + key;

      wrap.innerHTML = `
      <div class="item-row">
        <input type="number" min="0" placeholder="0"
               oninput="recalcRow('${key}','${section}')"
               id="qty-${key}" />
        <input type="text" class="desc" placeholder="Descripción del ítem..."
               id="desc-${key}" />
        <input type="number" min="0" step="0.01" placeholder="0.00"
               oninput="recalcRow('${key}','${section}')"
               id="price-${key}" />
        <input type="text" placeholder="0.00" readonly
               id="total-${key}" />
      </div>
      <button class="del-btn" onclick="deleteRow('${key}','${section}')">✕ Quitar</button>
    `;

      body.appendChild(wrap);
    }

    function deleteRow(key, section) {
      const w = document.getElementById('wrap-' + key);
      if (w) w.remove();
      recalcSection(section);
    }

    function recalcRow(key, section) {
      const qty = parseFloat(document.getElementById('qty-' + key)?.value) || 0;
      const price = parseFloat(document.getElementById('price-' + key)?.value) || 0;
      const tot = qty * price;
      const el = document.getElementById('total-' + key);
      if (el) el.value = tot > 0 ? tot.toFixed(2) : '';
      recalcSection(section);
    }

    function recalcSection(section) {
      const body = document.getElementById(section + '-body');
      const cells = body.querySelectorAll('[id^="total-"]');
      let sum = 0;
      cells.forEach(c => { sum += parseFloat(c.value) || 0; });

      if (section === 'repuestos') {
        document.getElementById('subtotal-rep').value = sum > 0 ? sum.toFixed(2) : '';
        document.getElementById('total-rep-display').value = sum > 0 ? sum.toFixed(2) : '';
      } else {
        document.getElementById('subtotal-obra').value = sum > 0 ? sum.toFixed(2) : '';
        document.getElementById('total-obra-display').value = sum > 0 ? sum.toFixed(2) : '';
      }
      recalcGeneral();
    }

    function recalcGeneral() {
      const rep = parseFloat(document.getElementById('subtotal-rep').value) || 0;
      const obra = parseFloat(document.getElementById('subtotal-obra').value) || 0;
      const tot = rep + obra;
      document.getElementById('total-general').value = tot > 0 ? tot.toFixed(2) : '';
    }

    function generarPDF() {
      // Ocultar temporalmente los controles que no van en PDF
      document.querySelectorAll('.del-btn').forEach(b => b.style.display = 'none');
      document.querySelector('.toolbar').style.display = 'none';

      // Transferir valores de <input> y <textarea> a sus atributos en el DOM 
      // Esta es una mejor práctica para que html2canvas pueda leer los campos escritos
      document.querySelectorAll('input').forEach(el => {
        if (el.type !== 'file') el.setAttribute('value', el.value);
      });
      document.querySelectorAll('textarea').forEach(el => {
        el.innerHTML = el.value;
      });

      const element = document.getElementById('sheet');

      // Opciones óptimas para un PDF formal
      const nombreArchivo = `Orden_Servicio_${document.getElementById('meta-fecha').value}.pdf`;
      const opt = {
        margin: [10, 10, 10, 10], // Margen en mm
        filename: nombreArchivo,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true }, // scale: 2 aumenta la resolución
        jsPDF: { unit: 'mm', format: 'letter', orientation: 'portrait' }
      };

      // Generar, descargar y luego restaurar la aplicación
      html2pdf().set(opt).from(element).save().then(() => {
        document.querySelectorAll('.del-btn').forEach(b => b.style.display = '');
        document.querySelector('.toolbar').style.display = 'flex';
      });
    }

    function limpiarForm() {
      if (!confirm('¿Seguro que deseas limpiar toda la orden?')) return;
      document.querySelectorAll('input:not([readonly]), textarea').forEach(el => el.value = '');
      document.querySelectorAll('input[readonly]').forEach(el => el.value = '');
      document.getElementById('meta-fecha').value = new Date().toISOString().slice(0, 10);
      document.getElementById('repuestos-body').innerHTML = '';
      document.getElementById('mano-obra-body').innerHTML = '';
      repCounter = 0; obraCounter = 0;
      for (let i = 0; i < 3; i++) addRow('repuestos');
      for (let i = 0; i < 3; i++) addRow('mano-obra');
    }
