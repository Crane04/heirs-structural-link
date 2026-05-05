/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#061425',
        surface: '#0B1F36',
        surface2: '#0E2A3F',
        border: '#123052',
        teal: '#2AAE9B',   // muted accent (avoid neon)
        tealL: '#74E3D3',  // highlight accent (use sparingly)
        gold: '#D9A441',
      },
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
