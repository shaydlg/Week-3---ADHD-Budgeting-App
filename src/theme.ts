"use client";

// This file defines the app's visual theme: its colors, rounded corners, and font.
// Material UI reads this and applies it everywhere, so the whole app stays consistent.
// The "use client" line at the top is required because the theme runs in the browser.

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#0e90a8" }, // calm blue-leaning teal
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
