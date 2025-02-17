/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        attention: {
          '0%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(99, 102, 241, 0.7)' },
          '70%': { transform: 'scale(1.1)', boxShadow: '0 0 0 10px rgba(99, 102, 241, 0)' },
          '100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(99, 102, 241, 0)' }
        },
        'fill-button': {
          '0%': { width: '0%' },
          '100%': { width: '100%' }
        },
        'progress-fill': {
          '0%': { 
            width: '0%',
            opacity: '0.5'
          },
          '100%': { 
            width: '100%',
            opacity: '0.5'
          }
        }
      },
      animation: {
        attention: 'attention 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fill-button': 'fill-button 3s linear forwards',
        'progress-fill': 'progress-fill 3s linear forwards'
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
