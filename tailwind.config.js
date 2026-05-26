/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"',
          '"Segoe UI"', 'system-ui', 'sans-serif',
        ],
      },
      colors: {
        brand: {
          DEFAULT: '#1a3255',
          light:   '#26456e',
          faint:   '#eef2f8',
        },
      },
      borderRadius: {
        card: '16px',
        btn:  '12px',
      },
    },
  },
  plugins: [],
}
