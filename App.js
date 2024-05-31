import React, {useState, useRef, useEffect, useContext, memo} from 'react';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeflateString, InflateString } from './backend/DataCompression';
import { 
  StyleSheet, 
  View,
  TouchableNativeFeedback,
  Platform,
  Dimensions,
  ActivityIndicator, 
  Animated,
  Easing,
  Image,
  Keyboard,
  AppState,
  Linking,
  Modal,
  Button,
  Pressable,
  Text,
  SafeAreaView,
} from 'react-native';
import { 
  GradientButton, 
  GradientChoice, 
  GradientNumberInput, 
  GradientTextInput,
  GradientQRCode,
  GradientShell,
  GradientDropDown
} from './mobile/GradientComponents';
import {
  HeaderTitle,
  PageHeader,
  PageFooter,
  PageContent,
  RelatedContentContainer,
} from './mobile/PageComponents';
import { FormBuilder, GetFormJSONAsMatch, exampleJson } from './mobile/FormBuilder';
import { 
  getBlueAllianceMatches, 
  getBlueAllianceTeams, 
  getBlueAllianceEvents,
  putOneToDatabase,
  testGet
} from './backend/APIRequests';
import MaskedView from '@react-native-masked-view/masked-view';
import { LeaveAnimationField, MicrophoneAnimationStage, NoteAnimationField, ParkAnimationField, TrapAnimationStage } from './mobile/InfoAnimations';
import Globals from './Globals';
import AppContext from './components/AppContext';
import WebApp from './web/WebApp';
import MobileApp from './mobile/MobileApp';

// Link to open testflight app?: exp+nimbus://expo-development-client/?event=2024tnkn
// QR Code is in the assets folder.
export default function App() {
  if (['windows', 'macos', 'web'].includes(Platform.OS)) {
    return (<WebApp />);
  } else {
    return (<MobileApp />);
  }

  const exampleForm = require('./web/examples/form_example.json');
  const lightningImage = require('./assets/862gigawatt.png');

  const [loadingStage, setLoadingStage] = useState(0);
  const [maxLoadingStage, setMaxLoadingStage] = useState(3);
  const [noInternet, setNoInternet] = useState({state: false, loadingFunc: async () => {}});
  const [screenIndex, setScreenIndex] = useState(0);
  const [screens, setScreens] = useState([]);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [viewingMatch, setViewingMatch] = useState(false);
  const [bigDataTest, setBigData] = useState({});
  const [formComponents, setFormComponents] = useState(FormBuilder(exampleJson));
  const [name, setName] = useState('');
  const [linkInfo, setLinkInfo] = useState({event: '', url: ''});
  const [APIData, setAPIData] = useState({matches: [], teams: [], event: '', event_name: '', events: []});
  const [serverInfo, setServerInfo] = useState({ip: 'frc862.com', port: '4000', timeout: 3000});
  const [QRLinkInfo, setQRLinkInfo] = useState({url: "exp+nimbus://expo-development-client"});
  const [matchesScouted, setMatchesScouted] = useState([]);
  const [sentMatches, setSentMatches] = useState([]);
  const [failedSendMatches, setFailedSendMatches] = useState([]);
  const [form, setForm] = useState(exampleForm);
  const leftAmount = useRef(new Animated.Value(0)).current;

  const getAPIData = async (eventCode, loadEvents) => {
    try {
      let matches = await getBlueAllianceMatches(eventCode, serverInfo.timeout);
      let successfullyLoadedMatches = false;
      let successfullyLoadedEvents = false;
      //let teams = await getBlueAllianceTeams(eventCode, serverInfo.timeout);
      if (matches == "ERROR" && eventCode != "2024none") {
        let eventAPIData = await AsyncStorage.getItem(eventCode);
        try {
          matches = JSON.parse(eventAPIData)["matches"]; 
          //teams = JSON.parse(eventAPIData)["teams"];
          successfullyLoadedMatches = true;
        } catch (e) {
          //console.error("Uh oh! Something went wrong with getting the matches from your device! Unfortunately, you also don't have internet, so try going to a place that does.");
        }
      } else {
        successfullyLoadedMatches = true;
      }

      let events = loadEvents ? await getBlueAllianceEvents(eventCode.slice(0, 4), serverInfo.timeout) : "ERROR";
      if (events == "ERROR") {
        const keys = await AsyncStorage.getAllKeys();
        if (keys.includes(eventCode.slice(0, 4))) {
          events = JSON.parse(await AsyncStorage.getItem(eventCode.slice(0, 4)));
          successfullyLoadedEvents = true;
        } else {
          //console.error("UH OH! You don't have the internet for finding the events, and you don't have the events stored on the device!")
        }
      } else {
        await AsyncStorage.setItem(eventCode.slice(0, 4), JSON.stringify(events));
        successfullyLoadedEvents = true;
      }

      //alert(`${successfullyLoadedEvents} ${successfullyLoadedMatches} ${loadEvents} ${!successfullyLoadedMatches && (!successfullyLoadedEvents || !loadEvents)}`)

      if (!successfullyLoadedMatches && (!successfullyLoadedEvents || !loadEvents)) {
        if (!noInternet.state) {
          setNoInternet({state: true, loadingFunc: async () => await getAPIData(eventCode, loadEvents)});
        }
        return false;
      }

      const event = events.constructor == Array ? events.find((event) => event["key"] == eventCode) : {}
      
      const newData = {
        matches: matches,
        //teams: teams,
        event: eventCode,
        event_name: event ? event["name"] : "None Found",
        events: events.constructor == Array ? events : []
      };

      setAPIData(newData);
      
      AsyncStorage.setItem(eventCode, JSON.stringify(newData));
      return true;
    } catch (error) {
      console.error(error);
    }
  }

  const compressMatchData = (matchData) => {
    let compressedEncoded = DeflateString(JSON.stringify(matchData));
    return compressedEncoded;
  }

  const decompressMatchData = (compressedData) => {
    let decompressed = InflateString(compressedData);
    return JSON.parse(decompressed);
  }

  const addLoadingTimeHehe = (ms) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  }

  const startApplicationProcess = async () => {
    //setSetting("PageColor", 'rgb(80, 80, 0)');
    setMaxLoadingStage(3);
    setLoadingStage(0);

    // IN case of loading failed for some reason
    addLoadingTimeHehe(20000).then(() => { if (loadingStage != -1) { setLoadingStage(-1); } });

    setServerInfo(JSON.parse(await AsyncStorage.getItem('serverInfo') || JSON.stringify(serverInfo)));
    setQRLinkInfo(JSON.parse(await AsyncStorage.getItem('QRInfo') || JSON.stringify(QRLinkInfo)));
    
    // const byteSize = str => new Blob([str]).size;
    // let sample = `
    // {
    //   "auton": {"amp_scored": "15", "collection_location": "12", "leave": "718", "notes_collected": "77", "speaker_scored": "true"}, 
    //   "endgame": {"climb": "cheesze", "harmony": "aaaa", "park": "bbbb", "spotlit_attempts": "cccc", "successful_spotlits": "dddd"}, 
    //   "event": "2024alhu", "page_keys": ["prematch", "auton", "teleop", "endgame"], 
    //   "prematch": {"alliance_color": "eeee", "match_num": "20", "match_type": "ffff", "team_num": "8811-red2"}, 
    //   "scout_name": "Shelby", 
    //   "teleop": {"amp_scored": "hhhh", "amplified_scored": "iiii", "collection_type": "jjjj", "notes_collected": "kkkk", "speaker_scored": "llll"}, 
    //   "view_only": false
    // }`.replace(/ /g,"").replace(/\n/g,"");

    setMatchesScouted(JSON.parse(await AsyncStorage.getItem('hugeData') || '[]'))
    setSentMatches(JSON.parse(await AsyncStorage.getItem('sentMatches') || '[]'));
    setFailedSendMatches(JSON.parse(await AsyncStorage.getItem('failedSendMatches') || '[]'));

    // Getting url and params for the app
    let url = await Linking.getInitialURL()
    var regex = /[?&]([^=#]+)=([^&#]*)/g,
      params = {},
      match;
    while (match = regex.exec(url)) {
      params[match[1]] = match[2];
    }

    //alert(`Don't mind this, it is just for testing testflight links\n${url}\n${JSON.stringify(params)}`);

    setLoadingStage(1);
    await addLoadingTimeHehe(300);
    //await addLoadingTimeHehe(100);

    try {
      url = '';

      setLinkInfo({event: params['event'] || '2024none', url: url ? url.includes("?") ? url.slice(0, url.indexOf('?')) : url : ''});

      if (params['event']) {
        await getAPIData(decodeURIComponent(params['event']), true);
      } else {
        await getAPIData('2024none', true);
      }

      setLoadingStage(2);
      await addLoadingTimeHehe(500);
    } catch (e) { alert(e) }

    // Getting the name of the scouter
    let name = await AsyncStorage.getItem('name')
    if (name) {
      setName(name);
      setScreenIndex(0);
      setScreens([HomeScreen]);
    } else {
      setScreenIndex(0);
      setScreens([NameScreen]);
    }

    // Check if there has been match data passed to the uri
    if (params.hasOwnProperty('match') && params.hasOwnProperty("data_parse_method")) {
      // Get and ensure that the match data is view_only
      let matchData = params['match'];
      switch (params["data_parse_method"]) {
        case "compressed":
          matchData = decompressMatchData(decodeURIComponent(matchData));
          break;
        case "uncompressed":
          // Temp
          matchData = JSON.parse(decodeURIComponent(matchData));
          break;
        default:
          matchData = JSON.parse(decodeURIComponent(matchData));
          break;
      }

      let viewOnly = tryGetProp(matchData, "view_only", true);
      matchData = await initializeBigData(matchData, matchData['event'] || params['event']);
      matchData["view_only"] = viewOnly;

      if ((await AsyncStorage.getAllKeys()).includes('hugeData')) {
        const hugeData = JSON.parse(await AsyncStorage.getItem('hugeData'));

        // Checking if the match is already in the huge data
        let hasData = -1;
        try {
          hasData = hugeData.findIndex((match) => match["scout_name"] == matchData["scout_name"] && match["prematch"]["match_num"] == matchData["prematch"]["match_num"]);
        } catch (e) {}

        // Add match to huge data if it is not already there
        // Otherwise, overwrite the match index with the new match data
        if (hasData == -1) {
          setMatchesScoutedPhone([...hugeData, matchData])
        } else {
          let newData = hugeData;
          newData[hasData] = matchData;
          setMatchesScoutedPhone(newData);
        }
      } else {
        setMatchesScoutedPhone([matchData]);
      }

      // Set the states for the app to go into viewing mode
      setViewingMatch(true);
      setBigData(matchData);
      setScreens([PrematchScreen, ...formComponents, SaveDataScreen]);
    }

    setLoadingStage(3);

    await addLoadingTimeHehe(500)

    // Set the loading stage to -1 to indicate that the app is done loading
    setLoadingStage(-1);
  }

  useEffect(() => {
    if (loadingStage != -1 && loadingStage != 0) {
      Animated.timing(loadingAnim, {
        toValue: loadingStage * (224 / maxLoadingStage),
        duration: 600,
        easing: Easing.inOut(Easing.exp),
        useNativeDriver: false,
      }).start();
    } else if (loadingStage == 0) {
      loadingAnim.setValue(0);
    }
  }, [loadingStage]);

  useEffect(() => {
    if (!noInternet.state) {
      return;
    }
    setScreens([NoInternetLoadScreen]);
    const timeout = setInterval(async () => {
      if (await noInternet.loadingFunc()) {
        setNoInternet({state: false, loadingFunc: async () => {}});
        setScreens([HomeScreen]);
        alert("Internet is accessable now!");
      }
    }, serverInfo.timeout + 500);

    return () => clearInterval(timeout);
  }, [noInternet])

  useEffect(() => {
    startApplicationProcess();
  }, []);

  const initializeBigData = async (data, event = "") => {
    if (APIData.event != (data["event"] || event) && data.hasOwnProperty("event")) {
      setMaxLoadingStage(1);
      setLoadingStage(0);
      await getAPIData(data["event"] || event, false);
      setLoadingStage(1);
      await addLoadingTimeHehe(500);
      setLoadingStage(-1);
    }

    if (data.hasOwnProperty("event") && data.hasOwnProperty("scout_name")) {
      return data;
    }

    let newData = GetFormJSONAsMatch();
    console.log("NEW DATA:", newData)

    newData["event"] = data["event"] || APIData.event || event;
    newData["view_only"] = data["view_only"] || false;
    newData["scout_name"] = data["scout_name"] || name;
    newData["page_keys"] = newData["page_keys"] ? (newData["page_keys"].includes("prematch") ? newData["page_keys"] : ["prematch", ...newData["page_keys"]]) : ["prematch"];
    newData["prematch"] = data["prematch"] || {
      match_num: "0",
      match_type: "",
      alliance_color: "",
      team_num: ""
    };

    setBigData(newData);
    return newData;
  };

  const tryGetProp = (obj, prop, if_null = undefined) => {
    if (obj.hasOwnProperty(prop)) {
      return obj[prop];
    } else {
      return if_null;
    }
  }

  const slideScreen = async (dir) => { 
    if (screenIndex == 0 && dir < 0) {
      // If not editing, just go back to the home screen
      if (editingIndex == -1) {
        setScreens([HomeScreen]);
        if (!name) {
          setScreens([NameScreen]);
        }
      }

      // Stop editing or viewing a match
      if (editingIndex != -1 || viewingMatch) {
        setMaxLoadingStage(1);
        setLoadingStage(0);

        setEditingIndex(-1);
        setViewingMatch(false);
        setScreens([StoredMatchesScreen]);
        setBigData({});

        await getAPIData(linkInfo.event, false)
        setLoadingStage(1);
        await addLoadingTimeHehe(500);
        setLoadingStage(-1);
      }
      // Make sure the screen index is reset
      setScreenIndex(0);
      return;
    }

    if (screenIndex + dir < screens.length) {
      let newIndx = screenIndex + dir;
      console.log("New Index:", newIndx, "New Page:", example[newIndx].name);
      setScreenIndex(newIndx);
    }
  }

  // Gives visuals for the stored data, whether it is is sent, failed, or neither.
  const setMatchesScoutedPhone = async (newMatches) => {
    setMatchesScouted(newMatches);
    await AsyncStorage.setItem('hugeData', JSON.stringify(newMatches));
  }
  const setSentMatchesPhone = async (newSentMatches) => {
    setSentMatches(newSentMatches);
    await AsyncStorage.setItem('sentMatches', JSON.stringify(newSentMatches));
  }
  const setFailedSendMatchesPhone = async (newFailedSendMatches) => {
    setFailedSendMatches(newFailedSendMatches);
    await AsyncStorage.setItem('failedSendMatches', JSON.stringify(newFailedSendMatches));
  }

  // Prebuilt screen, never used in form builder
  const HomeScreen = ({style, gradientDir = 1}) => {
    gradientDir = 1;
    const ctx = useContext(AppContext);

    return (
      <View style={[styles.page, {backgroundColor: Globals.PageColor}, style]}>
        <PageHeader gradientDir={gradientDir} infoText={`Event: ${ctx.APIData.event.slice(0, 4) + " " + ctx.APIData.event_name}`} title='Home'/>

        <PageContent gradientDir={gradientDir}>
          <GradientButton title="Match Time!" outerStyle={{height: '15%', width: '90%'}} style={{padding: 5}} onPress={async () => { 
              if (ctx.APIData.event_name == 'None Found') {
                alert("You have not selected an event!");
                return;
              }
              await ctx.initializeBigData(ctx.bigDataTest);
              ctx.setScreens([PrematchScreen, ...ctx.formComponents, SaveDataScreen]);
            }}
          />
          <GradientButton title="Master Page" onPress={() => { 
              ctx.setScreens([MasterAuthScreen]);
            }}
            showBackgroundGradient={Globals.ShowGradientBorderHome || Globals.ShowGradientHoverHome}
            borderWidth={Globals.ShowGradientBorderHome ? Globals.GradientBorderWidthHome : 0}  
          />
          <GradientButton title="Stored Matches" onPress={() => {
              ctx.setScreens([StoredMatchesScreen]);
            }}
            showBackgroundGradient={Globals.ShowGradientBorderHome || Globals.ShowGradientHoverHome}
            borderWidth={Globals.ShowGradientBorderHome ? Globals.GradientBorderWidthHome : 0}   
          />
          <GradientButton title="Server Details" onPress={() => {
              ctx.setScreens([ServerDetailsScreen]);
            }}
            showBackgroundGradient={Globals.ShowGradientBorderHome || Globals.ShowGradientHoverHome}
            borderWidth={Globals.ShowGradientBorderHome ? Globals.GradientBorderWidthHome : 0}   
          />
          <GradientButton title="Need Help?" onPress={() => {
              ctx.setScreens([HelpScreen]);
            }}
            showBackgroundGradient={Globals.ShowGradientBorderHome || Globals.ShowGradientHoverHome}
            borderWidth={Globals.ShowGradientBorderHome ? Globals.GradientBorderWidthHome : 0} 
            />
          <GradientButton title="Settings" onPress={() => {
              ctx.setScreens([SettingsScreen]);
            }}
            showBackgroundGradient={Globals.ShowGradientBorderHome || Globals.ShowGradientHoverHome}
            borderWidth={Globals.ShowGradientBorderHome ? Globals.GradientBorderWidthHome : 0} 
            />
          
          <View style={{bottom: 5, position: 'absolute', width:'100%', justifyContent: 'center', alignItems: 'center'}} >
            <HeaderTitle title="When selecting an item from this dropdown, IT WILL DELETE YOUR CURRENT MATCH DATA" headerNum={3} style={{width: "90%"}}/>
            <GradientDropDown
              style={{marginTop: 5}}
              parallelState={{
                state: ctx.APIData.event, 
                set: async (label, value) => {
                  await ctx.getAPIData(value, false);
                  ctx.setLinkInfo({...ctx.linkInfo, event: value});
                  setBigData({event: value});
                }
              }} 
              save_data={false} 
              title="Find Event" 
              data={ctx.APIData.events.map((event) => ({label: event["name"], value: event["key"]}))}
            />
          </View>

        </PageContent>

        <StatusBar style="light" />
      </View>
    )   
  }

  const SettingsScreen = ({style, gradientDir = 1}) => {
    return (
      <View style={[styles.page, {backgroundColor: Globals.PageColor}, style]}>
        <PageHeader gradientDir={gradientDir} title='Settings'/>
        <PageContent gradientDir={gradientDir}>
          <GradientButton title="Reset to defaults" onPress={async () => { 
            }}/>
        </PageContent>
        <PageFooter gradientDir={gradientDir}/>

        <StatusBar style="light" />
      </View>
    )
  }

  // Prebuilt screen, never used in form builder
  const NameScreen = ({style, gradientDir = 1}) => {
    const [name, setName] = useState('');

    const ctx = useContext(AppContext);

    return (
      <View style={[styles.page, {backgroundColor: Globals.PageColor}, style]}>

        <PageContent gradientDir={gradientDir} scrollable={false} style={{justifyContent: 'center', alignItems: 'center'}}>
          <GradientTextInput title="Enter your name" save_data={false} setParallelState={setName}/>
          <GradientButton disabled={!name} title="Continue" onPress={async () => { 
              ctx.setName(name);
              await AsyncStorage.setItem('name', name);
              ctx.setScreens([HomeScreen]);
            }}/>
        </PageContent>

        <StatusBar style="light" />
      </View>
    )
  }

  // Prebuilt screen, never used in form builder
  const NoInternetLoadScreen = ({style, gradientDir = 1}) => {
    const spinAmount = useRef(new Animated.Value(0)).current;

    Animated.loop(
      Animated.timing(spinAmount, {
        toValue: 360,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: false
      })
    ).start();

    const spinDegs = spinAmount.interpolate({
      inputRange: [0, 720],
      outputRange: ['0deg', '720deg']
    })

    return (
    <View style={[styles.page, {backgroundColor: Globals.PageColor}, style]}>
      <PageHeader gradientDir={gradientDir} title='No Internet'/>

      <PageContent gradientDir={gradientDir}>
        <HeaderTitle title={`Uh oh spaghetti O!`}/>
        <HeaderTitle title={`You don't have the internet required to download the needed information!`} headerNum={3}/>
        <View style={{flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center'}}>
          <Animated.Image source={lightningImage} style={{transform: [{rotateZ: spinDegs}]}}/>
        </View>
        <GradientButton title="Give up :(" onPress={async () => {setScreens([HomeScreen]); setNoInternet({state: false, loadingFunc: async () => {}})}}/>
      </PageContent>
    </View>
    );
  }

  // Prebuilt screen, never used in form builder
  const ServerDetailsScreen = ({style, gradientDir = 1}) => {

    const ctx = useContext(AppContext);

    const [newServerInfo, setNewServerInfo] = useState({ip: ctx.serverInfo.ip, port: ctx.serverInfo.port, timeout: ctx.serverInfo.timeout});
    return (
      <View style={[styles.page, {backgroundColor: Globals.PageColor}, style]}>
        <PageHeader gradientDir={gradientDir} title='Server Details'/>

        <PageContent gradientDir={gradientDir}>
          <HeaderTitle headerNum={3} style={{width: '90%'}} title={`If you do not know what any of this is / does, DO NOT mess with it or ask the person in charge of the scouting app's server`}/>
          <GradientTextInput title="Server IP" save_data={false} default_value={newServerInfo.ip} setParallelState={(value) => {setNewServerInfo({...newServerInfo, ip: value})}}/>
          <GradientTextInput title="Port" save_data={false} default_value={newServerInfo.port} setParallelState={(value) => {setNewServerInfo({...newServerInfo, port: value})}}/>
          <GradientTextInput title="Timeout Time (ms)" save_data={false} default_value={String(newServerInfo.timeout)} setParallelState={(value) => {setNewServerInfo({...newServerInfo, timeout: Number(value)})}}/>
          <GradientButton title="Test ping/get" onPress={() => testGet(newServerInfo.ip, newServerInfo.port, newServerInfo.timeout, 3).then((result) => alert(result))}/>
        </PageContent>

        <PageFooter gradientDir={gradientDir} overrideBack={() => {
          slideScreen(-1); 
          ctx.setServerInfo(newServerInfo); 
          AsyncStorage.setItem('serverInfo', JSON.stringify(newServerInfo));
        }}/>
      </View>
    )
  };

  // Prebuilt screen, never used in form builder
  const HelpScreen = ({style, gradientDir = 1}) => {
    return (
      <View style={[styles.page, {backgroundColor: Globals.PageColor}, style]}>
        <PageHeader gradientDir={gradientDir} title='Help'/>

        <PageContent gradientDir={gradientDir} scrollable={true}>
          <HeaderTitle title='Leave' headerNum={2}/>
          <HeaderTitle title='The robot has to fully leave their starting zone (pass the white line on their side) in auton, the first 15 seconds of the game' headerNum={3}/>
          <LeaveAnimationField/>
          <HeaderTitle title='Note' headerNum={2} style={{marginTop: 10}}/>
          <HeaderTitle title='The game piece used to score in the AMP and the SPEAKER' headerNum={3}/>
          <NoteAnimationField/>
          <HeaderTitle title='Park' headerNum={2} style={{marginTop: 10}}/>
          <HeaderTitle title='At the very end of the game, if any part of the robot is in the STAGE area (the triangle-like zone)' headerNum={3}/>
          <ParkAnimationField/>
          <HeaderTitle title='Microphone' headerNum={2} style={{marginTop: 10}}/>
          <HeaderTitle title='The pole (there are three) on each side of the STAGE at the top, which can hold a high note on it' headerNum={3}/>
          <MicrophoneAnimationStage/>
          <HeaderTitle title='Trap' headerNum={2} style={{marginTop: 10}}/>
          <HeaderTitle title='The flap and container for a note in the middle of the STAGE (one on each side)' headerNum={3}/>
          <TrapAnimationStage/>
        </PageContent>

        <PageFooter gradientDir={gradientDir}/>

        <StatusBar style="light" />
      </View>
    );
  }

  // Prebuilt screen, never used in form builder
  const MasterAuthScreen = ({style, gradientDir = 1}) => {
    const [authKey, setAuthKey] = useState('');

    const ctx = useContext(AppContext);

    return (
      <View style={[styles.page, {backgroundColor: Globals.PageColor}, style]}>
        <PageHeader gradientDir={gradientDir} title='Master'/>

        <PageContent style={{justifyContent: 'center'}} gradientDir={gradientDir}>
          <GradientTextInput title="Enter auth key" save_data={false} setParallelState={setAuthKey}/>
          <GradientButton title="Continue" onPress={() => { 
              if (authKey != '862orangeblue') {
                alert("Uh oh! Wrong Authentication key!");
                return;
              }
              ctx.setScreens([MasterControlScreen]);
              ctx.setScreenIndex(0);
            }}/>
        </PageContent>

        <PageFooter gradientDir={gradientDir}/>

        <StatusBar style="light" />
      </View>
    );
  }

  // Prebuilt screen, never used in form builder
  const MasterControlScreen = ({style, gradientDir = 1}) => {
    const [newQRLinkInfo, setNewQRLinkInfo] = useState({url: ctx.QRLinkInfo.url});

    const ctx = useContext(AppContext);

    return (
      <View style={[styles.page, {backgroundColor: Globals.PageColor}, style]}>
        <PageHeader gradientDir={gradientDir} title='Master'/>

        <PageContent gradientDir={gradientDir}>
          <HeaderTitle title='This Device'/>
          <GradientButton title="Reset Name" onPress={
            async () => { 
              alert("Reset Name!");
              await AsyncStorage.setItem('name', '');
              ctx.setName('');
            }}
          />
          <GradientButton title="Reset Data" onPress={
            async () => {
              alert("Reset Match Data!");
              ctx.setMatchesScouted([]);
              ctx.setSentMatches([]);
              ctx.setFailedSendMatches([]);
              await AsyncStorage.multiSet([['hugeData', '[]'], ['sentMatches', '[]'], ['failedSendMatches', '[]']]);
            }}
          />
          <GradientButton title="Reset All" onPress={
            async () => {
              alert("Reset All Data!");
              ctx.setMatchesScouted([]);
              ctx.setSentMatches([]);
              ctx.setFailedSendMatches([]);
              ctx.setName('');
              await AsyncStorage.multiRemove(await AsyncStorage.getAllKeys());
            }}
          />
          <HeaderTitle title='Link info for QR Codes'/>
          <GradientTextInput maxLength={100} title="URL" save_data={false} default_value={newQRLinkInfo.url} setParallelState={(value) => {setNewQRLinkInfo({...newQRLinkInfo, url: value})}}/>
        </PageContent>

        <PageFooter gradientDir={gradientDir} overrideBack={() => {
          slideScreen(-1); 
          ctx.setQRLinkInfo(newQRLinkInfo); 
          AsyncStorage.setItem('QRInfo', JSON.stringify(newQRLinkInfo));
        }}/>

        <StatusBar style="light" />
      </View>
    );
  }

  // Prebuilt screen, never used in form builder
  const StoredMatchesScreen = ({style, gradientDir = 1}) => {
    const ctx = useContext(AppContext);

    displayMatches = (accessType, errMsg) => {
      if (!ctx.matchesScouted || ctx.matchesScouted == -1) { return [<HeaderTitle key={0} title={errMsg} headerNum={3}/>]; }
      let filteredMatches = ctx.matchesScouted;

      // Filter matches based on access type, does all matches if none provided.
      if (accessType == "view") {
        filteredMatches = filteredMatches.filter(match => match["view_only"]);
      } else if (accessType == "edit") {
        filteredMatches = filteredMatches.filter(match => !match["view_only"]);
      }

      if (filteredMatches.length > 0) {
        // Sort the matches by match number
        filteredMatches.sort((a, b) => a["prematch"]["match_num"] - b["prematch"]["match_num"]);

        // Display the matches as buttons
        return filteredMatches.map((match) => {
          const index = ctx.matchesScouted.indexOf(match);
          const team = match["prematch"]["error_team_num"] ? match["prematch"]["error_team_num"] : match["prematch"]["team_num"][0].slice(0, match["prematch"]["team_num"][0].indexOf("-"))
          return(
           <GradientButton 
            innerStyle={{backgroundColor: ctx.failedSendMatches.includes(index) ? Globals.FailedMatchColor : ctx.sentMatches.includes(index) ? Globals.SuccessfulMatchColor : Globals.ButtonColor}}
            style={{width: '100%'}}
            textStyle={{fontSize: 18}}
            key={index} 
            title={`Match: ${match["prematch"]["match_num"]} | Team: ${team} | Scout: ${match["scout_name"]}`}
            onPress={async () => {
              setMaxLoadingStage(1);
              setLoadingStage(0);
              await addLoadingTimeHehe(100);
              if (match.hasOwnProperty("view_only") && match["view_only"]) { ctx.setViewingMatch(true); }

              if (ctx.APIData.event != match["event"]) {
                await getAPIData(match["event"], false);
              } else {
                setLoadingStage(1)
                await addLoadingTimeHehe(500);
                setLoadingStage(-1);
              }

              // Ensure that it is no longer marked as sent or failed, because it is being changed
              if (ctx.sentMatches.includes(index)) {
                ctx.setSentMatches(ctx.sentMatches.filter((val) => val != index));
              } else if (ctx.failedSendMatches.includes(index)) {
                ctx.setFailedSendMatches(ctx.failedSendMatches.filter((val) => val != index));
              }

              ctx.setEditingIndex(index);
              ctx.setBigData(match);
              ctx.initializeBigData(match);
              ctx.setScreenIndex(0);
              ctx.setScreens([PrematchScreen, ...formComponents, SaveDataScreen]);
            }}
          /> 
          )
        });
      } else {
        return [<HeaderTitle key={0} title={errMsg} headerNum={3}/>]
      }
    }



    return (
      <View style={[styles.page, {backgroundColor: Globals.PageColor}, style]}>
        <PageHeader gradientDir={gradientDir} title='Stored Matches'/>

        <PageContent gradientDir={gradientDir} scrollable={true}>
          <GradientButton title='Put all scouted matches to database' onPress={async () => 
            { 
              // In the case that there are no matches to send, without this, it breaks due to the method used to transfer the data all async.
              if (ctx.matchesScouted.length == 0) 
              { 
                alert("You have no matches to send!")
                return;
              }

              setLoadingStage(0);
              setMaxLoadingStage(ctx.matchesScouted.length);
              let sentMatchesReq = [];
              let failedSendMatchesReq = [];
              let currentLoadStage = 0;
              for (let index in ctx.matchesScouted) {
                const match = ctx.matchesScouted[Number(index)];

                // Don't let users send view-only matches
                if (match.view_only) { continue; }
                await putOneToDatabase(
                  {
                    event: match.event, 
                    scout: match.scout_name, 
                    number: match.prematch.match_num, 
                    team_info: match.prematch.team_num, 
                    type: match.prematch.match_type[0], 
                    data: match
                  }, ctx.serverInfo.ip, ctx.serverInfo.port, ctx.serverInfo.timeout
                ).then(async (response) => {
                  if (response === "ERROR") {
                    failedSendMatchesReq.push(Number(index));
                  } else {
                    sentMatchesReq.push(Number(index));
                  }
                  setLoadingStage(currentLoadStage + 1);
                  currentLoadStage++;

                  // If this was the last request to go through
                  if (currentLoadStage == ctx.matchesScouted.length) {
                    ctx.setSentMatches(sentMatchesReq);
                    ctx.setFailedSendMatches(failedSendMatchesReq);

                    await addLoadingTimeHehe(500);
                    setLoadingStage(-1);
                    alert(failedSendMatchesReq.length > 0 ? `Uh oh! Looks like there was an error sending ${failedSendMatchesReq.length} matches!` : 'All matches sent!');
                  }
                });
              }
            }}/>
          <HeaderTitle title='Editable Matches'/>
          <RelatedContentContainer>
            { displayMatches("edit", "You don't have any editable matches saved yet!") }
          </RelatedContentContainer>
          <HeaderTitle title='Viewable Matches' style={{marginTop: 10}}/>
          <RelatedContentContainer>
            { displayMatches("view", "You don't have any viewable matches saved yet!") }
          </RelatedContentContainer>

        </PageContent>

        <PageFooter gradientDir={gradientDir}/>        
        <StatusBar style="light" />
      </View>
    );
  }

  // Prebuilt screen, MAYBE use in form builder
  const SaveDataScreen = ({style, gradientDir = 1}) => {
    const ctx = useContext(AppContext);
    const base_url = ctx.QRLinkInfo.url;
    const compressed_uri = `${base_url}?event=` + encodeURIComponent(ctx.linkInfo.event) + "&match=" + encodeURIComponent(compressMatchData(ctx.bigDataTest)) + "&data_parse_method=compressed";
    const uncompressed_uri = `${base_url}?event=` + encodeURIComponent(ctx.linkInfo.event) + "&match=" + encodeURIComponent(JSON.stringify(ctx.bigDataTest)) + "&data_parse_method=uncompressed";

    return (
      <View style={[styles.page, {backgroundColor: Globals.PageColor}, style]}>
        <PageHeader gradientDir={gradientDir} infoText={`Event: ${ctx.APIData.event.slice(0, 4) + " " + ctx.APIData.event_name}`} title='Save Data'/>

        <PageContent gradientDir={gradientDir} scrollable={true}>
          <HeaderTitle title='QR Data'/>
          <HeaderTitle title='Scan this QR to view the data on another device.' headerNum={3} style={{width: '60%', marginTop: -5, marginBottom: 10}}/>
          <GradientQRCode text={compressed_uri}/>
          {/* <GradientQRCode text={uncompressed_uri}/> */}
          
          <HeaderTitle headerNum={3} title={"Info: The QR code won't work on TestFlight since you cannot directly open TestFlight apps with links (as far as I know)"}/>
          {/* <HeaderTitle headerNum={3} title={compressed_uri}/> */}
          <GradientButton title={ctx.viewingMatch ? "Finish Viewing?" : "Finish Scouting?"} onPress={async () => 
            {
              // If viewing a match, dont save the data again.
              if (ctx.viewingMatch) {
                ctx.setScreens([HomeScreen]);
                ctx.setScreenIndex(0);
                ctx.setViewingMatch(false);
                ctx.setBigData({});
                return;
              }

              let newVal = ctx.matchesScouted;

              let newBigData = ctx.bigDataTest;

              // Adding the name to the form
              newBigData["scout_name"] = ctx.name;

              if (ctx.editingIndex != -1) {
                newVal[ctx.editingIndex] = newBigData;
              }
            
              const newData = ctx.editingIndex == -1 ? [...newVal, newBigData] : newVal;
              // Only adds a new match scouted IF you were not editing a match, otherwise, replaces a stored match with its edited version.

              ctx.setMatchesScouted(newData);
              ctx.setScreenIndex(0), 
              ctx.setScreens([HomeScreen]); 
              ctx.setBigData({});
              ctx.setEditingIndex(-1);
            }} 
          />

        </PageContent>

        <PageFooter gradientDir={gradientDir}/>
        <StatusBar style="light" />
      </View>
    )
  }

  // Prebuilt screen for prematch data (EVENTUALLY MAKE THIS PART OF FORM BUIDLER AS WELL)
  const PrematchScreen = ({style, gradientDir = 1}) => {
    const ctx = useContext(AppContext);

    if (!ctx.APIData.matches) { return (<View style={[styles.page, {backgroundColor: Globals.PageColor}, style]}><ActivityIndicator size={'large'}/></View>);}
    const [matchType, setMatchType] = useState('');
    const [matchNum, setMatchNum] = useState(-1);
    const [alliance_color, setAllianceColor] = useState('');

    let teamsDisplay = alliance_color[0] === "red" ? ['r1', 'r2', 'r3'] : alliance_color[0] === "blue" ? ['b1', 'b2', 'b3'] : ['t1', 't2', 't3'];
    if (matchType != '' && matchNum > 0 && alliance_color != '') {
      const match = ctx.APIData.matches.find(match => match["comp_level"] == matchType && match["match_number"] == matchNum);
      if (match) {
        const teams = match["alliances"][alliance_color]["team_keys"];
        teamsDisplay = teams.map(team => team.slice(3));

        // Unset the team value, so that they have to set it again if needed.
        let currentTeamNum = ctx.bigDataTest["prematch"]["team_num"] && ctx.bigDataTest["prematch"]["team_num"].length > 0 ? ctx.bigDataTest["prematch"]["team_num"][0] : "";
        currentTeamNum = /^[rbt]/.test(currentTeamNum) ? "aa" : currentTeamNum;
        if (!teamsDisplay.includes(currentTeamNum.slice(0, currentTeamNum.indexOf("-"))) && currentTeamNum != "") {
          let newData = ctx.bigDataTest;
          newData["prematch"]["team_num"] = "";
          ctx.setBigData(newData);
        }
      }
    }

    return (
      <View style={[styles.page, {backgroundColor: Globals.PageColor}, style]}>
        <PageHeader title='Prematch' infoText={`Event: ${ctx.APIData.event.slice(0, 4) + " " + ctx.APIData.event_name}`} gradientDir={gradientDir}/>

        <PageContent gradientDir={gradientDir} scrollable={true}>
          <HeaderTitle title='Match Info' headerNum={2}/>
          <RelatedContentContainer style={{zIndex: 100}}>
            <GradientNumberInput key_value="match_num" maxLength={3} maxNum={150} setParallelState={setMatchNum} title='Match Number'/>
            <GradientChoice key_value="match_type" title='Match Type' setParallelState={setMatchType} data={[
              {label: "Quals", value: "qm", selectColor: 'rgba(0, 0, 255, 0.3)'}, 
              {label: "Semis", value: "sf", selectColor: 'rgba(0, 0, 255, 0.3)'}, 
              {label: "Finals", value: "f", selectColor: 'rgba(0, 0, 255, 0.3)'}]}
            />
          </RelatedContentContainer>
          <HeaderTitle title='Team Info' headerNum={2}/>
          <RelatedContentContainer style={{zIndex: 99}}>
            <GradientChoice key_value="alliance_color" title='Alliance Color' setParallelState={setAllianceColor} data={[
              {label: 'Red', value: 'red', selectColor: 'rgba(255, 0, 0, 0.7)'}, 
              {label: 'Blue', value: 'blue', selectColor: 'rgba(0, 0, 255, 0.7)'}]}
            />
            <GradientChoice key_value="team_num" title='Team Number' data={[
                {label: teamsDisplay[0], value: `${teamsDisplay[0]}-${alliance_color}1`, selectColor: 'rgba(0, 0, 255, 0.3)'},
                {label: teamsDisplay[1], value: `${teamsDisplay[1]}-${alliance_color}2`, selectColor: 'rgba(0, 0, 255, 0.3)'},
                {label: teamsDisplay[2], value: `${teamsDisplay[2]}-${alliance_color}3`, selectColor: 'rgba(0, 0, 255, 0.3)'},
              ]}/>
          </RelatedContentContainer>
          {/* Test if the letters r, b, or t are at the start of the team number, meaning no teams from the API were found */}
          { /^[rbt]/.test(teamsDisplay[0]) ? <GradientNumberInput asTicker={false} key_value="error_team_num" maxLength={5} maxNum={99999} title='Team Number'/> : null }
        </PageContent>

        <PageFooter gradientDir={gradientDir} overrideNext={() => {
          // FIND FIELDS THAT ARE REQUIRED THAT NEED TO BE FILLED IN. Automate eventually.
          const errors = [];
          // If no name or match number is specified, dont save the data.
          if (ctx.bigDataTest["prematch"]["match_num"] == 0) {
            errors.push("No match number specified");
          }
          if (ctx.bigDataTest["prematch"]["match_type"].length == 0) {
            errors.push("No match type specified");
          }
          if (ctx.bigDataTest["prematch"]["alliance_color"].length == 0) {
            errors.push("No alliance color specified");
          }
          if (ctx.bigDataTest["prematch"]["team_num"].length == 0) {
            errors.push("No team number specified");
          }
          if (errors.length > 0) {
            alert("Cannot go to next page yet!\n" + errors.join(",\n") + "!");
            return;
          }
          ctx.slideScreen(1);
        }}/>        
        <StatusBar style="light" />
      </View>
    )
  }

  // Used to display the current screen.
  const DisplayScreen = ({component, style, gradientDir = 1}) => {
    return (
      <>{component({style, gradientDir})}</>
    );
  };

  const statePackage = {
    // Screen stuff
    screens: screens,
    setScreens: setScreens,
    screenIndex: screenIndex,
    setScreenIndex: setScreenIndex,
    slideScreen: slideScreen,
    // Data stuff
    bigDataTest: bigDataTest,
    initializeBigData: initializeBigData,
    setBigData: setBigData,
    APIData: APIData,
    getAPIData: getAPIData,
    editingIndex: editingIndex,
    setEditingIndex: setEditingIndex,
    name: name,
    setName: setName,
    viewingMatch: viewingMatch,
    setViewingMatch: setViewingMatch,
    linkInfo: linkInfo,
    setLinkInfo: setLinkInfo,
    formComponents: formComponents,
    setFormComponents,
    serverInfo: serverInfo,
    setServerInfo: setServerInfo,
    QRLinkInfo: QRLinkInfo,
    setQRLinkInfo: setQRLinkInfo,
    // Loading Stage:
    setLoadingStage: setLoadingStage,
    // Huge data match stuff
    setSentMatches: setSentMatchesPhone,
    sentMatches: sentMatches,
    setFailedSendMatches: setFailedSendMatchesPhone,
    failedSendMatches: failedSendMatches,
    setMatchesScouted: setMatchesScoutedPhone,
    matchesScouted: matchesScouted,
  }

  const loadingAnim = useRef(new Animated.Value(0)).current;

  return (
    <AppContext.Provider value={statePackage}>
      <TouchableNativeFeedback onPress={() => Keyboard.dismiss()}>
        <SafeAreaView style={[styles.container, {backgroundColor: Globals.PageContainerColor, flexDirection: 'row', overflow: 'visible',left: leftAmount}]}>
          { screens.length > 0 ? <DisplayScreen key={screenIndex} component={screens[screenIndex]} gradientDir={(screenIndex) % 2}/> : null }
          <Modal
            style={{zIndex: -1000}}
            animationType="fade"
            transparent={false}
            visible={loadingStage > -1 || screens.length == 0}
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
                    <Animated.View style={{height: '100%', width: loadingAnim, backgroundColor: 'blue', justifyContent: 'center', alignItems: 'center'}}/>
                  }
                >
                  <Image source={lightningImage}/>
                  <View style={{width: 224, height: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'orange', borderRadius: 40}}/>
                </MaskedView>
              </View>
            </View>
          </Modal>
        </SafeAreaView>
      </TouchableNativeFeedback>
    </AppContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'stretch',
    alignItems: 'stretch',
    backgroundColor: "red",
    flexDirection: 'column',
  },
  page: {
    width: '100%',
    height: '100%',
    backgroundColor: "red",
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    paddingTop: Platform.OS === 'android' ? 20 : 0,
    margin: 0,
  },
});
