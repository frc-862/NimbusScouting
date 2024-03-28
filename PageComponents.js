// Purpose: Contains the components that are used to make the pages for the app as well as important components used on an app page.
import React, { useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  StyleSheet, 
  Text, 
  View,
  Platform,
  ScrollView,
  Animated,
  TouchableNativeFeedback
} from 'react-native';

// Make some text that can be used as a header for different page components.
const HeaderTitle = ({title = "null", style = {}, headerNum = -1}) => {
  // Gets the right header style based on the header number inputed.
  const headerStyle = (headerNum == -1) ? styles.header1 : {1: styles.header1, 2: styles.header2, 3: styles.header3}[headerNum]
  
  return (
  <Text style={[headerStyle, style]}>{title}</Text>
)};

// Make content merge together dynamically.
const RelatedContentContainer = ({statePackage, gradientDir, style, ...props}) => {

  let children = props.children.constructor === Array ? props.children : [props.children];

  return (
    <View style={[{width: '80%', alignItems: 'center'}, style]}>
      {children.map((child, index) => {
        let properties = {key: index, statePackage: statePackage, gradientDir: gradientDir, extraAttributes: {inContainer: true, containerPos: 2}, style: {marginBottom: -5}};
        if (index == 0 && children.length == 1) {
          properties.extraAttributes.containerPos = 0;
        } else if (index == 0) {
          properties.extraAttributes.containerPos = -1;
        } else if (index == children.length - 1) {
          properties.extraAttributes.containerPos = 1;
          properties.style.marginBottom = 10;
        }
        return React.cloneElement(child, properties);
      })}
    </View>
)};

// Makes a header for the page.
const PageHeader = ({title = "null", style = {}, infoText, statePackage, gradientDir = 1}) => (
  <View style={[styles.pageHeader, style]}>
    <Text style={styles.title}>{title}</Text>
    { infoText ? <Text style={{color: 'white', marginTop: 4, textAlign: 'center'}}>{infoText}</Text> : null }
    <LinearGradient
    colors={['hsl(240, 70%, 40%)', 'hsl(39, 70%, 40%)']}
    start={{x: gradientDir ? 0 : 1, y: 0}}
    end={{x: gradientDir ? 1 : 0, y: 0}}
    style={{position: 'absolute', width: '100%', height: 5, top: '100%'}}
    >
    </LinearGradient>
  </View>
);

// Makes a footer for the page.
const PageFooter = ({style = {}, statePackage, gradientDir = 1, overrideNext = () => { statePackage.slideScreen(1, statePackage); }, overrideBack = () => { statePackage.slideScreen(-1, statePackage); }}) => {
  const SelectionButton = ({style = {}, title = "", onPress = ()=>{}}) => {
    const opacityAnim = useRef(new Animated.Value(1)).current;

    const pressInOpacity = (stateToAnim) => {
      stateToAnim.setValue(0.5);
    }
    const pressOutOpacity = (stateToAnim) => {
        Animated.timing(stateToAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }

    return (
        <TouchableNativeFeedback 
            onPress={onPress}
            onPressIn={() => pressInOpacity(opacityAnim)}
            onPressOut={() => pressOutOpacity(opacityAnim)}
        >
            <Animated.View
                style={[{opacity: opacityAnim, flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgb(0, 0, 40)'}, style]}
            >
                <Text style={[{margin: 10, color: 'white', fontWeight: 'bold', fontSize: 30 }]}>{title}</Text>
            </Animated.View>
        </TouchableNativeFeedback>
    )
  };
  
  const nextButton = statePackage.screenIndex != statePackage.screens.length - 1;

  return (
  <View
    style={[styles.pageFooter, style]}
  >
    <LinearGradient
      colors={['hsl(240, 70%, 40%)', 'hsl(39, 70%, 40%)']}
      start={{x: gradientDir ? 0 : 1, y: 0}}
      end={{x: gradientDir ? 1 : 0, y: 0}}
      style={{position: 'absolute', width: '104%', height: '108%', bottom: '0%', borderTopLeftRadius: 25, borderTopRightRadius: 25, marginLeft: '-2%'}}
    >
    </LinearGradient>
    <SelectionButton 
      gradientDir={gradientDir}
      title="Back" 
      onPress={overrideBack}
      style={{width: nextButton ? '50%' : '100%', height: '100%', marginRight: 0, borderTopLeftRadius: 15, borderTopRightRadius: nextButton ? 0 : 15}}
    />
    { nextButton ? (<SelectionButton 
      gradientDir={gradientDir}
      title="Next" 
      onPress={overrideNext}
      style={{width: '50%', height: '100%', borderTopRightRadius: 15}}
    />) : null }
  </View>
)};

// Stores the content that should show on the page.
const PageContent = ({scrollable, gradientDir, statePackage, style={}, ...props}) => {
  let children = props.children.constructor === Array ? props.children : [props.children];

  let childElems = children.map((child, index) => {
    if (!child) {return null;}
    return React.cloneElement(child, {key: (child.key == null) ? index : child.key, statePackage: statePackage, gradientDir: gradientDir});
  });

  if (!scrollable) {
    return (
      <View style={[styles.pageContent, style]}>
        {childElems}
      </View> );
  } else {
    return (
      <ScrollView contentContainerStyle={{minWidth: '100%'}} style={{width: '100%'}} bounces={false} alwaysBounceVertical={false} overScrollMode='never'>
        <TouchableNativeFeedback style={{backgroundColor: 'red'}}>
          <View style={[styles.pageContent, style]}>
            {childElems}
          </View>
        </TouchableNativeFeedback>
      </ScrollView> );
  }
};

const styles = StyleSheet.create({
  pageHeader: {
    backgroundColor: 'rgb(0, 0, 40)',
    width: '100%', 
    height: '13%', 
    position: 'relative', 
    top: Platform.OS == 'android' ? -20 : '0%', 
    marginBottom: Platform.OS == 'android' ? -20 : '2%',
    justifyContent: 'center', 
    alignItems: 'center'
  },
  pageFooter: {
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
    backgroundColor: 'rgb(0, 0, 40)', 
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
    color: 'white',
    fontSize: 40,
    fontWeight: 'bold',
  },
  header1: {
    color: 'white',
    fontSize:35,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  header2: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  header3: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
});

export { HeaderTitle, RelatedContentContainer, PageHeader, PageFooter, PageContent };