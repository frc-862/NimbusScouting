import React from "react";
import { ScrollView, Text } from "react-native";
import FormBuildScreenContext from "../../../components/FormBuildScreenContext";
import Globals from "../../../Globals";


export default function PagesListView() {
  const ctx = React.useContext(FormBuildScreenContext);

  return (
    <ScrollView style={{flex: 1, backgroundColor: Globals.PageContainerColor, overflow: 'hidden'}}>
      <Text style={{color: 'white'}}>SHOW PAGES</Text>
    </ScrollView>
  )
}