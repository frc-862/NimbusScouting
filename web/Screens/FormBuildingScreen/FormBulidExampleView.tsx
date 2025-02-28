import React, { useContext } from "react";
import { ScrollView, Text, View } from "react-native";
import FormBuildScreenContext from "../../../components/FormBuildScreenContext";
import Globals from "../../../Globals";
import { HeaderTitle } from "../../../mobile/PageComponents";
import { AppInput } from "../../../GlobalComponents";
import DropdownComponent from "../../../mobile/Screens/Dropdown";
import { lab } from "d3";
import { PageFooter, PageHeader } from "../../FormBuilder/PageComponents";

const WebPhonePageView = ({children}: {children: any}) => {
  const ctx = useContext(FormBuildScreenContext);
  const width = 414;
  const height = 896;
  const scale = 0.7;

  return (

    // <View style={{ width: 100, height: 100, backgroundColor: 'lightblue', justifyContent: 'center', alignItems: 'center', transform: [{ scale: 2 }] }}>
    //   <Text>This view is scaled and centered.</Text>
    // </View>
    <View style={{width: width, height: height, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgb(30, 30, 30)', borderRadius: 50, overflow: 'hidden', transform: [{scale: scale}]}}>
      {children}
    </View>
  );
}


const PageContent = ({gradientDir, scrollable, children}: {gradientDir: number, scrollable: boolean, children: React.ReactNode}) => {
  return (
    <View style={{flex: 1, backgroundColor: 'white'}}>
      {scrollable ? <ScrollView>{children}</ScrollView> : children}
    </View>
  );
}

export default function FormBuildExampleView() {
  const ctx = React.useContext(FormBuildScreenContext);

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Globals.PageColor, overflow: 'hidden'}}>
      <Text style={{color: 'white'}}>SHOW EXAMPLE</Text>
      {/* <DropdownComponent
        data={[{ label: "IPhone XR", value: { x: 414, y: 896 } }, { label: "IPhone 12", value: { x: 414, y: 895 } }]} outerStyle={undefined} style={undefined} default_value={undefined}      /> */}
      <WebPhonePageView>
        <PageHeader key={""} title={"Hello!"} gradientDir={1} infoText={undefined}/>

        <PageContent gradientDir={1} scrollable={true}>
          <AppInput children={undefined} key={"Hi!"} default_value={"Hi!"} onLeave={() => {}} onValueChanged={() => {}} regex={false ? /[^0-9]/g : undefined} outerStyle={{width: '80%', marginBottom: 10}} style={{}} title={"Chickens"} showTitle={true}/>
        </PageContent>

        <PageFooter gradientDir={1} overrideNext={undefined} overrideBack={undefined} />  
      </WebPhonePageView>
    </View>
  )
}