import React, { useContext, useRef, useState } from 'react';
import Globals from '../mobile/Globals';
import { StyleSheet, View, Animated, Button, Text, Pressable, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FormBuilderContext from '../components/FormBuilderContext';


const Shell = ({children, style, innerStyle, opacity, emulated}) => {
  const ctx = useContext(FormBuilderContext);

  return (
    <LinearGradient
      style={[{justifyContent: 'center', alignItems: 'center', borderRadius: emulated ? 20 * ctx.scale : 20}, style]}
      colors={[Globals.GradientColor1, Globals.GradientColor2]}
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
    <Shell style={[styles.button, {height: emulated ? 70 * ctx.scale : 70}, style]} innerStyle={innerStyle} opacity={opacity} emulated={emulated}>
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

const WebHeader = ({title, fontSize, style, selectable=false, emulated, onEmulateClick = () => {}}) => {
  const ctx = useContext(FormBuilderContext);

  const elem = <Text selectable={selectable} style={[{color: Globals.TextColor, fontSize: emulated ? fontSize * ctx.scale : fontSize, fontWeight: 'bold'}, style]}>{title}</Text>
  return emulated ? <Pressable onPress={onEmulateClick}>{elem}</Pressable> : elem;
}

// Kinda want the Checkboxes in the actual app to look like this soooooo..... Ill keep it like this for now.
const WebCheckbox = ({title, style, innerStyle, checked = false, onClick = () => {}, emulated, onEmulateClick = () => {}}) => {
  const opacity = useRef(new Animated.Value(1)).current;
  const [isChecked, setIsChecked] = useState(checked);
  const ctx = useContext(FormBuilderContext);

  function setOpacity(value, time) {
    Animated.timing(opacity, {
      toValue: value,
      duration: time,
      useNativeDriver: true
    }).start();
  }

  return (
    <Shell opacity={isChecked ? 0 : opacity} style={[{height: 50 * ctx.scale, justifyContent: 'center', alignItems: 'center', overflow: 'hidden'}, style]} innerStyle={innerStyle} emulated={emulated}>
      { emulated ?
        <Pressable onPress={() => { onEmulateClick(); }} style={{height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center', padding: 15 * ctx.scale}}>
          <Text selectable={false} style={{color: Globals.TextColor, fontSize: 20 * ctx.scale, fontWeight: 'bold'}}>{title}</Text>
        </Pressable>
      : // Else, return the acutal checkbox
        <Pressable onPress={() => { onClick(); setIsChecked(!isChecked); }} onPressIn={() => setOpacity(0.5, 10)} onPressOut={() => setOpacity(1, 100)} style={{height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center', padding: 15 * ctx.scale}}>
          <Text selectable={false} style={{color: Globals.TextColor, fontSize: 20 * ctx.scale, fontWeight: 'bold'}}>{title}</Text>
        </Pressable>
      }
    </Shell>
  )
}

const WebInput = ({style, outerStyle, selectTextOnFocus, title, showTitle = true, default_value, onBlur = () => {}, parallelValue = {get: undefined, set: () => {}}, emulated, onEmulateClick = () => {}}) => {
  const ctx = useContext(FormBuilderContext);

  const controlled = parallelValue.get !== undefined;

  const scale = emulated ? ctx.scale : 1;
  const height = showTitle ? 75 * scale : 50 * scale;

  return (
    <View style={[{width: 200 * scale, height: height, borderRadius: 20 * scale, justifyContent: 'center', alignItems: 'center', overflow: 'hidden'}, outerStyle]}>
      { showTitle ? <Text selectable={false} style={{color: 'white', paddingLeft: 15 * scale, paddingRight: 15 * scale, fontSize: 20 * scale, fontWeight: 'bold', height: 25 * scale, borderTopLeftRadius: 20 * scale, borderTopRightRadius: 20 * scale, backgroundColor: Globals.ButtonColor, textAlign: 'center'}}>{title}</Text> : null }
      { 
        // Change the element based on whether it should be controlled or not
        React.cloneElement(
          <TextInput onBlur={onBlur} onChangeText={parallelValue.set} 
            selectTextOnFocus={selectTextOnFocus} readOnly={emulated}
            style={[{outline: 'none', padding: 10 * scale, color: 'white', fontSize: 20 * scale, fontWeight: 'bold', borderRadius: 20 * scale, width: '100%', height: 50 * scale, backgroundColor: Globals.ButtonColor, textAlign: 'center'}, style]}
          />,
          controlled ? {value: parallelValue.get || undefined} : {defaultValue: default_value}
        ) 
      }
      { emulated ? <Pressable onPress={onEmulateClick} style={{position: 'absolute', width: '100%', height: '100%'}}></Pressable> : null }
    </View>
  )
}

const WebChoice = ({style, title, showTitle = true, choices, default_value, emulated, onEmulateClick = () => {}}) => {
  const ctx = useContext(FormBuilderContext);

  const width = 300 * ctx.scale;
  const height = showTitle ? 75 * ctx.scale : 50 * ctx.scale;
  const titleHeight = 20 * ctx.scale;

  function getBorderRadius(index) {
    if (index === 0) {
      return {borderTopLeftRadius: 20 * ctx.scale, borderBottomLeftRadius: 20 * ctx.scale}
    } else if (index === choices.length - 1) {
      return {borderTopRightRadius: 20 * ctx.scale, borderBottomRightRadius: 20 * ctx.scale}
    } else {
      return {}
    }
  }

  return (
    <View style={{width: width, borderRadius: 20 * ctx.scale, justifyContent: 'center', alignItems: 'center', overflow: 'hidden'}}>
      { showTitle ? <Text selectable={false} style={{color: 'white', paddingLeft: 15 * ctx.scale, paddingRight: 15 * ctx.scale, fontSize: 20 * ctx.scale, fontWeight: 'bold', height: 25 * ctx.scale, borderTopLeftRadius: 20 * ctx.scale, borderTopRightRadius: 20 * ctx.scale, backgroundColor: Globals.ButtonColor, textAlign: 'center'}}>{title}</Text> : null }
      <View style={{zIndex: -1, width: width, flexDirection: 'row', flexWrap: 'wrap', borderRadius: 20 * ctx.scale, justifyContent: 'center', alignItems: 'center', overflow: 'hidden'}}>
        {
        choices.map((choice, index) => <WebCheckbox title={choice.label} key={index} emulated={emulated} style={{height: height - titleHeight, minWidth: width / 3, flex: 1, borderRadius: 0}} innerStyle={{borderRadius: 0}}/>)
        }
      </View>
      <Pressable onPress={onEmulateClick} style={{position: 'absolute', width: '100%', height: '100%'}}></Pressable>
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

const styles = StyleSheet.create({
  button: {
    borderStyle: 'none',
    width: '80%',
  }
});

export { WebButton, WebHeader, WebCheckbox, WebInput, WebChoice, WebPhonePageView }