import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'f1-red': '#E10600',
        'f1-bg': '#15151E',
        'f1-surface': '#1E1E28',
        'f1-text-primary': '#FFFFFF',
        'f1-text-secondary': '#9E9E9E',
        'f1-accent': '#FF1801',
        'f1-success': '#00D9FF',
        'f1-grid': '#2A2A35',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config

