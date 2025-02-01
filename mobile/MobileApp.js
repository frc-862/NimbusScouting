// React, React Native, & Expo Components
import { memo, useEffect, useRef, useState } from "react";
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

// Third Party Components
import MaskedView from '@react-native-masked-view/masked-view';
import AsyncStorage from "@react-native-async-storage/async-storage";

// My Custom Components & Functions
import Globals from "../Globals";
import AppContext from "../components/AppContext";
import { HomeScreen, PrematchScreen, SaveMatchScreen } from "./Screens/Screens";
import { FormBuilder, GetFormJSONAsMatch, exampleJson } from "./FormBuilder";
import { DeflateString, InflateString } from "../backend/DataCompression";
import { getBlueAllianceDataFromURL, getBlueAllianceMatches, getBlueAllianceTeams } from "../backend/APIRequests";

const DisplayScreen = ({Component, gradientDir}) => {
  return <Component gradientDir={gradientDir}/>;
};

const MobileApp = () => {
  // Load Resources
  const lightningImage = require('../assets/862gigawatt.png');

  async function appStart() {
    setLoadPercent(0, 0);

    // Use for testing having some empty keys in the storage.
    // await AsyncStorage.multiRemove(await AsyncStorage.getAllKeys())

    let year = String(new Date().getFullYear());
    let event = "";

    // Load the year from storage
    await AsyncStorage.getItem('scouting settings').then((data) => {
      if (data) {
        let parsed = JSON.parse(data);
        setScoutingSettings(JSON.parse(data));
        year = parsed.year;
        event = parsed.event;
        return;
      }
      setScoutingSettings({event: 'none', year: year});
      AsyncStorage.setItem('scouting settings', JSON.stringify({event: 'none', year: year}));
    });

    // Load the events for the year
    await AsyncStorage.getItem('events').then((data) => {
      if (data) { 
        setEvents(JSON.parse(data));
        return; 
      }

      getBlueAllianceDataFromURL("events/" + year + "/simple").then((data) => {
        let eventStuff = data.map((event) => ({key: event.key, name: event.name}));
        setEvents(eventStuff);
        AsyncStorage.setItem('events', JSON.stringify(eventStuff));
      });
    });

    // Load the matches for our event
    await AsyncStorage.getItem('event matches').then((data) => {
      if (data) {
        setEventMatches(JSON.parse(data));
        return;
      }

      getBlueAllianceMatches(event, 3000).then((data) => {
        setEventMatches(data);
        AsyncStorage.setItem('event matches', JSON.stringify(data));
      });
    });

    // Ensure that you have a base value stored for your server info.
    await AsyncStorage.getItem('serverInfo').then((data) => {
      if (!data) {
        AsyncStorage.setItem('serverInfo', JSON.stringify({ip: '10.168.88.99', port: 4000, timeout: 1000}));
      }
    });

    await AsyncStorage.getItem('currentForm').then((data) => {
      if (data) {
        setCurrentForm(JSON.parse(data));
      }
    });

    await AsyncStorage.getItem('stored view matches').then((data) => {
      if (data) {
        setLoadedMatches(JSON.parse(data).map((match) => JSON.parse(InflateString(match))));
      }
    });

    await AsyncStorage.getItem('stored forms').then((data) => {
      if (data) {
        setLoadedForms(JSON.parse(data).map((form) => JSON.parse(InflateString(form))));
      }
    });

    setLoadPercent(100, 300);
  }

  // App Start
  useEffect(() => {
    appStart();
  }, []);

  // Form states
  const [loadedForms, setLoadedForms] = useState([]);
  const [currentForm, setCurrentForm] = useState(undefined);
  const [formInfo, setFormInfo] = useState(undefined);

  const [scoutingSettings, setScoutingSettings] = useState({event: '2024tnkn', year: 2024});
  const [events, setEvents] = useState('2024tnkn');

  useEffect(() => {
    AsyncStorage.setItem('scouting settings', JSON.stringify(scoutingSettings));
    
    getBlueAllianceDataFromURL("events/" + scoutingSettings.year + "/simple").then((data) => {
      let eventStuff = data.map((event) => ({key: event.key, name: event.name}));
      setEvents(eventStuff);
      AsyncStorage.setItem('events', JSON.stringify(eventStuff));
    });

    getBlueAllianceMatches(scoutingSettings.event, 3000).then((data) => {
      setEventMatches(data);
      AsyncStorage.setItem('event matches', JSON.stringify(data));
    });
  }, [scoutingSettings]);

  useEffect(() => {
    if (currentForm === undefined) {
      return;
    }

    setFormInfo([
      {
        screen: PrematchScreen, 
        name: 'Prematch', 
        infoText: scoutingSettings.eventName,
        onBack: () => setScreens([{screen: HomeScreen, name: 'Home'}])
      },
      ...FormBuilder(JSON.stringify(currentForm.form)).map((form) => ({screen: form.screen, name: form.name, infoText: scoutingSettings.eventName})),
      {
        screen: SaveMatchScreen,
        name: 'Save Match',
        infoText: scoutingSettings.eventName,
      }
    ]);

    setScreens([{screen: HomeScreen, name: 'Home'}]);
  }, [currentForm]);

  // Match States
  const [eventMatches, setEventMatches] = useState([]);
  const [loadedMatches, setLoadedMatches] = useState([]);
  const [matchData, setMatchData] = useState(undefined);

  async function storeMatch(match) {
    const compressedMatch = DeflateString(JSON.stringify(match));

    // The the stored data from our storage and add the new match to it.
    const storedMatchData = await AsyncStorage.getItem('stored matches').then((data) => data ? JSON.parse(data) : []);
    const newStoredMatchData = [...storedMatchData, compressedMatch];

    AsyncStorage.setItem('stored matches', JSON.stringify(newStoredMatchData));
  }

  // Changing / Displaying Screens
  const [screens, setScreens] = useState([{screen: HomeScreen, name: 'Home'}]);
  const [screenIndex, setScreenIndex] = useState(0);

  useEffect(() => {
    setScreenIndex(0);
  }, [screens]);

  useEffect(() => {
    if (matchData === undefined) { return; }
    if (matchData.event !== undefined || matchData.event === scoutingSettings.event) { return; }
    setMatchData({...matchData, event: scoutingSettings.event});
  }, [matchData]);

  function slideScreen(dist) {
    setScreenIndex(screenIndex + dist);
  }

  // An animated variable for the loading screen, and starting a loading animation
  const [loading, setLoading] = useState(true); // Application loads some stuff at the beginning so just keep this true to start.
  const [loadError, setLoadError] = useState(false);
  const loadingAnimation = useRef(new Animated.Value(0)).current;
  const loadingPercent = loadingAnimation.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%']
  });

  async function setLoadPercent(toPcnt = 100, time = 300) {
    await new Promise((resolve) => {
      setLoading(true);
      Animated.timing(loadingAnimation, {
        toValue: toPcnt,
        duration: time,
        useNativeDriver: false
      }).start(() => {
        if (toPcnt >= 100) {
          setLoading(false);
        }
        resolve();
      });
    });
  }

  async function showLoadError(atPcnt = 50) {
    return new Promise(async (resolve) => {
      await setLoadPercent(atPcnt, 300);
      setLoadError(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setLoading(false);
      await new Promise((resolve) => setTimeout(resolve, 300));
      setLoadError(false);
      resolve();
    });
  }

  // Notification states & refs

  // Maybe add a notificaiton queue for multiple messages simultaneously?
  // Notification queue now works a bit, but can bug sometimes and stop giving notifications entirely.
  const notificationAnimation = useRef(new Animated.Value(0)).current;
  const [notificationQueue, setNotificationQueue] = useState([]);
  const [notificationShowing, setNotificationShowing] = useState(false);
  const [notificationInfo, setNotificationInfo] = useState({message: '', color: Globals.NotificationRegularColor});
  const [removeNotification, setRemoveNotification] = useState(false);
  const [notificaitonBoxSize, setNotificationBoxSize] = useState(0);
  const notificationHeight = notificationAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-notificaitonBoxSize, 65]
  });

  useEffect(() => {
    //console.log(notificationQueue)
    if (notificationQueue.length > 0 && !notificationShowing) {
      setNotificationInfo(notificationQueue[0]);
      setNotificationShowing(true);
    }
  }, [notificationQueue]);

  useEffect(() => {
    if (!removeNotification) { return }

    setNotificationQueue(notificationQueue.slice(1));
    setRemoveNotification(false);
    setNotificationShowing(false);
  }, [removeNotification]);

  useEffect(() => {
    if (!notificationShowing) { return }

    Animated.timing(notificationAnimation, {
      toValue: 1,
      duration: 500,
      useNativeDriver: false
    }).start(async () => {
      await new Promise((resolve) => setTimeout(resolve, notificationQueue.length > 1 ? 1000 : 3000));
      Animated.timing(notificationAnimation, {
        toValue: 0,
        duration: 500,
        useNativeDriver: false
      }).start(() => {
        setRemoveNotification(true);
      });
    });
  }, [notificationInfo]);

  async function showNotification(message, color = Globals.NotificationRegularColor) {
    setNotificationQueue([...notificationQueue, {message, color}]);
  }

  const states = {
    screens,
    setScreens,
    screenIndex,
    setScreenIndex,
    matchData,
    setMatchData,
    loadedForms,
    setLoadedForms,
    loadedMatches,
    setLoadedMatches,
    eventMatches,
    setEventMatches,
    formInfo,
    setFormInfo,
    currentForm,
    setCurrentForm,
    events,
    setEvents,
    scoutingSettings,
    setScoutingSettings,

    slideScreen,
    setLoadPercent,
    showLoadError,
    showNotification,
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
          { screens.length > 0 ? <DisplayScreen Component={screens[screenIndex].screen} gradientDir={(screenIndex) % 2}/> : null }
          
          {/* Notification pop-up (down) */}
          <Animated.View onLayout={(event) => {setNotificationBoxSize(event.nativeEvent.layout.height)}} style={{width: '100%', zIndex: 10000, position: 'absolute', top: notificationHeight, justifyContent: 'center', alignItems: 'center'}}>
            <View style={{maxWidth: '80%', padding: 15, paddingHorizontal: 25, borderRadius: 20, backgroundColor: notificationInfo.color, alignItems: 'center'}}>
              <Text style={{fontSize: 17, fontWeight: 'thin', color: 'white', textAlign: 'center'}}>{notificationInfo.message}</Text>
            </View>
          </Animated.View>


          {/* Loading Modal */}
          <Modal
            style={{zIndex: -1000}}
            animationType={"fade"}
            transparent={false}
            visible={loading}
          >
            <View style={{width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: Globals.PageColor}}>
              <View style={{width: '80%', height: '50%', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent'}}>
                <View style={{width: '100%', height: '100%', position: 'absolute', alignItems: 'center', justifyContent: 'center'}}>
                  <Image source={lightningImage} tintColor={'white'}/>
                  <View style={{width: 224, height: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', borderRadius: 40}}/>
                </View>
                <MaskedView
                  style={{ width: 224, height: '100%', justifyContent: 'center'}}
                  maskElement={
                    <View style={{width: '100%', height: '100%'}}>
                      <Animated.View style={{height: '70%', width: loadingPercent, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center'}}/>
                      <Animated.View style={{height: '30%', width: loadError ? '100%' : loadingPercent, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center'}}/>
                    </View>
                  }
                >
                  <Image source={lightningImage}/>
                  <View style = {{width: '100%', height: 20, justifyContent: 'center'}}>
                    <View style={{width: '100%', height: 20, borderRadius: 40, overflow: 'hidden'}}>
                      <Animated.View style={{width: loadingPercent, height: 20, backgroundColor: 'orange', borderRadius: 40}}/>
                    </View>
                    { loadError ? 
                      <Animated.View style={{position: 'absolute', justifyContent: 'center', alignItems: 'center', width: 30, height: 30, left: loadingPercent, transform: [{translateX: -15}]}}>
                        <View style={{position: 'absolute', width: 35, height: 10, backgroundColor: 'red', borderRadius: 20, transform: [{rotateZ: '45deg'}]}}></View>
                        <View style={{position: 'absolute', width: 35, height: 10, backgroundColor: 'red', borderRadius: 20, transform: [{rotateZ: '-45deg'}]}}></View>
                      </Animated.View>
                      : null 
                    }
                  </View>
                </MaskedView>
              </View>
            </View>
          </Modal>
        </SafeAreaView>
      </TouchableNativeFeedback>
    </AppContext.Provider>
  );
}

export default MobileApp;