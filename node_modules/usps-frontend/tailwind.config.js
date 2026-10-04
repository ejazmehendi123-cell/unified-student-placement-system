/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1B2A4A', // Ink Navy
          light: '#24375F',
          dark: '#121C32',
          50: '#F0F3F9',
          100: '#E1E7F2',
          800: '#1B2A4A',
          900: '#121C32',
        },
        paper: {
          DEFAULT: '#FAF7F1', // Paper background
          light: '#FFFFFF',
          dark: '#F2ECE1',
          muted: '#EAE2D3',
        },
        charcoal: {
          DEFAULT: '#23262B', // Charcoal text
          muted: '#5A606A',
          light: '#848C98',
          border: '#D8D3C8',
        },
        brass: {
          DEFAULT: '#B8863B', // Warm Brass Accent
          light: '#D49F4E',
          dark: '#936625',
          50: '#FDF8F0',
        },
        sage: {
          DEFAULT: '#4C7A63', // Muted Sage Success
          light: '#5D9479',
          dark: '#385A49',
          50: '#F0F6F3',
        },
        clay: {
          DEFAULT: '#B4543E', // Muted Clay Danger
          light: '#CC6750',
          dark: '#8C3D2B',
          50: '#FAF1EF',
        },
      },
      fontFamily: {
        serif: ['"Source Serif 4"', '"IBM Plex Serif"', 'Georgia', 'serif'],
        sans: ['"Public Sans"', '"IBM Plex Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px rgba(27, 42, 74, 0.05), 0 1px 2px rgba(27, 42, 74, 0.03)',
        card: '0 2px 6px rgba(27, 42, 74, 0.06), 0 1px 3px rgba(27, 42, 74, 0.04)',
        elevated: '0 10px 25px -5px rgba(27, 42, 74, 0.08), 0 8px 10px -6px rgba(27, 42, 74, 0.04)',
      },
      borderRadius: {
        'academic': '4px',
      }
    },
  },
  plugins: [],
}
