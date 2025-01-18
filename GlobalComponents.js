import React, { useEffect, useRef, useState } from 'react';
import Globals from './Globals';
import { View, Animated, Text, Pressable, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const AppButton = React.forwardRef(({children, hasGradient = true, style, outerStyle, innerStyle, gradientDirection, disabled, onHover = () => {}, onHoverLeave = () => {}, onPress = () => {}, onLayout = () => {}}, ref) => {

  const opacity = useRef(new Animated.Value(1)).current;

  function setOpacity(value, time) {
    Animated.timing(opacity, {
      toValue: value,
      duration: time,
      useNativeDriver: true
    }).start();
  }

  return (
    <Pressable onPointerEnter={onHover} onPointerLeave={onHoverLeave} onLayout={onLayout} onPressIn={() => setOpacity(0.5, 0)} onPressOut={() => setOpacity(1, 100)} onPress={onPress} style={[outerStyle, {borderRadius: 20, justifyContent: 'center', alignItems: 'center', overflow: 'hidden'}]}>
      <LinearGradient
        style={[{justifyContent: 'center', alignItems: 'center', position: 'absolute', width: '100%', height: '100%'}]}
        colors={hasGradient ? [Globals.GradientColor1, Globals.GradientColor2] : ['transparent', 'transparent']}
        start={{x: gradientDirection ? 0 : 1, y: 0}}
        end={{x: gradientDirection ? 1 : 0, y: 0}}
      />

      <Animated.View style={[{justifyContent: 'center', alignItems: 'center', overflow: 'hidden', width: '100%', height: '100%'}, style]}>
        <Animated.View style={[{position: 'absolute', backgroundColor: Globals.ButtonColor, opacity: opacity, width: '100%', height: '100%'}, innerStyle]}/>
        {children}
      </Animated.View>
    </Pressable>
  );
});

const AppLabel = ({title, style, onLayout = () => {}}) => {
  return (
    <Text onLayout={onLayout} style={[{color: Globals.TextColor, fontSize: 20, fontWeight: 'bold'}, style]}>{title}</Text>
  );
}

const AppCheckbox = ({children, checked, checkedColor, hasGradient = true, gradientColors, style, outerStyle, innerStyle, onPress = () => {}, onLayout = () => {}, onValueChanged = () => {}}) => {
  const opacity = useRef(new Animated.Value(1)).current;
  const [isChecked, setIsChecked] = useState(checked);

  // if (checked !== undefined && isChecked !== checked) {
  //   setIsChecked(checked);
  // }

  function pressed() {
    setIsChecked(!isChecked);
    onPress();
    onValueChanged(!isChecked);
  }

  function setOpacity(value, time) {
    Animated.timing(opacity, {
      toValue: value,
      duration: time,
      useNativeDriver: true
    }).start();
  }

  return (
    <Pressable onLayout={onLayout} style={[{borderRadius: 20, overflow: 'hidden'}, outerStyle]} onPressIn={() => setOpacity(0.5, 0)} onPressOut={() => setOpacity(1, 100)} onPress={pressed}>
      <LinearGradient
        style={[{justifyContent: 'center', alignItems: 'center', position: 'absolute', width: '100%', height: '100%', padding: 5}]}
        colors={hasGradient ? (gradientColors || [Globals.GradientColor1, Globals.GradientColor2]) : ['transparent', 'transparent']}
        start={{x: 1, y: 0}}
        end={{x: 0, y: 0}}
      />

      <Animated.View style={[{justifyContent: 'center', alignItems: 'center', overflow: 'hidden', width: '100%', height: '100%'}, style]}>
        <Animated.View style={[{position: 'absolute', backgroundColor: isChecked ? checkedColor : Globals.ButtonColor, opacity: opacity, width: '100%', height: '100%'}, innerStyle]}/>
        {children}
      </Animated.View>
    </Pressable>
  );
}

const AppInput = ({default_value = '', regex, inputMode = 'search', title, showTitle = true, outerStyle, style, onValueChanged = () => {}, onLayout = () => {}, onLeave = () => {}}) => {
  const [text, setText] = useState(default_value);

  function textChanged(newText) {
    const newValue = regex ? newText.replace(regex, '') : newText;
    setText(newValue);
    onValueChanged(newValue);
  }

  return (
    <View onLayout={onLayout} style={[{maxWidth: '100%', backgroundColor: Globals.ButtonColor, borderRadius: 20, overflow: 'hidden', justifyContent: 'center', alignItems: 'center'}, outerStyle]}>
      { showTitle ? [
        <Text key={0} selectable={false} style={{width: '100%', textAlign: 'center', fontSize: 17, backgroundColor: Globals.ButtonColor, paddingHorizontal: 5, paddingVertical: 3, fontWeight: 'bold', color: 'white'}}>{title}</Text>,
        <View key={1} style={{width: '90%', height: 2, backgroundColor: 'hsl(39, 70%, 40%)'}}/>
      ] : null }
      
      <TextInput selectTextOnFocus={true} inputMode={inputMode} onBlur={onLeave} value={String(text)} onChangeText={textChanged} style={[{height: 40, width: '100%', padding: 5, paddingHorizontal: 7, outline: 'none', justifyContent: 'center', textAlign: 'center', color: 'white'}, style]}/>
    </View>
  );
}

const AppChoice = ({default_indexes, default_choices, multiChoice, title, showTitle = true, choices, outerStyle, onLayout = () => {}, onValueChanged = () => {}}) => {
  let default_values = default_indexes ? default_indexes.constructor === Array ? default_indexes : [default_indexes] : [];
  default_values = default_choices ? choices.filter((choice) => default_choices.includes(choice.value)).map((choice) => choices.indexOf(choice)) : default_values;

  const [selectedIndexes, setSelectedIndexes] = useState(default_values);

  function selectIndex(value, index) {
    let newSelectedIndexes = [];
    // console.log(value)
    if (value) {
      // If value is true, then make sure the value is either added (if multiChoice), or set as the only value (if not multiChoice)
      newSelectedIndexes = multiChoice ? [...selectedIndexes, index] : [index];
    } else if (selectedIndexes.includes(index)) {
      // Otherwise, filter the value out of the list.
      newSelectedIndexes = selectedIndexes.filter((value) => value !== index);
    }

    // Ensure duplicates are removed.
    newSelectedIndexes = [...new Set(newSelectedIndexes)];
    setSelectedIndexes(newSelectedIndexes);
    onValueChanged(newSelectedIndexes);
  }

  return (
    <View onLayout={onLayout} style={[{maxWidth: '100%', backgroundColor: Globals.ButtonColor, borderRadius: 20, overflow: 'hidden', justifyContent: 'center', alignItems: 'center'}, outerStyle]}>
      { showTitle ? [
        <Text key={0} selectable={false} style={{width: '100%', textAlign: 'center', fontSize: 17, backgroundColor: Globals.ButtonColor, paddingHorizontal: 5, paddingVertical: 3, fontWeight: 'bold', color: 'white'}}>{title}</Text>,
        <View key={1} style={{width: '90%', height: 2, backgroundColor: 'hsl(39, 70%, 40%)'}}/>
      ] : null }
      
      <LinearGradient 
        style={{zIndex: -1, flexDirection: 'row', flexWrap: 'wrap', width: '100%', justifyContent: 'center', alignItems: 'center', overflow: 'hidden'}}
        colors={[Globals.GradientColor1, Globals.GradientColor2]}
        start={{x: 1, y: 0}}
        end={{x: 0, y: 0}}
      >
        {
        choices.map((choice, index) => {
          return (
          <AppCheckbox key={`${index}${selectedIndexes.includes(index)}`} hasGradient={false} onValueChanged={(value) => {selectIndex(value, index)}} checkedColor={choice.select_color} checked={selectedIndexes.includes(index)} style={{alignItems: 'center', justifyContent: 'center', height: 40}} outerStyle={{margin: -0.1, minWidth: '33.33333%', flex: 1, borderRadius: 0}}>
            <Text key={index} style={{color: Globals.TextColor, justifyContent: 'center'}}>{choice.label}</Text>
          </AppCheckbox>
          )
        })
        }
      </LinearGradient>
    </View>
  );
}

export { AppButton, AppLabel, AppCheckbox, AppInput, AppChoice }