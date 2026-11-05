export async function downloadVisualizationImage(
  container: HTMLElement,
  title: string,
): Promise<void> {
  await document.fonts.ready;
  const source = container.querySelector<SVGSVGElement>(
    'svg.recharts-surface, svg[role="group"]',
  );
  if (!source) throw new Error("CHART_NOT_READY");
  const bounds = source.getBoundingClientRect();
  if (!bounds.width || !bounds.height) throw new Error("CHART_NOT_READY");
  const svg = source.cloneNode(true) as SVGSVGElement;
  const originals = [source, ...source.querySelectorAll("*")];
  const copies = [svg, ...svg.querySelectorAll("*")];
  const properties = [
    "fill",
    "fill-opacity",
    "stroke",
    "stroke-width",
    "stroke-opacity",
    "stroke-dasharray",
    "opacity",
    "font-family",
    "font-size",
    "font-weight",
    "font-style",
    "text-anchor",
    "dominant-baseline",
    "letter-spacing",
    "color",
  ];
  originals.forEach((element, index) => {
    const style = window.getComputedStyle(element);
    for (const property of properties)
      (copies[index] as SVGElement).style.setProperty(
        property,
        style.getPropertyValue(property),
      );
  });
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.setAttribute("width", String(bounds.width));
  svg.setAttribute("height", String(bounds.height));
  const imageUrl = URL.createObjectURL(
    new Blob([new XMLSerializer().serializeToString(svg)], {
      type: "image/svg+xml;charset=utf-8",
    }),
  );
  try {
    const image = new Image();
    image.src = imageUrl;
    await image.decode();
    const legend = Array.from(
      container.querySelectorAll<HTMLElement>(".recharts-legend-item-text"),
    );
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) throw new Error("CANVAS_UNAVAILABLE");
    const width = Math.ceil(bounds.width + 32);
    context.font = "12px sans-serif";
    let x = 16;
    let row = 0;
    const entries = legend.map((element) => {
      const text = element.textContent ?? "";
      const entryWidth = context.measureText(text).width + 32;
      if (x > 16 && x + entryWidth > width - 16) {
        x = 16;
        row++;
      }
      const entry = { text, color: getComputedStyle(element).color, x, row };
      x += entryWidth;
      return entry;
    });
    const height = Math.ceil(
      bounds.height + 64 + (entries.length ? (row + 1) * 22 : 0),
    );
    canvas.width = width * 2;
    canvas.height = height * 2;
    context.scale(2, 2);
    context.fillStyle = "#fff";
    context.fillRect(0, 0, width, height);
    context.fillStyle = "#171717";
    context.font = "600 16px sans-serif";
    context.fillText(title, 16, 26, width - 32);
    context.drawImage(image, 16, 40, bounds.width, bounds.height);
    context.font = "12px sans-serif";
    for (const entry of entries) {
      const y = bounds.height + 58 + entry.row * 22;
      context.fillStyle = entry.color;
      context.fillRect(entry.x, y - 9, 10, 10);
      context.fillStyle = "#171717";
      context.fillText(entry.text, entry.x + 16, y);
    }
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (value) =>
          value ? resolve(value) : reject(new Error("IMAGE_EXPORT_FAILED")),
        "image/png",
      );
    });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `${
      title
        .replace(/[^\p{L}\p{N}]+/gu, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase() || "chart"
    }.png`;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}
