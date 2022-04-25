import { createMuiTheme } from "@material-ui/core/styles";
import { blueGrey, lightGreen } from "@material-ui/core/colors";

const theme = createMuiTheme({
  palette: {
    primary: {
      light: "#a5c514",
      main: "#a5c514",
      dark: "#a5c514",
      contrastText: "#fff",
    },
    secondary: {
      light: "#a5c514",
      main: "#a5c514",
      dark: "#a5c514",
      contrastText: "#000",
    },
    openTitle: blueGrey["400"],
    protectedTitle: lightGreen["400"],
    type: "light",
  },
});

export default theme;
