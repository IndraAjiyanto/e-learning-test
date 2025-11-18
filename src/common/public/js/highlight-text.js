// Helper untuk multiple word highlights
handlebars.registerHelper(
  'highlightWords',
  function (text, highlights, options) {
    if (!text || !highlights || !Array.isArray(highlights)) {
      return text;
    }

    const words = text.split(' ');
    const highlightedWords = highlights.map((h) => h.toLowerCase());

    let output = '';

    words.forEach((word) => {
      const isHighlight = highlightedWords.includes(word.toLowerCase());
      output += options.fn({
        word: word,
        isHighlight: isHighlight,
      });
    });

    return output;
  },
);
