import Quill from 'quill';
import { StyleAttributor, Scope } from 'parchment';
import QuillTableUI from 'quill-table-ui';

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

export function normalizeVideoEmbedUrl(url) {
  if (!url) return '';
  let cleanUrl = String(url).trim();
  if (!cleanUrl || cleanUrl.includes('[object')) return '';

  if (!/^[a-zA-Z]+:\/\//.test(cleanUrl) && !cleanUrl.startsWith('//')) {
    cleanUrl = 'https://' + cleanUrl;
  }

  const ytWatch = cleanUrl.match(/^(?:https?:)?\/\/(?:www\.|m\.)?youtube(?:-nocookie)?\.com\/watch.*[?&]v=([a-zA-Z0-9_-]+)/i);
  const ytShort = cleanUrl.match(/^(?:https?:)?\/\/(?:www\.|m\.)?youtu\.be\/([a-zA-Z0-9_-]+)/i);
  const ytEmbed = cleanUrl.match(/^(?:https?:)?\/\/(?:www\.|m\.)?youtube(?:-nocookie)?\.com\/embed\/([a-zA-Z0-9_-]+)/i);
  const ytShorts = cleanUrl.match(/^(?:https?:)?\/\/(?:www\.|m\.)?youtube(?:-nocookie)?\.com\/shorts\/([a-zA-Z0-9_-]+)/i);

  const videoId =
    (ytWatch && ytWatch[1]) ||
    (ytShort && ytShort[1]) ||
    (ytEmbed && ytEmbed[1]) ||
    (ytShorts && ytShorts[1]);

  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }

  return cleanUrl;
}

const BaseVideo = Quill.import('formats/video');
class CustomVideo extends BaseVideo {
  static sanitize(url) {
    const cleanUrl = normalizeVideoEmbedUrl(url);
    return super.sanitize(cleanUrl);
  }

  static create(value) {
    const sanitized = this.sanitize(value);
    const node = super.create(sanitized);
    return node;
  }

  html() {
    const val = this.value();
    const url =
      (typeof val === 'object' && val !== null ? val.video : val) ||
      (this.domNode && this.domNode.getAttribute('src')) ||
      '';
    const embedUrl = normalizeVideoEmbedUrl(url);
    return `<iframe class="ql-video" frameborder="0" allowfullscreen="true" src="${embedUrl}"></iframe>`;
  }
}

Quill.register(
  {
    'attributors/style/lineHeight': LineHeightStyle,
    'attributors/style/line-height': LineHeightStyle,
    'formats/lineHeight': LineHeightStyle,
    'formats/line-height': LineHeightStyle,
    'formats/video': CustomVideo,
    'modules/tableUI': QuillTableUI,
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
    try {
      parsed = JSON.parse(trimmed);
    } catch (e) {
      parsed = trimmed;
    }
  }
  if (typeof parsed === 'string') {
    try {
      const second = JSON.parse(parsed);
      if (typeof second === 'string' || (typeof second === 'object' && second !== null)) {
        parsed = second;
      }
    } catch (e) {}
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
            const embedUrl = normalizeVideoEmbedUrl(url);
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
  if (el.__quill) return el.__quill;

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
    ['link', 'image', 'video', 'formula', 'table'],
    ['clean'],
  ];

  const modules = {
    toolbar: toolbarOptions,
    table: options.table !== undefined ? options.table : true,
    tableUI: options.tableUI !== undefined ? options.tableUI : true,
    ...options.modules,
  };

  const quill = new Quill(el, {
    theme: 'snow',
    placeholder: options.placeholder || 'Write your content here...',
    modules,
  });
  el.__quill = quill;

  const toolbar = quill.getModule('toolbar');
  if (toolbar) {
    const tableModule = quill.getModule('table');
    if (tableModule) {
      toolbar.addHandler('table', () => {
        const [table] = tableModule.getTable();
        if (table) {
          tableModule.insertRowBelow();
        } else {
          tableModule.insertTable(3, 3);
        }
      });
    }
  }
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
    let html = editorJsBlocksToHtml(options.initialContent);
    if (html) {
      if (typeof html === 'string') {
        html = normalizeHtmlVideos(html);
      }
      quill.clipboard.dangerouslyPasteHTML(html);
    }
  }

  return quill;
}

export function normalizeHtmlVideos(html) {
  if (!html) return '';
  return html.replace(/<iframe([^>]*?)src=["']([^"']+)["']([^>]*?)>/gi, (match, before, src, after) => {
    const embedUrl = normalizeVideoEmbedUrl(src);
    if (!embedUrl) return '';
    return '<iframe' + before + 'src="' + embedUrl + '"' + after + '>';
  });
}

export function renderContentToHtml(raw, emptyMessage = '') {
  if (!raw) return emptyMessage ? `<p class="text-[#737373] italic">${emptyMessage}</p>` : '';
  let parsed = raw;
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    try {
      parsed = JSON.parse(trimmed);
    } catch (e) {
      parsed = trimmed;
    }
  }
  if (typeof parsed === 'string') {
    try {
      const second = JSON.parse(parsed);
      if (typeof second === 'string' || (typeof second === 'object' && second !== null)) {
        parsed = second;
      }
    } catch (e) {}
  }
  if (typeof parsed === 'string' && /<\/?[a-z][\s\S]*>/i.test(parsed)) {
    return normalizeHtmlVideos(parsed.replace(/&nbsp;/g, ' ').replace(/\u00A0/g, ' '));
  }
  if (parsed && Array.isArray(parsed.blocks) && parsed.blocks.length > 0) {
    return editorJsBlocksToHtml(parsed);
  }
  if (typeof parsed === 'string' && parsed.trim()) {
    return `<div class="whitespace-pre-line">${parsed}</div>`;
  }
  return emptyMessage ? `<p class="text-[#737373] italic">${emptyMessage}</p>` : '';
}

export function quillEditorContainer(config = {}) {
  return {
    quill: null,
    init() {
      const start = () => {
        if (!window.QuillEditor) {
          setTimeout(start, 50);
          return;
        }
        let initialContent = config.value;
        const scriptEl = document.getElementById(config.holderId + '_bootstrap_value');
        if (scriptEl && scriptEl.textContent) {
          try {
            initialContent = JSON.parse(scriptEl.textContent.trim());
          } catch (e) {
            initialContent = scriptEl.textContent.trim();
          }
        }
        if (typeof initialContent === 'string') {
          try {
            const second = JSON.parse(initialContent);
            if (typeof second === 'string' || (typeof second === 'object' && second !== null)) {
              initialContent = second;
            }
          } catch (e) {}
        }
        this.quill = window.QuillEditor.create(config.holderId, {
          placeholder: config.placeholder || 'Write your content here...',
          uploadUrl: config.uploadUrl || '/program/upload-image',
          initialContent,
        });
        const form = this.$el.closest('form');
        const sync = () => {
          const input = this.$refs?.input || document.getElementById(config.inputId);
          if (input && this.quill) {
            input.value = window.QuillEditor.getHtml(this.quill);
          }
        };
        if (this.quill) {
          this.quill.on('text-change', sync);
          sync();
        }
        if (form) {
          form.addEventListener('submit', sync);
        }
      };
      start();
    },
  };
}

export function contentPreviewContainer(rawContent, emptyMessage = '') {
  return {
    renderedHtml: '',
    init() {
      const render = () => {
        let content = rawContent;
        if (typeof content === 'string' && document.getElementById(content)) {
          content = document.getElementById(content).textContent;
        }
        this.renderedHtml = renderContentToHtml(content, emptyMessage);
      };
      render();
      if (!this.renderedHtml && typeof rawContent === 'string') {
        setTimeout(render, 50);
      }
    },
  };
}

window.Quill = Quill;
window.quillEditorContainer = quillEditorContainer;
window.contentPreviewContainer = contentPreviewContainer;
window.finalAssignmentContentRenderer = (sourceId, emptyMessage) => contentPreviewContainer(sourceId, emptyMessage);
window.QuillEditor = {
  create: createQuillEditor,
  blocksToHtml: editorJsBlocksToHtml,
  renderToHtml: renderContentToHtml,
  normalizeHtmlVideos,
  getHtml: (quill) => {
    if (!quill) return '';
    const raw = quill.getSemanticHTML ? quill.getSemanticHTML() : quill.root.innerHTML;
    if (raw === '<p><br></p>') return '';
    return raw.replace(/&nbsp;/g, ' ').replace(/\u00A0/g, ' ');
  },
  LineHeightStyle,
  LINE_HEIGHT_WHITELIST,
  normalizeVideoEmbedUrl,
};
