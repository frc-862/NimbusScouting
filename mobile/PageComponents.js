// Purpose: Contains the components that are used to make the pages for the app as well as important components used on an app page.
import React, { memo, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  StyleSheet, 
  Text, 
  View,
  Platform,
  ScrollView,
  Animated,
  TouchableNativeFeedback,
  SafeAreaView,
  Easing,
  Pressable
} from 'react-native';
import Globals from '../Globals';
import AppContext from '../components/AppContext';

// Make some text that can be used as a header for different page components.
const HeaderTitle = ({title = "null", style = {}, fontSize = 30}) => {
  return (<Text style={[{fontSize: fontSize, color: Globals.TextColor, marginBottom: 10, textAlign: 'center', fontWeight: 'bold'}, style]}>{title}</Text>)
};

// Make content merge together dynamically.
const RelatedContentContainer = ({gradientDir, style, ...props}) => {

  let children = props.children.constructor === Array ? props.children : [props.children];
  return (
    <View style={[{width: '80%', alignItems: 'center'}, style]}>
      {children.map((child, index) => {
        let properties = {key: index, gradientDir: gradientDir, extraAttributes: {inContainer: true, containerPos: 2}, style: [{marginBottom: Globals.ShowGradientBorder ? -5 : 0}, child.props.style]};
        if (index == 0 && children.length == 1) {
          properties.extraAttributes.containerPos = 0;
        } else if (index == 0) {
          properties.extraAttributes.containerPos = -1;
        } else if (index == children.length - 1) {
          properties.extraAttributes.containerPos = 1;
          properties.style[0].marginBottom = 10;
        }
        return React.cloneElement(child, properties);
      })}
    </View>
)};

// Makes a header for the page.
const PageHeader = ({title = "null", style = {}, infoText, gradientDir = 1}) => (
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

const PageFooter = ({style = {}, gradientDir = 1, overrideNext, overrideBack}) => {
  const ctx = useContext(AppContext);
  
  const inRange = ctx.screenIndex >= 0 && ctx.screenIndex < ctx.screens.length;
  const nextButton = inRange && (ctx.screenIndex != ctx.screens.length - 1 || ctx.screens[ctx.screenIndex].onNext);
  const backButton = inRange && (ctx.screenIndex != 0 || ctx.screens[ctx.screenIndex].onBack);

  // If no override is specified for the next or back buttons, then the default behavior is to slide the screen.
  if (!overrideNext) { overrideNext = () => { ctx.screens[ctx.screenIndex].onNext ? ctx.screens[ctx.screenIndex].onNext() : ctx.slideScreen(1); } }
  if (!overrideBack) { overrideBack = () => { ctx.screens[ctx.screenIndex].onBack ? ctx.screens[ctx.screenIndex].onBack() : ctx.slideScreen(-1); } }
  
  const SelectionButton = ({style = {}, title = "", onPress = ()=>{}}) => {
    const opacityAnim = useRef(new Animated.Value(1)).current;

    function setOpacity(value, time) {
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

  if (!nextButton && !backButton) { return null; }

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
        backButton ? 
        <SelectionButton style={{borderTopLeftRadius: 25, borderTopRightRadius: nextButton ? 0 : 25}} title='Back' 
          onPress={overrideBack}/>
        : null
      }
      {
        nextButton ? 
        <SelectionButton style={{borderTopRightRadius: 25}} title='Next' 
          onPress={overrideNext}/>
        : null 
      }
      </View>
    </View>
  )
}

// Makes a footer for the page.
// const PageFooter = ({style = {}, gradientDir = 1, overrideNext, overrideBack}) => {
//   const ctx = useContext(AppContext);
  
//   // If no override is specified for the next or back buttons, then the default behavior is to slide the screen.
//   if (!overrideNext) { overrideNext = () => { ctx.slideScreen(1); } }
//   if (!overrideBack) { overrideBack = () => { ctx.slideScreen(-1); } }
  
//   const SelectionButton = ({style = {}, title = "", onPress = ()=>{}}) => {
//     const opacityAnim = useRef(new Animated.Value(1)).current;

//     const pressInOpacity = (stateToAnim) => {
//       stateToAnim.setValue(0.5);
//     }
//     const pressOutOpacity = (stateToAnim) => {
//         Animated.timing(stateToAnim, {
//             toValue: 1,
//             duration: 300,
//             useNativeDriver: false,
//         }).start();
//     }

//     return (
//         <TouchableNativeFeedback 
//             onPress={onPress}
//             onPressIn={() => pressInOpacity(opacityAnim)}
//             onPressOut={() => pressOutOpacity(opacityAnim)}
//         >
//             <Animated.View
//                 style={[{opacity: opacityAnim, flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Globals.PageHeaderFooterColor}, style]}
//             >
//                 <Text style={[{margin: 10, color: Globals.PageHeaderFooterTextColor, fontWeight: 'bold', fontSize: 30 }]}>{title}</Text>
//             </Animated.View>
//         </TouchableNativeFeedback>
//     )
//   };
  
//   const nextButton = ctx.screenIndex != ctx.screens.length - 1;

//   return (
//   <View
//     style={[styles.pageFooter, style]}
//   >
//     <LinearGradient
//       colors={[Globals.PageHeaderFooterGradientColor1, Globals.PageHeaderFooterGradientColor2]}
//       start={{x: gradientDir ? 0 : 1, y: 0}}
//       end={{x: gradientDir ? 1 : 0, y: 0}}
//       style={{position: 'absolute', width: '104%', height: '108%', bottom: '0%', borderTopLeftRadius: 25, borderTopRightRadius: 25, marginLeft: '-2%'}}
//     >
//     </LinearGradient>
//     <SelectionButton 
//       gradientDir={gradientDir}
//       title="Back" 
//       onPress={overrideBack}
//       style={{width: nextButton ? '50%' : '100%', height: '100%', marginRight: 0, borderTopLeftRadius: 15, borderTopRightRadius: nextButton ? 0 : 15}}
//     />
//     { nextButton ? (<SelectionButton 
//       gradientDir={gradientDir}
//       title="Next" 
//       onPress={overrideNext}
//       style={{width: '50%', height: '100%', borderTopRightRadius: 15}}
//     />) : null }
//   </View>
// )};

// Stores the content that should show on the page.
const PageContent = memo(({scrollable, gradientDir, style={}, ...props}) => {  
  const downArrowOpacity = useRef(new Animated.Value(0)).current;
  const [baseHeight, setBaseHeight] = useState(618.5)
  const [scrollHeight, setScrollHeight] = useState(0)

  function playFade(toValue) {
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

  let children = props.children.constructor === Array ? props.children : [props.children];

  let childElems = children.map((child, index) => {
    if (!child) {return null;}
    return React.cloneElement(child, {key: (child.key == null) ? index : child.key, gradientDir: gradientDir});
  });

  /*
  Title: Detect ScrollView has reached the end
  Author: Henrik R
  Date: Dec 9, 2016
  Code version: Not Specified
  Availability: https://stackoverflow.com/questions/41056761/detect-scrollview-has-reached-the-end
  */
  const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
  };

  function handleScroll(event) {
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
          <TouchableNativeFeedback style={{backgroundColor: 'red'}}>
            <View style={[styles.pageContent, style]}>
              {childElems}
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

export { HeaderTitle, RelatedContentContainer, PageHeader, PageFooter, PageContent };