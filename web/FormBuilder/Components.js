import React, { useContext, useEffect, useRef, useState } from 'react';
import Globals from '../../Globals';
import { StyleSheet, View, Animated, Button, Text, Pressable, TextInput, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FormBuilderContext from '../../components/FormBuilderContext';
import { AppButton, AppCheckbox, AppChoice, AppInput } from '../../GlobalComponents';

const WebButton = ({title, outerStyle, style, innerStyle, textStyle, hoverAnimation = "opacity", onClick = () => {}, emulated, onEmulateClick = () => {},}) => {
  return (
    <AppButton hoverAnimation={hoverAnimation} onPress={onClick} outerStyle={outerStyle} style={style} innerStyle={innerStyle}>
      <Text selectable={false} style={[{color: 'white', fontSize: 16, fontWeight: 'bold'}, textStyle]}>{title}</Text>
    </AppButton>
  )
}

const WebHeader= ({title, fontSize, style, selectable=false, selected, emulated, emulatedStyle, onEmulateClick = () => {}}) => {
  const ctx = useContext(FormBuilderContext);
  const elem = <Text selectable={selectable} style={[{marginBottom: 10, color: Globals.TextColor, fontSize: emulated ? fontSize * ctx.scale : fontSize, fontWeight: 'bold'}, style]}>{title}</Text>
  return emulated ? <Pressable onPress={onEmulateClick} style={[{maxWidth: '80%', backgroundColor: selected && ctx.showHighlight ? 'rgba(255, 0, 0, 0.3)' : 'transparent'}, emulatedStyle]}>{elem}</Pressable> : elem;
}

// Kinda want the Checkboxes in the actual app to look like this soooooo..... Ill keep it like this for now.
const WebCheckbox = ({title, style, innerStyle, textStyle, default_value = false, checkedColor = 'rgb(0, 0, 0, 0)', onClick = () => {}, setParallelValue = () => {}, selected, emulated, onEmulateClick = () => {}}) => {
  const ctx = useContext(FormBuilderContext);
  
  return (
    <View style={{width: '100%', alignItems: 'center'}}>
      <AppCheckbox key={default_value} checked={default_value} checkedColor={checkedColor} onPress={onClick} onValueChanged={setParallelValue} outerStyle={[{justifyContent: 'center', alignItems: 'center', marginBottom: 10, width: '50%', height: 50} ,style]} style={innerStyle}><Text style={[{textAlign: 'center', verticalAlign: 'center', fontWeight: 'bold', fontSize: 17, color: 'white'}, textStyle]}>{title}</Text></AppCheckbox>
      <Pressable style={{position: 'absolute', width: '80%', height: '100%', backgroundColor: selected && ctx.showHighlight ? 'rgba(255, 0, 0, 0.3)' : 'transparent'}} onPress={onEmulateClick}></Pressable>
    </View>
  )
}

const WebInput = ({style, outerStyle, title, showTitle = true, default_value, onlyNumbers, onBlur = () => {}, setParallelValue = () => {}, selected, emulated, onEmulateClick = () => {}}) => {
  const ctx = useContext(FormBuilderContext);
  return (
    <View style={{width: '100%', alignItems: 'center'}}>
      <AppInput key={default_value} default_value={default_value} onLeave={onBlur} onValueChanged={setParallelValue} regex={onlyNumbers ? /[^0-9]/g : undefined} outerStyle={[{width: '80%', marginBottom: 10}, outerStyle]} style={style} title={title} showTitle={showTitle}/>
      <Pressable style={{position: 'absolute', width: '80%', height: '100%', backgroundColor: selected && ctx.showHighlight ? 'rgba(255, 0, 0, 0.3)' : 'transparent'}} onPress={onEmulateClick}></Pressable>
    </View>
  )
}

const WebChoice = ({style, title, showTitle = true, choices, default_value, selected, onEmulateClick = () => {}}) => {
  const ctx = useContext(FormBuilderContext);

  const transferred_defaults = default_value ? default_value.replace(' ', '').split(',').map((item) => Number(item)) : [];

  return (
    <View style={{width: '100%', alignItems: 'center'}}>
      <AppChoice key={default_value} choices={choices} default_indexes={transferred_defaults} showTitle={showTitle} title={title} outerStyle={{width: '80%', marginBottom: 10}} style={style}/>
      <Pressable style={{position: 'absolute', width: '80%', height: '100%', backgroundColor: selected && ctx.showHighlight ? 'rgba(255, 0, 0, 0.3)' : 'transparent'}} onPress={onEmulateClick}></Pressable>
    </View>
  )
}

const WebPhonePageView = ({children}) => {
  const ctx = useContext(FormBuilderContext);
  const width = 400 * ctx.scale;
  const height = 700 * ctx.scale;

  return (
    <View style={{width: width, height: height, margin: 'auto', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgb(30, 30, 30)', borderRadius: 50 * ctx.scale, overflow: 'hidden'}}>
      {children}
    </View>
  );
}

// https://amanhimself.dev/blog/custom-scroll-bar-indicator-with-react-native-animated-api/
const CustomScrollView = ({children, style, contentContainerStyle, addScrollbarSpace=true, scrollbarWidth = 6, scrollbarColor = 'hsl(39, 60%, 35%)'}) => {

  const [completeScrollBarHeight, setCompleteScrollBarHeight] = useState(1);
  const [visibleScrollBarHeight, setVisibleScrollBarHeight] = useState(0);
  const scrollIndicator = useRef(new Animated.Value(0)).current;

  // Calculate size of scroll indicator
  const scrollIndicatorSize =
  completeScrollBarHeight > visibleScrollBarHeight
    ? (visibleScrollBarHeight * visibleScrollBarHeight) / completeScrollBarHeight
    : visibleScrollBarHeight;

  const difference =
  visibleScrollBarHeight > scrollIndicatorSize
    ? visibleScrollBarHeight - scrollIndicatorSize
    : 1;
  
  const scrollIndicatorPosition = Animated.multiply(
    scrollIndicator,
    visibleScrollBarHeight / completeScrollBarHeight
  ).interpolate({
    inputRange: [0, difference],
    outputRange: [0, difference],
    extrapolate: 'clamp'
  });

  return (
    <View style={[{flexDirection: 'row'}, style]}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={contentContainerStyle}
        onContentSizeChange={(w, h) => {
          setCompleteScrollBarHeight(h);
        }}
        onLayout={({
          nativeEvent: {
            layout: { height }
          }
        }) => {
          setVisibleScrollBarHeight(height);
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollIndicator } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {children}
      </ScrollView>
      { 
      scrollIndicatorSize !== visibleScrollBarHeight ? 
        <View style={{position: addScrollbarSpace ? 'relative' : 'absolute', right: 0, height: '100%'}}>
          <Animated.View style={{height: scrollIndicatorSize, width: scrollbarWidth, backgroundColor: scrollbarColor, transform: [{ translateY: scrollIndicatorPosition }]}}/>
        </View> 
      : null
      }
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    borderStyle: 'none',
    width: '80%',
  }
});

export { WebButton, WebHeader, WebCheckbox, WebInput, WebChoice, WebPhonePageView, CustomScrollView }