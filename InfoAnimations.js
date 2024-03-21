import { View, Image, Animated, Easing, Text, StyleSheet } from "react-native";
import React, { useRef, useState, useMemo } from "react";

const fieldImage = require('./assets/game_field.png');
const red_robot = require('./assets/red_robot_862.png');
const blue_robot = require('./assets/blue_robot_862.png');
const stage = require('./assets/stage.png');
const note = require('./assets/note.png');
const stage_april_tag = require('./assets/stage_april_tag.png');

const waitTime = (ms) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

const Subtract = (a, b) => {
  return Animated.add(a, Animated.multiply(-1, new Animated.Value(b)));
}
const Clamp = (a, b, c) => {
  return a.interpolate({
    inputRange: [b, c],
    outputRange: [b, c],
    extrapolate: 'clamp',
  });
}

const ToPcnt = (a) => {
  return a.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  })
}

const BoxAnim = ({top, left, bottom, right, lineGrowth}) => {
  if (!lineGrowth) { console.error("Need to specify the lineGrowth Animated Value!"); return null; }
  return (
    <Animated.View style={[{width: 25, height: 25, position: 'absolute', top: top, left: left, bottom: bottom, right: right}]}>
      <Animated.View style={{backgroundColor: 'rgb(0, 255, 0)', width: ToPcnt(Clamp(lineGrowth, 0, 100)), height: 3, position: 'absolute', top: 0, left: 0}}/>
      <Animated.View style={{backgroundColor: 'rgb(0, 255, 0)', width: ToPcnt(Clamp(Subtract(lineGrowth, 200), 0, 100)), height: 3, position: 'absolute', bottom: 0, right: 0}}/>
      <Animated.View style={{backgroundColor: 'rgb(0, 255, 0)', width: 3, height: ToPcnt(Clamp(Subtract(lineGrowth, 300), 0, 100)), position: 'absolute', bottom: 0, left: 0}}/>
      <Animated.View style={{backgroundColor: 'rgb(0, 255, 0)', width: 3, height: ToPcnt(Clamp(Subtract(lineGrowth, 100), 0, 100)), position: 'absolute', top: 0, right: 0}}/>
    </Animated.View>
  )
}

const LeaveAnimationField = (props) => {
  const red_translate_amount = useRef(new Animated.Value(0)).current;
  const red_leave = useRef(new Animated.Value(0)).current;
  const blue_translate_amount = useRef(new Animated.Value(0)).current;
  const blue_rotate_amount = useRef(new Animated.Value(-60)).current;
  const blue2_translate_amount = useRef(new Animated.Value(0)).current;

  Animated.loop(
    Animated.sequence([
      Animated.parallel([
        Animated.timing(red_leave, {
          toValue: 100,
          duration: 2000,
          easing: Easing.inOut(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.timing(blue_translate_amount, {
          toValue: -20,
          duration: 2000,
          easing: Easing.inOut(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.timing(blue_rotate_amount, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.timing(red_translate_amount, {
          toValue: 50,
          duration: 2000,
          easing: Easing.inOut(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(blue2_translate_amount, {
            toValue: -45,
            duration: 2000,
            easing: Easing.inOut(Easing.exp),
            useNativeDriver: true,
          }),
          Animated.timing(blue2_translate_amount, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.exp),
            useNativeDriver: true,
          }),
        ])
      ]),
      Animated.delay(2000)
    ])
  ).start();

  const spin = blue_rotate_amount.interpolate({
    inputRange: [-360, 360],
    outputRange: ['-360deg', '360deg']
  });

  return (
    <View style={{width: 370, height: 185, justifyContent: 'center', alignItems: 'center'}}>
      <Image source={fieldImage} style={{width: '100%', height: '100%', position: 'absolute', borderRadius: 20}} />
      {/* Red Robot */}
      <Animated.View style={[styles.robot, {left: 5, top: 45, transform:[{translateX: red_translate_amount}]}]}>
        <Text style={[styles.text, {color: 'rgb(0, 255, 0)'}]}>√</Text>
        <Animated.Image source={red_robot} style={{width: 30, height: 30, position: 'absolute'}} />
      </Animated.View>
      {/* Blue Robot */}
      <Animated.View style={[styles.robot, {right:5, top: 140, transform:[{translateX: blue_translate_amount}]}]}>
        <Text style={[styles.text, {color: 'rgb(255, 0, 0)'}]}>X</Text>
        <Animated.Image source={blue_robot} style={{width: 30, height: 30, position: 'absolute', transform: [{rotate: spin}]}} />
      </Animated.View>
      {/* Blue Robot 2 */}
      <Animated.View style={[styles.robot, {right:5, top: 50, transform:[{translateX: blue2_translate_amount}]}]}>
        <Text style={[styles.text, {color: 'rgb(0, 255, 0)'}]}>√</Text>
        <Animated.Image source={blue_robot} style={{width: 30, height: 30, position: 'absolute'}} />
      </Animated.View>
    </View>
  );
};

const NoteAnimationField = (props) => {
  const lineGrowth = useRef(new Animated.Value(0)).current;
  const scale = new Animated.Value(1);

  Animated.loop(
    Animated.sequence([
      Animated.timing(lineGrowth, {
        toValue: 400,
        duration: 2000,
        easing: Easing.inOut(Easing.exp),
        useNativeDriver: false,
      }),
      Animated.timing(scale, {
        toValue: 8,
        duration: 1500,
        easing: Easing.inOut(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 1500,
        easing: Easing.inOut(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.timing(lineGrowth, {
        toValue: 0,
        duration: 2000,
        easing: Easing.inOut(Easing.exp),
        useNativeDriver: false,
      }),
      Animated.delay(2000)
    ])
  ).start();

  return (
    <View style={{width: 370, height: 185, justifyContent: 'center', alignItems: 'center'}}>
      <Image source={fieldImage} style={{width: '100%', height: '100%', position: 'absolute', borderRadius: 20}} />
      <Animated.View style={{zIndex: 10, width: 25, height: 25, justifyContent: "center", alignItems: "center", transform:[{ scale: scale }]}}>
        <View style={{width: 18, height: 18, position: 'absolute', justifyContent: 'center', alignItems: 'center', borderRadius: 40, backgroundColor: 'rgb(255, 145, 77)'}}>
          <View style={{width: 12, height: 12, backgroundColor: 'rgb(84,84,84)', borderRadius: 40}}></View>
        </View>
        <BoxAnim lineGrowth={lineGrowth}/>
      </Animated.View>
      <BoxAnim top={39} lineGrowth={lineGrowth}/>
      <BoxAnim top={-2} lineGrowth={lineGrowth}/>
      <BoxAnim bottom={39} lineGrowth={lineGrowth}/>
      <BoxAnim bottom={-2} lineGrowth={lineGrowth}/>
      <BoxAnim left={49} lineGrowth={lineGrowth}/>
      <BoxAnim bottom={45} left={49} lineGrowth={lineGrowth}/>
      <BoxAnim bottom={10} left={49} lineGrowth={lineGrowth}/>
      <BoxAnim right={49} lineGrowth={lineGrowth}/>
      <BoxAnim bottom={45} right={49} lineGrowth={lineGrowth}/>
      <BoxAnim bottom={10} right={49} lineGrowth={lineGrowth}/>
    </View>
  );
};

const ParkAnimationField = (props) => {
  const translateRed = useRef(new Animated.ValueXY(0, 0)).current;
  const translateBlue = useRef(new Animated.ValueXY(0, 0)).current;


  Animated.loop(
    Animated.sequence([
      Animated.parallel([
        Animated.timing(translateRed, {
          toValue: {x: -50, y: 0},
          duration: 2000,
          easing: Easing.inOut(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.timing(translateBlue, {
          toValue: {x: 45, y: 0},
          duration: 2000,
          easing: Easing.inOut(Easing.exp),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(2000)
    ])
  ).start();

  return (
    <View style={{width: 370, height: 185, justifyContent: 'center', alignItems: 'center'}}>
      <Image source={fieldImage} style={{width: '100%', height: '100%', position: 'absolute', borderRadius: 20}} />
      {/* Red Robot */}
      <Animated.View style={[styles.robot, {left: 140, top: 45, transform:[{translateX: translateRed.x}, {translateY: translateRed.y}]}]}>
        <Text style={[styles.text, {color: 'rgb(0, 255, 0)'}]}>√</Text>
        <Animated.Image source={red_robot} style={{width: 30, height: 30, position: 'absolute'}} />
      </Animated.View>
      {/* Red Robot 2 */}
      <Animated.View style={[styles.robot, {left: 140, bottom: 20, transform:[{translateX: translateRed.x}, {translateY: translateRed.y}]}]}>
        <Text style={[styles.text, {color: 'rgb(255, 0, 0)'}]}>X</Text>
        <Animated.Image source={red_robot} style={{width: 30, height: 30, position: 'absolute'}} />
      </Animated.View>
      {/* Blue Robot */}
      <Animated.View style={[styles.robot, {right: 140, bottom: 78, transform:[{translateX: translateBlue.x}, {translateY: translateBlue.y}]}]}>
        <Text style={[styles.text, {color: 'rgb(0, 255, 0)'}]}>√</Text>
        <Animated.Image source={blue_robot} style={{width: 30, height: 30, position: 'absolute'}} />
      </Animated.View>
    </View>
  );
}

const MicrophoneAnimationStage = (prop) => {
  const translate = useRef(new Animated.Value(0)).current;

  Animated.loop(
    Animated.sequence([
      Animated.timing(translate, {
        toValue: -70,
        duration: 2000,
        easing: Easing.inOut(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.delay(2000)
    ])
  ).start();

  return (
    <View style={{width: 185, height: 185, justifyContent: 'center', alignItems: 'center'}}>
      <Image source={stage} style={{width: '100%', height: '100%', position: 'absolute'}} />
      <View style={{width: 7, zIndex: 1, height: 26, position: 'absolute', backgroundColor: 'rgb(166,166,166)', top: 0, borderRadius: 20}}></View>
      <Animated.View style={{width: 30, height: 30, transform:[{translateY: translate}]}}>
        <Animated.Image source={note} style={{width: 30, height: 30, position: 'absolute'}} />
      </Animated.View>
    </View>
  );
}

const TrapAnimationStage = (prop) => {
  const translate = useRef(new Animated.Value(0)).current;
  const zIndex = useRef(new Animated.Value(2)).current;

  Animated.loop(
    Animated.sequence([
      Animated.timing(translate, {
        toValue: -40,
        duration: 2000,
        easing: Easing.inOut(Easing.exp),
        useNativeDriver: false,
      }),
      Animated.timing(zIndex, {
        toValue: 0,
        duration: 0,
        useNativeDriver: false,
      }),
      Animated.timing(translate, {
        toValue: 10,
        duration: 2000,
        easing: Easing.inOut(Easing.exp),
        useNativeDriver: false,
      }),
      Animated.delay(2000)
    ])
  ).start();

  return (
    <View style={{width: 185, height: 185, justifyContent: 'center', alignItems: 'center'}}>
      <Image source={stage} style={{width: '100%', height: '100%', position: 'absolute'}} />
      <Image source={stage_april_tag} style={{zIndex: 2, width: 42, height: 15, top: 78, position: 'absolute'}} />
      <View style={{width: 42, zIndex: 1, height: 26, position: 'absolute', backgroundColor: 'rgba(133,133,133, 0.5)', top: 92, borderBottomLeftRadius: 10, borderBottomRightRadius: 10}}></View>
      <Animated.View style={{zIndex: zIndex, width: 30, height: 30, transform:[{translateY: translate}]}}>
        <Animated.Image source={note} style={{width: 30, height: 30, position: 'absolute'}} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    textAlign: 'center', 
    margin: 'auto', 
    justifyContent: 'center', 
    top: -30, 
    fontWeight: 'bold', 
    fontSize: 24
  },
  robot: {
    width: 30, 
    height: 30, 
    position: 'absolute', 
    alignItems: 'center'
  }
})

export { LeaveAnimationField, NoteAnimationField, ParkAnimationField, MicrophoneAnimationStage, TrapAnimationStage };