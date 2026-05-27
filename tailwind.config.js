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
          DEFAULT: '#A88BFA',  // Violet-400 — used for spinner / focus rings
          light:   '#C4B5FD',
          dark:    '#8B5CF6',
          faint:   '#F5F3FF',
        },
        mochi: {
          text:  '#4B4552',   // warm gray-purple body text
          cream: '#FCFAFA',   // warm off-white background
        },
        candy: {
          pink:   '#f9a8d4',
          yellow: '#fde047',
          mint:   '#86efac',
          purple: '#d8b4fe',
          peach:  '#fca5a5',
          blue:   '#93c5fd',
        },
      },
      borderRadius: {
        card: '2rem',
        btn:  '9999px',
      },
      boxShadow: {
        kawaii: '0 8px 30px rgba(0,0,0,0.03)',
        mochi:  '0 8px 30px rgba(168,139,250,0.10), 0 2px 8px rgba(244,114,182,0.06)',
      },
    },
  },
  plugins: [],
}
