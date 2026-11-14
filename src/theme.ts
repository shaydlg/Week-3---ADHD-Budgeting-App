"use client";

// This file defines the app's visual theme: its colors, rounded corners, and font.
// Material UI reads this and applies it everywhere, so the whole app stays consistent.
// The "use client" line at the top is required because the theme runs in the browser.

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    // Calm blue-leaning teal, darkened from #0e90a8 so white text on filled
    // buttons (and the teal used for link/text buttons) clears WCAG 2.2 AA:
    // #0a7f94 on white is 4.69:1, above the 4.5:1 minimum for normal text.
    primary: { main: "#0a7f94", contrastText: "#ffffff" },
    secondary: { main: "#534ab7" }, // soft purple
    background: { default: "#f7f8f6", paper: "#ffffff" },
  },
  shape: {
    borderRadius: 12, // gentle, rounded corners
  },
  typography: {
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
  },
});

export default theme;
