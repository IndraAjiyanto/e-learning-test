import edjsHTML from "editorjs-html";

const parser = edjsHTML({
  image: (block) => {
    const { file, withBorder, withBackground, stretched, caption } = block.data;

    let classList: string[] = [];

    if (withBorder) classList.push("rounded-md");
    if (withBackground) classList.push("bg-gray-100", "p-3", "justify-content-center");
    if (stretched) classList.push("w-full", "max-w-full");

    return `
    <div class="my-4 flex justify-center ${classList.join(" ")}">
              <div class="flex justify-center mb-12">
            <div class="relative rounded-2xl overflow-hidden w-full sm:w-4/5 md:w-3/4 lg:w-2/3 flex justify-center items-center">
      <img 
        src="${file.url}" 
        alt="${caption || "Image"}"
        class="h-auto object-contain"
        loading="lazy"
      />
      </div>
      </div>
      </div>
    `;
  },
  paragraph: (block) => {
    const align = block.data.alignment;
    return `<p class="mb-3 text-lg text-gray-800 text-${align}">${block.data.text}</p>`;
  },
  header: (block) => {
    const level = block.data.level;
    if(level === 1) return `<h1 class="mb-4 text-3xl leading-9 font-bold">${block.data.text}</h1>`;
    if(level === 2) return `<h2 class="mb-4 text-2xl leading-8 font-bold">${block.data.text}</h2>`;
    if(level === 3) return `<h3 class="mb-4 text-xl leading-7 font-bold">${block.data.text}</h3>`;
    if(level === 4) return `<h4 class="mb-2 text-lg leading-7 font-semibold">${block.data.text}</h4>`;
    if(level === 5) return `<h5 class="mb-2 text-base leading-6 font-medium">${block.data.text}</h5>`;
    if(level === 6) return `<h6 class="mb-2 text-sm leading-5 font-medium">${block.data.text}</h6>`;
    return `<h${level} class="mb-4 text-4xl font-bold text-gray-900">${block.data.text}</h${level}>`;
  }
});

export default parser;