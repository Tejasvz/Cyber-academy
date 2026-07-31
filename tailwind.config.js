/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0d0d12', // Near-black/charcoal
        surface: '#171721',
        primary: 'var(--color-primary, #00f0ff)',
        secondary: 'var(--color-secondary, #ff00ff)',
        success: '#39ff14', // Green
        warning: '#ffb000', // Amber
        error: '#ff2a2a', // Red
        textMain: '#e2e2e8', // Off-white / pale gray
        textMuted: '#8a8a9a',
      },
      fontFamily: {
        mono: ['"Fira Code"', 'Consolas', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'neon': '0 0 10px var(--color-primary-glow, rgba(0, 240, 255, 0.4))',
      }
    },
  },
  plugins: [],
}
