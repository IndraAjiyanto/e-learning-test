import EditorJS from '@editorjs/editorjs'
import Header from '@editorjs/header'
import ParagraphOriginal from '@editorjs/paragraph'
import List from '@editorjs/list'
import ImageTool from '@editorjs/image'
import LinkTool from '@editorjs/link'
import Marker from '@editorjs/marker';

const Paragraph = require('editorjs-paragraph-with-alignment');

window.EditorJS = EditorJS;
window.EditorTools = { 
  Header, 
  Paragraph,
  List, 
  ImageTool, 
  LinkTool,
Marker
};
