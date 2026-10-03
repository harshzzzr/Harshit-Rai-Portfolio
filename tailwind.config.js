/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      colors: {
        architectural: {
          dark: '#0C0C0C',
          secondaryDark: '#101112',
          elevatedDark: '#141516',
          light: '#F2F1ED',
          secondaryLight: '#E9E8E3',
          elevatedLight: '#FFFFFF',
          textDark: '#D7E2EA',
          mutedDark: 'rgba(215, 226, 234, 0.50)',
          secondaryTextDark: 'rgba(215, 226, 234, 0.70)',
        },
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        surface: {
          light: '#ffffff',
          dark: '#101112',
          cardLight: '#ffffff',
          cardDark: '#101112',
        }
      },
      borderRadius: {
        'sm': '8px',
        'md': '14px',
        'lg': '20px',
        'xl': '28px',
        '2xl': '32px',
      },
      boxShadow: {
        'card-light': '0 1px 0 rgba(255, 255, 255, 0.8) inset, 0 8px 24px rgba(0, 0, 0, 0.04), 0 24px 60px rgba(0, 0, 0, 0.03)',
        'card-dark': '0 1px 0 rgba(255, 255, 255, 0.04) inset, 0 8px 24px rgba(0, 0, 0, 0.12), 0 24px 60px rgba(0, 0, 0, 0.10)',
        'glass-dark': '0 1px 0 rgba(255, 255, 255, 0.04) inset, 0 8px 24px rgba(0, 0, 0, 0.12), 0 24px 60px rgba(0, 0, 0, 0.10)',
        'glass-modal': '0 1px 0 rgba(255, 255, 255, 0.06) inset, 0 12px 32px rgba(0, 0, 0, 0.35)',
      },
      backdropBlur: {
        'glass': '32px',
        'glass-subtle': '24px',
        'glass-strong': '40px',
        'glass-mobile': '20px',
      },
      letterSpacing: {
        'editorial': '-0.035em',
        'editorial-tight': '-0.04em',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out forwards',
        'slide-down': 'slideDown 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      }
    },
  },
  plugins: [],
}
