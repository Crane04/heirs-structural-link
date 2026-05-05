/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        offwhite: '#F7F3EA',
        ink: '#061425',
        navy: '#061425',
        surface: '#FFFFFF',
        surface2: '#F3EFE6',
        border: '#E1DACF',
        gold: '#D9A441',
      },
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
