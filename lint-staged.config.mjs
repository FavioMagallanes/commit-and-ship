/** @type {import("lint-staged").Configuration} */
const config = {
  "*.{js,jsx,mjs,cjs,ts,tsx}": ["eslint --fix --no-warn-ignored", "prettier --write"],
  "*.{json,md,mdx,css,yml,yaml}": "prettier --write",
};

export default config;
