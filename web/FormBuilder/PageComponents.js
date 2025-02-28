// Purpose: Contains the components that are used to make the pages for the app as well as important components used on an app page.
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
  Pressable
} from 'react-native';
import Globals from '../../Globals';
import FormBuilderContext from '../../components/FormBuilderContext';

// All of these are basically just copies from PageComponents.js, but changed to support web and the purpose of making a form, not using it.
const PageHeader = ({title = "null", style = {}, infoText, gradientDir = 1}) => {
  const ctx = useContext(FormBuilderContext);
  
  const [text, setText] = useState(title);

  function trySetCurrentPageName(newName) {
    // Ensure leading and trailing whitespace is removed.
    newName = newName.trim();

    // Ensure that no two pages have the same name.
    if (ctx.formPages.some((page, index) => index !== ctx.currentPageIndex && page.name === newName)) {
      alert("Another page already has that name!");
      setText(ctx.currentPage.name);
      return;
    }

    // Ensure the page name is not empty.
    if (newName === "") {
      alert("Page name cannot be empty!");
      setText(ctx.currentPage.name);
      return;
    }

    // Update the page name.
    ctx.setCurrentPageName(newName);
    setText(newName);
  }

  return (
    <View style={[styles.pageHeader, style]}>
      <TextInput maxLength={20} selectTextOnFocus={true} onBlur={() => { trySetCurrentPageName(text); }} defaultValue={title} value={text} onChangeText={setText} style={[styles.title, {outline: 'none', fontSize: 40}]}/>
      {/* <Text style={[styles.title, {fontSize: 40}]}>{title}</Text> */}
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
};

// Makes a footer for the page.
const PageFooter = ({style = {}, gradientDir = 1, overrideNext, overrideBack}) => {
  const ctx = useContext(FormBuilderContext);
  
  const inRange = ctx.currentPageIndex >= 0 && ctx.currentPageIndex < ctx.formPages.length;
  const nextButton = inRange && ctx.currentPageIndex != ctx.formPages.length - 1;
  const backButton = inRange && ctx.currentPageIndex != 0;

  // If no override is specified for the next or back buttons, then the default behavior is to slide the screen.
  if (!overrideNext) { overrideNext = () => {  } }
  if (!overrideBack) { overrideBack = () => {  } }
  
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
          style={{width: '100%', height: '100%', alignItems: 'center', zIndex: 100}}
          onPress={onPress}
          onPressIn={() => setOpacity(0.5, 10)}
          onPressOut={() => setOpacity(1, 100)}
        >
          <Text selectable={false} style={{color: Globals.PageHeaderFooterTextColor, fontWeight: 'bold', fontSize: 30, padding: 13 }}>{title}</Text>
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
          onPress={() => { if (0 < ctx.currentPageIndex) { ctx.setSelectedPage(ctx.currentPageIndex - 1) } }}/>
        : null
      }
      {
        nextButton ? 
        <SelectionButton style={{borderTopRightRadius: 25}} title='Next' 
          onPress={() => { if (ctx.formPages.length - 1 > ctx.currentPageIndex) { ctx.setSelectedPage(ctx.currentPageIndex + 1) } }}/>
        : null 
      }
      </View>
    </View>
  )
};

// Stores the content that should show on the page.
const PageContent = memo(({scrollable, gradientDir, style={}, ...props}) => {  
  const downArrowOpacity = useRef(new Animated.Value(0)).current;
  const [baseHeight, setBaseHeight] = useState(618.5)
  const [scrollHeight, setScrollHeight] = useState(0)
  const ctx = useContext(FormBuilderContext);

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

  let children = props.children ? props.children.constructor === Array ? props.children : [props.children] : [];

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
      <View style={{width: '100%', flex: 1, zIndex: 10}}>
        <ScrollView 
          contentContainerStyle={{minWidth: '100%'}} 
          style={{width: '100%'}} 
          onScroll={({nativeEvent}) => handleScroll(nativeEvent) } 
          onContentSizeChange={(w, h) => setScrollHeight(h)} 
          onLayout={({nativeEvent}) => { setBaseHeight(nativeEvent.layout.height) }}
          onMomentumScrollEnd={({nativeEvent}) => handleScroll(nativeEvent)} 
          scrollEventThrottle={100} 
          bounces={false} persistentScrollbar={true} alwaysBounceVertical={false} overScrollMode='never' showsVerticalScrollIndicator={false}>
          <View style={[styles.pageContent, {paddingTop: 10, paddingBottom: 10}, style]}>
            {childElems}
          </View>
        </ScrollView> 
        <View style={{position: 'absolute', bottom: 0, width: '100%', height: 0, justifyContent: 'center', alignItems: 'center'}}>
        <Arrow width={40} height={40} color1='orange' color2='orange'/>
        </View>
      </View>);
  }
});

const styles = StyleSheet.create({
  pageHeader: {
    backgroundColor: Globals.PageHeaderFooterColor,
    width: '100%', 
    height: '13%', 
    position: 'relative', 
    top: Platform.OS == 'android' ? -20 : '0%', 
    marginBottom: Platform.OS == 'android' ? -20 : '2%',
    justifyContent: 'center', 
    alignItems: 'center'
  },
  pageFooter: {
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
  },
  title: {
    textAlign: 'center', 
    width: '80%', 
    color: Globals.PageHeaderFooterTextColor,
    fontSize: 40,
    fontWeight: 'bold',
  }
});

export { PageHeader, PageFooter, PageContent };