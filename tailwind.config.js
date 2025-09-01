/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Garden-themed color palette
        garden: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        earth: {
          50: '#fefce8',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        soil: {
          50: '#f7f3f0',
          100: '#ede4d3',
          200: '#dbc5a4',
          300: '#c4a26f',
          400: '#b08647',
          500: '#9c7339',
          600: '#855d30',
          700: '#6f4a2a',
          800: '#5d3e27',
          900: '#513525',
          950: '#2d1c12',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      backgroundImage: {
        'garden-gradient': 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0f9ff 100%)',
        'canvas-gradient': 'linear-gradient(45deg, #fefce8 0%, #f7fee7 50%, #ecfccb 100%)',
        'earth-gradient': 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)',
        'sky-gradient': 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 50%, #93c5fd 100%)',
        'leaf-gradient': 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 50%, #86efac 100%)',
      },
      boxShadow: {
        'garden': '0 10px 25px -5px rgba(132, 204, 22, 0.1), 0 4px 6px -2px rgba(132, 204, 22, 0.05)',
        'garden-hover': '0 20px 40px -10px rgba(132, 204, 22, 0.15), 0 8px 16px -4px rgba(132, 204, 22, 0.1)',
        'canvas': '0 10px 25px -5px rgba(132, 204, 22, 0.1), 0 4px 6px -2px rgba(132, 204, 22, 0.05), inset 0 2px 4px rgba(255, 255, 255, 0.4)',
        'canvas-hover': '0 20px 40px -10px rgba(132, 204, 22, 0.15), 0 8px 16px -4px rgba(132, 204, 22, 0.1), inset 0 2px 4px rgba(255, 255, 255, 0.4)',
        'lift': '0 20px 40px -10px rgba(0, 0, 0, 0.1), 0 8px 16px -4px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'gentle-pulse': 'gentle-pulse 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'gentle-pulse': {
          '0%, 100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
          '50%': {
            opacity: '0.8',
            transform: 'scale(1.05)',
          },
        },
        float: {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-10px)',
          },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}