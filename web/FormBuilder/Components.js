import React, { useContext, useEffect, useRef, useState } from 'react';
import Globals from '../../Globals';
import { StyleSheet, View, Animated, Button, Text, Pressable, TextInput, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FormBuilderContext from '../../components/FormBuilderContext';
import { AppChoice } from '../../GlobalComponents';

const Shell = ({children, style, innerStyle, opacity, hasGradient = true, emulated}) => {
  const ctx = useContext(FormBuilderContext);

  return (
    <LinearGradient
      style={[{justifyContent: 'center', alignItems: 'center', borderRadius: emulated ? 20 * ctx.scale : 20}, style]}
      colors={hasGradient ? [Globals.GradientColor1, Globals.GradientColor2] : ['transparent', 'transparent']}
      start={{x: 1, y: 0}}
      end={{x: 0, y: 0}}
    >
      <Animated.View style={[{borderRadius: emulated ? 18 * ctx.scale : 18, width: '100%', height: '100%', zIndex: -1, position: 'absolute', backgroundColor: Globals.ButtonColor, opacity: opacity}, innerStyle]}></Animated.View>
      {children}
    </LinearGradient>
  );
}

const WebButton = ({title, style, innerStyle, textStyle, onClick = () => {}, emulated, onEmulateClick = () => {},}) => {
  const opacity = useRef(new Animated.Value(1)).current;
  const ctx = useContext(FormBuilderContext);

  function setOpacity(value, time) {
    Animated.timing(opacity, {
      toValue: value,
      duration: time,
      useNativeDriver: true
    }).start();
  }

  return (
    <Shell style={[styles.button, style]} innerStyle={innerStyle} opacity={opacity} emulated={emulated}>
      { emulated ? 
        <Pressable 
          onPress={onEmulateClick}
          style={{width: '100%',height: '100%', backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center'}}
        ></Pressable> 
        : // Else return the actual button
        <Pressable
          onPressIn={() => setOpacity(0.5, 10)}
          onPressOut={() => setOpacity(1, 100)}
          onPress={onClick}
          style={{width: '100%',height: '100%', backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center'}}
        >
          <Text selectable={false} style={[{color: Globals.TextColor, width: '100%', textAlign: 'center', justifyContent: 'center', alignItems: 'center', fontSize: emulated ? 20 * ctx.scale : 20, fontWeight: 'bold'}, textStyle]}>{title}</Text>
        </Pressable>
      }
    </Shell>
  );
}

const WebHeader= ({title, fontSize, style, selectable=false, selected, emulated, emulatedStyle, onEmulateClick = () => {}}) => {
  const ctx = useContext(FormBuilderContext);
  const elem = <Text selectable={selectable} style={[{color: Globals.TextColor, fontSize: emulated ? fontSize * ctx.scale : fontSize, fontWeight: 'bold'}, style]}>{title}</Text>
  return emulated ? <Pressable onPress={onEmulateClick} style={[{backgroundColor: selected && ctx.showHighlight ? 'rgba(255, 0, 0, 0.3)' : 'transparent'}, emulatedStyle]}>{elem}</Pressable> : elem;
}

// Kinda want the Checkboxes in the actual app to look like this soooooo..... Ill keep it like this for now.
const WebCheckbox = ({title, style, innerStyle, textStyle, hasGradient = true, checked = false, checkedColor = 'rgb(0, 0, 0, 0)', onClick = () => {}, setParallelValue = () => {}, selected, emulated, onEmulateClick = () => {}}) => {
  const opacity = useRef(new Animated.Value(1)).current;
  const [isChecked, setIsChecked] = useState(checked);
  const ctx = useContext(FormBuilderContext);

  if (emulated && isChecked !== checked) {
    setIsChecked(checked);
  }

  function setOpacity(value, time) {
    Animated.timing(opacity, {
      toValue: value,
      duration: time,
      useNativeDriver: true
    }).start();
  }

  return (
    <Shell hasGradient={hasGradient} opacity={isChecked ? 1 : opacity} style={[{justifyContent: 'center', alignItems: 'center', overflow: 'hidden'}, style]} innerStyle={[innerStyle, {backgroundColor: isChecked ? checkedColor : Globals.ButtonColor}]} emulated={emulated}>
      { emulated ?
        <Pressable onPress={() => { onEmulateClick(); }} style={{width: '100%', justifyContent: 'center', alignItems: 'center', padding: 15 * ctx.scale, backgroundColor: selected && ctx.showHighlight ? 'rgba(255, 0, 0, 0.3)' : 'transparent'}}>
          <Text selectable={false} style={[{maxWidth: '100%', textAlign: 'center', color: Globals.TextColor, fontSize: 20 * ctx.scale, fontWeight: 'bold'}, textStyle]}>{title}</Text>
        </Pressable>
      : // Else, return the acutal checkbox
        <Pressable onPress={() => { onClick(); setIsChecked(!isChecked); setParallelValue(!isChecked)}} onPressIn={() => setOpacity(0.5, 10)} onPressOut={() => setOpacity(1, 100)} style={{height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center', padding: 15 * ctx.scale}}>
          <Text selectable={false} style={[{maxWidth: '100%', textAlign: 'center', color: Globals.TextColor, fontSize: 20 * ctx.scale, fontWeight: 'bold'}, textStyle]}>{title}</Text>
        </Pressable>
      }
    </Shell>
  )
}

const WebInput = ({style, outerStyle, selectTextOnFocus, title, showTitle = true, default_value, onlyNumbers, onBlur = () => {}, setParallelValue = () => {}, selected, emulated, onEmulateClick = () => {}}) => {
  const ctx = useContext(FormBuilderContext);
  const [textValue, setTextValue] = useState(default_value);
  const scale = emulated ? ctx.scale : 1;
  let height = 60 * scale;
  let width = 300 * scale;
  if (!emulated) {
    height = style ? style.height : 60 * scale;
    width = style ? style.width : 300 * scale;
  }

  return (
    <View style={[{width: width, borderRadius: 20 * scale, justifyContent: 'center', alignItems: 'center', overflow: 'hidden'}, outerStyle]}>
      { showTitle ? 
      [
        <Text selectable={false} style={{width: '100%', color: 'white', paddingLeft: 15 * scale, paddingRight: 15 * scale, fontSize: 20 * scale, fontWeight: 'bold', borderRadius: 0, borderTopLeftRadius: 20 * scale, borderTopRightRadius: 20 * scale, backgroundColor: Globals.ButtonColor, textAlign: 'center'}}>{title}</Text>,
        <View style={{width: '100%', backgroundColor: Globals.ButtonColor, alignItems: 'center'}}>
          <View style={{width: '90%', height: 2 * scale, borderRadius: 10, backgroundColor: 'hsl(39, 70%, 40%)'}}/>
        </View>
      ] : null 
      }
      <TextInput 
        onBlur={() => {
          // Set text and parallel text to be numbers if needed
          if (onlyNumbers) {

          }

          onBlur();
        }} 
        defaultValue={default_value}
        value={textValue}
        onChangeText={(text) => { 
          if (onlyNumbers) {
            setParallelValue(text);
            setTextValue(text);
          } else {
            setParallelValue(text);
            setTextValue(text);
          }
        }} 
        selectTextOnFocus={selectTextOnFocus} readOnly={emulated}
        style={[{outline: 'none', padding: 10 * scale, color: 'white', fontSize: 20 * scale, fontWeight: 'bold', borderRadius: 20 * scale, borderTopLeftRadius: showTitle ? 0 : null, borderTopRightRadius: showTitle ? 0 : null, width: '100%', height: height, backgroundColor: Globals.ButtonColor, textAlign: 'center'}, style]}
      />
      { emulated ? <Pressable onPress={onEmulateClick} style={{position: 'absolute', width: '100%', height: '100%', backgroundColor: selected && ctx.showHighlight ? 'rgba(255, 0, 0, 0.3)' : 'transparent'}}></Pressable> : null }
    </View>
  )
}

const WebChoice = ({style, title, showTitle = true, choices, default_indexes, selected, onEmulateClick = () => {}}) => {
  const ctx = useContext(FormBuilderContext);

  const transferred_defaults = default_indexes ? default_indexes.replace(' ', '').split(',').map((item) => Number(item)) : [];

  return (
    <View>
      <AppChoice key={default_indexes} choices={choices} default_indexes={transferred_defaults} showTitle={showTitle} title={title} style={style}/>
      <Pressable style={{position: 'absolute', width: '100%', height: '100%', backgroundColor: selected && ctx.showHighlight ? 'rgba(255, 0, 0, 0.3)' : 'transparent'}} onPress={onEmulateClick}></Pressable>
    </View>
  )

  return (
    <View style={{width: width, borderRadius: 20 * ctx.scale, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', backgroundColor: Globals.ButtonColor}}>
      
      { showTitle ? <Text selectable={false} style={{width: width, color: 'white', paddingLeft: 15 * ctx.scale, paddingRight: 15 * ctx.scale, fontSize: 20 * ctx.scale, fontWeight: 'bold', borderTopLeftRadius: 20 * ctx.scale, borderTopRightRadius: 20 * ctx.scale, backgroundColor: Globals.ButtonColor, textAlign: 'center'}}>{title}</Text> : null }
      { showTitle ? <View style={{width: '90%', height: 2 * scale, borderRadius: 10, backgroundColor: 'hsl(39, 70%, 40%)'}}/> : null }
      <LinearGradient 
        style={{zIndex: -1, width: width, flexDirection: 'row', flexWrap: 'wrap', borderRadius: 20 * scale, borderTopLeftRadius: showTitle ? 0 : null, borderTopRightRadius: showTitle ? 0 : null, justifyContent: 'center', alignItems: 'center', overflow: 'hidden'}}
        colors={[Globals.GradientColor1, Globals.GradientColor2]}
        start={{x: 1, y: 0}}
        end={{x: 0, y: 0}}
      >
        {
        choices.map((choice, index) => <WebCheckbox hasGradient={false} title={choice.label} checkedColor={choice.select_color} checked={choice.value === default_value} key={index} emulated={emulated} style={{height: height, minWidth: width / 3, flex: 1, borderRadius: 0}} innerStyle={{borderRadius: 0}}/>)
        }
      </LinearGradient>
      <Pressable onPress={onEmulateClick} style={{position: 'absolute', width: '100%', height: '100%', backgroundColor: selected && ctx.showHighlight ? 'rgba(255, 0, 0, 0.3)' : 'transparent'}}></Pressable>
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