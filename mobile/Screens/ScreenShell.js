import React, { useContext } from 'react';
import { View, StyleSheet, Platform, StatusBar } from 'react-native';
import { PageHeader, PageContent, PageFooter } from '../PageComponents';
import Globals from '../../Globals';
import AppContext from '../../contexts/AppContext';

/**
 * The parent component used on all screens.
 * 
 * @param {JSX.Element} children The children to render.
 * @param {boolean} scrollable If true, the content will be scrollable.
 * @param {object} style The style object to apply to the content.
 * @param {number} gradientDir The direction of the gradient.
 * @param {function} overrideNext The function to call when the next button is pressed.
 * @param {function} overrideBack The function to call when the back button is pressed.
 * 
 * @returns {JSX.Element} The screen shell.
 */
const ScreenShell = ({children, scrollable = true, style, gradientDir = 1, overrideNext = undefined, overrideBack = undefined}) => {
  const ctx = useContext(AppContext);

  const {name, infoText} = ctx.screens[ctx.screenIndex];

  return (
  <View style={[styles.page, {backgroundColor: Globals.PageColor}]}>
    <PageHeader gradientDir={gradientDir} infoText={infoText} title={name}/>

    <PageContent gradientDir={gradientDir} scrollable={scrollable} style={style}>
      {children}
    </PageContent>

    <PageFooter gradientDir={gradientDir} overrideBack={overrideBack} overrideNext={overrideNext}/>
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