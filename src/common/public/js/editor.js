import Quill from 'quill';
import { StyleAttributor, Scope } from 'parchment';

export const LINE_HEIGHT_WHITELIST = [
  '1',
  '1.15',
  '1.2',
  '1.25',
  '1.5',
  '1.75',
  '2',
  '2.5',
  '3',
];

export const LineHeightStyle = new StyleAttributor('lineHeight', 'line-height', {
  scope: Scope.BLOCK,
  whitelist: LINE_HEIGHT_WHITELIST,
});

const BaseVideo = Quill.import('formats/video');
class CustomVideo extends BaseVideo {
  html() {
    const url = this.value();
    return `<iframe class="ql-video" frameborder="0" allowfullscreen="true" src="${url}"></iframe>`;
  }
}

Quill.register(
  {
    'attributors/style/lineHeight': LineHeightStyle,
    'attributors/style/line-height': LineHeightStyle,
    'formats/lineHeight': LineHeightStyle,
    'formats/line-height': LineHeightStyle,
    'formats/video': CustomVideo,
  },
  true,
);

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
            const align = d.alignment && d.alignment !== 'left' ? ' class="ql-align-' + d.alignment + '"' : '';
            return '<h' + lvl + align + '>' + (d.text || '') + '</h' + lvl + '>';
          }
          case 'paragraph': {
            const align = d.alignment && d.alignment !== 'left' ? ' class="ql-align-' + d.alignment + '"' : '';
            return '<p' + align + '>' + (d.text || '') + '</p>';
          }
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
          case 'video':
          case 'embed': {
            const url = d.embed || d.source || (d.file && d.file.url) || d.url || '';
            let embedUrl = url;
            const yt = url.match(/^(?:(https?):\/\/)?(?:(?:www|m)\.)?youtube\.com\/watch.*v=([a-zA-Z0-9_-]+)/) || url.match(/^(?:(https?):\/\/)?(?:(?:www|m)\.)?youtu\.be\/([a-zA-Z0-9_-]+)/);
            if (yt) {
              embedUrl = (yt[1] || 'https') + '://www.youtube.com/embed/' + yt[2] + '?showinfo=0';
            }
            return '<iframe class="ql-video" frameborder="0" allowfullscreen="true" src="' + embedUrl + '"></iframe>';
          }
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

  const defaultLineHeights = options.lineHeights || [
    false,
    '1',
    '1.15',
    '1.25',
    '1.5',
    '1.75',
    '2',
    '2.5',
    '3',
  ];

  const toolbarOptions = options.toolbar || [
    [{ font: [] }, { size: [] }],
    [{ lineHeight: defaultLineHeights }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }, 'blockquote', 'code-block'],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ script: 'sub' }, { script: 'super' }],
    [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
    [{ direction: 'rtl' }, { align: [] }],
    ['link', 'image', 'video', 'formula'],
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

  const toolbar = quill.getModule('toolbar');
  if (toolbar && toolbar.container) {
    const lineHeightPicker = toolbar.container.querySelector('.ql-lineHeight, .ql-line-height');
    if (lineHeightPicker) {
      lineHeightPicker.setAttribute('title', 'Line Height');
      const label = lineHeightPicker.querySelector('.ql-picker-label');
      if (label) {
        label.setAttribute('title', 'Line Height');
      }
    }
  }

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
  getHtml: (quill) => {
    if (!quill) return '';
    const html = quill.getSemanticHTML ? quill.getSemanticHTML() : quill.root.innerHTML;
    return html === '<p><br></p>' ? '' : html;
  },
  LineHeightStyle,
  LINE_HEIGHT_WHITELIST,
};
