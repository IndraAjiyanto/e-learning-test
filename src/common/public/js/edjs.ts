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
    return `<p class="mb-3 text-lg text-gray-800">${block.data.text}</p>`;
  },
});

export default parser;