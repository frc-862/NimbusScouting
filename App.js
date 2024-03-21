import React, {useState, useRef, useEffect} from 'react';
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
  GradientShell
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
  putOneToDatabase
} from './backend/APIRequests';
import MaskedView from '@react-native-masked-view/masked-view';
import { LeaveAnimationField, MicrophoneAnimationStage, NoteAnimationField, ParkAnimationField, TrapAnimationStage } from './InfoAnimations';

// Link to open testflight app?: exp+nimbus://expo-development-client/?event=2023tnkn
// QR Code is in the assets folder.
export default function App() {
  const dimensions = Dimensions.get('window');
  const [loadingStage, setLoadingStage] = useState(0);
  const [maxLoadingStage, setMaxLoadingStage] = useState(3);
  const [loadingScreen, setLoadingScreen] = useState(false);
  const [screenIndex, setScreenIndex] = useState(0);
  const [screens, setScreens] = useState([]);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [bigDataTest, setBigData] = useState({});
  const [form, setForm] = useState(FormBuilder());
  const [name, setName] = useState('');
  const [linkInfo, setLinkInfo] = useState({event: '', url: ''});
  const [APIData, setAPIData] = useState({matches: [], teams: [], event: ''});
  const [viewingMatch, setViewingMatch] = useState(false);
  const [infoModelProps, setInfoModelProps] = useState({headerText: 'Header', infoText: 'Info', buttonText: 'Button', visible: false, type: 'info'});
  const [matchesScouted, setMatchesScouted] = useState([]);
  const [sentMatches, setSentMatches] = useState([]);
  const [failedSendMatches, setFailedSendMatches] = useState([]);
  const [scoutedMatchInfo, setScoutedMatchInfo] = useState([]);
  const leftAmount = useRef(new Animated.Value(0)).current;

  const lightningImage = require('./assets/862gigawatt.png');

  const getAPIData = async (eventCode) => {
    try {
        const matches = await getBlueAllianceMatches(eventCode);
        const teams = await getBlueAllianceTeams(eventCode);
        const newData = {
          matches: matches,
          teams: teams,
          event: eventCode
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

    // const byteSize = str => new Blob([str]).size;
    // let sample = `
    // {
    //   "auton": {"amp_scored": "15", "collection_location": "12", "leave": "718", "notes_collected": "77", "speaker_scored": "true"}, 
    //   "endgame": {"climb": "cheesze", "harmony": "aaaa", "park": "bbbb", "spotlit_attempts": "cccc", "successful_spotlits": "dddd"}, 
    //   "event": "2023alhu", "page_keys": ["prematch", "auton", "teleop", "endgame"], 
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
      // Getting the name of the scouter
      let name = await AsyncStorage.getItem('name')
      //console.log("Name:", name);
      if (name) {
        setName(name);
      } else {
        setInfoModelProps({headerText: 'Enter your name', infoText: 'You cannot do this again!', buttonText: 'Continue', visible: true, type: 'nameInput'});
      }

      url = '';

      setLinkInfo({event: params['event'] || '2023alhu', url: url ? url.includes("?") ? url.slice(0, url.indexOf('?')) : url : ''});

      //console.log(`Event found: ${params['event'] || '2023alhu'}`)
      if (params['event']) {
        await getAPIData(decodeURIComponent(params['event']));
      } else {
        await getAPIData('2023alhu');
      }

      setLoadingStage(3);
      await addLoadingTimeHehe(500);
      //console.log(3);
    } catch (e) { alert(e) }

    setScreens([HomeScreen]);
    setScreenIndex(0);

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

  const initializeBigData = async (data) => {
    if (APIData.event != (data["event"] || linkInfo.event)) {
      console.log(`Switching to event ${(data["event"] || linkInfo.event)}`)
      setAPIData(JSON.parse(await AsyncStorage.getItem(data["event"] || linkInfo.event)));
    }

    if (data.hasOwnProperty("event")) {
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

  const slideScreen = (dir) => { 
    console.log(bigDataTest["prematch"]) 
    if (screenIndex == 0 && dir < 0) {
      // If not editing, just go back to the home screen
      if (editingIndex == -1) {
        setScreens([HomeScreen]);
        if (!name) {
          setInfoModelProps({headerText: 'Enter your name', infoText: 'You cannot do this again!', buttonText: 'Continue', visible: true, type: 'nameInput'});
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
        <PageHeader gradientDir={gradientDir} title='Home' style={{position: 'absolute', top: 0}}/>

        <PageContent style={{justifyContent: 'center'}} gradientDir={gradientDir} statePackage={statePackage}>
          <GradientButton title="Match Time!" style={{height: '10%', width: '90%', position: 'absolute', top: '15%'}} onPress={async () => { 
              setLoadingScreen(true);
              await statePackage.initializeBigData(statePackage.bigDataTest);
              statePackage.setScreens([PrematchScreen, ...statePackage.form, SaveDataScreen]);
              setLoadingScreen(false);
            }}/>
          <GradientButton title="Master Page" onPress={() => { 
              statePackage.setScreens([MasterAuthScreen]);
            }}/>
          <GradientButton title="Stored Matches" onPress={() => {
              statePackage.setScreens([StoredMatchesScreen]);
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
              await AsyncStorage.setItem('hugeData', '[]');
            }}
          />
          <GradientButton title="Reset All" onPress={
            async () => {
              alert("Reset All Data!");
              await AsyncStorage.setItem('name', '');
              statePackage.setName('');
              await AsyncStorage.setItem('hugeData', '[]');
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
          <GradientButton title='Reset Matches Scouted' onPress={async () => 
            {
              statePackage.setMatchesScouted([]);
              statePackage.setSentMatches([]);
              statePackage.setFailedSendMatches([]);
            }}/>
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

                putOneToDatabase({event: match.event, scout: match.scout_name, number: match.prematch.match_num, team_info: match.prematch.team_num, type: match.prematch.match_type[0], data: match}).then(async (response) => {;
                  if (response === undefined) {
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
        <PageHeader gradientDir={gradientDir} title='Save Data'/>

        <PageContent style={{justifyContent: 'center'}} gradientDir={gradientDir} statePackage={statePackage}>
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

              // If no name or match number is specified, dont save the data.
              if (statePackage.bigDataTest["prematch"]["match_num"] == 0) {
                alert("No match number specified!\nCannot save data!")
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
        console.log(currentTeamNum)
        if (!teamsDisplay.includes(currentTeamNum.slice(0, currentTeamNum.indexOf("-"))) && currentTeamNum != "") {
          let newData = statePackage.bigDataTest;
          newData["prematch"]["team_num"] = "";
          statePackage.setBigData(newData);
        }
      }
    }

    console.log(statePackage.bigDataTest["prematch"]);

    return (
      <View style={[styles.page, style]}>
        <PageHeader title='Prematch' gradientDir={gradientDir}/>

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
    editingIndex: editingIndex,
    setEditingIndex: setEditingIndex,
    name: name,
    setName: setName,
    viewingMatch: viewingMatch,
    setViewingMatch: setViewingMatch,
    linkInfo: linkInfo,
    form: form,
    // Notification / Popup stuff
    infoModelProps: infoModelProps,
    setInfoModelProps: setInfoModelProps,
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

  // return (
  //   <SafeAreaView style={{justifyContent: 'center', alignItems: 'center'}}>
  //     <Button title='ICHICAHICAIOCHA'></Button>
  //   </SafeAreaView>
  // )

  return (
    <TouchableNativeFeedback onPress={() => Keyboard.dismiss()}>
      <SafeAreaView style={[styles.container, {flexDirection: 'row', overflow: 'visible',left: leftAmount}]}>
        { screens.length > 0 ? <DisplayScreen key={screenIndex} statePackage={statePackage} component={screens[screenIndex]} gradientDir={(screenIndex) % 2}/> : null }
        <ModalPopup  
          statePackage={statePackage} 
          infoText={infoModelProps.infoText}
          headerText={infoModelProps.headerText} 
          buttonText={infoModelProps.buttonText} 
          visible={infoModelProps.visible} 
          setVisible={() => setInfoModelProps({...infoModelProps, visible: false})}
          type={infoModelProps.type}
        />
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
