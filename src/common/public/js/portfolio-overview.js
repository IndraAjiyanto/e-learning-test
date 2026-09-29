/*
 * Render `contentHtml` portfolio di panel detail.
 *
 * Files ini pernah berada di dalam partial my_portofolio/index.hbs. Partial
 * tersebut kini dimuat lewat loadCourseFragment, yang menempelkan HTML dengan
 * `container.innerHTML = html` - dan skrip yang disisipkan dengan cara itu
 * TIDAK dieksekusi browser. Fungsi ini dipanggil dari Alpine (`x-html`), jadi
 * harus sudah ada di halaman sebelum fragment masuk; karena itu ia dipindah ke
 * aset statis yang dimuat sekali oleh shell.
 */
(function (global) {
  // Whitelist tag/atribut untuk HTML overview. Dipakai karena `contentHtml`
  // di-inject lewat x-html, sedangkan sanitize-html hanya jalan di server.
  var OVERVIEW_ALLOWED_TAGS = [
    'P', 'BR', 'B', 'STRONG', 'I', 'EM', 'U', 'S', 'MARK', 'SMALL', 'SUB', 'SUP', 'SPAN', 'DIV',
    'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'UL', 'OL', 'LI', 'A', 'BLOCKQUOTE', 'PRE', 'CODE', 'HR',
    'FIGURE', 'FIGCAPTION', 'IMG', 'TABLE', 'THEAD', 'TBODY', 'TR', 'TH', 'TD'
  ];
  var OVERVIEW_ALLOWED_ATTRS = ['href', 'src', 'alt', 'title', 'colspan', 'rowspan', 'class'];

  function sanitizeOverviewHtml(html) {
    // DOMParser menghasilkan dokumen inert: script tidak jalan, resource tidak di-fetch.
    var doc = new DOMParser().parseFromString(html, 'text/html');

    doc.body.querySelectorAll('*').forEach(function (el) {
      if (OVERVIEW_ALLOWED_TAGS.indexOf(el.tagName) === -1) {
        el.remove();
        return;
      }
      Array.prototype.slice.call(el.attributes).forEach(function (attr) {
        var name = attr.name.toLowerCase();
        var value = (attr.value || '').replace(/[\s\u0000-\u001F]/g, '').toLowerCase();
        if (OVERVIEW_ALLOWED_ATTRS.indexOf(name) === -1) {
          el.removeAttribute(attr.name);
        } else if ((name === 'href' || name === 'src') && /^(javascript|data|vbscript):/.test(value)) {
          el.removeAttribute(attr.name);
        }
      });
      if (el.tagName === 'A') {
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener noreferrer');
      }
    });

    return doc.body.innerHTML;
  }

  function renderOverview(raw) {
    if (!raw) return '';
    if (typeof raw !== 'string') return '';
    var trimmed = raw.trim();
    if (!trimmed) return '';
    // 1. Editor.js JSON (kolom `content`)
    if (trimmed.startsWith('{')) {
      try {
        var parsed = JSON.parse(trimmed);
        if (parsed && Array.isArray(parsed.blocks)) {
          return parsed.blocks.map(function (b) {
            var d = b.data || {};
            switch (b.type) {
              case 'header': {
                var lvl = Math.min(Math.max(d.level || 2, 1), 6);
                return '<h' + lvl + '>' + (d.text || '') + '</h' + lvl + '>';
              }
              case 'list':
                var items = (d.items || []).map(function (i) {
                  var content = (typeof i === 'object' && i !== null) ? (i.content || '') : i;
                  return '<li>' + content + '</li>';
                }).join('');
                return d.style === 'ordered' ? '<ol class="list-decimal pl-5">' + items + '</ol>' : '<ul class="list-disc pl-5">' + items + '</ul>';
              case 'image':
                return '<figure class="my-4"><img src="' + ((d.file && d.file.url) || '') + '" alt="overview image" class="max-w-full rounded-lg"/>' +
                  (d.caption ? '<figcaption class="text-center text-sm text-[#737373] mt-2">' + d.caption + '</figcaption>' : '') + '</figure>';
              case 'quote':
                return '<blockquote class="border-l-4 border-[#D4D4D4] pl-4 italic my-4">' + (d.text || '') + '</blockquote>';
              case 'code':
                return '<pre class="bg-gray-100 p-4 rounded-md my-4 overflow-x-auto"><code>' + (d.code || '') + '</code></pre>';
              case 'delimiter':
                return '<hr class="my-6 border-t-2 border-[#E5E5E5]"/>';
              default:
                return '<p class="my-2">' + (d.text || '') + '</p>';
            }
          }).join('');
        }
      } catch (e) {
        // not editor JSON, fallback below
      }
    }
    // 2. HTML jadi hasil editorjsHTML.parse() di server (kolom `contentHtml`)
    if (/<\/?[a-z][\s\S]*>/i.test(trimmed)) {
      return sanitizeOverviewHtml(trimmed);
    }
    // 3. Teks biasa -> escape supaya aman
    var el = document.createElement('div');
    el.textContent = trimmed;
    return el.innerHTML;
  }

  global.sanitizeOverviewHtml = sanitizeOverviewHtml;
  global.renderOverview = renderOverview;
})(window);
