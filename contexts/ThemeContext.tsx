import React from "react";

// Helpful link for this: https://savaslabs.com/blog/using-react-global-state-hooks-and-context
// This link also includes links to react Context and Hooks tutorials and use.
/*
Title: Using React Global with State Hooks and Context
Author: Maddy Closs
Date: June 25, 2020
Code version: Not Specified
Availability: https://savaslabs.com/blog/using-react-global-state-hooks-and-context
*/

export type ThemeColors = {
  primary: string | undefined,
  secondary: string | undefined,
  tertiary: string | undefined,
  dark: string | undefined,
  light: string | undefined,
  text: string | undefined,
  background: string | undefined,
  surface: string | undefined,
  error: string | undefined
}

export class Theme {
  colors: ThemeColors;

  constructor(themeColors: ThemeColors) {
    this.colors = themeColors;
  }
}

const ThemeContext = React.createContext<{theme: Theme, setTheme: () => {}}>(undefined!);

export default ThemeContext;