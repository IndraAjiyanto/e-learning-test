class TextType {
  constructor(
    element,
    texts,
    typingSpeed = 75,
    pauseDuration = 3500,
    cursor = '|',
  ) {
    this.element = element;
    this.texts = Array.isArray(texts) ? texts : [texts];
    this.typingSpeed = typingSpeed;
    this.pauseDuration = pauseDuration;
    this.cursor = cursor;

    this.textIndex = 0;
    this.charIndex = 0;
    this.isDeleting = false;
    this.isPaused = false;

    // Simpan teks asli untuk fallback
    this.originalContent = element.innerHTML;

    this.startTyping();
  }

  startTyping() {
    if (this.isPaused) return;

    const currentText = this.texts[this.textIndex];

    // Pastikan currentText ada dan berupa string
    if (!currentText || typeof currentText !== 'string') {
      console.error('Invalid text:', currentText);
      return;
    }

    let displayText = currentText.substring(0, this.charIndex);

    // Update element content dengan styling yang sama
    this.element.innerHTML =
      `<span class="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent">${displayText}</span>` +
      `<span class="typing-cursor text-slate-600">${this.cursor}</span>`;

    if (!this.isDeleting && this.charIndex < currentText.length) {
      // Typing forward
      this.charIndex++;
      setTimeout(() => this.startTyping(), this.typingSpeed);
    } else if (this.isDeleting && this.charIndex > 0) {
      // Deleting backward
      this.charIndex--;
      setTimeout(() => this.startTyping(), this.typingSpeed / 2);
    } else {
      // Switch modes
      if (!this.isDeleting) {
        // Pause before deleting
        this.isPaused = true;
        setTimeout(() => {
          this.isPaused = false;
          this.isDeleting = true;
          this.startTyping();
        }, this.pauseDuration);
      } else {
        // Move to next text
        this.isDeleting = false;
        this.charIndex = 0;
        this.textIndex = (this.textIndex + 1) % this.texts.length;
        setTimeout(() => this.startTyping(), this.typingSpeed);
      }
    }
  }

  // Method untuk menghentikan animasi
  stop() {
    this.isPaused = true;
    // Kembalikan ke konten asli atau teks terakhir
    this.element.innerHTML = this.originalContent;
  }
}

// Auto-inisialisasi elemen dengan data attributes
document.addEventListener('DOMContentLoaded', () => {
  const elements = document.querySelectorAll('[data-texttype]');

  elements.forEach((el) => {
    try {
      // Parse texts dari data attribute
      let texts = [];
      if (el.dataset.texts) {
        texts = JSON.parse(el.dataset.texts);
      } else if (el.dataset.text) {
        // Fallback untuk single text
        texts = [el.dataset.text];
      } else {
        // Gunakan teks yang sudah ada di element sebagai fallback
        const existingText = el.textContent.trim();
        texts = existingText ? [existingText] : ['Default Text'];
      }

      const speed = parseInt(el.dataset.speed) || 75;
      const pause = parseInt(el.dataset.pause) || 1500;
      const cursor = el.dataset.cursor || '|';

      // Clear existing content sebelum memulai animasi
      el.innerHTML = '';

      new TextType(el, texts, speed, pause, cursor);
    } catch (error) {
      console.error('Error initializing TextType:', error);
    }
  });
});
