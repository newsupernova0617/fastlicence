/** @type {import('tailwindcss').Config} */
const config = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        fastsaas: {
          primary: '#2563EB',
          'primary-content': '#FFFFFF',
          secondary: '#F97316',
          'secondary-content': '#1B1400',
          accent: '#0EA5E9',
          'accent-content': '#022C42',
          neutral: '#101828',
          'neutral-content': '#F5F7FD',
          'base-100': '#FFFFFF',
          'base-200': '#F3F5FB',
          'base-300': '#E2E8F0',
          'base-content': '#1F2937',
          info: '#0284C7',
          success: '#16A34A',
          warning: '#D97706',
          error: '#DC2626'
        }
      },
      'light'
    ]
  },
};

export default config;
