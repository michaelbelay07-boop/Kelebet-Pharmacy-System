export default {
  content: ['./index.html','./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: { 50:'#edfaf4',100:'#d3f3e5',200:'#aae6ce',300:'#74d2b1',400:'#41b891',500:'#22a07a',600:'#178063',700:'#146652',800:'#125443',900:'#0f4238' },
      },
      fontFamily: { sans: ['"Plus Jakarta Sans"','sans-serif'] },
    }
  },
  plugins: [],
}
