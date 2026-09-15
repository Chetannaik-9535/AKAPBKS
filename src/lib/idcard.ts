export function calcAge(dob: string) {
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return "";
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age -= 1;
  return String(age);
}

export function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB");
}

async function snapshot(node: HTMLElement): Promise<HTMLCanvasElement> {
  const { toCanvas } = await import("html-to-image");
  const width = Math.max(node.offsetWidth || 320, node.scrollWidth || 320);
  const height = Math.max(node.offsetHeight || 440, node.scrollHeight || 440);
  return toCanvas(node, {
    pixelRatio: 3,
    backgroundColor: "#ffffff",
    cacheBust: true,
    skipFonts: true,
    width,
    height,
  });
}

export async function downloadCardPdf(
  front: HTMLElement,
  back: HTMLElement,
  fileName: string,
) {
  const { jsPDF } = await import("jspdf");
  const [frontCanvas, backCanvas] = [await snapshot(front), await snapshot(back)];
  // Exact standard CR80 dimensions: 2.125" x 3.375" (53.975mm x 85.725mm)
  const widthIn = 2.125;
  const heightIn = 3.375;
  const pdf = new jsPDF({ orientation: "portrait", unit: "in", format: [widthIn, heightIn] });
  pdf.addImage(frontCanvas.toDataURL("image/jpeg", 0.98), "JPEG", 0, 0, widthIn, heightIn);
  pdf.addPage([widthIn, heightIn], "portrait");
  pdf.addImage(backCanvas.toDataURL("image/jpeg", 0.98), "JPEG", 0, 0, widthIn, heightIn);
  pdf.save(`${fileName}.pdf`);
}

export async function downloadSingleCardImage(node: HTMLElement, fileName: string) {
  const canvas = await snapshot(node);
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = `${fileName}.png`;
  link.click();
}

export async function downloadCardImages(front: HTMLElement, back: HTMLElement, fileName: string) {
  const [frontCanvas, backCanvas] = [await snapshot(front), await snapshot(back)];
  const gap = 30;
  const padding = 20;
  const combined = document.createElement("canvas");
  combined.width = frontCanvas.width + backCanvas.width + gap + padding * 2;
  combined.height = Math.max(frontCanvas.height, backCanvas.height) + padding * 2;
  const ctx = combined.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(0, 0, combined.width, combined.height);
  ctx.drawImage(frontCanvas, padding, padding);
  ctx.drawImage(backCanvas, padding + frontCanvas.width + gap, padding);
  const link = document.createElement("a");
  link.href = combined.toDataURL("image/png");
  link.download = `${fileName}-id-card.png`;
  link.click();
}

/** Downscale and compress a chosen photo to a small data URL. */
export function fileToDataUrl(file: File, maxSize = 700): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the photo"));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("Could not read the photo"));
      image.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Could not process the photo"));
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
