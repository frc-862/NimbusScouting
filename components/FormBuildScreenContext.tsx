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
export type FormBuildScreenContextType = {
  formJson: any,
  setFormJson: (formJson: any) => void
}


const FormBuildScreenContext = React.createContext<FormBuildScreenContextType>(undefined!);

export default FormBuildScreenContext;