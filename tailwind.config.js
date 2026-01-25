const colors = require('./src/components/ui/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter'],
        garamond: ['EBGaramond-Regular'],
        'garamond-medium': ['EBGaramond-Medium'],
        'garamond-semibold': ['EBGaramond-SemiBold'],
        'garamond-bold': ['EBGaramond-Bold'],
        'garamond-extrabold': ['EBGaramond-ExtraBold'],
        roboto: ['Roboto-Regular'],
        'roboto-light': ['Roboto-Light'],
        'roboto-medium': ['Roboto-Medium'],
        'roboto-semibold': ['Roboto-SemiBold'],
        'roboto-bold': ['Roboto-Bold'],
        'roboto-extrabold': ['Roboto-ExtraBold'],
        brownstd: ['BrownStd-Regular'],
        'brownstd-bold': ['brownstd-Bold'],
        'biro-script': ['biro-script'],
      },
      colors,
    },
  },
  plugins: [],
};
