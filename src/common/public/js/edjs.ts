import edjsHTML from 'editorjs-html';

const parser = edjsHTML({
  image: (block) => {
    const { file, withBorder, withBackground, stretched, caption } = block.data;

    let classList: string[] = [];

    if (withBorder) classList.push('rounded-md');
    if (withBackground)
      classList.push('bg-gray-100', 'p-3', 'justify-content-center');
    if (stretched) classList.push('w-full', 'max-w-full');

    return `
    <div class="my-4 flex justify-center ${classList.join(' ')}">
              <div class="flex justify-center mb-12">
            <div class="relative rounded-2xl overflow-hidden max-w-[600px] flex justify-center items-center">
      <img 
        src="${file.url}" 
        alt="${caption || 'Image'}"
        class="h-auto object-contain"
        loading="lazy"
      />
      ${caption ? `<p class="mt-2 text-sm text-center text-gray-600">${caption}</p>` : ''}
      </div>
      </div>
      </div>
    `;
  },
  paragraph: (block) => {
    const align = block.data.alignment;
    return `<p class="mb-3 text-lg text-gray-800 [&_a]:underline text-${align}">${block.data.text}</p>`;
  },
  header: (block) => {
    const level = block.data.level;
    if (level === 1)
      return `<h1 class="mb-4 text-gray-900 text-3xl leading-9 font-bold [&_a]:underline">${block.data.text}</h1>`;
    if (level === 2)
      return `<h2 class="mb-4 text-gray-900 text-2xl leading-8 font-bold [&_a]:underline">${block.data.text}</h2>`;
    if (level === 3)
      return `<h3 class="mb-4 text-gray-900 text-xl leading-7 font-bold [&_a]:underline">${block.data.text}</h3>`;
    if (level === 4)
      return `<h4 class="mb-2 text-gray-900 text-lg leading-7 font-semibold [&_a]:underline">${block.data.text}</h4>`;
    if (level === 5)
      return `<h5 class="mb-2 text-gray-900 text-base leading-6 font-medium [&_a]:underline">${block.data.text}</h5>`;
    if (level === 6)
      return `<h6 class="mb-2 text-gray-900 text-sm leading-5 font-medium [&_a]:underline">${block.data.text}</h6>`;
    return `<h1 class="mb-4 text-gray-900 text-4xl font-bold">${block.data.text}</h1>`;
  },
});

export default parser;
