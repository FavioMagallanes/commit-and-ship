/**
 * Prettier configuration.
 * Tailwind class sorting is handled by prettier-plugin-tailwindcss (must stay last in `plugins`).
 *
 * @type {import("prettier").Config & import("prettier-plugin-tailwindcss").PluginOptions}
 */
const config = {
  endOfLine: "lf",
  printWidth: 100,
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindStylesheet: "./src/app/globals.css",
  tailwindFunctions: ["cn", "cva", "clsx"],
};

export default config;
