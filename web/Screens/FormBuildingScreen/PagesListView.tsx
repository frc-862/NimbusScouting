import React from "react";
import { Pressable, ScrollView, Text } from "react-native";
import FormBuildScreenContext, { FormPage } from "../../../contexts/FormBuildScreenContext";
import Globals from "../../../Globals";
import { AppButton } from "../../../GlobalComponents";


function PageButton({page, index, onPress}: {page: FormPage, index: number, onPress: (index: number) => void}) {
  return (

    <AppButton onPress={() => onPress(index)} style={undefined} outerStyle={undefined} innerStyle={undefined} gradientDirection={undefined} disabled={undefined}>
      <Text style={{color: 'black'}}>{page.name}</Text>
    </AppButton>
  )
}

export default function PagesListView({onPress}: {onPress: (index: number) => void}) {
  const ctx = React.useContext(FormBuildScreenContext);

  return (
    <ScrollView style={{flex: 1, backgroundColor: Globals.PageContainerColor, overflow: 'hidden'}}>
      {
        ctx.pages.map((page, index: number) => {
          return (
            <PageButton key={index} page={page} index={index} onPress={(index: number) => { onPress(index); }} />
          )  
        })
      }
    </ScrollView>
  )
}