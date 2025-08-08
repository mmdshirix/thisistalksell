/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
    // Note: cssnano removed to prevent "Cannot find module 'cssnano'" in CI.
    // Next.js already minifies CSS/JS in production builds.
  }
}

export default config
