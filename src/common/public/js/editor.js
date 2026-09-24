import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import ParagraphOriginal from '@editorjs/paragraph';
import List from '@editorjs/list';
import ImageTool from '@editorjs/image';
import LinkTool from '@editorjs/link';
import Marker from '@editorjs/marker';

const Paragraph = require('editorjs-paragraph-with-alignment');

if (Header && Header.prototype && Header.prototype.renderSettings) {
  const origRenderSettings = Header.prototype.renderSettings;
  Header.prototype.renderSettings = function () {
    const list = origRenderSettings ? origRenderSettings.call(this) : [];
    return list.map((item) => ({
      icon: item.icon,
      name: item.label,
      title: item.title || item.label,
      label: item.label || item.title,
      isActive: item.isActive,
      closeOnActivate: item.closeOnActivate,
      onActivate: item.onActivate,
    }));
  };
}

window.EditorJS = EditorJS;
window.EditorTools = {
  Header,
  Paragraph,
  List,
  ImageTool,
  LinkTool,
  Marker,
};
