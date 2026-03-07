import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
      colors: {
        cream: {
          50: '#FDFCFA',
          100: '#FAF9F6',
          200: '#F5F3EF',
          300: '#EBE7E0',
        },
        gold: {
          300: '#D4AD6A',
          400: '#C9923C',
          500: '#B8832E',
          600: '#A07228',
          700: '#8A6223',
        },
        dark: {
          700: '#1C1917',
          800: '#141210',
          900: '#0A0A0A',
          950: '#050505',
        },
        safety: {
          50: '#f0fdf4',
          100: '#dcfce7',
          700: '#15803d',
          800: '#166534',
        },
        match: {
          50: '#eff6ff',
          100: '#dbeafe',
          700: '#1d4ed8',
          800: '#1e40af',
        },
        reach: {
          50: '#fff7ed',
          100: '#ffedd5',
          700: '#c2410c',
          800: '#9a3412',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      boxShadow: {
        'soft': '0 2px 20px rgba(0, 0, 0, 0.04)',
        'card': '0 4px 30px rgba(0, 0, 0, 0.06)',
        'glow': '0 0 40px rgba(201, 146, 60, 0.15)',
      },
    },
  },
  plugins: [],
}

export default config
