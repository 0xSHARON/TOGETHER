const { GlobalFonts } = require("@napi-rs/canvas");
const fs = require("fs");
const path = require("path");

let fontsInitialized = false;

// Project font directory (self-contained within repository)
const LOCAL_FONT_DIRS = [
  path.resolve(__dirname, "../../fonts"),
];

function initCanvasFonts() {
  if (fontsInitialized) return;

  // 1. Local bundled font definitions (bundled directly in the repo)
  const localFonts = [
    // Modern Neo-Brutalist Headings & Titles (Bahnschrift & Inter)
    { file: "bahnschrift.ttf", name: "Bahnschrift" },
    { file: "Inter-Bold.otf", name: "Inter" },
    { file: "Inter-SemiBold.otf", name: "Inter" },
    { file: "Inter-Medium.otf", name: "Inter" },
    { file: "Inter-Regular.otf", name: "Inter" },
    { file: "Inter-Black.otf", name: "Inter" },

    // Clean Sans-Serif Body (Segoe UI & Roboto)
    { file: "segoeui.ttf", name: "Segoe UI" },
    { file: "segoeuib.ttf", name: "Segoe UI" },

    // Technical Monospace & Bento Counters (Consolas)
    { file: "consola.ttf", name: "Consolas" },
    { file: "consolab.ttf", name: "Consolas" },

    // Color Emojis (Registered after text fonts so Latin glyphs are never corrupted)
    { file: "NotoColorEmoji.ttf", name: "Noto Color Emoji" },
  ];

  // Register all local fonts found in fonts/ or assets/fonts/
  const registeredLocal = new Set();
  for (const dir of LOCAL_FONT_DIRS) {
    if (!fs.existsSync(dir)) continue;

    for (const { file, name } of localFonts) {
      const fullPath = path.join(dir, file);
      if (fs.existsSync(fullPath)) {
        try {
          GlobalFonts.registerFromPath(fullPath, name);
          registeredLocal.add(file);
        } catch {}
      }
    }
  }

  // 2. System fallbacks (for environments where system packages exist)
  const systemFallbacks = [
    // Linux system paths
    { p: "/usr/share/fonts/opentype/inter/Inter-Bold.otf", name: "Inter" },
    { p: "/usr/share/fonts/opentype/inter/Inter-Regular.otf", name: "Inter" },
    { p: "/usr/share/fonts/truetype/roboto/unhinted/RobotoTTF/Roboto-Bold.ttf", name: "Roboto" },
    { p: "/usr/share/fonts/truetype/roboto/unhinted/RobotoTTF/Roboto-Regular.ttf", name: "Roboto" },
    { p: "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf", name: "Liberation Sans" },
    { p: "/usr/share/fonts/truetype/liberation/LiberationMono-Bold.ttf", name: "Liberation Mono" },
    { p: "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", name: "DejaVu Sans" },
    { p: "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf", name: "DejaVu Sans Mono" },
    { p: "/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf", name: "Noto Color Emoji" },
    { p: "/usr/share/fonts/truetype/ancient-scripts/Symbola_hint.ttf", name: "Symbola" },

    // Windows system paths
    { p: "C:/Windows/Fonts/bahnschrift.ttf", name: "Bahnschrift" },
    { p: "C:/Windows/Fonts/segoeui.ttf", name: "Segoe UI" },
    { p: "C:/Windows/Fonts/segoeuib.ttf", name: "Segoe UI" },
    { p: "C:/Windows/Fonts/consola.ttf", name: "Consolas" },
    { p: "C:/Windows/Fonts/consolab.ttf", name: "Consolas" },
    { p: "C:/Windows/Fonts/seguiemj.ttf", name: "Segoe UI Emoji" },
  ];

  for (const { p, name } of systemFallbacks) {
    if (fs.existsSync(p)) {
      try {
        GlobalFonts.registerFromPath(p, name);
      } catch {}
    }
  }

  fontsInitialized = true;
}

// Auto-initialize on module load
initCanvasFonts();

// Primary Typography Stacks:
// Standard Text Fonts ALWAYS precede Emoji fallbacks to prevent glyph corruption
const SANS = '"Inter", Bahnschrift, "Segoe UI", "Roboto", "Liberation Sans", "DejaVu Sans", Arial, sans-serif';
const MONO = 'Consolas, "Liberation Mono", "DejaVu Sans Mono", monospace';
const EMOJI = '"Noto Color Emoji", "Segoe UI Emoji", "Apple Color Emoji", Symbola, sans-serif';

const FONTS = {
  // Title / Heading Font: Inter / Bahnschrift / Segoe UI with emoji support
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
  LOCAL_FONT_DIRS,
};
