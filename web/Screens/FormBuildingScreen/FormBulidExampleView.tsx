import React, { memo, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  StyleSheet, 
  Text, 
  TextInput,
  View,
  Platform,
  ScrollView,
  Animated,
  TouchableNativeFeedback,
  SafeAreaView,
  Easing,
  Pressable,
  ViewStyle,
  NativeSyntheticEvent,
  GestureResponderEvent
} from 'react-native';
import Globals
 from '../../../Globals';
import FormBuildScreenContext from '../../../contexts/FormBuildScreenContext';
import { ScrollEvent } from 'react-native-reanimated';
import { AppCheckbox, AppChoice, AppInput } from '../../../GlobalComponents';

const WebPhonePageView = ({children}: {children: any}) => {
  const ctx = useContext(FormBuildScreenContext);
  const width = 414;
  const height = 896;
  const scale = 0.7;

  return (

    // <View style={{ width: 100, height: 100, backgroundColor: 'lightblue', justifyContent: 'center', alignItems: 'center', transform: [{ scale: 2 }] }}>
    //   <Text>This view is scaled and centered.</Text>
    // </View>
    <View style={{width: width, height: height, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgb(30, 30, 30)', borderRadius: 50, overflow: 'hidden', transform: [{scale: scale}]}}>
      {children}
    </View>
  );
}

// const PageHeader = ({title = "null", style = {}, infoText, gradientDir = 1}) => {
//   const ctx = useContext(FormBuilderContext);
  
//   const [text, setText] = useState(title);

//   function trySetCurrentPageName(newName) {
//     // Ensure leading and trailing whitespace is removed.
//     newName = newName.trim();

//     // Ensure that no two pages have the same name.
//     if (ctx.formPages.some((page, index) => index !== ctx.currentPageIndex && page.name === newName)) {
//       alert("Another page already has that name!");
//       setText(ctx.currentPage.name);
//       return;
//     }

//     // Ensure the page name is not empty.
//     if (newName === "") {
//       alert("Page name cannot be empty!");
//       setText(ctx.currentPage.name);
//       return;
//     }

//     // Update the page name.
//     ctx.setCurrentPageName(newName);
//     setText(newName);
//   }

//   return (
//     <View style={[styles.pageHeader, style]}>
//       <TextInput maxLength={20} selectTextOnFocus={true} onBlur={() => { trySetCurrentPageName(text); }} defaultValue={title} value={text} onChangeText={setText} style={[styles.title, {outline: 'none', fontSize: 40 * ctx.scale}]}/>
//       {/* <Text style={[styles.title, {fontSize: 40 * ctx.scale}]}>{title}</Text> */}
//       { infoText ? <Text style={{color: Globals.PageHeaderFooterTextColor, marginTop: 4, textAlign: 'center'}}>{infoText}</Text> : null }
//       <LinearGradient
//       colors={[Globals.PageHeaderFooterGradientColor1, Globals.PageHeaderFooterGradientColor2]}
//       start={{x: gradientDir ? 0 : 1, y: 0}}
//       end={{x: gradientDir ? 1 : 0, y: 0}}
//       style={{position: 'absolute', width: '100%', height: 5 * ctx.scale, top: '100%'}}
//       >
//       </LinearGradient>
//     </View>
//   );
// };

// Makes a header for the page.
const PageHeader = ({title = "null", style = {}, infoText, gradientDir = 1}: {title: string, style: any, infoText: string, gradientDir: number}) => (
  <View style={[styles.pageHeader, style]}>
    <Text style={styles.title}>{title}</Text>
    { infoText ? <Text style={{color: Globals.PageHeaderFooterTextColor, marginTop: 4, textAlign: 'center'}}>{infoText}</Text> : null }
    <LinearGradient
    colors={[Globals.PageHeaderFooterGradientColor1, Globals.PageHeaderFooterGradientColor2]}
    start={{x: gradientDir ? 0 : 1, y: 0}}
    end={{x: gradientDir ? 1 : 0, y: 0}}
    style={{position: 'absolute', width: '100%', height: 5, top: '100%'}}
    >
    </LinearGradient>
  </View>
);

const PageFooter = ({style = {}, gradientDir = 1, showNextButton, showBackButton, overrideNext = (event: GestureResponderEvent) => {}, overrideBack = (event: GestureResponderEvent) => {}}: {style: any, gradientDir: number, showNextButton: boolean, showBackButton: boolean, overrideNext: (event: GestureResponderEvent) => void, overrideBack: (event: GestureResponderEvent) => void}) => {
  const SelectionButton = ({style = {}, title = "", onPress = (event: GestureResponderEvent) => {}}: {style: any, title: string, onPress: (event: GestureResponderEvent) => void}) => {
    const opacityAnim = useRef(new Animated.Value(1)).current;

    function setOpacity(value: number, time: number) {
      Animated.timing(opacityAnim, {
        toValue: value,
        duration: time,
        useNativeDriver: true
      }).start();
    }

    return (
      <Animated.View style={[{flex: 1, backgroundColor: Globals.PageHeaderFooterColor, opacity: opacityAnim}, style]}>
        <Pressable 
          style={{width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', zIndex: 100}}
          onPress={onPress}
          onPressIn={() => setOpacity(0.5, 10)}
          onPressOut={() => setOpacity(1, 100)}
        >
          <Text selectable={false} style={{color: Globals.PageHeaderFooterTextColor, fontWeight: 'bold', fontSize: 30, padding: 13}}>{title}</Text>
        </Pressable>
      </Animated.View>
    )
  };

  if (!showNextButton && !showBackButton) { return null; }

  return (
    <View
      style={[styles.pageFooter, style]}
    >
      <View style = {{width: '100%', height: 80, flexDirection: 'row', bottom: '0%', borderRadius: 25, overflow: 'hidden'}}>
      <LinearGradient
        colors={[Globals.PageHeaderFooterGradientColor1, Globals.PageHeaderFooterGradientColor2]}
        start={{x: gradientDir ? 0 : 1, y: 0}}
        end={{x: gradientDir ? 1 : 0, y: 0}}
        style={{position: 'absolute', width: '100%', height: '100%', zIndex: -1}}
      >
      </LinearGradient>
      {
        showBackButton ? 
        <SelectionButton style={{borderTopLeftRadius: 25, borderTopRightRadius: showNextButton ? 0 : 25}} title='Back' 
          onPress={overrideBack}/>
        : null
      }
      {
        showNextButton ? 
        <SelectionButton style={{borderTopRightRadius: 25}} title='Next' 
          onPress={overrideNext}/>
        : null 
      }
      </View>
    </View>
  )
}

interface PageContentProps {
  scrollable: boolean;
  gradientDir: number;
  style?: ViewStyle;
  children?: React.ReactNode;
}

const PageContent = memo(({scrollable, gradientDir, style={}, children = [] as React.ReactNode[]}: PageContentProps) => {  
  children = children || [];
  const downArrowOpacity = useRef(new Animated.Value(0)).current;
  const [baseHeight, setBaseHeight] = useState(618.5)
  const [scrollHeight, setScrollHeight] = useState(0)

  function playFade(toValue: number) {
    Animated.timing(downArrowOpacity, {
      toValue: toValue,
      duration: 300,
      easing: Easing.linear,
      useNativeDriver: true
    }).start()
  }

  useEffect(() => {
    if (scrollHeight - 20 > baseHeight) {
      playFade(1);
    }
  }, [scrollHeight, baseHeight])

  let childElems = React.Children.map(children, (child, index) => {
    if (!child) {return null;}
    return React.isValidElement(child) ? React.cloneElement(child, {key: (child.key == null) ? index : child.key, ...(child.props.gradientDir !== undefined && { gradientDir })}) : child;
  });

  /*
  Title: Detect ScrollView has reached the end
  Author: Henrik R
  Date: Dec 9, 2016
  Code version: Not Specified
  Availability: https://stackoverflow.com/questions/41056761/detect-scrollview-has-reached-the-end
  */
  const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}: {layoutMeasurement: any, contentOffset: any, contentSize: any}) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
  };

  function handleScroll(event: any) {
    if (isCloseToBottom(event)) {
      playFade(0)
    } else {
      playFade(1)
    }
  }

  const Arrow = ({width = 400, height = 400, color1 = Globals.PageHeaderFooterGradientColor1, color2 = Globals.PageHeaderFooterGradientColor2}) => {
    return (
      <Animated.View style={{height: width, width: height, justifyContent: 'center', alignItems: 'center', opacity: downArrowOpacity}}>
        <View style={{height: '100%', width: '25%', borderRadius: 100, backgroundColor: color1, position: 'absolute'}}></View>
        <View style={{height: '62.5%', width: '25%', borderRadius: 100, backgroundColor: color2, position: 'absolute', bottom: '-6.25%', right: '23.75%', transform: [{rotateZ: '45deg'}]}}></View>
        <View style={{height: '62.5%', width: '25%', borderRadius: 100, backgroundColor: color2, position: 'absolute', bottom: '-6.25%', left: '23.75%', transform: [{rotateZ: '-45deg'}]}}></View>
      </Animated.View>
    );
  }

  if (!scrollable) {
    return (
      <View style={[styles.pageContent, style]}>
        {childElems}
      </View> );
  } else {
    return (
      <SafeAreaView style={{width: '100%', flex: 1, zIndex: 10}}>
        <ScrollView 
          contentContainerStyle={[{minWidth: '100%'}]} 
          style={{width: '100%'}} 
          onScroll={({nativeEvent}) => handleScroll(nativeEvent) } 
          onContentSizeChange={(w, h) => setScrollHeight(h)} 
          onLayout={({nativeEvent}) => { setBaseHeight(nativeEvent.layout.height) }}
          onMomentumScrollEnd={({nativeEvent}) => handleScroll(nativeEvent)} 
          scrollEventThrottle={17} 
          bounces={false} persistentScrollbar={true} alwaysBounceVertical={false} overScrollMode='never'>
          <TouchableNativeFeedback style={{width: '100%',borderColor: 'transparent'}}>
            <View style={[styles.pageContent, style]}>
              {children}
            </View>
          </TouchableNativeFeedback>
        </ScrollView> 
        <View style={{position: 'absolute', bottom: 0, width: '100%', height: 0, justifyContent: 'center', alignItems: 'center'}}>
        <Arrow width={40} height={40} color1='orange' color2='orange'/>
        </View>
      </SafeAreaView>);
  }
});

const styles = StyleSheet.create({
  pageHeader: {
    backgroundColor: Globals.PageHeaderFooterColor,
    width: '100%', 
    height: '13%', 
    position: 'relative', 
    top: Platform.OS == 'android' ? -20 : '0%', 
    marginBottom: Platform.OS == 'android' ? -20 : 5,
    justifyContent: 'center', 
    alignItems: 'center'
  },
  pageFooter: {
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
    backgroundColor: Globals.PageHeaderFooterColor, 
    width: '100%', 
    height: '9%', 
    position: 'relative', 
    bottom: 0, 
    marginTop: '2%', 
    flexDirection: 'row', 
    justifyContent: 'space-evenly', 
    alignItems: 'center'
  },
  pageContent: {
    flex: 1, 
    justifyContent:'flex-start',
    alignItems: 'center', 
    width: '100%',
    paddingTop: 10,
    paddingBottom: 10,
  },
  title: {
    textAlign: 'center', 
    width: '80%', 
    color: Globals.PageHeaderFooterTextColor,
    fontSize: 40,
    fontWeight: 'bold',
  },
  header1: {
    color: Globals.TextColor,
    fontSize:35,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  header2: {
    color: Globals.TextColor,
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  header3: {
    color: Globals.TextColor,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default function FormBuildExampleView({children, onSetName, onBackPressed, onNextPressed}: {children?: React.ReactNode, onSetName?: Function, onBackPressed?: Function, onNextPressed?: Function}) {

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Globals.PageColor, overflow: 'hidden'}}>
      {/* <Text style={{color: 'white'}}>SHOW EXAMPLE</Text> */}
      
      <WebPhonePageView>
        <PageHeader key={""} title={"Hello!"} gradientDir={1} infoText={""} style={undefined}/>

        <PageContent gradientDir={1} scrollable={true}>
          {children}
          {/* <AppCheckbox children={undefined} checked={false} checkedColor={undefined} gradientColors={undefined} style={undefined} outerStyle={undefined} innerStyle={undefined} /> */}
        </PageContent>

        <PageFooter 
          gradientDir={1} 
          overrideNext={() => { if (onNextPressed) onNextPressed(); } } 
          overrideBack={() => { if (onBackPressed) onBackPressed(); } } 
          style={undefined} 
          showNextButton={true} 
          showBackButton={true}
          />  
      </WebPhonePageView>
    </View>
  )
}