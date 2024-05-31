import ScreenShell from "./ScreenShell";
import { GradientButton, GradientCheckBox, GradientChoice, GradientNumberInput, GradientQRCode, GradientTextInput } from "../GradientComponents";
import { Animated, View } from "react-native";
import AppContext from "../../components/AppContext";
import { useContext, useEffect, useState } from "react";
import { HeaderTitle, RelatedContentContainer } from "../PageComponents";
import { AppChoice, AppInput } from "../../GlobalComponents";
import { FormBuilder, GetFormJSONAsMatch, exampleJson } from "../FormBuilder";
import { DeflateString, InflateString } from "../../backend/DataCompression";

const HomeScreen = ({gradientDir}) => {
  const ctx = useContext(AppContext);

  return (
    <ScreenShell gradientDir={gradientDir} scrollable={false}>
      <GradientButton outerStyle={{height: '15%', width: '90%'}} style={{padding: 5}} title={"Time to Scout!"} onPress={() => {
        ctx.setScreens(ctx.formInfo);
        ctx.setMatchData(GetFormJSONAsMatch(exampleJson));
      }}/>
      <GradientButton title={"Print Match Data"} onPress={() => {
        console.log(ctx.matchData);
      }}/>
      <GradientButton title={"Scouted Matches"} onPress={() => {
        ctx.setScreens([{screen: ScoutedMatchesScreen, name: 'Scouted Matches', onBack: () => {ctx.setScreens([{screen: HomeScreen, name: 'Home'}])}}])
      }}/>
    </ScreenShell>
  );
}

const ScoutedMatchesScreen = ({gradientDir}) => {
  const ctx = useContext(AppContext);

  const [matches, setMatches] = useState([]);

  async function decompressMatches() {
    let decompressedMatches = [];
    for (let match of ctx.storedMatchData) {
      decompressedMatches.push(JSON.parse(InflateString(match)));
    }
    setMatches(decompressedMatches);
  }

  useEffect(() => { 
    decompressMatches();
  }, []);


  // Determine what to render based on your matches scouted and if the matches have been decompressed yet.
  let listRender = [
    <HeaderTitle key={1} title='No Matches Scouted Yet!' fontSize={30}/>,
    <HeaderTitle key={2} title='Go Scout Some!' fontSize={15}/>,
  ];

  console.log(matches, ctx.storedMatchData)

  if (matches.length > 0) {
    listRender = matches.map((match, index) => {
      return (
        <View key={index} style={{width: '100%'}}>
          <GradientCheckBox title={`Scouted Match #${index}`} fontSize={30}/>
        </View>
      )
    });
  } else if (ctx.storedMatchData.length > 0) {
    listRender = [
      <HeaderTitle key={1} title='Decompressing Matches...' fontSize={30}/>,
      <HeaderTitle key={2} title='Please Wait' fontSize={10}/>,
    ];
  }

  // Just return the screen with the list of matches.
  return (
    <ScreenShell gradientDir={gradientDir}>
      { listRender }
    </ScreenShell>
  )
}

/*
  Form-Based Screens
    - These screens are used in the form, along with the auto generated screens from the form builder.
    - They are used to collect data from the user about the match.
    - Unfortunately, with the functions these screens need to have, it is is hard to make them dynamic.
*/

const PrematchScreen = ({ gradientDir }) => {
  const ctx = useContext(AppContext);
  const [matchNum, setMatchNum] = useState();

  return (
  <ScreenShell gradientDir={gradientDir}>
    <GradientNumberInput key_value="match_num" title='Match Number' onValueChanged={setMatchNum}/>
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
}

const SaveMatchDataScreen = ({ gradientDir }) => {
  const ctx = useContext(AppContext);

  return (
  <ScreenShell gradientDir={gradientDir} scrollable={false} style={{justifyContent: 'center'}}>
    <GradientQRCode text={DeflateString(JSON.stringify(ctx.matchData))}/>
    <GradientButton title='Save Match Data' style={{padding: 5}} onPress={() => {
        ctx.storeMatch(ctx.matchData);
        ctx.setMatchData({});
        ctx.setScreens([{screen: HomeScreen, name: 'Home'}])
      }}
    />
    
  </ScreenShell>
  )
}

export { HomeScreen, PrematchScreen, SaveMatchDataScreen }