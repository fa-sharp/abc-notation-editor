import fs from "fs/promises";

// Function to convert path data to SVG
async function createSVG(name, pathData, width, height) {
  const scaleX = 10;
  const scaleY = 10;
  // Use width/height from the pathData if not provided
  width = width || pathData.w || 10;
  height = height || pathData.h || 10;

  // Create SVG string directly instead of using DOM
  let svgString = `<svg xmlns="http://www.w3.org/2000/svg"
    width="${(width * scaleX).toFixed(2)}"
    height="${(height * scaleY).toFixed(2)}"
    viewBox="0 0 ${(width * scaleX).toFixed(2)} ${(height * scaleY).toFixed(2)}">`;

  // Convert ABC path format to SVG path format
  let svgPath = "";
  let x = ((width * scaleX) / 2).toFixed(2); // Center the drawing
  let y = ((height * scaleY) / 2).toFixed(2);

  for (const cmd of pathData.d || pathData) {
    const type = cmd[0];
    switch (type) {
      case "M":
        svgPath += `M${(parseFloat(x) + cmd[1] * scaleX).toFixed(2)},${(parseFloat(y) + cmd[2] * scaleY).toFixed(2)}`;
        break;
      case "c":
        svgPath += `c${(cmd[1] * scaleX).toFixed(2)},${(cmd[2] * scaleY).toFixed(2)} ${(cmd[3] * scaleX).toFixed(2)},${(cmd[4] * scaleY).toFixed(2)} ${(cmd[5] * scaleX).toFixed(2)},${(cmd[6] * scaleY).toFixed(2)}`;
        break;
      case "l":
        svgPath += `l${(cmd[1] * scaleX).toFixed(2)},${(cmd[2] * scaleY).toFixed(2)}`;
        break;
      case "z":
        svgPath += "z";
        break;
    }
  }

  svgString += `<path d="${svgPath}" fill="currentColor"/>`;
  svgString += "</svg>";

  // Write file
  await fs.writeFile(`${name}.svg`, svgString, { flag: "w" });
}

const glyphs = {};

for (const glyph in glyphs) {
  await createSVG(glyph, glyphs[glyph]);
}
