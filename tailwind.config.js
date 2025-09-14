/** @type {import('tailwindcss').Config} */
//export default {
  //content: [
    //"./index.html",
    //"./src/**/*.{js,jsx}",
  //],
  //theme: {
    //extend: {},
  //},
  //plugins: [],
//};
//*/



/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4f46e5",
        secondary: "#f59e0b",
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
};