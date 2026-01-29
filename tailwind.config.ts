import type { Config } from 'tailwindcss'
import heroPatterns from 'tailwindcss-hero-patterns'

export default {
  darkMode: 'class',
  content: [
    './app/components/**/*.{js,vue,ts}',
    './app/layouts/**/*.vue',
    './app/pages/**/*.vue',
    './app/plugins/**/*.{js,ts}',
    './app/app.vue',
    './app/error.vue'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter Variable', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
      },
      colors: {
        // Primary color (alias for brand-blue)
        'primary': {
          50: '#eef2ff',
          100: '#dce6ff',
          200: '#baccff',
          300: '#8aabff',
          400: '#5478e6',
          500: '#2b4bbf',
          600: '#233da0',
          700: '#1c3080',
          800: '#152460',
          900: '#0e1840'
        },
        'brand-blue': {
          50: '#eef2ff',
          100: '#dce6ff',
          200: '#baccff',
          300: '#8aabff',
          400: '#5478e6',
          500: '#2b4bbf',
          600: '#233da0',
          700: '#1c3080',
          800: '#152460',
          900: '#0e1840'
        },
        'brand-red': {
          50: '#fff5f5',
          100: '#ffe3e3',
          200: '#ffc9c9',
          300: '#ffa0a0',
          400: '#f75555',
          500: '#f32525',
          600: '#d91f1f',
          700: '#b31919',
          800: '#8c1414',
          900: '#660f0f'
        }
      }
    }
  },
  plugins: [heroPatterns]
} satisfies Config
