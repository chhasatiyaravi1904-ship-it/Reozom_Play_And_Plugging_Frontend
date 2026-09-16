const fs = require('fs');

const htmlContent = fs.readFileSync('C:/Users/Hetu/Desktop/Reozom_Play_Plugin/Frontend/src/views/LandingView.html', 'utf8');

const configMatch = htmlContent.match(/tailwind\.config\s*=\s*(\{[\s\S]*?\})\s*<\/script>/);
if (!configMatch) {
  console.error("No tailwind config found in HTML");
  process.exit(1);
}

const config = new Function('return ' + configMatch[1])();
const colors = config.theme.extend.colors;
const fontFamily = config.theme.extend.fontFamily;
const fontSize = config.theme.extend.fontSize;

let css = '\n\n/* Stitch Theme Extensions */\n@theme {\n';

if (colors) {
  for (const [k, v] of Object.entries(colors)) {
    css += `  --color-${k}: ${v};\n`;
  }
}

if (fontFamily) {
  for (const [k, v] of Object.entries(fontFamily)) {
    // v is an array like ["Plus Jakarta Sans"]
    css += `  --font-${k}: "${v[0]}", sans-serif;\n`;
  }
}

if (fontSize) {
  for (const [k, v] of Object.entries(fontSize)) {
    css += `  --text-${k}: ${v[0]};\n`;
    if (v[1] && v[1].lineHeight) {
      css += `  --text-${k}--line-height: ${v[1].lineHeight};\n`;
    }
  }
}

css += '}\n';

fs.appendFileSync('C:/Users/Hetu/Desktop/Reozom_Play_Plugin/Frontend/src/assets/main.css', css);
console.log('Successfully appended theme to main.css');
