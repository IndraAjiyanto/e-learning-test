import Quill from 'quill';

/**
 * Helper converter dari EditorJS blocks ke HTML jika ada data legacy
 */
export function editorJsBlocksToHtml(raw) {
  if (!raw) return '';
  let parsed = raw;
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (trimmed.startsWith('{')) {
      try {
        parsed = JSON.parse(trimmed);
      } catch (e) {
        return raw;
      }
    } else {
      return raw;
    }
  }

  if (parsed && Array.isArray(parsed.blocks) && parsed.blocks.length > 0) {
    return parsed.blocks
      .map(function (b) {
        const d = b.data || {};
        const type = (b.type || '').toLowerCase();
        const itemText = (i) =>
          typeof i === 'object' && i !== null
            ? i.content || i.text || ''
            : i || '';
        switch (type) {
          case 'header': {
            const lvl = Math.min(Math.max(d.level || 2, 1), 6);
            return '<h' + lvl + '>' + (d.text || '') + '</h' + lvl + '>';
          }
          case 'paragraph':
            return '<p>' + (d.text || '') + '</p>';
          case 'list': {
            const listItems = (d.items || [])
              .map(itemText)
              .map((c) => '<li>' + c + '</li>')
              .join('');
            return d.style === 'ordered'
              ? '<ol>' + listItems + '</ol>'
              : '<ul>' + listItems + '</ul>';
          }
          case 'image':
            return (
              '<p><img src="' +
              ((d.file && d.file.url) || '') +
              '" alt="' +
              (d.caption || '') +
              '" /></p>'
            );
          case 'quote':
            return '<blockquote>' + (d.text || '') + '</blockquote>';
          case 'code':
            return '<pre><code>' + (d.code || '') + '</code></pre>';
          case 'delimiter':
            return '<hr />';
          default:
            return d.text ? '<p>' + d.text + '</p>' : '';
        }
      })
      .join('');
  }

  return typeof parsed === 'string' ? parsed : '';
}

/**
 * Factory inisialisasi Quill
 */
export function createQuillEditor(holder, options = {}) {
  const el = typeof holder === 'string' ? document.getElementById(holder) : holder;
  if (!el) return null;

  const toolbarOptions = options.toolbar || [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['blockquote', 'code-block'],
    ['link', 'image'],
    ['clean'],
  ];

  const modules = {
    toolbar: toolbarOptions,
  };

  const quill = new Quill(el, {
    theme: 'snow',
    placeholder: options.placeholder || 'Write your content here...',
    modules,
  });

  if (options.uploadUrl) {
    const toolbar = quill.getModule('toolbar');
    if (toolbar) {
      toolbar.addHandler('image', () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/jpeg,image/png,image/jpg,image/gif,image/webp');
        input.onchange = async () => {
          const file = input.files && input.files[0];
          if (!file) return;

          const formData = new FormData();
          formData.append('image', file);

          try {
            const res = await fetch(options.uploadUrl, {
              method: 'POST',
              body: formData,
            });
            const result = await res.json();
            const url =
              result?.file?.url ||
              result?.url ||
              (result?.uploadedImageUrls && result.uploadedImageUrls[0]);

            if (url) {
              const range = quill.getSelection(true) || { index: quill.getLength() };
              quill.insertEmbed(range.index, 'image', url);
              quill.setSelection(range.index + 1);
            } else {
              console.error('Upload failed:', result);
              alert(result?.message || 'Upload gagal');
            }
          } catch (err) {
            console.error('Upload error:', err);
            alert('Gagal mengunggah gambar');
          }
        };
        input.click();
      });
    }
  }

  if (options.initialContent) {
    const html = editorJsBlocksToHtml(options.initialContent);
    if (html) {
      quill.clipboard.dangerouslyPasteHTML(html);
    }
  }

  return quill;
}

window.Quill = Quill;
window.QuillEditor = {
  create: createQuillEditor,
  blocksToHtml: editorJsBlocksToHtml,
};
