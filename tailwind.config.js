/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx,js,jsx}',
    './components/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0f',
        surface: '#111118',
        border: '#1e1e2e',
        accent: '#7c3aed',
        accentHover: '#6d28d9',
        accentGlow: '#7c3aed33',
        danger: '#ef4444',
        warn: '#f59e0b',
        safe: '#10b981',
        muted: '#6b7280',
        text: '#e2e8f0',
        textDim: '#94a3b8',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 20px #7c3aed33',
        danger: '0 0 20px #ef444433',
      },
    },
  },
  plugins: [],
}
