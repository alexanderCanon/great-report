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
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ unit: 'mm', format: 'letter', orientation: 'portrait' });

      /* ── Layout ── */
      const M  = 10;          // margen
      const PW = 215.9;       // ancho carta
      const CW = PW - 2 * M; // 195.9 mm de contenido
      const X  = M;

      /* ── Colores del diseño original ── */
      const INK    = [26,  26,  26];
      const YELLOW = [245, 197, 24];
      const ORANGE = [224, 123, 42];
      const SILVER = [122, 134, 148];
      const SILVD  = [92,  100, 112];
      const RED    = [192, 57,  43];
      const WHITE  = [255, 255, 255];
      const ROWALT = [247, 248, 250];
      const BORDER = [44,  44,  44];
      const BLIGHT = [200, 205, 212];

      const sf = c => doc.setFillColor(...c);
      const sd = c => doc.setDrawColor(...c);
      const st = c => doc.setTextColor(...c);
      const lw = w => doc.setLineWidth(w);

      /* ── Leer campos del formulario (independiente del layout de pantalla) ── */
      const meta  = document.querySelectorAll('.order-meta-row input');
      const fecha = meta[0]?.value || '';
      const enc   = meta[1]?.value || '';
      const tel   = meta[2]?.value || '';
      const fechaFmt = fecha
        ? (() => { const [y,m,d] = fecha.split('-'); return `${d}/${m}/${y}`; })()
        : '';

      const r1   = document.querySelectorAll('.info-row-1 .info-field input');
      const cliente   = r1[0]?.value || '';
      const direccion = r1[1]?.value || '';

      const r2   = document.querySelectorAll('.info-row-2 .info-field input');
      const marca = r2[0]?.value || '';
      const linea = r2[1]?.value || '';
      const placa = r2[2]?.value || '';
      const anio  = r2[3]?.value || '';

      const r3   = document.querySelectorAll('.info-row-3 .info-field input');
      const km   = r3[0]?.value || '';
      const prox = r3[1]?.value || '';

      const obs  = document.querySelector('.obs-area textarea')?.value || '';

      let y = M;

      /* ═══════════════════════════════════════════
         ENCABEZADO: Logo | Título | Meta
      ═══════════════════════════════════════════ */
      const HDR_H  = 30;
      const LOGO_W = 38;
      const META_W = 52;
      const TIT_W  = CW - LOGO_W - META_W;

      // Celda logo
      lw(0.5); sf(WHITE); sd(BORDER);
      doc.rect(X, y, LOGO_W, HDR_H, 'FD');
      try {
        const logoEl = document.querySelector('.logo-cell img');
        if (logoEl && logoEl.complete && logoEl.naturalWidth > 0) {
          const cnv = document.createElement('canvas');
          cnv.width  = logoEl.naturalWidth;
          cnv.height = logoEl.naturalHeight;
          cnv.getContext('2d').drawImage(logoEl, 0, 0);
          const logoData = cnv.toDataURL('image/jpeg', 0.95);
          const maxW  = LOGO_W - 6;
          const maxH  = HDR_H  - 6;
          const ratio = Math.min(maxW / logoEl.naturalWidth, maxH / logoEl.naturalHeight);
          const lW    = logoEl.naturalWidth  * ratio;
          const lH    = logoEl.naturalHeight * ratio;
          const lX    = X + (LOGO_W - lW) / 2;
          const lY    = y + (HDR_H  - lH) / 2;
          doc.addImage(logoData, 'JPEG', lX, lY, lW, lH);
        } else {
          throw new Error('no image');
        }
      } catch (_) {
        st(SILVER); doc.setFont('helvetica','bold'); doc.setFontSize(11);
        doc.text('PIRRI', X + LOGO_W/2, y + HDR_H/2 + 2, { align:'center' });
      }

      // Celda título
      const TX = X + LOGO_W;
      sf(YELLOW); sd(BORDER);
      doc.rect(TX, y, TIT_W, HDR_H, 'FD');
      st(INK); doc.setFont('helvetica','bold'); doc.setFontSize(14);
      doc.text('ORDEN DE SERVICIO', TX + TIT_W/2, y + HDR_H/2 - 2, { align:'center' });
      doc.setFontSize(11);
      doc.text('Y REPARACIÓN',      TX + TIT_W/2, y + HDR_H/2 + 6, { align:'center' });

      // Meta (3 filas: Fecha / Encargado / Teléfono)
      const MX    = TX + TIT_W;
      const MRH   = HDR_H / 3;
      const MLBLW = 26;
      const MVALW = META_W - MLBLW;
      [
        { lbl:'FECHA',     val: fechaFmt },
        { lbl:'ENCARGADO', val: enc },
        { lbl:'TELÉFONO',  val: tel },
      ].forEach((row, i) => {
        const ry = y + i * MRH;
        sf(SILVER); sd(BORDER); doc.rect(MX, ry, MLBLW, MRH, 'FD');
        st(WHITE); doc.setFont('helvetica','bold'); doc.setFontSize(5.5);
        doc.text(row.lbl, MX + 2, ry + MRH/2 + 1);
        sf(WHITE); doc.rect(MX + MLBLW, ry, MVALW, MRH, 'FD');
        st(INK); doc.setFont('helvetica','normal'); doc.setFontSize(7.5);
        doc.text(row.val, MX + MLBLW + 2, ry + MRH/2 + 1, { maxWidth: MVALW - 3 });
        if (i < 2) { sd(BORDER); lw(0.3); doc.line(MX, ry + MRH, MX + META_W, ry + MRH); }
      });

      y += HDR_H;

      /* ── Helper: celda etiqueta + valor ── */
      function cell(fx, fy, fw, fh, lbl, val, lblColor, lblTxt, lblW) {
        sf(lblColor); sd(BORDER); lw(0.4);
        doc.rect(fx, fy, lblW, fh, 'FD');
        st(lblTxt); doc.setFont('helvetica','bold'); doc.setFontSize(5.8);
        doc.text(lbl, fx + 1.5, fy + fh/2 + 1);
        sf(WHITE);
        doc.rect(fx + lblW, fy, fw - lblW, fh, 'FD');
        st(INK); doc.setFont('helvetica','normal'); doc.setFontSize(7.5);
        const lines = doc.splitTextToSize(val, fw - lblW - 3);
        doc.text(lines[0] || '', fx + lblW + 2, fy + fh/2 + 1);
      }

      /* ═══════════════════════════════════════════
         INFO GRID
      ═══════════════════════════════════════════ */
      const IH   = 9;   // altura de fila info
      const HALF = CW / 2;

      // Fila 1: Cliente | Dirección
      lw(0.4); sd(BORDER);
      cell(X,        y, HALF, IH, 'CLIENTE',   cliente,  YELLOW, INK, 18);
      cell(X + HALF, y, HALF, IH, 'DIRECCIÓN', direccion, YELLOW, INK, 22);
      doc.line(X + HALF, y, X + HALF, y + IH);
      doc.line(X, y + IH, X + CW, y + IH);
      y += IH;

      // Fila 2: Marca | Línea | Placa | Año
      const cols2 = [
        { lbl:'MARCA', val:marca, lw:14, w:52 },
        { lbl:'LÍNEA', val:linea, lw:11, w:46 },
        { lbl:'PLACA', val:placa, lw:11, w:46 },
        { lbl:'AÑO',   val:anio,  lw:9,  w:0  },
      ];
      cols2[3].w = CW - cols2.slice(0,3).reduce((s,c) => s + c.w, 0);
      let cx = X;
      cols2.forEach((c, i) => {
        cell(cx, y, c.w, IH, c.lbl, c.val, YELLOW, INK, c.lw);
        if (i < cols2.length - 1) doc.line(cx + c.w, y, cx + c.w, y + IH);
        cx += c.w;
      });
      doc.line(X, y + IH, X + CW, y + IH);
      y += IH;

      // Fila 3: Km | Prox. Servicio
      cell(X,        y, HALF, IH, 'KILOMETRAJE ACTUAL', km,   YELLOW, INK, 38);
      cell(X + HALF, y, HALF, IH, 'PROX. SERVICIO',     prox, YELLOW, INK, 30);
      doc.line(X + HALF, y, X + HALF, y + IH);
      doc.line(X, y + IH, X + CW, y + IH);
      y += IH;

      /* ═══════════════════════════════════════════
         ENCABEZADO DE TABLA
      ═══════════════════════════════════════════ */
      const TH_H   = 8;
      const C_QTY  = 20;
      const C_PRIC = 30;
      const C_TOT  = 26;
      const C_DESC = CW - C_QTY - C_PRIC - C_TOT;
      const DIVS   = [C_QTY, C_QTY + C_DESC, C_QTY + C_DESC + C_PRIC];

      sf(ORANGE); sd(BORDER); lw(0.4);
      doc.rect(X, y, CW, TH_H, 'FD');
      st(WHITE); doc.setFont('helvetica','bold'); doc.setFontSize(7);
      [
        { t:'CANTIDAD',    cx: X + C_QTY/2 },
        { t:'DESCRIPCIÓN', cx: X + C_QTY + C_DESC/2 },
        { t:'PRECIO U.',   cx: X + C_QTY + C_DESC + C_PRIC/2 },
        { t:'TOTAL',       cx: X + CW - C_TOT/2 },
      ].forEach(h => doc.text(h.t, h.cx, y + TH_H/2 + 1.5, { align:'center' }));
      DIVS.forEach(dx => { sd(BORDER); doc.line(X + dx, y, X + dx, y + TH_H); });
      y += TH_H;

      /* ── Helpers de sección ── */
      const SLBL_H = 6;
      const ROW_H  = 8;
      const STOT_H = 7;

      function drawSectionLabel(label) {
        sf([176, 184, 196]); sd(BORDER); lw(0.4);
        doc.rect(X, y, CW, SLBL_H, 'FD');
        st(WHITE); doc.setFont('helvetica','bolditalic'); doc.setFontSize(6.5);
        doc.text(label, X + CW/2, y + SLBL_H/2 + 1.5, { align:'center' });
        y += SLBL_H;
      }

      function drawItems(bodyId) {
        const rows = document.getElementById(bodyId)
          ?.querySelectorAll('.item-row') || [];
        let subtotal = 0, idx = 0;
        rows.forEach(row => {
          const inp   = row.querySelectorAll('input');
          const qty   = inp[0]?.value || '';
          const desc  = inp[1]?.value || '';
          const price = inp[2]?.value || '';
          const total = inp[3]?.value || '';
          if (!qty && !desc && !price) return;

          sf(idx % 2 === 1 ? ROWALT : WHITE); sd(BLIGHT); lw(0.2);
          doc.rect(X, y, CW, ROW_H, 'FD');
          st(INK); doc.setFont('helvetica','normal'); doc.setFontSize(8);
          doc.text(qty,   X + C_QTY/2,                     y + ROW_H/2 + 1.5, { align:'center' });
          doc.text(desc,  X + C_QTY + 2,                   y + ROW_H/2 + 1.5, { maxWidth: C_DESC - 4 });
          doc.text(price, X + C_QTY + C_DESC + C_PRIC/2,   y + ROW_H/2 + 1.5, { align:'center' });
          doc.text(total, X + CW - 2,                       y + ROW_H/2 + 1.5, { align:'right' });
          DIVS.forEach(dx => { sd(BLIGHT); lw(0.2); doc.line(X + dx, y, X + dx, y + ROW_H); });
          subtotal += parseFloat(total) || 0;
          y += ROW_H; idx++;
        });
        return subtotal;
      }

      function drawSubtotal(valId, fallback) {
        const val = document.getElementById(valId)?.value
          || (fallback > 0 ? fallback.toFixed(2) : '');
        sf(RED); sd(BORDER); lw(0.4);
        doc.rect(X, y, CW, STOT_H, 'FD');
        st(WHITE); doc.setFont('helvetica','bold'); doc.setFontSize(7);
        doc.text('SUB TOTAL',
          X + C_QTY + C_DESC + C_PRIC/2, y + STOT_H/2 + 1.5, { align:'center' });
        doc.setFontSize(8.5);
        doc.text(`Q  ${val}`, X + CW - 2, y + STOT_H/2 + 1.5, { align:'right' });
        sd(BORDER); lw(0.4);
        doc.line(X + C_QTY + C_DESC, y, X + C_QTY + C_DESC, y + STOT_H);
        y += STOT_H;
      }

      /* ═══════════════════════════════════════════
         SECCIÓN REPUESTOS
      ═══════════════════════════════════════════ */
      drawSectionLabel('REPUESTOS');
      const repTotal = drawItems('repuestos-body');
      drawSubtotal('subtotal-rep', repTotal);

      /* ═══════════════════════════════════════════
         SECCIÓN MANO DE OBRA
      ═══════════════════════════════════════════ */
      drawSectionLabel('MANO DE OBRA');
      const obraTotal = drawItems('mano-obra-body');
      drawSubtotal('subtotal-obra', obraTotal);

      /* ═══════════════════════════════════════════
         RESUMEN: Observaciones | Totales
      ═══════════════════════════════════════════ */
      const SUM_H   = 36;
      const TOT_W   = 65;
      const OBS_W   = CW - TOT_W;
      const OBS_LBL = 7;
      const TROW_H  = SUM_H / 3;

      // Observaciones
      sf(RED); sd(BORDER); lw(0.4);
      doc.rect(X, y, OBS_W, OBS_LBL, 'FD');
      st(WHITE); doc.setFont('helvetica','bold'); doc.setFontSize(6.5);
      doc.text('OBSERVACIONES', X + 3, y + OBS_LBL/2 + 1.5);
      sf(WHITE); doc.rect(X, y + OBS_LBL, OBS_W, SUM_H - OBS_LBL, 'FD');
      st(INK); doc.setFont('helvetica','normal'); doc.setFontSize(7.5);
      doc.text(
        doc.splitTextToSize(obs, OBS_W - 6).slice(0, 4),
        X + 3, y + OBS_LBL + 6
      );

      // Panel de totales
      const TOTX  = X + OBS_W;
      const TLBLW = 34;
      [
        { lbl:'REPUESTOS',    id:'total-rep-display',  bg:ORANGE, fg:WHITE,  big:false },
        { lbl:'MANO DE OBRA', id:'total-obra-display', bg:YELLOW, fg:INK,   big:false },
        { lbl:'TOTAL GENERAL',id:'total-general',      bg:SILVD,  fg:WHITE,  big:true  },
      ].forEach((tr, i) => {
        const ry = y + i * TROW_H;
        sf(tr.bg); sd(BORDER); lw(0.4);
        doc.rect(TOTX, ry, TLBLW, TROW_H, 'FD');
        st(tr.fg); doc.setFont('helvetica','bold'); doc.setFontSize(6.2);
        doc.text(tr.lbl, TOTX + 2, ry + TROW_H/2 + 1);
        sf(WHITE);
        doc.rect(TOTX + TLBLW, ry, TOT_W - TLBLW, TROW_H, 'FD');
        st(INK); doc.setFont('helvetica','bold');
        doc.setFontSize(tr.big ? 11 : 9);
        const val = document.getElementById(tr.id)?.value || '';
        doc.text(`Q  ${val}`, TOTX + TOT_W - 2, ry + TROW_H/2 + 1.5, { align:'right' });
        if (i < 2) { sd(BORDER); lw(0.3); doc.line(TOTX, ry + TROW_H, TOTX + TOT_W, ry + TROW_H); }
      });

      // Línea divisoria vertical entre obs y totales
      sd(BORDER); lw(0.5);
      doc.line(TOTX, y, TOTX, y + SUM_H);
      y += SUM_H;

      /* ── Footer ── */
      const FOOTER_H = 14;
      sf(YELLOW); sd(BORDER); lw(0.4);
      doc.rect(X, y, CW, FOOTER_H, 'FD');
      st(INK); doc.setFont('helvetica','bold'); doc.setFontSize(8.5);
      doc.text(
        'Gracias por tu preferencia, en Taller de motos Pirri te brindamos un servicio de excelente calidad.\n¡Vuelve Pronto!',
        X + CW/2, y + 6, { align:'center', maxWidth: CW - 4 }
      );
      y += FOOTER_H;

      /* ── Borde exterior ── */
      sd(BORDER); lw(0.7);
      doc.rect(X, M, CW, y - M);

      /* ── Guardar ── */
      doc.save(`Orden_Servicio_${fecha || 'sin_fecha'}.pdf`);
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
