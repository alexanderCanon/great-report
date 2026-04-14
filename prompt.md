You are working on an existing HTML/CSS/JS workshop service report.

Context:
- The screen panel/report generator already contains the approved field changes.
- Those on-screen changes must remain intact.
- The only broken part is the PDF / print export.
- A previous change unintentionally altered the final PDF appearance.
- The PDF must now be restored so it remains visually faithful to the original exported report.

Task:
Fix ONLY the PDF/print rendering layer.
Do not redesign, refactor, or reinterpret the report.

ABSOLUTE RULES:
- Do NOT rewrite the template.
- Do NOT rebuild the layout from scratch.
- Do NOT modernize the UI.
- Do NOT change colors, border thickness, typography hierarchy, spacing system, table structure, or alignment logic for the screen version.
- Do NOT alter calculations, row generation, subtotals, totals, observations, signatures, or field data flow.
- Do NOT touch the panel unless it is strictly required for print isolation.
- Preserve all approved new field changes already implemented in the panel.
- Treat screen rendering and PDF rendering as separate concerns.

PRIMARY GOAL:
Restore the PDF so it behaves and looks like the ORIGINAL clean export.

The PDF must preserve:
- original printable width usage
- original proportions
- original compactness
- original scaling
- original table density
- original spacing rhythm
- original header placement
- original footer/signature placement
- original page composition
- original clean alignment

Known problem symptoms:
- PDF content became visually different from the original
- content looks reduced / shrunk / compressed incorrectly
- excessive blank space appears below the report
- print layout no longer fills the page correctly
- screen-oriented CSS likely leaked into print
- export configuration may be forcing wrong scale, margins, width, or page-break behavior

Implementation requirements:
1. Audit the current PDF generation path first.
   - Check whether the export uses `window.print()`, `html2pdf`, `jsPDF`, browser print CSS, or any print wrapper/container.
   - Identify the exact reason for layout drift before changing code.

2. Isolate print behavior from screen behavior.
   - Use `@media print` for print-only fixes.
   - If necessary, use a dedicated print wrapper or print-specific class.
   - Do not solve PDF issues by degrading the screen layout.

3. Restore print fidelity with minimal, surgical overrides.
   Focus specifically on:
   - `@page` size and margins
   - root/container width in print
   - fixed vs auto widths
   - transform / scale usage
   - zoom-related hacks
   - overflow clipping
   - absolute/relative positioning side effects
   - page-break rules
   - min-height / vh usage
   - flex/grid behavior in print
   - print font scaling
   - hidden elements affecting layout height
   - padding/margin differences in print
   - PDF library options such as page format, margin, scale, image quality, canvas scale, and content width

4. Preserve original document density.
   - The report must not look smaller than before.
   - It must not float at the top with large empty space below.
   - It must occupy the printable page similarly to the original export.
   - The final page must feel compact and production-ready.

5. Preserve current content changes without disturbing print composition.
   - The approved new fields remain.
   - The report structure remains.
   - Only print fidelity is restored.

Technical instructions:
- Prefer print-only CSS overrides over shared CSS edits.
- Avoid broad selectors that may affect screen rendering.
- Remove only the rules causing PDF distortion.
- If a PDF library is used, tune its export options instead of redesigning HTML.
- If the print/export pipeline uses scaling, ensure scaling is deterministic and based on the intended page width.
- If the issue comes from a wrapper with screen dimensions, bypass it in print.
- Avoid introducing arbitrary hardcoded values unless they match the original PDF behavior.
- Keep the DOM structure as intact as possible.

What to inspect:
- `@media print`
- `@page`
- report container width / max-width
- print margins
- any `transform: scale(...)`
- any `zoom`
- any `vh`, `min-height`, or large bottom spacing
- hidden toolbar/button containers still occupying space
- PDF export options:
  - page size
  - orientation
  - margins
  - html2canvas scale
  - jsPDF format
  - image compression
  - content width fitting
  - pagebreak mode

Expected outcome:
- The panel stays exactly as it is now.
- The PDF returns to the original clean composition.
- The PDF no longer appears shrunken or mispositioned.
- The printable area is used correctly.
- No redesign occurs.
- No unrelated logic is touched.

Required output format:
1. Brief diagnosis of what caused the PDF drift.
2. Exact code changes made only for PDF/print fidelity.
3. Updated code.
4. Short explanation of why the fix restores the original export behavior.

Final directive:
This is a print-fidelity restoration task.
Act like a layout preservation engineer.
Do not make aesthetic decisions.
Do not improve the design.
Do not “clean up” the UI.
Restore the original PDF behavior with the smallest possible set of targeted changes.

Additional enforcement:
- If a fix can be done in print-only CSS, do not touch HTML.
- If a fix can be done in export config, do not touch layout CSS.
- Do not replace tables with grids.
- Do not change widths unless restoring original print proportions.
- Do not alter the visual identity of the report in any way.
- Any modification unrelated to PDF fidelity is forbidden.

Start by identifying the exact print/export regression, then patch only that regression.
Do not perform broad refactors.