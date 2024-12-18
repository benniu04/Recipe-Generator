/** @type {import('tailwindcss').Config} */
export default  {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontSize: {
        'custom-size': '36px', // Custom font size
      },
      colors: {
        cream: '#f5f5dc', // Custom color
      },
      fontFamily: {
        'libre': ['"Libre Baskerville"', 'serif'],
      },
    },
  },
  plugins: [],
}