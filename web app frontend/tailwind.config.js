/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: '#14110F',
        'ink-muted': '#6B6560',
        paper: '#FAF9F7',
        surface: '#FFFFFF',
        'surface-2': '#F5F5F4',
        accent: '#C2410C',
        'accent-hover': '#9A3412',
        success: '#15803D',
        warning: '#B45309',
        danger: '#B91C1C',
        info: '#1E40AF',
        border: '#E7E5E4'
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace']
      },
      borderRadius: {
        'btn': '6px',
        'card': '8px',
        'chip': '4px'
      }
    },
  },
  plugins: [],
}
