/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './public/**/*.html',
  ],
  theme: {
    extend: {
      animation: {
        'slideIn': 'slideIn 0.3s ease-out',
        'slideOut': 'slideOut 0.3s ease-in',
        'pulse': 'pulse 2s infinite',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideOut: {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      colors: {
        'fcm-success': '#10b981',
        'fcm-error': '#ef4444',
        'fcm-warning': '#f59e0b',
        'fcm-info': '#3b82f6',
      },
      fontFamily: {
        'mono': ['Courier New', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      zIndex: {
        '9999': '9999',
      },
    },
  },
  plugins: [],
}
