#!/usr/bin/env bash
# Rebuilds A1/SRS.pdf from SRS.md (needs pandoc + Node with Playwright/Chromium).
# Alternative: open SRS.md in VS Code/Typora and "Export to PDF".
set -e
cd "$(dirname "$0")"
pandoc SRS.md -s --toc --toc-depth=2 --css srs.css --embed-resources --metadata lang=en -o /tmp/SRS.html
python3 - <<'PY'
import re
h=open('/tmp/SRS.html').read()
toc=re.search(r'<nav id="TOC".*?</nav>',h,re.S).group(0)
h=h.replace(toc,'',1)
i=h.index('<div class="cover-meta">'); j=h.index('</div>',i)+6
h=h[:j]+'<div style="page-break-before:always"></div><h1 style="border:none;margin-top:0">Table of Contents</h1>'+toc+h[j:]
open('/tmp/SRS.html','w').write(h)
PY
node -e "
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage();
await p.goto('file:///tmp/SRS.html'); await p.pdf({ path: '../SRS.pdf', format: 'A4', printBackground: true, displayHeaderFooter: true,
headerTemplate: '<div></div>', footerTemplate: '<div style=\"font-size:8px;width:100%;text-align:center;color:#888\">Restaurant App MVP — SRS v1.0 · Page <span class=\"pageNumber\"></span> of <span class=\"totalPages\"></span></div>',
margin: { top: '16mm', bottom: '16mm', left: '14mm', right: '14mm' } }); await b.close(); })();"
echo "Wrote A1/SRS.pdf"
