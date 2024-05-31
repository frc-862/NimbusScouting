import React, { useContext } from 'react';
import { View, StyleSheet, Platform, StatusBar } from 'react-native';
import { PageHeader, PageContent, PageFooter } from '../PageComponents';
import Globals from '../../Globals';
import AppContext from '../../components/AppContext';

const ScreenShell = ({children, scrollable = true, style, gradientDir = 1}) => {
  const ctx = useContext(AppContext);

  const {name, infoText} = ctx.screens[ctx.screenIndex];

  return (
  <View style={[styles.page, {backgroundColor: Globals.PageColor}]}>
    <PageHeader gradientDir={gradientDir} infoText={infoText} title={name}/>

    <PageContent gradientDir={gradientDir} scrollable={scrollable} style={style}>
      {children}
    </PageContent>

    <PageFooter gradientDir={gradientDir}/>
    <StatusBar style="light" />
  </View>
  );
}

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

export default ScreenShell;