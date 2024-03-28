import React, {useState, useRef, useEffect, memo} from 'react';
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
  SafeAreaView
} from 'react-native';
import { 
  GradientButton, 
  GradientChoice, 
  GradientNumberInput, 
  GradientTextInput,
  GradientQRCode,
  GradientShell,
  GradientDropDown
} from './GradientComponents';
import {
  HeaderTitle,
  PageHeader,
  PageFooter,
  PageContent,
  RelatedContentContainer,
} from './PageComponents';
import { ModalPopup } from './PopupsAndNotifications';
import { FormBuilder, GetFormJSONAsMatch, EncodeJSON, DecodeJSON } from './FormBuilder';
import { 
  getBlueAllianceMatches, 
  getBlueAllianceTeams, 
  getBlueAllianceEvents,
  putOneToDatabase
} from './backend/APIRequests';
import MaskedView from '@react-native-masked-view/masked-view';
import { LeaveAnimationField, MicrophoneAnimationStage, NoteAnimationField, ParkAnimationField, TrapAnimationStage } from './InfoAnimations';
import { Header } from 'react-native/Libraries/NewAppScreen';
import NetInfo from '@react-native-community/netinfo';

// Link to open testflight app?: exp+nimbus://expo-development-client/?event=2024tnkn
// QR Code is in the assets folder.
export default function App() {
  const dimensions = Dimensions.get('window');
  const [loadingStage, setLoadingStage] = useState(0);
  const [maxLoadingStage, setMaxLoadingStage] = useState(3);
  const [screenIndex, setScreenIndex] = useState(0);
  const [screens, setScreens] = useState([]);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [viewingMatch, setViewingMatch] = useState(false);
  const [bigDataTest, setBigData] = useState({});
  const [form, setForm] = useState(FormBuilder());
  const [name, setName] = useState('');
  const [linkInfo, setLinkInfo] = useState({event: '', url: ''});
  const [APIData, setAPIData] = useState({matches: [], teams: [], event: '', event_name: '', events: []});
  const [serverInfo, setServerInfo] = useState({ip: 'frc862.com', port: '4000', timeout: 3000});
  const [matchesScouted, setMatchesScouted] = useState([]);
  const [sentMatches, setSentMatches] = useState([]);
  const [failedSendMatches, setFailedSendMatches] = useState([]);
  const leftAmount = useRef(new Animated.Value(0)).current;

  const lightningImage = require('./assets/862gigawatt.png');

  const getAPIData = async (eventCode, loadEvents) => {
    try {
      let networkInfo = await NetInfo.fetch()

      let loadFromAPI = networkInfo.isConnected && !networkInfo.details.isConnectionExpensive;
      //console.log(networkInfo, loadFromAPI)
      let matches = [];
      let teams = [];
      if (!loadFromAPI) {
        let eventAPIData = await AsyncStorage.getItem(eventCode);
        try {
          matches = JSON.parse(eventAPIData)["matches"]; 
          teams = JSON.parse(eventAPIData)["teams"];
        } catch (e) {
          console.error("Uh oh! Something went wrong with getting the matches from your device! Unfortunately, you also don't have internet, so try going to a place that does.");
        }
      } else {
        matches = await getBlueAllianceMatches(eventCode, serverInfo.timeout);
        teams = await getBlueAllianceTeams(eventCode, serverInfo.timeout);
      }
      let events = loadEvents && loadFromAPI ? await getBlueAllianceEvents(eventCode.slice(0, 4), serverInfo.timeout) : "ERROR";
      if (events == "ERROR") {
        const keys = await AsyncStorage.getAllKeys();
        if (keys.includes(eventCode.slice(0, 4))) {
          events = JSON.parse(await AsyncStorage.getItem(eventCode.slice(0, 4)));
        } else {
          console.error("UH OH! You don't have the internet for finding the events, and you don't have the events stored on the device!")
        }
      } else {
        await AsyncStorage.setItem(eventCode.slice(0, 4), JSON.stringify(events));
      }
      const event = events.constructor == Array ? events.find((event) => event["key"] == eventCode) : {}
      
      const newData = {
        matches: matches,
        teams: teams,
        event: eventCode,
        event_name: event ? event["name"] : "None Found",
        events: events.constructor == Array ? events : []
      };
      setAPIData(newData);
      
      AsyncStorage.setItem(eventCode, JSON.stringify(newData));
    } catch (error) {
      console.error(error);
    }
  }

  const compressMatchData = (matchData) => {
    let encoded = EncodeJSON(matchData);
    let compressedEncoded = DeflateString(JSON.stringify(encoded));
    return compressedEncoded;
  }

  const decompressMatchData = (compressedData) => {
    let decompressed = InflateString(compressedData);
    let decoded = DecodeJSON(JSON.parse(decompressed));
    return decoded;
  }

  const addLoadingTimeHehe = (ms) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  }

  const startApplicationProcess = async () => {
    setMaxLoadingStage(3);
    setLoadingStage(0);

    // IN case of loading failed for some reason
    addLoadingTimeHehe(20000).then(() => { if (loadingStage != -1) { setLoadingStage(-1); } });

    setServerInfo(JSON.parse(await AsyncStorage.getItem('serverInfo') || JSON.stringify(serverInfo)));
    
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
    //console.log(url);
    var regex = /[?&]([^=#]+)=([^&#]*)/g,
      params = {},
      match;
    while (match = regex.exec(url)) {
      params[match[1]] = match[2];
    }

    alert(`Don't mind this, it is just for testing testflight links\n${url}\n${JSON.stringify(params)}`);

    setLoadingStage(1);
    //console.log(2);
    await addLoadingTimeHehe(300);
    //console.log("PARAMS:", params)

    // Check if there has been match data passed to the uri
    if (params.hasOwnProperty('match')) {
      // Get and ensure that the match data is view_only
      let matchData = decompressMatchData(decodeURIComponent(params['match']));
      // console.log(matchData)
      matchData["view_only"] = true;

      // Getting and setting the huge data to add the match only for viewing
      const hugeData = JSON.parse(await AsyncStorage.getItem('hugeData'));

      // Checking if the match is already in the huge data
      let hasData = -1;
      try {
        hasData = hugeData.findIndex((match) => match["scout_name"] == matchData["scout_name"] && match["prematch"]["match_num"] == matchData["prematch"]["match_num"]);
      } catch (e) {}

      // Add match to huge data if it is not already there
      // Otherwise, overwrite the match index with the new match data
      if (hasData == -1) {
        hugeData.push(matchData);
        await AsyncStorage.setItem('hugeData', JSON.stringify(hugeData));
      } else {
        hugeData[hasData] = matchData;
        await AsyncStorage.setItem('hugeData', JSON.stringify(hugeData));
      }

      // Set the states for the app to go into viewing mode
      setViewingMatch(true);
      setBigData(matchData);
      await initializeBigData(matchData);
      setScreens([PrematchScreen, ...form, SaveDataScreen]);
    }

    setLoadingStage(2);
    //await addLoadingTimeHehe(100);
    //console.log(2);

    try {
      url = '';

      setLinkInfo({event: params['event'] || 'none', url: url ? url.includes("?") ? url.slice(0, url.indexOf('?')) : url : ''});

      //console.log(`Event found: ${params['event'] || '2024alhu'}`)
      if (params['event']) {
        await getAPIData(decodeURIComponent(params['event']), true);
      } else {
        await getAPIData('2024none', true);
      }

      setLoadingStage(3);
      await addLoadingTimeHehe(500);
      //console.log(3);
    } catch (e) { alert(e) }

    // Getting the name of the scouter
    let name = await AsyncStorage.getItem('name')
    console.log("NAME:", name);
    //console.log("Name:", name);
    if (name) {
      setName(name);
      console.log("Name:", name);
      setScreenIndex(0);
      setScreens([HomeScreen]);
    } else {
      console.log("NONAME");
      setScreenIndex(0);
      setScreens([NameScreen]);
    }

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
    startApplicationProcess();

    // Get the app state
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      // Save data to server
      if (nextAppState != 'background') { return; }

      let dataToSave = JSON.parse(await AsyncStorage.getItem('hugeData'));
      if (!dataToSave) { dataToSave = []; }
      let numErrors = 0;
      dataToSave.map((match, index) => {
        let event = match["event"];
        let scout = match["scout_name"];
        let number = match["prematch"]["match_num"];
        let type = match["prematch"]["match_type"];
        let data = match;
      });
      if (numErrors > 0) { console.log(numErrors);}
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    console.log(name);
  }, [name]);

  const initializeBigData = async (data) => {
    if (APIData.event != (data["event"] || linkInfo.event)) {
      console.log(`Switching to event ${(data["event"] || linkInfo.event)}`)
      setAPIData(JSON.parse(await AsyncStorage.getItem(data["event"] || linkInfo.event)));
    }

    if (data.hasOwnProperty("event") && data.hasOwnProperty("scout_name")) {
      return;
    }

    let newData = GetFormJSONAsMatch();

    newData["event"] = data["event"] || linkInfo.event;
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
  };

  const tryGetProp = (obj, prop, if_null = undefined) => {
    if (obj.hasOwnProperty(prop)) {
      return obj[prop];
    } else {
      return if_null;
    }
  }

  const slideScreen = (dir, statePackage) => { 
    //console.log(bigDataTest["prematch"]) 
    if (screenIndex == 0 && dir < 0) {
      // If not editing, just go back to the home screen
      if (editingIndex == -1) {
        setScreens([HomeScreen]);
        console.log(statePackage.name);
        if (!statePackage.name) {
          setScreens([NameScreen]);
        }
      }

      // Stop editing or viewing a match
      if (editingIndex != -1 || viewingMatch) {
        setEditingIndex(-1);
        setViewingMatch(false);
        setScreens([StoredMatchesScreen]);
        setBigData({});
      }
      
      // Make sure the screen index is reset
      setScreenIndex(0);

      return;
    }

    if (screenIndex + dir < screens.length) {
      let newIndx = screenIndex + dir;
      let newLeft = newIndx * -dimensions.width;
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
  const HomeScreen = ({style, statePackage, gradientDir = 1}) => {
    gradientDir = 1;

    return (
      <View style={[styles.page, style]}>
        <PageHeader gradientDir={gradientDir} infoText={`Event: ${statePackage.APIData.event.slice(0, 4) + " " + statePackage.APIData.event_name}`} title='Home' style={{position: 'absolute', top: 0}}/>

        <PageContent style={{justifyContent: 'center'}} gradientDir={gradientDir} statePackage={statePackage}>
          <GradientButton title="Match Time!" style={{height: '10%', width: '90%', position: 'absolute', top: '15%'}} onPress={async () => { 
              if (statePackage.APIData.event_name == 'None Found') {
                alert("You have not selected an event!");
                return;
              }
              await statePackage.initializeBigData(statePackage.bigDataTest);
              statePackage.setScreens([PrematchScreen, ...statePackage.form, SaveDataScreen]);
            }}/>
          <GradientButton title="Master Page" onPress={() => { 
              statePackage.setScreens([MasterAuthScreen]);
            }}/>
          <GradientButton title="Stored Matches" onPress={() => {
              statePackage.setScreens([StoredMatchesScreen]);
            }}/>
          <GradientButton title="Server Details" onPress={() => {
              statePackage.setScreens([ServerDetailsScreen]);
            }}/>
          <GradientButton title="Need Help?" onPress={() => {
              statePackage.setScreens([HelpScreen]);
            }}/>
          {/* <GradientButton title="IPhone 13 and above test buttons" onPress={() => {
              statePackage.setScreens([TestScreen]);
            }}/>
          <GradientButton title="Test QR Code" onPress={() => {
              statePackage.setScreens([QRTestScreen]);
            }}/> */}
          
          <RelatedContentContainer style={{bottom: 0, position: 'absolute'}}>
            <HeaderTitle title="When selecting an item from this dropdown, IT WILL DELETE YOUR CURRENT MATCH DATA" headerNum={3} style={{width: "90%"}}/>
            <GradientDropDown
              style={{marginTop: 10}}
              parallelState={{
                state: statePackage.APIData.event, 
                set: async (label, value) => {
                  await statePackage.getAPIData(value, false);
                  statePackage.setLinkInfo({...statePackage.linkInfo, event: value});
                  setBigData({event: value});
                }
              }} 
              save_data={false} 
              title="Find Event" 
              data={statePackage.APIData.events.map((event) => ({label: event["name"], value: event["key"]}))}
            />
          </RelatedContentContainer>

        </PageContent>

        <StatusBar style="light" />
      </View>
    )   
  }

  const TestScreen = ({style, statePackage, gradientDir = 1}) => {
    return (
      <View style={[styles.page, style]}>
        <PageHeader gradientDir={gradientDir} title='Button Test'/>

        <PageContent gradientDir={gradientDir} statePackage={statePackage} style={{flex: 1}}>
          <View style={{flexDirection: 'row', flex: 1}}>
            <GradientButton title="Slide Left" onPress={() => console.log(-1)} style={{width: '40%'}}/>
            <GradientButton title="Slide Right" onPress={() => console.log(1)} style={{width: '40%'}}/>
          </View>
          <View style={{flexDirection: 'row', flex: 1}}>
            <Button title="Slide Left" onPress={() => console.log(-1)} style={{width: '40%'}}/>
            <Button title="Slide Right" onPress={() => console.log(1)} style={{width: '40%'}}/>
          </View>
          <View style={{flexDirection: 'row', flex: 1}}>
            <Pressable onPress={() => {}} style={({pressed}) => [{backgroundColor: pressed ? 'rgb(210, 230, 255)' : 'white', width: '40%'}]}>
              {({pressed}) => (<Text style={styles.text}>{pressed ? 'Pressed!' : 'Press Me'}</Text>)}
            </Pressable>
            <Pressable onPress={() => {}} style={({pressed}) => [{backgroundColor: pressed ? 'rgb(210, 230, 255)' : 'white', width: '40%'}]}>
              {({pressed}) => (<Text style={styles.text}>{pressed ? 'Pressed!' : 'Press Me'}</Text>)}
            </Pressable>
          </View>
        </PageContent>

        <View style={{flex: 1, width: '100%', backgroundColor: 'red', justifyContent: 'center'}}>
          <View style={{flexDirection: 'row', flex: 1, width: '100%', justifyContent: 'center'}}>
            <GradientButton title="Slide Left" onPress={() => console.log(-1)} style={{width: '40%'}}/>
            <GradientButton title="Slide Right" onPress={() => console.log(1)} style={{width: '40%'}}/>
          </View>
          <View style={{flexDirection: 'row', flex: 1, width: '100%', justifyContent: 'center'}}>
            <Button title="Slide Left" onPress={() => console.log(-1)} style={{width: '40%'}}/>
            <Button title="Slide Right" onPress={() => console.log(1)} style={{width: '40%'}}/>
          </View>
          <View style={{flexDirection: 'row', flex: 1, widht: '100%', justifyContent: 'center'}}>
            <Pressable onPress={() => {}} style={({pressed}) => [{backgroundColor: pressed ? 'rgb(210, 230, 255)' : 'white', width: '40%'}]}>
              {({pressed}) => (<Text style={styles.text}>{pressed ? 'Pressed!' : 'Press Me'}</Text>)}
            </Pressable>
            <Pressable onPress={() => {}} style={({pressed}) => [{backgroundColor: pressed ? 'rgb(210, 230, 255)' : 'white', width: '40%'}]}>
              {({pressed}) => (<Text style={styles.text}>{pressed ? 'Pressed!' : 'Press Me'}</Text>)}
            </Pressable>
          </View>
        </View>

        <StatusBar style="light" />
      </View>
    )
  }

  const NameScreen = ({style, statePackage, gradientDir = 1}) => {
    const [name, setName] = useState('');

    return (
      <View style={[styles.page, style]}>

        <PageContent gradientDir={gradientDir} statePackage={statePackage} scrollable={false} style={{justifyContent: 'center', alignItems: 'center'}}>
          <GradientTextInput title="Enter your name" save_data={false} setParallelState={setName}/>
          <GradientButton disabled={!name} title="Continue" onPress={async () => { 
              statePackage.setName(name);
              await AsyncStorage.setItem('name', name);
              statePackage.setScreens([HomeScreen]);
            }}/>
        </PageContent>

        <StatusBar style="light" />
      </View>
    )
  }

  const QRTestScreen = ({style, statePackage, gradientDir = 1}) => {
    return (
      <View style={[styles.page, style]}>
        <PageHeader gradientDir={gradientDir} title='QR Test'/>

        <PageContent gradientDir={gradientDir} statePackage={statePackage} style={{flex: 1}}>
          <GradientQRCode data={"Hi I'm Joe"} size={300}/>
        </PageContent>

        <StatusBar style="light" />
      </View>
    )
  }

  const ServerDetailsScreen = ({style, statePackage, gradientDir = 1}) => {

    const [newServerInfo, setNewServerInfo] = useState({ip: statePackage.serverInfo.ip, port: statePackage.serverInfo.port, timeout: statePackage.serverInfo.timeout});

    return (
      <View style={[styles.page, style]}>
        <PageHeader gradientDir={gradientDir} title='Server Details'/>

        <PageContent gradientDir={gradientDir} statePackage={statePackage}>
          <HeaderTitle headerNum={3} style={{width: '90%'}} title={`If you do not know what any of this is / does, DO NOT mess with it or ask the person in charge of the scouting app's server`}/>
          <GradientTextInput title="Server IP" save_data={false} default_value={newServerInfo.ip} setParallelState={(value) => {setNewServerInfo({...newServerInfo, ip: value})}}/>
          <GradientTextInput title="Port" save_data={false} default_value={newServerInfo.port} setParallelState={(value) => {setNewServerInfo({...newServerInfo, port: value})}}/>
          <GradientTextInput title="Timeout Time (ms)" save_data={false} default_value={String(newServerInfo.timeout)} setParallelState={(value) => {setNewServerInfo({...newServerInfo, timeout: Number(value)})}}/>
        </PageContent>

        <PageFooter gradientDir={gradientDir} statePackage={statePackage} overrideBack={() => {
          slideScreen(-1, statePackage); 
          statePackage.setServerInfo(newServerInfo); 
          AsyncStorage.setItem('serverInfo', JSON.stringify(newServerInfo));
        }}/>
      </View>
    )
  };

  const HelpScreen = ({style, statePackage, gradientDir = 1}) => {
    return (
      <View style={[styles.page, style]}>
        <PageHeader gradientDir={gradientDir} title='Help'/>

        <PageContent gradientDir={gradientDir} statePackage={statePackage} scrollable={true}>
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

        <PageFooter gradientDir={gradientDir} statePackage={statePackage}/>

        <StatusBar style="light" />
      </View>
    );
  }

  // Prebuilt screen, never used in form builder
  const MasterAuthScreen = ({style, statePackage, gradientDir = 1}) => {
    const [authKey, setAuthKey] = useState('');

    return (
      <View style={[styles.page, style]}>
        <PageHeader gradientDir={gradientDir} title='Master'/>

        <PageContent style={{justifyContent: 'center'}} gradientDir={gradientDir} statePackage={statePackage}>
          <GradientTextInput title="Enter auth key" save_data={false} setParallelState={setAuthKey}/>
          <GradientButton title="Continue" onPress={() => { 
              if (authKey != '862orangeblue') {
                alert("Uh oh! Wrong Authentication key!");
                return;
              }
              statePackage.setScreens([MasterControlScreen]);
              statePackage.setScreenIndex(0);
            }}/>
        </PageContent>

        <PageFooter gradientDir={gradientDir} statePackage={statePackage}/>

        <StatusBar style="light" />
      </View>
    );
  }

  // Prebuilt screen, never used in form builder
  const MasterControlScreen = ({style, statePackage, gradientDir = 1}) => {
    return (
      <View style={[styles.page, style]}>
        <PageHeader gradientDir={gradientDir} title='Master'/>

        <PageContent gradientDir={gradientDir} statePackage={statePackage}>
          <HeaderTitle title='This Device'/>
          <GradientButton title="Reset Name" onPress={
            async () => { 
              alert("Reset Name!");
              await AsyncStorage.setItem('name', '');
              statePackage.setName('');
            }}
          />
          <GradientButton title="Reset Data" onPress={
            async () => {
              alert("Reset Match Data!");
              statePackage.setMatchesScouted([]);
              statePackage.setSentMatches([]);
              statePackage.setFailedSendMatches([]);
              await AsyncStorage.multiSet([['hugeData', '[]'], ['sentMatches', '[]'], ['failedSendMatches', '[]']]);
            }}
          />
          <GradientButton title="Reset All" onPress={
            async () => {
              alert("Reset All Data!");
              statePackage.setMatchesScouted([]);
              statePackage.setSentMatches([]);
              statePackage.setFailedSendMatches([]);
              statePackage.setName('');
              await AsyncStorage.multiSet([['hugeData', '[]'], ['sentMatches', '[]'], ['failedSendMatches', '[]'], ['name', '']]);
            }}
          />

          <HeaderTitle title='Other Devices'/>
          <GradientButton title="Reset Name"/>
          <GradientButton title="Reset Data"/>
          <GradientButton title="Reset All"/>
        </PageContent>

        <PageFooter gradientDir={gradientDir} statePackage={statePackage}/>

        <StatusBar style="light" />
      </View>
    );
  }

  // Prebuilt screen, never used in form builder
  const StoredMatchesScreen = ({style, statePackage, gradientDir = 1}) => {
    displayMatches = (accessType, errMsg) => {
      if (!statePackage.matchesScouted || statePackage.matchesScouted == -1) { return [<HeaderTitle key={0} title={errMsg} headerNum={3}/>]; }

      let filteredMatches = statePackage.matchesScouted;

      // Filter matches based on access type, does all matches if none provided.
      if (accessType == "view") {
        filteredMatches = filteredMatches.filter(match => match["view_only"]);
      } else if (accessType == "edit") {
        filteredMatches = filteredMatches.filter(match => !match["view_only"]);
      }

      if (filteredMatches.length > 0) {
        // Sort the matches by match number
        const doubleTryProp = (obj, first, second, if_null) => {if (obj.hasOwnProperty(first)) {return tryGetProp(obj[first], second, if_null)} else {return if_null}}
        filteredMatches.sort((a, b) => doubleTryProp(a, "prematch", "match_num", 151) - doubleTryProp(b, "prematch", "match_num", 151));

        // Display the matches as buttons
        return filteredMatches.map((match) => {
          const index = statePackage.matchesScouted.indexOf(match);
          match["prematch"] = tryGetProp(match, "prematch", {});
          return(
           <GradientButton 
            innerStyle={{backgroundColor: statePackage.failedSendMatches.includes(index) ? 'rgba(50,0,50,0.6)' : statePackage.sentMatches.includes(index) ? 'rgba(0,50,50,0.6)' : 'rgba(0,0,50,1)'}}
            key={index} 
            title={tryGetProp(match["prematch"], "match_num", "NaN") + " : " + tryGetProp(match, "scout_name", "None") + " : " + tryGetProp(match, "event", "None")}
            onPress={() => {
              if (match.hasOwnProperty("view_only") && match["view_only"]) { statePackage.setViewingMatch(true); }
              statePackage.setLoadingStage(0);

              // Ensure that it is no longer marked as sent or failed, because it is being changed
              if (statePackage.sentMatches.includes(index)) {
                statePackage.setSentMatches(statePackage.sentMatches.filter((val) => val != index));
              } else if (statePackage.failedSendMatches.includes(index)) {
                statePackage.setFailedSendMatches(statePackage.failedSendMatches.filter((val) => val != index));
              }

              statePackage.setEditingIndex(index);
              statePackage.setBigData(match);
              statePackage.initializeBigData(match);
              statePackage.setScreenIndex(0);
              statePackage.setScreens([PrematchScreen, ...form, SaveDataScreen]);
              statePackage.setLoadingStage(-1);
            }}
          /> 
          )
        });
      } else {
        return [<HeaderTitle key={0} title={errMsg} headerNum={3}/>]
      }
    }



    return (
      <View style={[styles.page, style]}>
        <PageHeader gradientDir={gradientDir} title='Stored Matches'/>

        <PageContent gradientDir={gradientDir} statePackage={statePackage} scrollable={true}>
          <GradientButton title='Put all scouted matches to database' onPress={async () => 
            { 
              // In the case that there are no matches to send, without this, it breaks due to the method used to transfer the data all async.
              if (statePackage.matchesScouted.length == 0) 
              { 
                alert("You have no matches to send!")
                return;
              }

              setLoadingStage(0);
              setMaxLoadingStage(statePackage.matchesScouted.length);
              let sentMatchesReq = [];
              let failedSendMatchesReq = [];
              let currentLoadStage = 0;
              for (let index in statePackage.matchesScouted) {
                const match = statePackage.matchesScouted[Number(index)];

                // Don't let users send view-only matches
                if (match.view_only) { continue; }

                putOneToDatabase(
                  {
                    event: match.event, 
                    scout: match.scout_name, 
                    number: match.prematch.match_num, 
                    team_info: match.prematch.team_num, 
                    type: match.prematch.match_type[0], 
                    data: match
                  }, statePackage.serverInfo.ip, statePackage.serverInfo.port, statePackage.serverInfo.timeout
                ).then(async (response) => {
                  if (response === "ERROR") {
                    failedSendMatchesReq.push(Number(index));
                  } else {
                    sentMatchesReq.push(Number(index));
                  }
                  setLoadingStage(currentLoadStage + 1);
                  currentLoadStage++;

                  // If this was the last request to go through
                  if (currentLoadStage == statePackage.matchesScouted.length) {
                    statePackage.setSentMatches(sentMatchesReq);
                    statePackage.setFailedSendMatches(failedSendMatchesReq);

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
          <GradientShell radius={{topRad: 15, bottomRad: 15}} style={{height: 5, width: '90%', marginTop: 20}} gradientDir={gradientDir}/>
          <HeaderTitle title='Viewable Matches'/>
          <RelatedContentContainer>
            { displayMatches("view", "You don't have any viewable matches saved yet!") }
          </RelatedContentContainer>

        </PageContent>

        <PageFooter gradientDir={gradientDir} statePackage={statePackage}/>        
        <StatusBar style="light" />
      </View>
    );
  }

  // Prebuilt screen, MAYBE use in form builder
  const SaveDataScreen = ({style, statePackage, gradientDir = 1}) => {
    const compressed_uri = statePackage.linkInfo.url + "?event=" + encodeURIComponent(statePackage.linkInfo.event) + "&match=" + encodeURIComponent(compressMatchData(statePackage.bigDataTest));
    //const uncompressed_uri = statePackage.linkInfo.url + "?event=" + encodeURIComponent(statePackage.linkInfo.event) + "&match=" + encodeURIComponent(JSON.stringify(statePackage.bigDataTest));

    return (
      <View style={[styles.page, style]}>
        <PageHeader gradientDir={gradientDir} infoText={`Event: ${statePackage.APIData.event.slice(0, 4) + " " + statePackage.APIData.event_name}`} title='Save Data'/>

        <PageContent style={{justifyContent: 'center'}} gradientDir={gradientDir} statePackage={statePackage} scrollable={false}>
          <HeaderTitle title='QR Data'/>
          <HeaderTitle title='Scan this QR to view the data on another device.' headerNum={3} style={{width: '60%', marginTop: -5, marginBottom: 10}}/>
          <GradientQRCode text={compressed_uri}/>
          {/* <GradientQRCode text={uncompressed_uri}/> */}
          
          <HeaderTitle headerNum={3} title={"Info: The QR code won't work on TestFlight since you cannot directly open TestFlight apps with links (as far as I know)"}/>
          {/* <HeaderTitle headerNum={3} title={compressed_uri}/> */}
          <GradientButton title={statePackage.viewingMatch ? "Finish Viewing?" : "Finish Scouting?"} onPress={async () => 
            {
              // If viewing a match, dont save the data again.
              if (statePackage.viewingMatch) {
                statePackage.setScreens([HomeScreen]);
                statePackage.setScreenIndex(0);
                statePackage.setViewingMatch(false);
                statePackage.setBigData({});
                return;
              }

              // FIND FIELDS THAT ARE REQUIRED THAT NEED TO BE FILLED IN. Automate eventually.
              const errors = [];

              // If no name or match number is specified, dont save the data.
              if (statePackage.bigDataTest["prematch"]["match_num"] == 0) {
                errors.push("No match number specified");
              }
              if (statePackage.bigDataTest["prematch"]["match_type"].length == 0) {
                errors.push("No match type specified");
              }
              if (statePackage.bigDataTest["prematch"]["alliance_color"].length == 0) {
                errors.push("No alliance color specified");
              }
              if (statePackage.bigDataTest["prematch"]["team_num"].length == 0) {
                errors.push("No team number specified");
              }

              if (errors.length > 0) {
                alert("Cannot save data!\n" + errors.join(",\n") + "!");
                return;
              }

              let newVal = statePackage.matchesScouted;

              let newBigData = statePackage.bigDataTest;

              // Adding the name to the form
              newBigData["scout_name"] = statePackage.name;

              if (statePackage.editingIndex != -1) {
                newVal[statePackage.editingIndex] = newBigData;
              }
            
              const newData = statePackage.editingIndex == -1 ? [...newVal, newBigData] : newVal;
              // Only adds a new match scouted IF you were not editing a match, otherwise, replaces a stored match with its edited version.

              console.log(statePackage.sentMatches, statePackage.failedSendMatches)

              statePackage.setMatchesScouted(newData);
              statePackage.setScreenIndex(0), 
              statePackage.setScreens([HomeScreen]); 
              statePackage.setBigData({});
              statePackage.setEditingIndex(-1);
            }} 
          />

        </PageContent>

        <PageFooter gradientDir={gradientDir} statePackage={statePackage}/>
        <StatusBar style="light" />
      </View>
    )
  }

  // Prebuilt screen for prematch data (EVENTUALLY MAKE THIS PART OF FORM BUIDLER AS WELL)
  const PrematchScreen = ({style, statePackage, gradientDir = 1}) => {

    if (!statePackage.APIData.matches) { return (<View style={[styles.page, style]}><ActivityIndicator size={'large'}/></View>);}
    const [matchType, setMatchType] = useState('');
    const [matchNum, setMatchNum] = useState(-1);
    const [alliance_color, setAllianceColor] = useState('');

    let teamsDisplay = alliance_color[0] === "red" ? ['r1', 'r2', 'r3'] : alliance_color[0] === "blue" ? ['b1', 'b2', 'b3'] : ['t1', 't2', 't3'];
    if (matchType != '' && matchNum > 0 && alliance_color != '') {
      const match = statePackage.APIData.matches.find(match => match["comp_level"] == matchType && match["match_number"] == matchNum);
      if (match) {
        const teams = match["alliances"][alliance_color]["team_keys"];
        teamsDisplay = teams.map(team => team.slice(3));

        // Unset the team value, so that they have to set it again if needed.
        let currentTeamNum = statePackage.bigDataTest["prematch"]["team_num"] ? statePackage.bigDataTest["prematch"]["team_num"][0] : "";
        currentTeamNum = /^[rbt]/.test(currentTeamNum) ? "aa" : currentTeamNum;
        //console.log(currentTeamNum)
        if (!teamsDisplay.includes(currentTeamNum.slice(0, currentTeamNum.indexOf("-"))) && currentTeamNum != "") {
          let newData = statePackage.bigDataTest;
          newData["prematch"]["team_num"] = "";
          statePackage.setBigData(newData);
        }
      }
    }

    // console.log("AAAA:",statePackage.bigDataTest["prematch"]);

    return (
      <View style={[styles.page, style]}>
        <PageHeader title='Prematch' infoText={`Event: ${statePackage.APIData.event.slice(0, 4) + " " + statePackage.APIData.event_name}`} gradientDir={gradientDir}/>

        <PageContent gradientDir={gradientDir} statePackage={statePackage} scrollable={true}>
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
          { /^[rbt]/.test(teamsDisplay[0]) ? <GradientNumberInput asTicker={false} key_value="error_team_num" maxLength={5} maxNum={99999} title='Team Number'/> : null }
          {/* <Button title='HI' style={{backgroundColor: 'red', width: 300, height: 400}}><View style={{width: 100, height: 100}}></View></Button> */}
        </PageContent>

        <PageFooter gradientDir={gradientDir} statePackage={statePackage}/>        
        <StatusBar style="light" />
      </View>
    )
  }

  // Used to display the current screen.
  const DisplayScreen = ({component, style, statePackage, gradientDir = 1}) => {
    //console.log(screens)
    return (
      <>{component({style, statePackage, gradientDir})}</>
    );
  };

  let statePackage = {
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
    form: form,
    serverInfo: serverInfo,
    setServerInfo: setServerInfo,
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
    <TouchableNativeFeedback onPress={() => Keyboard.dismiss()}>
      <SafeAreaView style={[styles.container, {flexDirection: 'row', overflow: 'visible',left: leftAmount}]}>
        { screens.length > 0 ? <DisplayScreen key={screenIndex} statePackage={statePackage} component={screens[screenIndex]} gradientDir={(screenIndex) % 2}/> : null }
        <Modal
          style={{zIndex: -1000}}
          animationType="fade"
          transparent={false}
          visible={loadingStage > -1 || screens.length == 0}
          onRequestClose={() => {
            setVisible(false);
          }}
        >
          <View style={{width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgb(0, 0, 65)'}}>
            <View style={{width: '80%', height: '50%%', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent'}}>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'stretch',
    alignItems: 'stretch',
    backgroundColor: 'rgb(0, 0, 40)',
    flexDirection: 'column',
  },
  page: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgb(0, 0, 65)',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    paddingTop: Platform.OS === 'android' ? 20 : 0,
    margin: 0,
  },
});
