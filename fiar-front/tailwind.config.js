/** @type {import('tailwindcss').Config} */

// Inline Prizma Tailwind preset (wired to CSS variables from prizma-tokens)
const ramp = (group) => {
  // Color ramps: primary, accent, slate, etc.
  // This uses CSS vars that must be set by importing prizma-tokens CSS
  const colors = {};
  const commonGroups = {
    primary: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'],
    accent: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'],
    slate: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'],
  };
  (commonGroups[group] || []).forEach(shade => {
    colors[shade] = `var(--c-${group}-${shade})`;
  });
  return colors;
};

const prizmaTailwindPreset = {
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "var(--c-primary)", ...ramp("primary") },
        accent: { DEFAULT: "var(--c-accent)", ...ramp("accent") },
        slate: ramp("slate"),
        success: "var(--c-success)",
        warning: "var(--c-warning)",
        danger: "var(--c-danger)",
        info: "var(--c-info)",
        bg: "var(--c-bg)",
        "bg-subtle": "var(--c-bg-subtle)",
        surface: "var(--c-surface)",
        "surface-raised": "var(--c-surface-raised)",
        "surface-sunken": "var(--c-surface-sunken)",
        border: "var(--c-border)",
        "border-strong": "var(--c-border-strong)",
        text: "var(--c-text)",
        "text-muted": "var(--c-text-muted)",
        "text-subtle": "var(--c-text-subtle)",
        module: "var(--c-accent-module)",
        "module-tint": "var(--c-accent-module-tint)",
        "module-text": "var(--c-accent-module-text)",
      },
      fontFamily: {
        display: ["Sora", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SF Mono", "Menlo", "monospace"],
      },
      borderRadius: {
        sm: "var(--c-radius-sm)", md: "var(--c-radius-md)", lg: "var(--c-radius-lg)",
        xl: "var(--c-radius-xl)", "2xl": "var(--c-radius-2xl)", full: "var(--c-radius-full)", none: "var(--c-radius-none)",
      },
      boxShadow: {
        xs: "var(--c-shadow-xs)", sm: "var(--c-shadow-sm)", md: "var(--c-shadow-md)",
        lg: "var(--c-shadow-lg)", xl: "var(--c-shadow-xl)", glow: "var(--c-shadow-glow)",
      },
      backgroundImage: {
        corriente: "var(--c-gradient-corriente)",
        caudal: "var(--c-gradient-caudal)",
        aurora: "var(--c-gradient-aurora)",
        mist: "var(--c-gradient-mist)",
        sheen: "var(--c-gradient-sheen)",
        "primary-grad": "var(--c-primary-grad)",
        "accent-grad": "var(--c-accent-grad)",
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      ringColor: { DEFAULT: "rgb(var(--c-ring-channels) / <alpha-value>)" },
      transitionDuration: { fast: "var(--c-duration-fast)", base: "var(--c-duration-base)", slow: "var(--c-duration-slow)", slower: "var(--c-duration-slower)" },
      transitionTimingFunction: { flow: "var(--c-ease-flow)", standard: "var(--c-ease-standard)" },
    },
  },
  plugins: [],
};

module.exports = {
  presets: [prizmaTailwindPreset],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
