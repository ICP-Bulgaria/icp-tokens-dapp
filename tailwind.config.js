/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './ui/components/**/*.{js,ts,jsx,tsx,mdx}'
    // Or if using `src` directory:
  ],
  theme: {
    extend: {
      colors: {
        'token-title-green': '#019a9a',
        'active-link-green': '#019A9AFF',
        'mobile-menu-grey': '#565D6DFF',
        'background-hover-menu': '#F5F5F5'
      },

      keyframes: {
        fadeInLeft: {
          '0%': { opacity: 0, transform: 'translateX(-200px)' },
          '100%': { opacity: 1, transform: 'translateX(0px)' },
        },
        fadeInRight: {
          '0%': { opacity: 1, transform: 'translateX(0)' },
          '100%': { opacity: 0, transform: 'translateX(-200px)' },
        }
      },
      animation: {
        fadeInLeft: 'fadeInLeft 0.5s ease-in-out',
        fadeInRight: 'fadeInRight 0.5s ease-in-out',
      }
    },
  },
  plugins: []
};
