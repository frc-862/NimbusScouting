import React, { useContext, useRef } from 'react';
import { View, Text } from "react-native"
import AppContext from "../../contexts/AppContext";
import Globals from '../../Globals';
import FormBuildingScreen from './FormBuildingScreen';
import ComponenetTestingScreen from './ComponentTestingScreen';
import { AppButton } from '../../GlobalComponents';
import TeamsDataScreen from './TeamsDataScreen';
import { WebButton } from '../FormBuilder/Components';
import { GradientButton } from '../../mobile/GradientComponents';
import FormBuildingScreenv2 from './FormBuildingScreen/FormBuildingScreenv2';

const HomeScreen = () => {
  const ctx = useContext(AppContext);

  return (
    <View style={{flex: 1, backgroundColor: Globals.PageColor, justifyContent: 'center', alignItems: 'center'}}>
      <AppButton onPress={() => ctx.setScreens([FormBuildingScreen])} outerStyle={{margin: 5, padding: 5}} style={{padding: 5, width: 200, borderRadius: 15, height: 70}}>
        <Text selectable={false} style={{textAlign: 'center', fontSize: 20, fontWeight: 'bold', color: 'white'}}>To Form Builder</Text>
      </AppButton>

      <AppButton onPress={() => ctx.setScreens([FormBuildingScreenv2])} outerStyle={{margin: 5, padding: 5}} style={{padding: 5, width: 200, borderRadius: 15, height: 70}}>
        <Text selectable={false} style={{textAlign: 'center', fontSize: 20, fontWeight: 'bold', color: 'white'}}>To Form Builder v2</Text>
      </AppButton>
      
      <AppButton onPress={() => ctx.setScreens([TeamsDataScreen])} outerStyle={{margin: 5}} style={{padding: 5, width: 200, height: 70}}>
        <Text selectable={false} style={{textAlign: 'center', fontSize: 20, fontWeight: 'bold', color: 'white'}}>To Teams Data Screen</Text>
      </AppButton>

      <AppButton onPress={() => ctx.setScreens([ComponenetTestingScreen])} outerStyle={{margin: 5}} style={{padding: 5, width: 200, height: 70}}>
        <Text selectable={false} style={{textAlign: 'center', fontSize: 20, fontWeight:'bold', color: 'white'}}>To Component Testing</Text>
      </AppButton>

      <WebButton title="To Form Builder" onClick={() => ctx.setScreens([FormBuildingScreen])}/>
      <GradientButton title="To Teams Data Screen" onPress={() => ctx.setScreens([TeamsDataScreen])}/>
    </View>
  );

}

export default HomeScreen