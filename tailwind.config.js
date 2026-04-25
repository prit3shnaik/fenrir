/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx,js,jsx}',
    './components/**/*.{ts,tsx,js,jsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark mode
        bg:          'var(--color-bg)',
        surface:     'var(--color-surface)',
        border:      'var(--color-border)',
        accent:      'var(--color-accent)',
        accentHover: 'var(--color-accent-hover)',
        accentGlow:  'var(--color-accent-glow)',
        danger:      '#ef4444',
        warn:        '#f59e0b',
        safe:        '#10b981',
        muted:       'var(--color-muted)',
        text:        'var(--color-text)',
        textDim:     'var(--color-text-dim)',
      },
      boxShadow: {
        glow:   '0 0 20px var(--color-accent-glow)',
        danger: '0 0 20px #ef444433',
      },
    },
  },
  plugins: [],
}
