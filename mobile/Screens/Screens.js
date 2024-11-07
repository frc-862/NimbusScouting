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
import { getBlueAllianceDataFromURL, getBlueAllianceTeams, getDatabaseDataFromURL, putOneToDatabase, testGet } from "../../backend/APIRequests";
import { LeaveAnimationField, MicrophoneAnimationStage, NoteAnimationField, ParkAnimationField, TrapAnimationStage } from "../InfoAnimations";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DropdownComponent from "./Dropdown";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import DragDropList from "../DragDropList";
import DataDisplay from "../DataDisplay";
import { PageHeader, PageContent, PageFooter } from "../PageComponents";
import { LinearGradient } from "expo-linear-gradient";
import { Dropdown } from "react-native-element-dropdown";

const HomeScreen = memo(({gradientDir}) => {
  const ctx = useContext(AppContext);

  return (
    <ScreenShell gradientDir={gradientDir} scrollable={false}>
      <GradientButton outerStyle={{height: 100, width: '90%'}} style={{padding: 5}} textStyle={{fontSize: 25}} title={"Time to Scout!"} onPress={() => {
        if (ctx.currentForm === undefined) { ctx.showNotification("You don't have a form selected!", Globals.NotificationWarningColor); return; }

        ctx.setScreens(ctx.formInfo);
        if (ctx.matchData === undefined) {
          ctx.setMatchData({form: {name: ctx.currentForm.name, year: ctx.currentForm.year}, ...GetFormJSONAsMatch(JSON.stringify(ctx.currentForm.form))});
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

        let data = await getDatabaseDataFromURL('/forms', {}, {}, serverInfo.ip, serverInfo.port, serverInfo.timeout);
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
      <GradientButton title={"View Data"} onPress={async () => {
        await ctx.setLoadPercent(0, 0);

        const serverInfo = JSON.parse(await AsyncStorage.getItem("serverInfo"));

        let data = await getDatabaseDataFromURL('/matches', {}, {}, serverInfo.ip, serverInfo.port, serverInfo.timeout);
        if (data === "ERROR") { 
          if (ctx.loadedMatches.length === 0) {
            ctx.showLoadError(50).then(() => {ctx.showNotification("Failed to load matches! Try again later.", Globals.NotificationErrorColor);});
            return;
          }
          ctx.showLoadError(50).then(() => {ctx.showNotification("Failed to load matches! The data you view may not be up to date!", Globals.NotificationWarningColor);});
          AsyncStorage.setItem('stored view matches', JSON.stringify(ctx.loadedMatches.map((match) => DeflateString(JSON.stringify(match)))));
          ctx.setScreens([{screen: DataViewScreen, name: 'View Data', onBack: () => {ctx.setScreens([{screen: HomeScreen, name: 'Home'}])}}]);
          return;
        } else {
          AsyncStorage.setItem('stored view matches', JSON.stringify(data.map((match) => DeflateString(JSON.stringify(match)))));
        }

        ctx.setScreens([{screen: DataViewScreen, name: 'View Data', onBack: () => {ctx.setScreens([{screen: HomeScreen, name: 'Home'}])}}]);

        await ctx.setLoadPercent(100, 300);
      }}/>
      <GradientButton title={"Picklist"} onPress={() => {ctx.setScreens([{screen: PicklistScreen, name: 'Picklist', infoText: '', onBack: () => {ctx.setScreens([{screen: HomeScreen, name: 'Home'}])}}]);}}/>
    </ScreenShell>
  );
});

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
            ctx.showNotification("Edit function not implemented yet!", Globals.NotificationWarningColor);
            // ctx.setMatchData(matches[selectedMatches[0]]);
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

            // Using OF works here, but IN does not. This is because in works like for i in range, and of works like foreach.
            for (const matchIndex of selectedMatches) {
              await putOneToDatabase(
                {
                  data: matches[matchIndex],
                  number: matches[matchIndex]["0{match_num}"],
                  team: matches[matchIndex]["0{team}"][0],
                  scout: "NONE YET",
                  event: "NONE YET"
                }, 
                serverInfo.ip, 
                serverInfo.port, 
                serverInfo.timeout
              ).then(async (data) => {
                if (data === "ERROR") { failedMatches++; }
              });
            }

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
      return (
        <AppCheckbox 
          onPress={() => {trySelectMatch(index)}} key={String(selectedMatches.includes(index)) + index} 
          checked={selectedMatches.includes(index)} 
          checkedColor={'rgba(0,255,0,0.3)'} 
          gradientColors={match['0{alliance}'][0] === 'red' ? ['rgb(182,0,0)', 'rgb(182,0,0)'] : ['rgb(0,0,182)', 'rgb(0,0,182)']} 
          innerStyle={{borderRadius: 17}} 
          style={{overflow: 'hidden', padding: 5, height: undefined}} 
          outerStyle={{ marginBottom: 10, marginHorizontal: 5, flex: 1, minWidth: '40%', maxWidth: '50%'}}
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
                <Text style={{color: 'white', fontSize: 10, marginTop: 10, textAlign: 'center'}}>
                  {form.year}      
                </Text>
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

const DataViewScreen = memo(({gradientDir}) => {
  const ctx = useContext(AppContext);
  const [matches, setMatches] = useState([]);
  // How our data show be displayed. ("auto" means that we want it to choose a line chart for numerical data, and a pie chart for categorical data, or a percentage thingy or something for true/false values)
  const [displayStyleOverride, setDisplayStyleOverride] = useState("auto");
  const [formKeyValueChoices, setFormKeyValueChoices] = useState(getFormKeyValues());

  const displayViewSize = useRef(new Animated.Value(150)).current;

  // Our different data filters.
  const [dataFilters, setDataFilters] = useState({
    form: ctx.currentForm,
    dataYValues: [
      {
        value: "0{match_num}",
        conditionalValue: null,
      },
      {
        value: "3{numbers}",
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

  function getFormKeyValues() {

    const formToUse = dataFilters !== undefined ? dataFilters.form : ctx.currentForm;

    if (formToUse === undefined) { return []; }

    let keyVals = [{label: "Prematch: Match Number", value: "0{match_num}"}, {label: "Prematch: Alliance", value: "0{alliance}"}, {label: "Prematch: Team", value: "0{team}"}];
    formToUse.form.forEach((page, i) => {
      page.elements.forEach((field) => {
        if (!field["key_value"] || !field["title"]) { return; }
        keyVals.push({label: page.name + ": " + field["title"], value: `${i + 1}{${field["key_value"]}}`});
      });
    });

    return keyVals;
  }

  useEffect(() => {
    // Try and get the matches from the stored data.
    if (matches.length === 0) {
      AsyncStorage.getItem('stored view matches').then((data) => {
        const decompData = JSON.parse(data).map((match) => JSON.parse(InflateString(match)));
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


  // Part of the "Screen Shell" here. Just makes sure the right name is shown for the screen.
  const {name, infoText} = ctx.screens[ctx.screenIndex];

  const [value, setValue] = useState("b");

  // I wouldv'e used my ScreenShell here, but I wanted to alter the top, an I can't do that with the ScreenShell.
  return (
  <View style={[styles.page, {backgroundColor: Globals.PageColor}]}>
    <PageHeader gradientDir={gradientDir} infoText={infoText} title={name}/>

    <Animated.View style={{
      marginTop: -3, 
      width: '100%', height: displayViewSize, 
      justifyContent: 'center', alignItems: 'center', 
      backgroundColor: Globals.PageHeaderFooterColor,
      overflow: 'hidden'
    }}>
      <DataDisplay d={matches} dataFilters={dataFilters} displayStyleOverride={displayStyleOverride} onDisplaySizeChange={(recomScale) => {
        // Change it to the recommended scale (recomScale)
        Animated.timing(displayViewSize, {toValue: recomScale.y + 30, duration: 500, easing: Easing.inOut(Easing.cubic), useNativeDriver: false}).start();
        // displayViewSize.setValue(recomScale.y + 30);
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
        data={ formKeyValueChoices }
        outerStyle={{width: '80%', marginBottom: 10}}
        placeholder="Value to Display"
        default_value={getValueOfYData(0, "value")}
        onChange={(choice) => { setValueOfYData(0, "value", choice.value) }}
      />
      <DropdownComponent
        data={ formKeyValueChoices }
        placeholder="Value to Check"
        default_value={getValueOfYData(1, "value")}
        onChange={(choice) => { setValueOfYData(1, "value", choice.value) }}
      />
      <AppInput title="Conditional Value" outerStyle={{width: '80%'}} default_value={getValueOfYData(1, "conditionalValue")} onValueChanged={(value) => {setValueOfYData(1, "conditionalValue", value)}}/>

      <DropdownComponent 
        data={ctx.loadedForms.map((form) => ({label: form.name, value: form.name}))} 
        placeholder="Form to use" 
        default_value={ctx.currentForm ? ctx.currentForm.name : undefined}
        onChange={(choice) => { setDataFilters({...dataFilters, form: ctx.loadedForms.find((form) => form.name === choice.value)}) }}
      />
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

const SettingsScreen = memo(({gradientDir}) => {
  const ctx = useContext(AppContext);

  // Server settings variables
  const [ip, setIP] = useState(undefined);
  const [port, setPort] = useState(undefined);
  const [timeout, setTimeout] = useState(undefined);

  if (ip === undefined || port === undefined || timeout === undefined) {
    AsyncStorage.getItem("serverInfo", (err, result) => {
      if (result) {
        const info = JSON.parse(result);
        setIP(info.ip);
        setPort(info.port);
        setTimeout(info.timeout);
      }
    });
  }

  return (
    <ScreenShell gradientDir={gradientDir} scrollable={false}>
      <HeaderTitle title='Server Details' fontSize={30}/>

      <AppInput key={(ip !== undefined) + "1"} default_value={ip} title='IP' outerStyle={{marginBottom: 10, width: '80%'}} onValueChanged={setIP}/>
      <View style={{flexDirection: 'row', justifyContent: 'center', width: '80%'}}>
        <AppInput regex={/[^0-9]/g} inputMode='numeric' key={(port !== undefined) + "2"} default_value={port} title='Port' outerStyle={{marginBottom: 10, marginHorizontal: '2.5%', width: '47.5%'}} onValueChanged={setPort}/>
        <AppInput regex={/[^0-9]/g} inputMode='numeric' key={(timeout !== undefined) + "3"} default_value={timeout} title='Timeout' outerStyle={{marginBottom: 10, marginHorizontal: '2.5%', width: '47.5%'}} onValueChanged={setTimeout}/>
      </View>

      <View style={{width: '70%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
        <GradientButton title='Test Connection' outerStyle={{flex: 1}} textStyle={{textAlign: 'center', fontSize: 18}} onPress={() => {
          AsyncStorage.setItem("serverInfo", JSON.stringify({ip: ip, port: port, timeout: timeout}), () => {
            testGet(ip, port, timeout).then((data) => {
              if (data !== "API is running! Your connection worked!") {
                ctx.showNotification("Failed to connect to server!", Globals.NotificationErrorColor);
              } else {
                ctx.showNotification("Connected to server!", Globals.NotificationSuccessColor);
              }
            });
          })}}/>
        <GradientButton title='Save Server Details' outerStyle={{flex: 1}} textStyle={{textAlign: 'center', fontSize: 18}} onPress={() => {
          AsyncStorage.setItem("serverInfo", JSON.stringify({ip: ip, port: port, timeout: timeout}), () => {
            ctx.setScreens([{screen: HomeScreen, name: 'Home'}]);
            ctx.showNotification(`Server Details Saved!`);
          });
        }}/>
      </View>

      <HeaderTitle title='Color Scheme' fontSize={30}/>

      <HeaderTitle title='Testing Buttons' fontSize={30}/>

      <GradientButton title={"Test fill match data"} textStyle={{textAlign: 'center'}} onPress={async () => {
        AsyncStorage.setItem("stored matches", JSON.stringify(["eJxNj81qwzAQhF9FbK85yI5LwddADznnFkLY2ptYoJ8grSBF+N27a19608w3zKwaPFIOMDaIGAhGOKXwSpEimwsVdvFpPno4wC9hFsq7B+sBuhaqZ7fCeIVpSW6iuwZ5yURwU14k6WkLSON/dmyxhh/KRSB0n6AO05tVnmthU1Igo46goRXGrIxzJdWdvB/oiwjbAvK03KVv69ITbEPvHcZp384066aVBQybw50aM7J++Ds7c67R2C/T236A9Q/Wjlhq","eJxNj7sKAjEQRX8ljK3FPhRhW8HC2k5ExnV0A3lIMgEl7L87szZ2uedc7pAKj5g8DBUCeoIB9tG/YqDA5kSZbXiaVQdr+BAmsfxjMK+hrb44tjMMZxinaEe6apGnRAQX9VmajpaCLP67vobib5SySGi3oITpzRqPJbPJ0ZNRImpTM2NSx6mQ5lbeD3RZQlM98jhdZW/Z6kEZOmcxjL/bie56s5EL6BfCnYI7sn74kKw5lmCanemabgPzF9buWGw=","eJxNj8sKwjAQRX8ljFsXba0I3QouXLsTkbGONpCHJBNQQv/dmbpxl3vO5Q6p8IjJw1AhoCcYYB/9KwYKbE6U2YanWXWwhg9hEss/BvMa2uqLYzvDcIZxinakqxZ5SkRwUZ+l6WgpyOK/29RQ/I1SFgntFpQwvVnjsWQ2OXoySkT1NTMmdZwKaW7l/UCXJTTVI4/TVfaWrR6UoXMWw/i7neiuNxu5gH4hvFFwR9YPH5I1xxJMszNd0/UwfwHXTlhu","eJxNj82KAjEQhF8ltFcPmVlFmKvgwbM3WaQdWyeQH0k6sEuYd7d7BPHWVV9RRTe4pxxgaBAxEAywT+GZIkU2Jyrs4sOseljDP2EWym8P5jV0LVTPbobhDOOU3EgXDfKUieBXeZGkpyUgjd/sp8UarpSLQOi2oA7TH6s81sKmpEBGHUGbVhizMs6VVHdy39EXEbYF5HG6SN+nyzb03mEc39tXX5dRKxMYFos7NW7I+vEhO3Os0did6W2/gfkFNtlY2g==","eJxNj8sKwjAQRX8ljFsXbX1Bt4IL1+5EZKyjDeQhyQSU0H93pm7c5Z5zuUMqPGLy0FcI6Al62Ef/ioECmxNltuFpFh0s4UOYxPKPwbSEtvri2E7Qn2EYox3oqkUeExFc1GdpOpoLsvjvVjUUf6OURUK7ASVMb9Z4LJlNjp6MElHrmhmTOk6FNLfyfqDLEprqkYfxKnvz1haUoXMWw/C7fXNlPtrICfQz4k7BHVl/fEjWHEswzc50TbeG6Qs3Oljc","eJxNj0sLAjEMhP9KiVcP+xJhr4IHz95kkbhGt9CHtCkoZf+7Tb14y8w3TJIMDx8sjBkcWoIRDt6+vCPH6kyRtXuqTQdb+BCGQvnnwbqFNttkWK8wXmBevJ7pKkFeAhFMwmNJGqqB0vjP+uySvVGIBUK7A3GY3izylCKr6C0pcQoacmQMwjgkEt2W+YEmFtFkizwv19JXu/YgHhqj0c119yQGE9p6CPey/44svx6DVqfkVLNXXdMNsH4BHMpW8g=="]));
      }}/>
    </ScreenShell>
  )
});

const PicklistScreen = memo(({gradientDir}) => {
  // TODO: Make a different picklist section for both quals and for alliances in elims.

  const [teams, setTeams] = useState([]);
  const [teamNames, setTeamNames] = useState({});
  const [teamStatuses, setTeamStatuses] = useState({});
  const [dragListData, setDragListData] = useState([]);

  async function getTeamNamesFromAPI() {
    getBlueAllianceTeams('2024tnkn', 3000).then((data) => {
      setTeamNames(data);
    });
  }

  function getAndSetDragListData() {
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
    }

    const tiersDragData = [
      {...baseDragData, key: 'tier1', is_tier_card: true, tier_info: 'Tier 1'},
      {...baseDragData, key: 'tier2', is_tier_card: true, tier_info: 'Tier 2'},
      {...baseDragData, key: 'tier3', is_tier_card: true, tier_info: 'Tier 3'},
      {...baseDragData, key: 'nopick', is_tier_card: true, tier_info: 'No Pick'},
    ]

    const teamsDragData = teams.map((team) => {
      const teamStatus = teamStatuses[team];

      return ({
        key: team, 
        is_tier_card: false,
        tier_info: null,
        team_number: team.replace('frc', ''),
        team_name: 'None',//teamStatus.team.nickname,
        ranking: teamStatus.qual.ranking.rank,
        alliance: teamStatus.alliance ? teamStatus.alliance.number : null,
        alliance_pick: teamStatus.alliance ? teamStatus.alliance.pick : null,
        qual_wins: teamStatus.qual.ranking.record.wins,
        qual_losses: teamStatus.qual.ranking.record.losses,
        qual_ties: teamStatus.qual.ranking.record.ties,
        playoff_wins: teamStatus.playoff ? teamStatus.playoff.record.wins : null,
        playoff_losses: teamStatus.playoff ? teamStatus.playoff.record.losses : null,
        playoff_ties: teamStatus.playoff ? teamStatus.playoff.record.ties : null,
      });
    });

    
    setDragListData(
      [...tiersDragData, ...teamsDragData]
    );
  }
  
  if (teams.length === 0) {
    // getBlueAllianceEvents('2024').then((data) => { console.log(data); });
    getBlueAllianceDataFromURL("https://www.thebluealliance.com/api/v3/event/" + '2024tnkn' + "/teams/statuses", 10000).then((data) => {
      setTeamStatuses(data);
      setTeams(Object.keys(data));
    });
  }

  if (teamNames.length === 0) {
    getBlueAllianceTeams('2024tnkn', 3000).then((data) => {
      setTeamNames(data);
    });
  }

  useEffect(() => {
    getAndSetDragListData();
  }, [teams]);

  return (
    <ScreenShell gradientDir={gradientDir} scrollable={false} style={{paddingTop: 0, paddingBottom: 0}}>
      <GestureHandlerRootView style={{width: '100%', flex: 1}}>
        <DragDropList data={dragListData}/>
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

const PrematchScreen = memo(({ gradientDir }) => {
  const ctx = useContext(AppContext);
  const [matchNum, setMatchNum] = useState();

  return (
  <ScreenShell gradientDir={gradientDir}>
    <GradientTextInput onlyNumbers key_value="match_num" title='Match Number' onValueChanged={setMatchNum}/>
    <HeaderTitle title='Team Info' fontSize={30}/>
    <GradientChoice key_value="alliance" title='Alliance Color' onValueChanged={setMatchNum} choices={[
      {label: 'Red', value: 'red', select_color: 'rgba(255, 0, 0, 0.6)'},
      {label: 'Blue', value: 'blue', select_color: 'rgba(0, 0, 255, 0.6)'},
    ]}/>
    <GradientChoice key_value="team" title='Team' onValueChanged={setMatchNum} choices={[
      {label: 'Team 1', value: 't1', select_color: 'rgba(0, 0, 255, 0.3)'},
      {label: 'Team 2', value: 't2', select_color: 'rgba(0, 0, 255, 0.3)'},
      {label: 'Team 3', value: 't3', select_color: 'rgba(0, 0, 255, 0.3)'},
    ]}/>
    
  </ScreenShell>
  )
});

const SaveMatchScreen = memo(({ gradientDir }) => {
  const ctx = useContext(AppContext);

  return (
  <ScreenShell gradientDir={gradientDir} scrollable={false} style={{justifyContent: 'center'}}>
    <HeaderTitle title='QR code does NOT function yet!' fontSize={30}/>
    <GradientQRCode text={DeflateString(JSON.stringify({...ctx.matchData, date: new Date().toDateString()}))}/>
    <GradientButton title='Save Match' style={{padding: 5}} onPress={() => {
        ctx.storeMatch({...ctx.matchData, date: new Date().toDateString()});
        ctx.setMatchData(undefined);
        ctx.setScreens([{screen: HomeScreen, name: 'Home'}])
        ctx.showNotification('Match Saved!');
      }}
    />
    
  </ScreenShell>
  )
});

export { HomeScreen, PrematchScreen, SaveMatchScreen, ScoutedMatchesScreen }