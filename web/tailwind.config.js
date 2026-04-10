/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy:  '#0B1F3A',
        teal:  '#028090',
        tealL: '#00A896',
        gold:  '#F4A61D',
      },
    },
  },
  plugins: [],
};
