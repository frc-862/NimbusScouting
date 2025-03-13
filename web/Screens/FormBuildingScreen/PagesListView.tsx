import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import FormBuildScreenContext, { FormPage } from "../../../contexts/FormBuildScreenContext";
import Globals from "../../../Globals";
import { AppButton } from "../../../GlobalComponents";


function PageButton({page, index, onPress}: {page: FormPage, index: number, onPress: (index: number) => void}) {
  return (

    <AppButton onHover={() => {}} onPress={() => onPress(index)} style={{borderRadius: 0}} outerStyle={{width: '100%', borderRadius: 0}} innerStyle={undefined} gradientDirection={undefined} disabled={undefined}>
      <View style={{width: '100%', height: '100%', flexDirection: 'row', alignItems: 'center', padding: 5}}>
        <Text style={{color: 'white', fontSize: 18, flex: 1, marginLeft: 2, marginVertical: 2}}>{page.name}</Text>

        <AppButton onPress={() => {}} style={{borderRadius: 0}} outerStyle={{borderRadius: 0, height: '100%'}} innerStyle={undefined} gradientDirection={undefined} disabled={undefined}>
          <Text style={{color: 'white', fontSize: 12, margin: 3}}>Up</Text>
        </AppButton>
        <AppButton onPress={() => {}} style={{borderRadius: 0}} outerStyle={{borderRadius: 0, height: '100%'}} innerStyle={undefined} gradientDirection={undefined} disabled={undefined}>
          <Text style={{color: 'white', fontSize: 12, margin: 3}}>Down</Text>
        </AppButton>
        <AppButton onPress={() => {}} style={{borderRadius: 0}} outerStyle={{borderRadius: 0, height: '100%'}} innerStyle={undefined} gradientDirection={undefined} disabled={undefined}>
          <Text style={{color: 'white', fontSize: 12, margin: 3}}>Del</Text>
        </AppButton>
      </View>
    </AppButton>
  )
}

export default function PagesListView({onPress}: {onPress: (index: number) => void}) {
  const ctx = React.useContext(FormBuildScreenContext);

  return (
    <ScrollView style={{flex: 1, backgroundColor: Globals.PageContainerColor, overflow: 'hidden'}} contentContainerStyle={{alignItems: 'center'}}>
      {
        ctx.pages.map((page, index: number) => {
          return (
            <PageButton key={index} page={page} index={index} onPress={(index: number) => { onPress(index); }} />
          )  
        }) 
      }
      <AppButton onPress={() => {}} style={{borderRadius: 0}} outerStyle={{borderRadius: 0, width: '20%'}} innerStyle={undefined} gradientDirection={undefined} disabled={undefined}>
        <Text style={{color: 'white', fontWeight: 'bold', fontSize: 24, marginBottom: 5}}>+</Text>
      </AppButton>
    </ScrollView>
  )
}