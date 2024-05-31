// React, React Native, & Expo Components
import { useEffect, useRef, useState } from "react";
import { 
  View, 
  SafeAreaView, 
  TouchableNativeFeedback, 
  Image, 
  Modal, 
  Animated, 
  StyleSheet, 
  Platform,
  Text,
  Keyboard
} from "react-native";
import { StatusBar } from "expo-status-bar";

// Third Party Components
import MaskedView from '@react-native-masked-view/masked-view';
import AsyncStorage from "@react-native-async-storage/async-storage";

// My Custom Components & Functions
import Globals from "../Globals";
import AppContext from "../components/AppContext";
import { PageFooter, PageContent, PageHeader } from "./PageComponents";
import { HomeScreen, PrematchScreen, SaveMatchDataScreen } from "./Screens/Screens";
import { FormBuilder, GetFormJSONAsMatch, exampleJson } from "./FormBuilder";
import { DeflateString, InflateString } from "../backend/DataCompression";

const MobileApp = () => {

  // Load Resources
  const lightningImage = require('../assets/862gigawatt.png');

  // App Start
  useEffect(() => {
    AsyncStorage.getItem('stored matches').then((data) => {
      if (data) {
        console.log('Loaded stored matches');
        console.log(data)
        setStoredMatchData(JSON.parse(data));
      }
    });
  }, []);

  // Match States
  const [storedMatchData, setStoredMatchData] = useState([]);
  const [matchData, setMatchData] = useState({});
  const [formInfo, setFormInfo] = useState(
    [
      {
        screen: PrematchScreen, 
        name: 'Prematch', 
        infoText: 'Put current event here',
        onBack: () => setScreens([{screen: HomeScreen, name: 'Home'}])
      },
      ...FormBuilder(exampleJson).map((form) => ({screen: form.screen, name: form.name})),
      {
        screen: SaveMatchDataScreen,
        name: 'Save Match Data',
        infoText: 'Put current event here',
      }
    ]
  );

  function storeMatch(match) {
    const compressedMatch = DeflateString(JSON.stringify(match));
    const newStoredMatchData = [...storedMatchData, compressedMatch];

    setStoredMatchData(newStoredMatchData);
    AsyncStorage.setItem('stored matches', JSON.stringify(newStoredMatchData));
  }

  // Changing / Displaying Screens
  const [screens, setScreens] = useState([{screen: HomeScreen, name: 'Home', onNext: undefined, onBack: undefined}]);
  const [screenIndex, setScreenIndex] = useState(0);

  useEffect(() => {
    setScreenIndex(0);
  }, [screens]);

  function slideScreen(dist) {
    setScreenIndex(screenIndex + dist);
  }

  function DisplayScreen({component, gradientDir}) {
    return component({gradientDir});
  }

  // An animated variable for the loading screen, and starting a loading animation
  const [loading, setLoading] = useState(false);
  const loadingAnimation = useRef(new Animated.Value(0)).current;
  const loadingPercent = loadingAnimation.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%']
  });

  function setLoadPercent(toPcnt = 100) {
    setLoading(true);
    Animated.timing(loadingAnimation, {
      toValue: toPcnt,
      duration: 300,
      useNativeDriver: false
    }).start(() => {
      if (toPcnt >= 100) {
        setLoading(false);
        loadingAnimation.setValue(0);
      }
    });
  }

  const LoadingModal = () => {
    return (
    <Modal
      style={{zIndex: -1000}}
      animationType={"fade"}
      transparent={false}
      visible={loading}
      onRequestClose={() => {
        setVisible(false);
      }}
    >
      <View style={{width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: Globals.PageColor}}>
        <View style={{width: '80%', height: '50%', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent'}}>
          <View style={{width: '100%', height: '100%', position: 'absolute', alignItems: 'center', justifyContent: 'center'}}>
            <Image source={lightningImage} tintColor={'white'}/>
            <View style={{width: 224, height: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', borderRadius: 40}}/>
          </View>
          <MaskedView
            style={{ flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center'}}
            maskElement={
              <Animated.View style={{height: '100%', width: loadingPercent, backgroundColor: 'blue', justifyContent: 'center', alignItems: 'center'}}/>
            }
          >
            <Image source={lightningImage}/>
            <View style={{width: 224, height: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'orange', borderRadius: 40}}/>
          </MaskedView>
        </View>
      </View>
    </Modal>
    );
  }

  const states = {
    screens,
    setScreens,
    screenIndex,
    setScreenIndex,
    matchData,
    setMatchData,

    formInfo,
    storedMatchData,

    slideScreen,
    setLoadPercent,
    storeMatch,
  }

  if (screenIndex >= screens.length) {
    setScreenIndex(0); 
    return null;
  }

  return (
    <AppContext.Provider value={states}>
      <TouchableNativeFeedback onPress={() => Keyboard.dismiss()}>
        <SafeAreaView style={{flex: 1, justifyContent: 'stretch', alignItems: 'stretch', backgroundColor: Globals.PageContainerColor, flexDirection: 'row', overflow: 'visible'}}>
          { screens.length > 0 ? <DisplayScreen key={screenIndex} component={screens[screenIndex].screen} gradientDir={(screenIndex) % 2}/> : null }
          <LoadingModal/>
        </SafeAreaView>
      </TouchableNativeFeedback>
    </AppContext.Provider>
  );
}

export default MobileApp;