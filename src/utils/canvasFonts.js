const { GlobalFonts } = require("@napi-rs/canvas");
const fs = require("fs");

let fontsInitialized = false;

function initCanvasFonts() {
  if (fontsInitialized) return;

  const fontDefinitions = [
    // 1. Inter (Modern sleek sans-serif)
    { p: "/usr/share/fonts/opentype/inter/Inter-Bold.otf", name: "Inter" },
    { p: "/usr/share/fonts/opentype/inter/Inter-SemiBold.otf", name: "Inter" },
    { p: "/usr/share/fonts/opentype/inter/Inter-Medium.otf", name: "Inter" },
    { p: "/usr/share/fonts/opentype/inter/Inter-Regular.otf", name: "Inter" },
    { p: "/usr/share/fonts/opentype/inter/Inter-Black.otf", name: "Inter" },

    // 2. Roboto (Google standard sans-serif)
    { p: "/usr/share/fonts/truetype/roboto/unhinted/RobotoTTF/Roboto-Bold.ttf", name: "Roboto" },
    { p: "/usr/share/fonts/truetype/roboto/unhinted/RobotoTTF/Roboto-Medium.ttf", name: "Roboto" },
    { p: "/usr/share/fonts/truetype/roboto/unhinted/RobotoTTF/Roboto-Regular.ttf", name: "Roboto" },
    { p: "/usr/share/fonts/truetype/roboto/unhinted/RobotoTTF/Roboto-Black.ttf", name: "Roboto" },

    // 3. Liberation Sans & Mono (Metric-compatible with Arial & Courier)
    { p: "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf", name: "Liberation Sans" },
    { p: "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf", name: "Liberation Sans" },
    { p: "/usr/share/fonts/truetype/liberation/LiberationMono-Bold.ttf", name: "Liberation Mono" },
    { p: "/usr/share/fonts/truetype/liberation/LiberationMono-Regular.ttf", name: "Liberation Mono" },

    // 4. DejaVu Sans & Mono (Debian Linux foundational fonts)
    { p: "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", name: "DejaVu Sans" },
    { p: "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", name: "DejaVu Sans" },
    { p: "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf", name: "DejaVu Sans Mono" },
    { p: "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", name: "DejaVu Sans Mono" },

    // 5. Windows System Fonts
    { p: "C:/Windows/Fonts/bahnschrift.ttf", name: "Bahnschrift" },
    { p: "C:/Windows/Fonts/segoeui.ttf", name: "Segoe UI" },
    { p: "C:/Windows/Fonts/segoeuib.ttf", name: "Segoe UI" },
    { p: "C:/Windows/Fonts/seguisb.ttf", name: "Segoe UI" },
    { p: "C:/Windows/Fonts/consola.ttf", name: "Consolas" },
    { p: "C:/Windows/Fonts/consolab.ttf", name: "Consolas" },
    { p: "C:/Windows/Fonts/arial.ttf", name: "Arial" },
    { p: "C:/Windows/Fonts/arialbd.ttf", name: "Arial" },

    // 6. Color Emojis & Symbols (Always registered AFTER text fonts)
    { p: "/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf", name: "Noto Color Emoji" },
    { p: "/usr/share/fonts/truetype/ancient-scripts/Symbola_hint.ttf", name: "Symbola" },
    { p: "C:/Windows/Fonts/seguiemj.ttf", name: "Segoe UI Emoji" },
  ];

  for (const { p, name } of fontDefinitions) {
    if (fs.existsSync(p)) {
      try {
        GlobalFonts.registerFromPath(p, name);
      } catch {}
    }
  }

  fontsInitialized = true;
}

// Auto-initialize on first import
initCanvasFonts();

// Primary Typography Stacks:
// Standard Text Fonts ALWAYS precede Emoji fallbacks to prevent Latin glyph corruption
const SANS = '"Inter", "Roboto", "Liberation Sans", "DejaVu Sans", "Segoe UI", Arial, sans-serif';
const MONO = '"Liberation Mono", "DejaVu Sans Mono", Consolas, "Courier New", monospace';
const EMOJI = '"Noto Color Emoji", "Segoe UI Emoji", "Apple Color Emoji", Symbola, sans-serif';

const FONTS = {
  // Title / Heading Font: Inter / Roboto / DejaVu / Segoe UI with emoji support
  title: (weight, size) => `${weight} ${size}px ${SANS}, ${EMOJI}`,

  // Clean Sans Body Font
  sans: (weight, size) => `${weight} ${size}px ${SANS}, ${EMOJI}`,

  // Code / Technical Monospace Font
  mono: (weight, size) => `${weight} ${size}px ${MONO}, ${EMOJI}`,

  // Raw family strings
  familySans: SANS,
  familyMono: MONO,
  familyEmoji: EMOJI,
};

module.exports = {
  initCanvasFonts,
  FONTS,
  SANS,
  MONO,
  EMOJI,
};
