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
  var OVERVIEW_ALLOWED_ATTRS = ['href', 'src', 'alt', 'title', 'colspan', 'rowspan', 'class', 'style'];

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

    var parsed = null;
    var trimmed = '';

    if (typeof raw === 'object' && raw !== null) {
      if (Array.isArray(raw.blocks)) {
        parsed = raw;
      } else if (Array.isArray(raw.ops)) {
        // Quill Delta object
        return raw.ops
          .map(function (op) {
            if (typeof op.insert === 'string') return op.insert.replace(/\n/g, '<br>');
            if (op.insert && op.insert.image) return '<p><img src="' + op.insert.image + '" alt="image" class="max-w-full rounded-lg"/></p>';
            return '';
          })
          .join('');
      } else if (typeof raw.html === 'string') {
        return sanitizeOverviewHtml(raw.html);
      } else if (typeof raw.content === 'string') {
        return renderOverview(raw.content);
      } else if (typeof raw.text === 'string') {
        return renderOverview(raw.text);
      }
    } else if (typeof raw === 'string') {
      trimmed = raw.trim();
      if (!trimmed || trimmed === '[object Object]') return '';

      // 1. Editor.js JSON string
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
          var j = JSON.parse(trimmed);
          if (j && Array.isArray(j.blocks)) {
            parsed = j;
          }
        } catch (e) {
          // fallback ke html/text
        }
      }
    } else {
      return '';
    }

    // 1. Render jika berupa Editor.js blocks
    if (parsed && Array.isArray(parsed.blocks)) {
      return parsed.blocks
        .map(function (b) {
          var d = b.data || {};
          switch (b.type) {
            case 'header': {
              var lvl = Math.min(Math.max(d.level || 2, 1), 6);
              return '<h' + lvl + '>' + (d.text || '') + '</h' + lvl + '>';
            }
            case 'list': {
              var items = (d.items || [])
                .map(function (i) {
                  var content = typeof i === 'object' && i !== null ? i.content || '' : i;
                  return '<li>' + content + '</li>';
                })
                .join('');
              return d.style === 'ordered'
                ? '<ol class="list-decimal pl-5">' + items + '</ol>'
                : '<ul class="list-disc pl-5">' + items + '</ul>';
            }
            case 'image':
              return (
                '<figure class="my-4"><img src="' +
                ((d.file && d.file.url) || '') +
                '" alt="overview image" class="max-w-full rounded-lg"/>' +
                (d.caption
                  ? '<figcaption class="text-center text-sm text-[#737373] mt-2">' +
                    d.caption +
                    '</figcaption>'
                  : '') +
                '</figure>'
              );
            case 'quote':
              return '<blockquote class="border-l-4 border-[#D4D4D4] pl-4 italic my-4">' + (d.text || '') + '</blockquote>';
            case 'code':
              return '<pre class="bg-gray-100 p-4 rounded-md my-4 overflow-x-auto"><code>' + (d.code || '') + '</code></pre>';
            case 'delimiter':
              return '<hr class="my-6 border-t-2 border-[#E5E5E5]"/>';
            default:
              return '<p class="my-2">' + (d.text || '') + '</p>';
          }
        })
        .join('');
    }

    // 2. HTML siap render
    if (typeof trimmed === 'string' && /<\/?[a-z][\s\S]*>/i.test(trimmed)) {
      return sanitizeOverviewHtml(trimmed);
    }

    // 3. Teks biasa -> escape supaya aman
    if (trimmed) {
      var el = document.createElement('div');
      el.textContent = trimmed;
      return el.innerHTML;
    }

    return '';
  }

  global.sanitizeOverviewHtml = sanitizeOverviewHtml;
  global.renderOverview = renderOverview;
})(window);
