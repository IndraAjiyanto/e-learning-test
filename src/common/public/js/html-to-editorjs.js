// Deprecated: No longer needed with Quill (HTML is stored directly).
export default function htmlToEditorjs(html) {
  return html;
}
if (typeof window !== 'undefined') {
  window.htmlToEditorjs = htmlToEditorjs;
}