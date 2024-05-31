import React, { useState }from 'react';
import AppContext from "../components/AppContext";
import HomeScreen from './Screens/HomeScreen';

const WebApp = () => {
  const [screens, setScreens] = useState([HomeScreen]);
  const [screenIndex, setScreenIndex] = useState(0);

  const states = {
    setScreens: setScreens,
    setScreenIndex: setScreenIndex,
  }

  const DisplayScreen = () => {
    return screens[screenIndex]();
  }

  return (
    <AppContext.Provider value={states}>
      <DisplayScreen/>
    </AppContext.Provider>
  )
}

export default WebApp