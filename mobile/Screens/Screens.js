import ScreenShell from "./ScreenShell";
import { GradientButton, GradientChoice, GradientQRCode, GradientTextInput } from "../GradientComponents";
import { Animated, View, Text, ScrollView, Image, Pressable, Easing, StyleSheet, Platform, StatusBar } from "react-native";
import AppContext from "../../components/AppContext";
import { useContext, useEffect, useState, useRef, memo } from "react";
import { HeaderTitle } from "../PageComponents";
import { AppCheckbox, AppInput } from "../../GlobalComponents";
import { GetFormJSONAsMatch } from "../FormBuilder";
import { DeflateString, InflateString } from "../../backend/DataCompression";
import Globals from "../../Globals";
import { APIGet, getBlueAllianceDataFromURL, getBlueAllianceTeams, getDatabaseDataFromURL, putOneToDatabase, testGet } from "../../backend/APIRequests";
import { LeaveAnimationField, MicrophoneAnimationStage, NoteAnimationField, ParkAnimationField, TrapAnimationStage } from "../InfoAnimations";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DropdownComponent from "./Dropdown";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import DragDropList from "../DragDropList";
import DraggableLyrics from "../DragDropSimple";
import DataDisplay from "../DataDisplay";
import { PageHeader, PageContent, PageFooter } from "../PageComponents";
import { LinearGradient } from "expo-linear-gradient";
import { json, timeout } from "d3";
import { useKeepAwake } from "expo-keep-awake";

/** 
 * This is the **main screen** of the app. It is the first screen that the user sees when they open the app.
 * 
 * @description This screen has buttons to *scout matches*, *view data*, *select a form*, and *view the settings*. It also has buttons to view the *scouted matches* and the *picklist*.
 * 
 * @param {Object} gradientDir - The direction of the gradient for the screen.
 * @returns {JSX.Element} - The JSX code for the screen.
*/
const HomeScreen = memo(({gradientDir}) => {
  const ctx = useContext(AppContext);

  return (
    <ScreenShell gradientDir={gradientDir} scrollable={true}>
      <GradientButton outerStyle={{height: 100, width: '90%'}} style={{padding: 5}} textStyle={{fontSize: 25}} title={"Time to Scout!"} onPress={() => {
        if (ctx.currentForm === undefined) { ctx.showNotification("You don't have a form selected!", Globals.NotificationWarningColor); return; }
        if (ctx.scoutingSettings.event === "none") { ctx.showNotification("You don't have an event selected!", Globals.NotificationWarningColor); return; }
        ctx.setScreens(ctx.formInfo);

        if (ctx.matchData === undefined) {
          // console.log(GetFormJSONAsMatch(JSON.stringify(ctx.currentForm.form)));
          ctx.setMatchData({form: {name: ctx.currentForm.name, year: ctx.currentForm.year}, event: ctx.scoutingSettings.event, ...GetFormJSONAsMatch(JSON.stringify(ctx.currentForm.form))});
        }
      }}/>
      <GradientButton title={"Need help scouting?"} onPress={() => {
        ctx.setScreens([{screen: ScoutHelpScreen, name: 'Help', onBack: () => {ctx.setScreens([{screen: HomeScreen, name: 'Home'}])}}]);
      }}/>
      <View style={{width: '80%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
        <GradientButton outerStyle={{flex: 1}} textStyle={{textAlign: 'center'}} title={"Print Match Data"} onPress={() => {
          console.log(ctx.matchData);
        }}/>
        <GradientButton outerStyle={{flex: 1}} textStyle={{textAlign: 'center'}} title={"Print Current Form Data"} onPress={() => {
          console.log(JSON.stringify(ctx.currentForm));
        }}/>
      </View>
      <View style={{width: '80%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
        <GradientButton title={"Settings"} outerStyle={{flex: 1}} textStyle={{textAlign: 'center'}} onPress={() => {
          ctx.setScreens([{screen: SettingsScreen, name: 'Settings', onBack: () => {ctx.setScreens([{screen: HomeScreen, name: 'Home'}])}}])
        }}/>
      </View> 

      <GradientButton title={"Scouted Matches"} onPress={() => {
        ctx.setScreens([{screen: ScoutedMatchesScreen, name: 'Scouted Matches', onBack: () => {ctx.setScreens([{screen: HomeScreen, name: 'Home'}])}}])
      }}/>
      <GradientButton title={"Select Form"} onPress={async () => {
        await ctx.setLoadPercent(0, 0);

        const serverInfo = JSON.parse(await AsyncStorage.getItem("serverInfo"));

        let data = await getDatabaseDataFromURL(serverInfo.urlBase, '/forms', serverInfo.timeout);
        if (data === "ERROR") { 
          if (ctx.loadedForms.length === 0) {
            ctx.showLoadError(50).then(() => {ctx.showNotification("Failed to load forms! Try again later.", Globals.NotificationErrorColor);});
            return;
          }
          ctx.showLoadError(50).then(() => {ctx.showNotification("Failed to load forms! Using cached forms.", Globals.NotificationWarningColor);});
          ctx.setScreens([{screen: FormSelectScreen, name: 'Select Form', infoText: ctx.currentForm ? `Current: ${ctx.currentForm.name}` : "None Currently!", onBack: () => {ctx.setScreens([{screen: HomeScreen, name: 'Home'}])}}]);
          return;
        } else {
          AsyncStorage.setItem('stored forms', JSON.stringify(data.map((form) => DeflateString(JSON.stringify(form)))));
          ctx.setLoadedForms(data);
        }

        ctx.setScreens([{screen: FormSelectScreen, name: 'Select Form', infoText: ctx.currentForm ? `Current: ${ctx.currentForm.name}` : "None Currently!", onBack: () => {ctx.setScreens([{screen: HomeScreen, name: 'Home'}])}}]);
       
        await ctx.setLoadPercent(100, 300);
      }}/>

      
      {/* <GradientButton title={"View Data"} onPress={async () => {
        await ctx.setLoadPercent(0, 0);

        if (ctx.currentForm === undefined) { 
          ctx.showLoadError(33).then(() => { ctx.showNotification("You don't have a form selected!", Globals.NotificationWarningColor); });
          return;
        }

        const serverInfo = JSON.parse(await AsyncStorage.getItem("serverInfo"));

        let data = await getDatabaseDataFromURL(serverInfo.urlBase, '/matches', serverInfo.timeout);
        if (data === "ERROR") {
          if (ctx.loadedMatches.length === 0) {
            ctx.showLoadError(66).then(() => {ctx.showNotification("Failed to load matches! Try again later.", Globals.NotificationErrorColor);});
            return;
          }
          ctx.showLoadError(66).then(() => {ctx.showNotification("Failed to load matches! The data you view may not be up to date!", Globals.NotificationWarningColor);});
          AsyncStorage.setItem('stored view matches', JSON.stringify(ctx.loadedMatches.map((match) => DeflateString(JSON.stringify(match)))));
          ctx.setScreens([{screen: DataViewScreen, name: 'View Data', onBack: () => {ctx.setScreens([{screen: HomeScreen, name: 'Home'}])}}]);
          return;
        } else {
          AsyncStorage.setItem('stored view matches', JSON.stringify(data.map((match) => DeflateString(JSON.stringify(match)))));
        }

        ctx.setScreens([{screen: DataViewScreen, name: 'View Data', onBack: () => {ctx.setScreens([{screen: HomeScreen, name: 'Home'}])}}]);

        await ctx.setLoadPercent(100, 300);
      }}/> */}
      <GradientButton title={"Picklist"} onPress={() => {ctx.setScreens([{screen: PicklistScreen, name: 'Picklist', infoText: '', onBack: () => {ctx.setScreens([{screen: HomeScreen, name: 'Home'}])}}]);}}/>
    </ScreenShell>
  );
});

/**
 * This screen is for the user to see useful visuals and information about the game and the scoring elements.
 * 
 * @description This screen has animations and information about the game elements and how they work.
 * 
 * @param {Object} gradientDir - The direction of the gradient for the screen.
 * @returns {JSX.Element} - The JSX code for the screen.
 */
const ScoutHelpScreen = memo(({gradientDir}) => {
  return (
    <ScreenShell gradientDir={gradientDir} scrollable={true}>
      <HeaderTitle title='Leave' fontSize={30}/>
      <HeaderTitle title='The robot has to fully leave their starting zone (pass the white line on their side) in auton, the first 15 seconds of the game' fontSize={15} style={{maxWidth: '80%'}}/>
      <LeaveAnimationField/>
      <HeaderTitle title='Note' fontSize={30} style={{marginTop: 10}}/>
      <HeaderTitle title='The game piece used to score in the AMP and the SPEAKER' fontSize={15} style={{maxWidth: '80%'}}/>
      <NoteAnimationField/>
      <HeaderTitle title='Park' fontSize={30} style={{marginTop: 10}}/>
      <HeaderTitle title='At the very end of the game, if any part of the robot is in the STAGE area (the triangle-like zone)' fontSize={15} style={{maxWidth: '80%'}}/>
      <ParkAnimationField/>
      <HeaderTitle title='Microphone' fontSize={30} style={{marginTop: 10}}/>
      <HeaderTitle title='The pole (there are three) on each side of the STAGE at the top, which can hold a high note on it' fontSize={15} style={{maxWidth: '80%'}}/>
      <MicrophoneAnimationStage/>
      <HeaderTitle title='Trap' fontSize={30} style={{marginTop: 10}}/>
      <HeaderTitle title='The flap and container for a note in the middle of the STAGE (one on each side)' fontSize={15} style={{maxWidth: '80%'}}/>
      <TrapAnimationStage/>
    </ScreenShell>
  )
});

/**
 * This screen is used to see the matches that have been scouted by the user, and to send them to the server.
 * 
 * @description This screen has match buttons that can be selected and deleted, and a button to send the selected matches to the server.
 * 
 * @param {Object} gradientDir - The direction of the gradient for the screen.
 * @returns {JSX.Element} - The JSX code for the screen.
 */
const ScoutedMatchesScreen = memo(({gradientDir}) => {
  const ctx = useContext(AppContext);
  // Load trash image.
  const trashIcon = require('../../assets/icons/delete-icon.png');
  const checkIcon = require('../../assets/icons/check-mark-icon.png');
  const editIcon = require('../../assets/icons/file-edit-icon.png');
  const exportIcon = require('../../assets/icons/file-export-icon.png');

  const buttonWidthAndMargins = useRef(new Animated.ValueXY({x: 0, y: 0})).current;

  const [matches, setMatches] = useState([]);
  const [selectedMatches, setSelectedMatches] = useState([]);
  const [sentMatches, setSentMatches] = useState([]);

  async function getSentMatches() { 
    const storedSendMatches = await AsyncStorage.getItem('sent matches').then((data) => data ? JSON.parse(data) : []);
    setSentMatches(storedSendMatches);
  }


  function trySelectMatch(index) {
    if (selectedMatches.includes(index)) {
      setSelectedMatches(selectedMatches.filter((item) => item !== index));
    } else {
      setSelectedMatches([...selectedMatches, index]);
    }
  }

  function trySelectAll() {
    if (selectedMatches.length === matches.length) {
      setSelectedMatches([]);
    } else {
      setSelectedMatches(matches.map((match, index) => index));
    }
  }

  function deleteSelectedMatches() {
    let newMatches = [...matches];
    newMatches = newMatches.filter((match, index) => !selectedMatches.includes(index));
    setMatches(newMatches);
    setSelectedMatches([]);

    let deflatedNewMatches = newMatches.map((match) => DeflateString(JSON.stringify(match)));
    let newSentMatches = sentMatches.filter((match) => deflatedNewMatches.includes(match));
    AsyncStorage.setItem('sent matches', JSON.stringify(newSentMatches));
    setSentMatches(newSentMatches);

    AsyncStorage.setItem('stored matches', JSON.stringify(newMatches.map((match) => DeflateString(JSON.stringify(match)))));
  }

  async function decompressMatches() {
    const storedMatchData = await AsyncStorage.getItem('stored matches').then((data) => data ? JSON.parse(data) : [])
    let decompressedMatches = [];
    for (let match of storedMatchData) {
      decompressedMatches.push(JSON.parse(InflateString(match)));
    }
    setMatches(decompressedMatches);
  }

  useEffect(() => { 
    decompressMatches();
    getSentMatches();
  }, []);

  useEffect(() => {
    if (selectedMatches.length > 0) {
      Animated.timing(buttonWidthAndMargins, 
        {
          toValue: {x: 75, y: 5}, 
          duration: 200, 
          easing: Easing.inOut(Easing.quad), 
          useNativeDriver: false
        }
      ).start();      
    } else {
      Animated.timing(buttonWidthAndMargins, 
        {
          toValue: {x: 0, y: 0}, 
          duration: 200, 
          easing: Easing.inOut(Easing.quad), 
          useNativeDriver: false
        }
      ).start(); 
    }
  }, [selectedMatches]);
  
  const DeleteButton = ({onShouldDelete = () => {}}) => {
    const opactiyAnim = useRef(new Animated.Value(1)).current;
    const [onConfirmation, setOnConfirmation] = useState(false);

    useEffect(() => {
      if (onConfirmation) {
        const timeout = setTimeout(() => {
          Animated.timing(opactiyAnim, {toValue: 0.5, duration: 200, useNativeDriver: false}).start(() => { 
            setOnConfirmation(false);
            Animated.timing(opactiyAnim, {toValue: 1, duration: 200, useNativeDriver: false}).start();
          });
        }, 3000);
        return () => { clearTimeout(timeout); }
      }
    }, [onConfirmation]);

    return (
      <Animated.View style={{flex: 1, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', opacity: opactiyAnim}}>
        <Pressable 
          onPressIn={() => {opactiyAnim.setValue(0.5)}} 
          onPressOut={() => {Animated.timing(opactiyAnim, {toValue: 1, duration: 200, useNativeDriver: false}).start()}}
          onPress={() => {
            if (onConfirmation) {
              onShouldDelete();
            } else {
              setOnConfirmation(true);
            }
          }}
          style={{padding: 5, paddingHorizontal: 10, borderRadius: 20, justifyContent: 'center', alignItems: 'center'}}
        >
          { 
            onConfirmation ? 
            <Image source={checkIcon} style={{position: 'absolute', width: 30, height: 22}} tintColor={'green'}/> 
            : 
            <Image source={trashIcon} style={{position: 'absolute', width: 25, height: 30}} tintColor={'red'}/> 
          }
          
        </Pressable>
      </Animated.View>
    );
  }

  const EditButton = ({index}) => {
    const opactiyAnim = useRef(new Animated.Value(1)).current;

    return (
      <Animated.View style={{width: 30, marginHorizontal: 10, justifyContent: 'center', alignItems: 'center', opacity: opactiyAnim}}>
        <Pressable 
          onPressIn={() => {opactiyAnim.setValue(0.5)}} 
          onPressOut={() => {Animated.timing(opactiyAnim, {toValue: 1, duration: 200, useNativeDriver: false}).start()}}
          onPress={() => {
            ctx.setMatchData(matches[index]);
            ctx.setScreens(
              [{
                screen: SaveMatchScreen, 
                props: {dataToShow: matches[index]},
                name: 'Match QR',
                onBack: () => {
                  ctx.setScreens(
                    [{
                      screen: ScoutedMatchesScreen, 
                      name: 'Scouted Matches', 
                      onBack: () => {
                        ctx.setScreens([{screen: HomeScreen, name: 'Home'}])
                      }
                    }]
                  )
                }
              }]
            );
            // ctx.showNotification("Edit function not implemented yet!", Globals.NotificationWarningColor);
            
            // ctx.setScreens(ctx.formInfo);
          }}
          style={{padding: 5, paddingHorizontal: 10, borderRadius: 20}}
        >
          <Image source={editIcon} style={{width: 23, height: 30}} tintColor={'white'}/>
        </Pressable>
      </Animated.View>
    );
  }

  const ExportButton = () => {
    const opactiyAnim = useRef(new Animated.Value(1)).current;

    return (
      <Animated.View style={{flex: 1, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', opacity: opactiyAnim}}>
        <Pressable 
          onPressIn={() => {opactiyAnim.setValue(0.5)}} 
          onPressOut={() => {Animated.timing(opactiyAnim, {toValue: 1, duration: 200, useNativeDriver: false}).start()}}
          onPress={async () => {
            await ctx.setLoadPercent(0, 0);

            const serverInfo = JSON.parse(await AsyncStorage.getItem("serverInfo"));

            let failedMatches = 0;
            let successfulMatches = []

            // Using OF works here, but IN does not. This is because in works like for i in range, and of works like foreach.
            for (const matchIndex of selectedMatches) {
              if (!(matches[matchIndex] && matches[matchIndex]["0{match_num}"] && matches[matchIndex]["0{team}"] && matches[matchIndex]["0{team}"][0])) { failedMatches++; continue; }
              await putOneToDatabase(
                serverInfo.urlBase,
                {
                  data: matches[matchIndex],
                  number: matches[matchIndex]["0{match_num}"],
                  team: matches[matchIndex]["0{team}"][0],
                  scout: "NONE YET",
                  event: matches[matchIndex]["event"],
                },
                serverInfo.timeout
              ).then((data) => {
                if (data === "ERROR") { failedMatches++; }
                else { successfulMatches.push(DeflateString(JSON.stringify(matches[matchIndex]))); }
              });
            }


            const newSentMatches = sentMatches;
            successfulMatches.forEach((index) => {
              if (!newSentMatches.includes(index)) {
                newSentMatches.push(index);
              }
            });
            AsyncStorage.setItem('sent matches', JSON.stringify(newSentMatches));
            setSentMatches(newSentMatches);


            if (failedMatches === selectedMatches.length) {
              await ctx.showLoadError(0);
              ctx.showNotification(`Failed to upload all of the selected matches!`, Globals.NotificationErrorColor);
            }
            else if (failedMatches > 0) {
              await ctx.showLoadError((failedMatches / selectedMatches.length) * 100);
              ctx.showNotification(`Failed to upload ${failedMatches} matches!`, Globals.NotificationWarningColor);
            }
            else {
              await ctx.setLoadPercent(100, 300);
              ctx.showNotification("Successfully uploaded all selected matches!", Globals.NotificationRegularColor);
            }
          }}
          style={{padding: 5, paddingHorizontal: 10, borderRadius: 20, justifyContent: 'center', alignItems: 'center'}}
        >
          <Image source={exportIcon} style={{position: 'absolute', width: 24, height: 30}} tintColor={'white'}/>
        </Pressable>
      </Animated.View>
    );
  }

  // Determine what to render based on your matches scouted and if the matches have been decompressed yet.
  let listRender = [
    <HeaderTitle key={1} title='No Matches Scouted Yet!' fontSize={30}/>,
    <HeaderTitle key={2} title='Go Scout Some!' fontSize={15}/>,
  ];

  if (matches.length > 0) {
    listRender = matches.map((match, index) => {
      let sent = sentMatches.includes(DeflateString(JSON.stringify(match)));

      return (
        <AppCheckbox 
          onPress={() => {trySelectMatch(index)}} key={String(selectedMatches.includes(index)) + index} 
          checked={selectedMatches.includes(index)} 
          checkedColor={'rgba(0,255,0,0.3)'} 
          gradientColors={match['0{alliance}'][0] === 'red' ? ['rgb(182,0,0)', 'rgb(182,0,0)'] : ['rgb(0,0,182)', 'rgb(0,0,182)']} 
          innerStyle={{borderRadius: 17}} 
          style={{overflow: 'hidden', padding: 5, height: undefined, backgroundColor: sent ? 'purple' : undefined}} 
          outerStyle={{ marginBottom: 10, marginHorizontal: 5, flex: 1, minWidth: '40%', maxWidth: '50%', backgroundColor: sent ? 'purple' : undefined}}
        >    

          <View style={{flexDirection: 'row'}}>
            <View style={{flex: 1, paddingLeft: 10, paddingVertical: 5, justifyContent: 'center'}}>
              <Text style={{color: 'white', fontSize: 16}}>Match: {match["0{match_num}"]}</Text>
              <Text style={{color: 'white', fontSize: 16}}>Team: {match["0{team}"]}</Text>
            </View>  
            <EditButton index={index}/>
          </View>                
          {/* <View style={{flexDirection: 'row', marginTop: 5, height: 30, width: '100%', alignItems: 'center'}}>
            <Text style={{textAlign: 'center', color: 'white', fontSize: 25, fontWeight: 'bold', flex: 1}}>#{match["0{match_num}"]} - {match["0{team}"]}</Text>
          </View>

          <View style={{flexDirection: 'row'}}>
            <EditButton index={index}/>
            <View style={{flex: 4, paddingVertical: 5, justifyContent: 'center'}}>
              <Text style={{color: 'white', fontSize: 12}}>{`Scouted on ${match["date"]} by You (Put name here)`}</Text>
              <Text style={{color: 'white', fontSize: 12}}>{`Using form "${match["form"].name}"`}</Text>
            </View>
          </View> */}
        </AppCheckbox>
      )
    });
  } else {
    listRender = [
      <HeaderTitle key={1} title='Decompressing Matches...' fontSize={30}/>,
      <HeaderTitle key={2} title='Please Wait' fontSize={10}/>,
    ];
  }

  // Just return the screen with the list of matches.
  return (
    <ScreenShell gradientDir={gradientDir} scrollable={false}>
      <ScrollView style={{width: '90%'}} contentContainerStyle={{width: '100%', alignItems: 'center'}}>
        <Pressable style={{width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center'}}>
          { listRender }
        </Pressable>
      </ScrollView>
      <View style={{width: '90%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
        { matches.length > 0 ? <GradientButton outerStyle={{flex: 1}} title={selectedMatches.length === matches.length ? 'Deselect All' : 'Select All'} onPress={trySelectAll}/> : null }
        <Animated.View key={0} style={{height: 75, width: buttonWidthAndMargins.x, margin: buttonWidthAndMargins.y, borderRadius: 20, backgroundColor: Globals.ButtonColor}}><ExportButton/></Animated.View>
        <Animated.View key={1} style={{height: 75, width: buttonWidthAndMargins.x, margin: buttonWidthAndMargins.y, borderRadius: 20, backgroundColor: Globals.ButtonColor}}><DeleteButton onShouldDelete={deleteSelectedMatches}/></Animated.View>
      </View>
    </ScreenShell>
  )
});

/**
 * This is the screen you select the form you will be using to enter in your match data.
 * 
 * @description This screen shows a list of forms that you can select, pulled from the server that you entered on the settings screen.
 * 
 * @param {Object} gradientDir - The direction of the gradient for the screen.
 * @returns {JSX.Element} - The JSX code for the screen.
 */
const FormSelectScreen = memo(({gradientDir}) => {
  const ctx = useContext(AppContext)

  const [currentSelected, setCurrentSelected] = useState(-1);
  const [yearQuery, setYearQuery] = useState('');
  const [nameQuery, setNameQuery] = useState('');

  function setSelected(index) {
    if (currentSelected == index) {
      setCurrentSelected(-1);
    } else {
      setCurrentSelected(index);
    }

  }

  if (ctx.loadedForms === undefined || ctx.loadedForms.length === 0) {
    return (
      <ScreenShell gradientDir={gradientDir} scrollable={false} style={{justifyContent: 'center', alignItems: 'center'}}>
        <HeaderTitle title='Could not load forms!' fontSize={30}/>
        <HeaderTitle title='Retrying...' fontSize={15}/>
      </ScreenShell>
    )
  }

  return (
    <ScreenShell gradientDir={gradientDir} scrollable={false}>
      <AppInput title='Year' outerStyle={{width: '80%'}} onValueChanged={setYearQuery}/>
      <HeaderTitle title='Results:' fontSize={30} style={{marginBottom: 5}}/>
      <View style={{width: '90%', height: 5, borderRadius: 20, marginBottom: 10, backgroundColor: Globals.GradientColor2}}/>
      <ScrollView style={{flex: 1, width: '100%'}} contentContainerStyle={{alignItems: 'center'}}>
        {
          ctx.loadedForms.map((form, index) => {
            const yqLower = yearQuery.toLowerCase();
            if (yqLower !== '' && !form.year.includes(yqLower)) { return; }

            return (
              <AppCheckbox key={String(currentSelected === index) + String(index)} onPress={() => {setSelected(index)}} checked={currentSelected === index} checkedColor={'rgba(0,255,0,0.3)'} style={{height: undefined}} outerStyle={{marginBottom: 10, width: '75%'}}>
                <Text style={{color: 'white', fontSize: 10, marginTop: 10, textAlign: 'center'}}>{form.year}</Text>
                <Text style={{ color: 'white', fontSize: 17, marginBottom: 10, textAlign: 'center', fontWeight: 'bold'}}>{form.name}</Text>
              </AppCheckbox>
            )
          })
        }
      </ScrollView>
      { currentSelected != -1 ? 
        <GradientButton title='Select Form' onPress={() => {
          ctx.setCurrentForm(ctx.loadedForms[currentSelected]);
          AsyncStorage.setItem("currentForm", JSON.stringify(ctx.loadedForms[currentSelected]));
          ctx.showNotification(`Selected form: ${ctx.loadedForms[currentSelected].name}!`);
          // Do this so that the match data does not have possibly extra values from the other forms you may have used before.
          ctx.setMatchData(undefined);
        }}/> 
        : null 
      } 
    </ScreenShell>
  )
});

/**
 * This screen is used to see the match data that has been scouted by all of the users, along with the rankings of some teams.
 * 
 * @description This screen has multiple fields that can be changed, to see different data, and to see the rankings of the teams by different factors.
 * 
 * @param {Object} gradientDir - The direction of the gradient for the screen.
 * @returns {JSX.Element} - The JSX code for the screen.
 */
const DataViewScreen = memo(({gradientDir}) => {
  const ctx = useContext(AppContext);
  const [matches, setMatches] = useState([]);
  // How our data show be displayed. ("auto" means that we want it to choose a line chart for numerical data, and a pie chart for categorical data, or a percentage thingy or something for true/false values)
  const [displayStyleOverride, setDisplayStyleOverride] = useState("auto");
  const [formKeyValueChoices, setFormKeyValueChoices] = useState(getFormKeyValues());

  const [fullScreen, setFullscreen] = useState(false);

  const displayViewSize = useRef(new Animated.Value(150)).current;

  // Our different data filters.
  const [dataFilters, setDataFilters] = useState({
    form: ctx.currentForm,
    dataYValues: [
      {
        value: null,
        uses: [],
        conditionalValue: null,
      },
      {
        value: null,
        uses: [],
        conditionalValue: null,
      }
    ],
    overrideXAxisValue: null,
    dataUse: "auto" // Auto means that it will try to automatically guess what kind of data it is, numerical, or categorical
  });

  // Getting and setting the data filters
  function setValueOfYData(index, value_id, value) {
    let newYValues = [...dataFilters.dataYValues];
    newYValues[index][value_id] = value;
    setDataFilters({...dataFilters, dataYValues: newYValues});
  }

  function getValueOfYData(index, value_id) {
    let value = dataFilters.dataYValues[index][value_id];
    // Give the actual value if its not null or empty, otherwise give an empty string.
    return !value && value !== 0 ? '' : value;
  }

  function addYValue() {
    let newYValues = [...dataFilters.dataYValues];
    newYValues.push({value: null, uses: [], conditionalValue: null});
    setDataFilters({...dataFilters, dataYValues: newYValues});
  }

  function getFormKeyValues() {

    const formToUse = dataFilters !== undefined ? dataFilters.form : ctx.currentForm;

    if (formToUse === undefined) { return []; }

    let keyVals = [{label: "None", value: null}, {label: "Event", value: "event"}, {label: "Prematch: Match Number", value: "0{match_num}"}, {label: "Prematch: Alliance", value: "0{alliance}"}, {label: "Prematch: Team", value: "0{team}"}];
    formToUse.form.forEach((page, i) => {
      page.elements.forEach((field) => {
        if (!field["key_value"] || !field["title"]) { return; }
        keyVals.push({label: page.name + ": " + field["title"], value: `${i + 1}{${field["key_value"]}}`});
      });
    });

    return keyVals;
  }

  function displayFilterChoices() {
    if (displayStyleOverride == "ranking") {
      return (
        <View style={{width: '100%', alignItems: 'center'}}>
          <DropdownComponent
            key={"override_x: " + dataFilters.overrideXAxisValue}
            data={ formKeyValueChoices }
            outerStyle={{width: '80%', marginBottom: 10}}
            placeholder="Value to Rank"
            default_value={dataFilters.overrideXAxisValue}
            onChange={(choice) => { setDataFilters({...dataFilters, overrideXAxisValue: choice.value}) }}
          />
          <HeaderTitle title='Values to Factor In' fontSize={20}/>
          <GradientButton title='Add Value' onPress={addYValue}/>
          { 
            dataFilters.dataYValues.map((yData, index) => {

              return (
                <View key={index} style={{width: '80%', backgroundColor: Globals.ButtonColor, borderRadius: 20, alignItems: 'center', paddingVertical: 10, marginBottom: 10}}>
                  <HeaderTitle title={`Value ${index + 1}`} fontSize={15}/>
                  <DropdownComponent
                    key={`y-val ${index} ` + getValueOfYData(index, "value")}
                    data={ formKeyValueChoices }
                    outerStyle={{width: '90%', marginBottom: 10}}
                    style={{backgroundColor: Globals.PageColor}}
                    placeholder="Value to Rank By"
                    dropdownPosition="top"
                    default_value={getValueOfYData(index, "value")}
                    onChange={(choice) => { setValueOfYData(index, "value", choice.value) }}
                  />
                </View>
              )
            })
          }
        </View>
      )
    }



    return (
      <View style={{width: '100%', alignItems: 'center'}}>
        <DropdownComponent
          key={"y-val 0 " + getValueOfYData(0, "value")}
          data={ formKeyValueChoices }
          outerStyle={{width: '80%', marginBottom: 10}}
          placeholder="Value to Display"
          default_value={getValueOfYData(0, "value")}
          onChange={(choice) => { setValueOfYData(0, "value", choice.value) }}
        />

        <DropdownComponent
          key={"y-val 1" + getValueOfYData(1, "value")}
          data={ formKeyValueChoices }
          outerStyle={{width: '80%', marginBottom: 10}}
          placeholder="Value to Check"
          default_value={getValueOfYData(1, "value")}
          onChange={(choice) => { setValueOfYData(1, "value", choice.value) }}
        />

        <AppInput title="Conditional Value" outerStyle={{width: '80%'}} default_value={getValueOfYData(1, "conditionalValue")} onValueChanged={(value) => {setValueOfYData(1, "conditionalValue", value)}}/>
      </View>
    )
  }

  useEffect(() => {
    // Try and get the matches from the stored data.
    if (matches.length === 0) {
      AsyncStorage.getItem('stored view matches').then((data) => {
        let decompData = JSON.parse(data).map((match) => JSON.parse(InflateString(match)));

        // Remove the matches that don't have the right form name and year. 
        decompData = decompData.filter((match) => match.data && match.data["form"] && match.data["form"].name === ctx.currentForm.name && match.data["form"].year === ctx.currentForm.year);
        
        // console.log("Decompdata: " + decompData);

        // Set the matches to the sorted decompressed data.
        setMatches(decompData.sort((a, b) => Number(a.data["0{match_num}"]) - Number(b.data["0{match_num}"])));
      });
    }

    setFormKeyValueChoices(getFormKeyValues());
  }, []);

  useEffect(() => {
    // console.log(dataFilters.form.name)
    setFormKeyValueChoices(getFormKeyValues());
  }, [dataFilters]);

  useEffect(() => {
    if (displayStyleOverride == "ranking") {
      setDataFilters({...dataFilters, overrideXAxisValue: '0{team}'});
    }
  }, [displayStyleOverride])


  // Part of the "Screen Shell" here. Just makes sure the right name is shown for the screen.
  const {name, infoText} = ctx.screens[ctx.screenIndex];

  // I wouldv'e used my ScreenShell here, but I wanted to alter the top, an I can't do that with the ScreenShell.
  return (
  <View style={[styles.page, {backgroundColor: Globals.PageColor}]}>
    <PageHeader gradientDir={gradientDir} infoText={infoText} title={name}/>

    <Animated.View style={{
      marginTop: -3, 
      width: '100%', height: fullScreen ? '100%' : displayViewSize, 
      justifyContent: 'center', alignItems: 'center', 
      backgroundColor: Globals.PageHeaderFooterColor,
      overflow: 'hidden',
    }}>
      <DataDisplay d={matches} dataFilters={dataFilters} displayStyleOverride={displayStyleOverride} onDisplaySizeChange={(recomScale) => {
        setFullscreen(recomScale.y >= 1000);
        // Change it to the recommended scale (recomScale)
        Animated.timing(displayViewSize, {toValue: recomScale.y + 30, duration: 500, easing: Easing.inOut(Easing.cubic), useNativeDriver: false}).start();
      }}/>
      
    </Animated.View>
    <LinearGradient
      colors={[Globals.PageHeaderFooterGradientColor1, Globals.PageHeaderFooterGradientColor2]}
      start={{x: gradientDir ? 0 : 1, y: 0}}
      end={{x: gradientDir ? 1 : 0, y: 0}}
      style={{width: '100%', height: 5}}
    >
    </LinearGradient>

    <PageContent gradientDir={gradientDir} scrollable={true} style={{paddingTop: 15}}>
      <DropdownComponent
        data={[{label: "Auto", value: "auto"}, {label: "Ranking", value: "ranking"}]}//, {label: "Line Chart", value: "line"}, {label: "Pie Chart", value: "pie"}, {label: "Percentage", value: "percentage"}]}
        outerStyle={{width: '80%', marginBottom: 10}}
        placeholder="Display Style"
        default_value={displayStyleOverride}
        onChange={(choice) => { setDisplayStyleOverride(choice.value) }}
      />
      
      { displayFilterChoices() }

      {/* <DropdownComponent 
        data={ctx.loadedForms.map((form) => ({label: form.name, value: form.name}))} 
        placeholder="Form to use" 
        default_value={ctx.currentForm ? ctx.currentForm.name : undefined}
        onChange={(choice) => { setDataFilters({...dataFilters, form: ctx.loadedForms.find((form) => form.name === choice.value)}) }}
      /> */}
    </PageContent>

    <PageFooter gradientDir={gradientDir}/>
    <StatusBar style="light" />
  </View>
  );
});

const styles = StyleSheet.create({
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

/**
 * This screen is used to see the user's settings.
 * 
 * @description This screen has buttons to change the event you are scouting, the year you are scouting, and the server you are sending data to.
 * 
 * @param {Object} gradientDir - The direction of the gradient for the screen.
 * @returns {JSX.Element} - The JSX code for the screen.
 */
const SettingsScreen = memo(({gradientDir}) => {
  const ctx = useContext(AppContext); 

  // Server settings variables
  const [urlBase, setUrlBase] = useState(undefined);
  const [timeout, setTimeout] = useState(undefined);

  useEffect(() => {
    if (urlBase === undefined && timeout === undefined) {
      return
    }
    AsyncStorage.setItem("serverInfo", JSON.stringify({urlBase: urlBase, timeout: timeout}), () => {});
  }, [urlBase, timeout]);

  const [errorText, setErrorText] = useState('');

  if (urlBase === undefined) {
    AsyncStorage.getItem("serverInfo", (err, result) => {
      if (result) {
        const info = JSON.parse(result);
        setUrlBase(info.urlBase);
        setTimeout(info.timeout);
      }
    });
  }

  const currentYear = new Date().getFullYear();
  const years = Array.from({length: 50}).map((_, i) => ({label: String(currentYear - i), value: String(currentYear - i)}));

  return (
    <ScreenShell gradientDir={gradientDir} scrollable={true}>
      <HeaderTitle title='Scouting Details' fontSize={30}/>

      <DropdownComponent
        data={ years }
        outerStyle={{width: '80%', marginBottom: 10}}
        placeholder="Year"
        default_value={String(ctx.scoutingSettings.year)}
        onChange={(choice) => { ctx.setMatchData(undefined); ctx.setScoutingSettings({...ctx.scoutingSettings, year: choice.value}) }}
      />

      <DropdownComponent
        data={ [{label: "None", value: "none"}, ...ctx.events.map((item) => ({label: `${item.name} (${item.key.substring(4)})`, value: item.key}))] }
        outerStyle={{width: '80%', marginBottom: 10}}
        placeholder="Event"
        default_value={ctx.scoutingSettings.event}
        onChange={(choice) => { ctx.setMatchData(undefined); ctx.setScoutingSettings({...ctx.scoutingSettings, event: choice.value, eventName: choice.label}); }}
      />

      <HeaderTitle title='Server Details' fontSize={30}/>

      <AppInput key={(urlBase !== undefined) + "1"} default_value={urlBase} title='Server Base URL' outerStyle={{marginBottom: 10, width: '80%'}} onValueChanged={setUrlBase}/>

      <View style={{width: '80%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
        <GradientButton title='Test Connection' outerStyle={{flex: 1}} textStyle={{textAlign: 'center', fontSize: 18}} onPress={() => {
          AsyncStorage.setItem("serverInfo", JSON.stringify({urlBase: urlBase, timeout: timeout}), () => {
            
            // APIGet(urlBase, 1000).then((data) => { console.log(data); });
            testGet(urlBase, timeout).then((data) => {
              if (data !== "API is running! Your connection worked!") {
                let jsonData = JSON.parse(data); 
                setErrorText(data);

                ctx.showNotification(`Failed to connect to server! ${jsonData.code} ${jsonData.message} ${jsonData.stack}`, Globals.NotificationErrorColor);
              } else {
                ctx.showNotification("Connected to server!", Globals.NotificationSuccessColor);
              }
            });
          })}}/>
        <AppInput regex={/[^0-9]/g} inputMode='numeric' key={(timeout !== undefined) + "3"} default_value={timeout} title='Timeout' outerStyle={{ marginHorizontal: '2.5%', height: 75, flex: 1}} onValueChanged={setTimeout}/>
      </View>

      <HeaderTitle title='Color Scheme' fontSize={30}/>

      <HeaderTitle title='Testing Buttons' fontSize={30}/>

      {/* <GradientButton title={"Test fill match data"} textStyle={{textAlign: 'center'}} onPress={async () => {
        AsyncStorage.setItem("stored matches", JSON.stringify(["eJxNj81qwzAQhF9FbK85yI5LwddADznnFkLY2ptYoJ8grSBF+N27a19608w3zKwaPFIOMDaIGAhGOKXwSpEimwsVdvFpPno4wC9hFsq7B+sBuhaqZ7fCeIVpSW6iuwZ5yURwU14k6WkLSON/dmyxhh/KRSB0n6AO05tVnmthU1Igo46goRXGrIxzJdWdvB/oiwjbAvK03KVv69ITbEPvHcZp384066aVBQybw50aM7J++Ds7c67R2C/T236A9Q/Wjlhq","eJxNj7sKAjEQRX8ljK3FPhRhW8HC2k5ExnV0A3lIMgEl7L87szZ2uedc7pAKj5g8DBUCeoIB9tG/YqDA5kSZbXiaVQdr+BAmsfxjMK+hrb44tjMMZxinaEe6apGnRAQX9VmajpaCLP67vobib5SySGi3oITpzRqPJbPJ0ZNRImpTM2NSx6mQ5lbeD3RZQlM98jhdZW/Z6kEZOmcxjL/bie56s5EL6BfCnYI7sn74kKw5lmCanemabgPzF9buWGw=","eJxNj8sKwjAQRX8ljFsXba0I3QouXLsTkbGONpCHJBNQQv/dmbpxl3vO5Q6p8IjJw1AhoCcYYB/9KwYKbE6U2YanWXWwhg9hEss/BvMa2uqLYzvDcIZxinakqxZ5SkRwUZ+l6WgpyOK/29RQ/I1SFgntFpQwvVnjsWQ2OXoySkT1NTMmdZwKaW7l/UCXJTTVI4/TVfaWrR6UoXMWw/i7neiuNxu5gH4hvFFwR9YPH5I1xxJMszNd0/UwfwHXTlhu","eJxNj82KAjEQhF8ltFcPmVlFmKvgwbM3WaQdWyeQH0k6sEuYd7d7BPHWVV9RRTe4pxxgaBAxEAywT+GZIkU2Jyrs4sOseljDP2EWym8P5jV0LVTPbobhDOOU3EgXDfKUieBXeZGkpyUgjd/sp8UarpSLQOi2oA7TH6s81sKmpEBGHUGbVhizMs6VVHdy39EXEbYF5HG6SN+nyzb03mEc39tXX5dRKxMYFos7NW7I+vEhO3Os0did6W2/gfkFNtlY2g==","eJxNj8sKwjAQRX8ljFsXbX1Bt4IL1+5EZKyjDeQhyQSU0H93pm7c5Z5zuUMqPGLy0FcI6Al62Ef/ioECmxNltuFpFh0s4UOYxPKPwbSEtvri2E7Qn2EYox3oqkUeExFc1GdpOpoLsvjvVjUUf6OURUK7ASVMb9Z4LJlNjp6MElHrmhmTOk6FNLfyfqDLEprqkYfxKnvz1haUoXMWw/C7fXNlPtrICfQz4k7BHVl/fEjWHEswzc50TbeG6Qs3Oljc","eJxNj0sLAjEMhP9KiVcP+xJhr4IHz95kkbhGt9CHtCkoZf+7Tb14y8w3TJIMDx8sjBkcWoIRDt6+vCPH6kyRtXuqTQdb+BCGQvnnwbqFNttkWK8wXmBevJ7pKkFeAhFMwmNJGqqB0vjP+uySvVGIBUK7A3GY3izylCKr6C0pcQoacmQMwjgkEt2W+YEmFtFkizwv19JXu/YgHhqj0c119yQGE9p6CPey/44svx6DVqfkVLNXXdMNsH4BHMpW8g=="]));
      }}/> */}

      <GradientButton title={"Clear Picklist Data"} textStyle={{textAlign: 'center'}} onPress={async () => {
        AsyncStorage.removeItem('picklist');
      }}/>

      <GradientButton title={"Delete all stored data"} textStyle={{textAlign: 'center'}} onPress={async () => {
        AsyncStorage.multiRemove(await AsyncStorage.getAllKeys());
      }}/>

      <HeaderTitle title={`Error Text: ${errorText}`} style={{textAlign: 'left'}} fontSize={15}/>
    </ScreenShell>
  )
});

/**
 * This screen is used to see the user's own picklist for an event. (Right now, it can be reset on the settings page)
 * 
 * @description This screen has a drag drop list full of the teams at the event, and the user can drag and drop them into different tiers. (The tier tags can be dragged too)
 * 
 * @param {Object} gradientDir - The direction of the gradient for the screen.
 * @returns {JSX.Element} - The JSX code for the screen.
 */
const PicklistScreen = memo(({gradientDir}) => {
  // TODO: Make a different picklist section for both quals and for alliances in elims.
  const ctx = useContext(AppContext);

  const [teams, setTeams] = useState([]);
  const [teamNames, setTeamNames] = useState({});
  const [teamStatuses, setTeamStatuses] = useState({});
  const [dragListData, setDragListData] = useState([]);

  async function getAndSetDragListData() {
    const storedPicklist = await AsyncStorage.getItem('picklist');
    if (storedPicklist) {
      setDragListData(JSON.parse(InflateString(storedPicklist)));
      return;
    }


    if (teamStatuses === "ERROR" || teamStatuses === undefined || teamStatuses.length == 0 || teams === "Error" || teams === undefined || teams.length == 0) { return; }


    const baseDragData = {
      key: '', 
      is_tier_card: false,
      tier_info: null,
      team_number: 0,
      team_name: '',
      ranking: 0,
      alliance: null,
      alliance_pick: null,
      qual_wins: 0,
      qual_losses: 0,
      qual_ties: 0,
      playoff_wins: null,
      playoff_losses: null,
      playoff_ties: null,
      picked: false
    }

    const tiersDragData = [
      {...baseDragData, key: 'tier1', is_tier_card: true, tier_info: 'Tier 1'},
      {...baseDragData, key: 'tier2', is_tier_card: true, tier_info: 'Tier 2'},
      {...baseDragData, key: 'tier3', is_tier_card: true, tier_info: 'Tier 3'},
      {...baseDragData, key: 'nopick', is_tier_card: true, tier_info: 'No Pick'},
    ]

    function tryGetSubkey(object, subkey, defualt_value) {
      if (!object) { return defualt_value; }

      try {
        for (const key of subkey.split('.')) {
          object = object[key];
        }
      } catch {
        return defualt_value;
      }
    }

    const teamsDragData = teams.map((team) => {
      const teamStatus = teamStatuses[team];
      const teamName = teamNames[team];

      return ({
        key: team, 
        is_tier_card: false,
        tier_info: null,
        team_number: team.replace('frc', ''),
        team_name: teamName ? teamName : 'None',
        ranking: tryGetSubkey(teamStatus, "qual.ranking.rank", "N/A"),
        alliance: tryGetSubkey(teamStatus, "alliance.number", "N/A"),
        alliance_pick: tryGetSubkey(teamStatus, "alliance.pick", "N/A"),
        qual_wins: tryGetSubkey(teamStatus, "qual.ranking.record.wins", 0),
        qual_losses: tryGetSubkey(teamStatus, "qual.ranking.record.losses", 0),
        qual_ties: tryGetSubkey(teamStatus, "qual.ranking.record.ties", 0),
        playoff_wins: tryGetSubkey(teamStatus, "playoff.record.wins", 0) ,
        playoff_losses: tryGetSubkey(teamStatus, "playoff.record.losses", 0),
        playoff_ties: tryGetSubkey(teamStatus, "playoff.record.ties", 0),
        picked: false
      });
    });

    setDragListData(
      [...tiersDragData, ...teamsDragData]
    );
  }

  useEffect(() => {
    const statuses = {};
    const names = {};
    setTeams(ctx.teamData.map((team) => { statuses[team.team] = team.status; names[team.team] = team.name.nickname; return team.team }));
    setTeamStatuses(statuses);
    setTeamNames(names);

    // console.log(statuses, names);
  }, []);

  useEffect(() => {
    // console.log(teams)
    getAndSetDragListData();
  }, [teams, teamNames, teamStatuses]);

  return (
    <ScreenShell gradientDir={gradientDir} scrollable={false} style={{paddingTop: 0, paddingBottom: 0}}>
      <GestureHandlerRootView style={{width: '100%', flex: 1}}>
        <DragDropList data={dragListData} onDataChanged={(data) => { AsyncStorage.setItem('picklist', DeflateString(JSON.stringify(data)))}}/>
      </GestureHandlerRootView>
    </ScreenShell>
  );
});

/*
  Form-Based Screens
    - These screens are used in the form, along with the auto generated screens from the form builder.
    - They are used to collect data from the user about the match.
    - Unfortunately, with the functions these screens need to have, it is is hard to make them dynamic.
*/

/**
 * This screen is always used for the first page of the form
 * 
 * @description This screen lets you enter in the match number, alliance color, and team number, based on who you are scouting.
 * 
 * @param {Object} gradientDir - The direction of the gradient for the screen.
 * @returns {JSX.Element} - The JSX code for the screen.
 */
const PrematchScreen = memo(({ gradientDir }) => {
  const ctx = useContext(AppContext);
  const [matchNum, setMatchNum] = useState(ctx.matchData["0{match_num}"]);
  const [alliance, setAlliance] = useState(ctx.matchData["0{alliance}"]);
  const [teamsData, setTeamsData] = useState([]);
  const [matches, setMatches] = useState(ctx.eventMatches);
  const [teamInputType, setTeamInputType] = useState("choice");
  const [teamDriverStation, setTeamDriverStation] = useState(ctx.matchData['0{team_driver_station}']);

  // Make sure the screen stays on while using the app.
  useKeepAwake();

  useEffect(() => {
    if (teamInputType !== "choice") {
      ctx.matchData['0{team_driver_station}'] = "";
    } else {
      ctx.matchData['0{team_driver_station}'] = teamDriverStation;
    }
  }, [teamInputType]);

  const baseTeamData = [
    {label: 'Team 1', value: 't1', select_color: 'rgba(0, 0, 255, 0.3)'},
    {label: 'Team 2', value: 't2', select_color: 'rgba(0, 0, 255, 0.3)'},
    {label: 'Team 3', value: 't3', select_color: 'rgba(0, 0, 255, 0.3)'},
  ];

  function setMatchDataKey(ctx, key, data) {
    ctx.matchData[key] = data;
    ctx.setMatchData(ctx.matchData)
  }

  function refreshTeamData() {
    // If team data cannot be found with our current info, just say t1, t2, t3.
    if (matches === undefined || matches.length === 0 || matches == "ERROR" || matchNum === undefined || alliance === undefined || alliance.length === 0) {
      if (ctx.teamData === undefined || ctx.teamData.length === 0) {
        setTeamInputType("numbers");
      } else {
        setTeamInputType("dropdown");
      }
      setTeamsData(baseTeamData);
      return;
    }
    // Get the team data from the matches.
    let match = matches.find((match) => match.comp_level === 'qm' && match.match_number === Number(matchNum));
  
    if (match === undefined) {
      if (ctx.teamData === undefined || ctx.teamData.length === 0) {
        setTeamInputType("numbers");
      } else {
        setTeamInputType("dropdown");
      }
      setTeamsData(baseTeamData);
      return;
    }

    setTeamInputType("choice");

    let TD = match.alliances[alliance].team_keys.map((team) => {
      let teamNumber = team.replace('frc', '');
      return { label: teamNumber, value: teamNumber, select_color: String(alliance) == "red" ? 'rgba(255, 0, 0, 0.5)' : 'rgba(0, 0, 255, 0.5)' };
    });
    setTeamsData(TD);

    if (teamDriverStation !== "" && teamDriverStation !== undefined) {
      setMatchDataKey(ctx, '0{team}', TD[teamDriverStation - 1].value);
    }
  }

  function makeTeamInput() {
    switch (teamInputType) {
      case "numbers":
        return <GradientTextInput inputMode="numeric" regex={/[^0-9]/g} key_value="team" title='Team'/>;
      case "dropdown":
        return (
          <DropdownComponent 
            default_value={ctx.matchData["0{team}"]} 
            style={{alignSelf: 'center', width: '80%'}} 
            data={ctx.teamData.map((item) => ({label: item.team.replace('frc', ''), value: item.team.replace('frc', '')}))}
            onChange={(value) => { setMatchDataKey(ctx, "0{team}", value.value)}}/>);
      case "choice":
        return <GradientChoice key_value="team" title='Team' choices={teamsData} onValueChanged={(newValue) => {
          setTeamDriverStation(newValue.length == 0 || !newValue ? "" : Number(newValue[0]) + 1);
          setMatchDataKey(ctx, '0{team_driver_station}', newValue.length == 0 || !newValue ? "" : Number(newValue[0]) + 1);
        }}/>;
    }
  }

  if (teamsData.length === 0) {
    refreshTeamData();
  }

  useEffect(() => {
    refreshTeamData();
  }, [matchNum, alliance, matches]);

  const alliance_types = ["red", "blue"];


  function tryGoNext() {
    if (alliance && matchNum && ctx.matchData["0{team}"] && ctx.matchData["0{team}"].length != 0) {
      console.log(alliance, matchNum, ctx.matchData["0{team}"]);
      ctx.slideScreen(1)
    } else {
      console.log(alliance, matchNum, ctx.matchData["0{team}"]);
      ctx.showNotification('Please fill out all fields!', Globals.NotificationErrorColor);
    }
  }

  return (
  <ScreenShell gradientDir={gradientDir} overrideNext={tryGoNext}>
    <GradientTextInput onlyNumbers key_value="match_num" title='Match Number' onValueChanged={setMatchNum}/>
    <HeaderTitle title='Team Info' fontSize={30}/>
    <GradientChoice key_value="alliance" title='Alliance Color' onValueChanged={(newIndexes) => setAlliance(alliance_types[newIndexes[0]])} choices={[
      {label: 'Red', value: 'red', select_color: 'rgba(255, 0, 0, 0.6)'},
      {label: 'Blue', value: 'blue', select_color: 'rgba(0, 0, 255, 0.6)'},
    ]}/>
    { makeTeamInput() }
    
  </ScreenShell>
  );
});

/**
 * This screen is always used as the last page in each form, allowing you to save your data locally.
 * 
 * @description This screen has a QR code that can be scanned to transfer the match data w/o internet, and a button to save the match data to the device.
 * 
 * @param {Object} gradientDir - The direction of the gradient for the screen.
 * @returns {JSX.Element} - The JSX code for the screen.
 */
const SaveMatchScreen = memo(({ gradientDir, props={}}) => {
  const ctx = useContext(AppContext);

  // Make sure the screen stays on while using the app.
  useKeepAwake();

  const [qrData, setQRData] = useState('Hi!');

  async function getQRData() {
    let qrData = "exp+nimbus://expo-development-client/?match=" + encodeURIComponent(DeflateString(JSON.stringify({...ctx.matchData, date: new Date().toDateString()})));
    if (props.dataToShow) {
      qrData = "exp+nimbus://expo-development-client/?match=" + encodeURIComponent(DeflateString(JSON.stringify(props.dataToShow)));
    }
    return qrData;
  }

  useEffect(() => {
    getQRData().then((data) => { setQRData(data) });
  }, []);
  

  // expo link: exp://10.168.81.243:8081/?match=
  // nimbus link: exp+nimbus://expo-development-client/?match=

  return (
  <ScreenShell gradientDir={gradientDir} scrollable={false} style={{justifyContent: 'center'}}>
    { props.dataToShow ? <HeaderTitle title={`Match ${props.dataToShow["0{match_num}"]}, Team: ${props.dataToShow["0{team}"]}`} fontSize={30}/> : <HeaderTitle title='Save Match' fontSize={30}/> }

    <GradientQRCode text={qrData}/>
    
    { props.dataToShow ? null :
      <GradientButton title='Save Match' style={{padding: 5}} onPress={async () => {
          if (await ctx.storeMatch({...ctx.matchData, date: new Date().toDateString()})) {
            ctx.showNotification('Match Saved!');
            ctx.setMatchData(undefined);
            ctx.setScreens([{screen: HomeScreen, name: 'Home'}])
          } else {
            ctx.showNotification('Match Already Exists!', Globals.NotificationErrorColor);
          }
          
        }}
      />
    }
    
  </ScreenShell>
  )
});

export { HomeScreen, PrematchScreen, SaveMatchScreen, ScoutedMatchesScreen }