import React, {useState, useRef, useEffect, useMemo, memo, useContext } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import { 
  Text, 
  View,
  TouchableNativeFeedback,
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
  Button,
  TextInput
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import * as Svg from 'react-native-svg';
import Globals from './Globals';
import AppContext from '../components/AppContext';

// Functions only used for these elements
const pressInOpacity = (stateToAnim) => {
    stateToAnim.setValue(Globals.ButtonHoverOpacity);
}
const pressOutOpacity = (stateToAnim) => {
    Animated.timing(stateToAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
    }).start();
}

function setBigData(ctx, key_value, data) {
    try {
        let newData = ctx.bigDataTest;

        // Get the key used for the current pagew
        page_key = newData.page_keys[ctx.screenIndex];

        // Set the data to the corresponding key_value on the current page.
        newData[page_key][key_value] = data;
        ctx.setBigData(newData);
    } catch (e) {
        console.log(key_value);
        return "";
    }
}
function getBigData(ctx, key_value, if_null) {
    try {
        let bigData = ctx.bigDataTest;
        // Get the key used for the current page
        page_key = bigData.page_keys[ctx.screenIndex];
        
        // Use the key to try and get the value from the bigData, if the value is "" or undef, then just use if_null
        return bigData[page_key][key_value] || if_null;
    } catch (e) {
        console.log(key_value);
        return if_null;
    }
}

// The basic shell used for many of the gradient components
const GradientShell = ({borderWidth = Globals.ShowGradientBorder ? Globals.GradientBorderWidth : 0, showBackgroundGradient = Globals.ShowGradientBorder || Globals.ShowGradientHover, ...props}) => {
    const topRad = props.radius && props.radius.topRad > 0 ? 20 : 0;
    const bottomRad = props.radius && props.radius.bottomRad > 0 ? 20 : 0;

    return (
        <View style={[styles.outerShell, props.style]}>
            <View style={{width: '100%'}}>
                <LinearGradient 
                    style={[styles.dropdownGradient, {width: '100%', height: '100%'},
                        {borderBottomLeftRadius: bottomRad, borderTopLeftRadius: topRad, borderBottomRightRadius: bottomRad, borderTopRightRadius: topRad}]}
                    colors={[Globals.GradientColor1, Globals.GradientColor2]}
                    start={{x: props.gradientDir ? 0 : 1, y: 0}}
                    end={{x: props.gradientDir ? 1 : 0, y: 0}}
                >
                    <TouchableWithoutFeedback
                        onPress={() => {if (props.onPress) { props.onPress(); }}}
                        //onPressIn={() => { if (props.onPress) { pressInOpacity(props.opacityAnim) }}}
                        //onPressOut={() => { if (props.onPress) { pressOutOpacity(props.opacityAnim) }}}
                        style={{ alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}
                    >
                        <View style={[styles.innerShell, props.innerStyle, {width: '100%', height: '100%', padding: borderWidth, backgroundColor: showBackgroundGradient ? 'transparent' : Globals.PageColor}]}>
                            { props.children }
                        </View>
                    </TouchableWithoutFeedback>
                </LinearGradient>
            </View>
        </View>
    );
}

const GradientButton = ({key_value, showBackgroundGradient, borderWidth, save_data=true, textStyle = {}, innerStyle = {}, style = {}, disabled, extraAttributes = {inContainer: false}, onPress = ()=>{}, title = "", gradientDir = 1}) => {
    
    const opacityAnim = useRef(new Animated.Value(1)).current;

    const bottomRad = (extraAttributes.inContainer && extraAttributes.containerPos == -1 || extraAttributes.containerPos == 2) ? 0 : 15;
    const topRad = (extraAttributes.inContainer && extraAttributes.containerPos == 1 || extraAttributes.containerPos == 2) ? 0 : 15;

    return (
        <GradientShell borderWidth={borderWidth} showBackgroundGradient={showBackgroundGradient} style={style} gradientDir={gradientDir} radius={{topRad: topRad, bottomRad: bottomRad}} onPress={onPress} opacityAnim={opacityAnim} disabled={disabled}>
            <TouchableNativeFeedback 
                onPress={() => { if(!disabled) { onPress() }}}
                onPressIn={() => { if(!disabled) { pressInOpacity(opacityAnim) }}}
                onPressOut={() => { if(!disabled) { pressOutOpacity(opacityAnim) }}}
            >
                <Animated.View
                    style={[styles.buttonInner, innerStyle, {opacity: opacityAnim}, 
                    {borderBottomLeftRadius: bottomRad, borderTopLeftRadius: topRad, borderBottomRightRadius: bottomRad, borderTopRightRadius: topRad}]} 
                >
                    <View style={{width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={[{margin: 'auto', textAlign: 'center'}, styles.buttonText, textStyle, disabled ? {color: 'gray'} : {}]}>{title}</Text>
                    </View>
                </Animated.View>
            </TouchableNativeFeedback>
        </GradientShell>
)};

const GradientDropDown = memo(({key_value, save_data=true, style = {}, extraAttributes = {inContainer: false}, data = [], parallelState = {state, set}, title = "Click to show dropdown", gradientDir = 1}) =>  {
    if (key_value == undefined && save_data) {
        console.error("No key value provided for dropdown.");
    }
    
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(parallelState.state || null);

    return (
        // <GradientShell style={style} gradientDir={gradientDir} radius={{topRad: topRad, bottomRad: bottomRad}}>
            <Dropdown
                data={data}
                style={[style, {width: '80%', height: 75, color: 'green', borderRadius: 20, borderTopRightRadius: 20, padding: 'auto'},{backgroundColor: Globals.ButtonColor}]}
                containerStyle={{backgroundColor: Globals.ButtonColor, marginTop: -2, borderWidth: 0, borderRadius: 20, overflow: 'hidden'}}
                selectedTextStyle={{color: Globals.TextColor, fontWeight: 'bold', fontSize: 20, textAlign: 'center', margin: 'auto', }}
                itemContainerStyle={{backgroundColor: Globals.ButtonColor}}
                placeholderStyle={{color: Globals.TextColor, fontWeight: 'bold', fontSize: 20, textAlign: 'center'}}
                inputSearchStyle={{color: Globals.TextColor, fontWeight: 'bold', borderWidth: 0}}
                search
                autoScroll={false}
                renderItem={(item, selected) => {
                    return (
                        <View style={{
                            height: 50, 
                            paddingLeft: 10, 
                            justifyContent: 'center', 
                            alignItems: 'left', 
                            backgroundColor: (selected ? 'hsl(39, 70%, 20%)' : Globals.ButtonColor), 
                            color: Globals.TextColor}}
                        >
                            <Text style={{color: Globals.TextColor, fontWeight: 'bold'}}>{item.label}</Text>
                        </View>
                    )
                }}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={!open ? title : '...'}
                searchPlaceholder="Search..."
                value={value}
                onFocus={() => setOpen(true)}
                onBlur={() => setOpen(false)}
                onChange={async item => {
                  setValue(item.value);
                  parallelState.set(item.label, item.value);
                  setOpen(false);
                }}
            />
        // </GradientShell>
)});

const GradientCheckBox = ({key_value, save_data=true, style = {}, extraAttributes = {inContainer: false}, disabled, title = "", selectColor = 'rgba(0,0,0,0)', gradientDir = 1}) => {
    const ctx = useContext(AppContext)
    
    if (key_value == undefined && save_data) {
        console.error("No key value provided for checkbox.");
    }

    disabled = disabled == undefined ? (ctx.viewingMatch) : disabled;

    const opacityAnim = useRef(new Animated.Value(1)).current;
    const [value, setValue] = useState(getBigData(ctx, key_value, false));

    const bottomRad = (extraAttributes.inContainer && extraAttributes.containerPos == -1 || extraAttributes.containerPos == 2) ? 0 : 15;
    const topRad = (extraAttributes.inContainer && extraAttributes.containerPos == 1 || extraAttributes.containerPos == 2) ? 0 : 15;

    function onPress() {
        if (save_data) {
            setValue(!value);
            setBigData(ctx, key_value, !value);
        }
    }

    return (
        <GradientShell style={[styles.checkboxOuter, style]} gradientDir={gradientDir} radius={{topRad: topRad, bottomRad: bottomRad}}>
            <TouchableNativeFeedback 
                onPress={!disabled ? onPress : null}
                onPressIn={() => { if (!disabled) {pressInOpacity(opacityAnim)}}}
                onPressOut={() => { if (!disabled) {pressOutOpacity(opacityAnim)}}}
            >
                <Animated.View
                    style={[styles.checkboxInner, {opacity: opacityAnim, backgroundColor: value ? selectColor : Globals.ButtonColor}, 
                    {borderBottomLeftRadius: bottomRad, borderTopLeftRadius: topRad, borderBottomRightRadius: bottomRad, borderTopRightRadius: topRad}]} 
                >
                </Animated.View>
            </TouchableNativeFeedback>
        </GradientShell>
    )
}

const GradientChoice = ({key_value, changed, save_data=true, multiselect = false, style = {}, setParallelState, data = [], extraAttributes = {inContainer: false}, disabled, title = "", gradientDir = 1}) => {
    const ctx = useContext(AppContext)
    if (key_value == undefined && save_data) {
        console.error("No key value provided for choice.");
    }

    disabled = disabled == undefined ? (ctx.viewingMatch) : disabled;
    let startIndexes = getBigData(ctx, key_value, []).map((item) => data.findIndex((dataItem) => dataItem.value == item));
    const [selectedIndexes, setSelectedIndexes] = useState(startIndexes);

    const useParallelState = setParallelState != undefined;

    useEffect(() => {
        if (useParallelState) {
            setParallelState(selectedIndexes.map((index) => data[index].value));
        }
    }, [selectedIndexes]);

    const bottomRad = (extraAttributes.inContainer && extraAttributes.containerPos == -1 || extraAttributes.containerPos == 2) ? 0 : 15;
    const topRad = (extraAttributes.inContainer && extraAttributes.containerPos == 1 || extraAttributes.containerPos == 2) ? 0 : 15;

    const SelectionButton = ({style = {}, title = "", onPress = ()=>{}}) => {
        const opacityAnim = useRef(new Animated.Value(1)).current;

        const bottomRad = (extraAttributes.inContainer && extraAttributes.containerPos <= 0) ? 0 : 15;
        const topRad = (extraAttributes.inContainer && extraAttributes.containerPos >= 0) ? 0 : 15;
        return (
            <TouchableNativeFeedback 
                onPress={!disabled ? onPress : null}
                onPressIn={() => { if (!disabled) {pressInOpacity(opacityAnim)}}}
                onPressOut={() => { if (!disabled) {pressOutOpacity(opacityAnim)}}}
            >
                <Animated.View
                    style={[styles.buttonInner, {opacity: opacityAnim, alignItems: 'center', justifyContent: 'center', backgroundColor: Globals.ButtonColor,}, 
                        {borderBottomLeftRadius: bottomRad, borderTopLeftRadius: topRad, borderBottomRightRadius: bottomRad, borderTopRightRadius: topRad},
                    style]}
                >
                    <View style={{width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={[{margin: 'auto', textAlign: 'center'}, styles.buttonText]}>{title}</Text>
                    </View>
                </Animated.View>
            </TouchableNativeFeedback>
    )};

    return (
        <GradientShell style={[style]} innerStyle={[{flexDirection: 'row'}]} gradientDir={gradientDir} radius={{bottomRad: bottomRad, topRad: topRad}}>
            {data.map((item, index) => {
            let selected = startIndexes.includes(index);
            let style = {backgroundColor: selected ? item.selectColor : Globals.ButtonColor, width: 'auto', height: '100%', flex: 1};
            if (index == 0) {
                style.marginRight = -1; 
                style.borderTopRightRadius = 0;
                style.borderBottomRightRadius = 0;
            }
            else if (index == data.length - 1) {
                style.borderTopLeftRadius = 0;
                style.borderBottomLeftRadius = 0;
            }
            else {
                style.marginRight = -1;
                style.borderTopRightRadius = 0;
                style.borderBottomRightRadius = 0;
                style.borderBottomLeftRadius = 0;
                style.borderTopLeftRadius = 0;
            }
            return ( <SelectionButton 
                onPress={() => {
                    if (!save_data) { return; }

                    let newIndexes = selectedIndexes;
                    if (multiselect) {
                        if (newIndexes.includes(index)) {
                            // Remove from selected
                            let indexAt = newIndexes.indexOf(index);
                            newIndexes = newIndexes.filter((item, index) => index != indexAt);
                        } else {
                            // Add to selected
                            newIndexes = [...newIndexes, index];
                        }
                    } else {
                        newIndexes = newIndexes.includes(index) ? [] : [index];
                    }
                    setBigData(ctx, key_value, newIndexes.map((item) => data[item].value));
                    setSelectedIndexes(newIndexes);
                }} 
                key={item.value} 
                style={style} 
                title={item.label} /> )
            })}
        </GradientShell>
)};

const GradientMultiChoice = ({key_value, changed, save_data=true, style = {}, data = [], extraAttributes = {inContainer: false}, disabled, title = "", gradientDir = 1}) => {
    return ( 
        <GradientChoice key_value={key_value} changed={changed} save_data={save_data} multiselect={true} style={style} data={data} extraAttributes={extraAttributes} disabled={disabled} title={title} gradientDir={gradientDir}/>
)};

const GradientTextInput = ({key_value, save_data=true, asTicker = false, style = {}, default_value="", setParallelState, extraAttributes = {inContainer: false}, disabled, title = "", titleStyle, regexForText = '', keyboardType = 'web-search', maxLength = 20, gradientDir = 1, maxNum = -1}) => {
    const ctx = useContext(AppContext)
    if (key_value == undefined && save_data) {
        console.error("No key value provided for text input.");
    }

    disabled = disabled == undefined ? (ctx.viewingMatch) : disabled;
    
    const useParallelState = setParallelState != undefined;

    const [text, setText] = useState((save_data ? getBigData(ctx, key_value, '') : undefined) || default_value);
    const opacityAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (useParallelState) {
            setParallelState(text);
        }
    }, [text]);

    const bottomRad = (extraAttributes.inContainer && extraAttributes.containerPos == -1 || extraAttributes.containerPos == 2) ? 0 : 15;
    const topRad = (extraAttributes.inContainer && extraAttributes.containerPos == 1 || extraAttributes.containerPos == 2) ? 0 : 15;

    const TickerButton = ({style = {}, title = "", onPress = ()=>{}}) => {
        const opacityTick = useRef(new Animated.Value(1)).current;

        return (
            <TouchableNativeFeedback
                onPressIn={() => (!disabled ? pressInOpacity(opacityTick) : null)}
                onPressOut={() => (!disabled ? pressOutOpacity(opacityTick) : null)}
                onPress={!disabled ? onPress : null}
            >
                <Animated.View style={[{backgroundColor: Globals.ButtonColor, width: '20%', height: '100%', color: Globals.TextColor, justifyContent: 'center', opacity: opacityTick}, style]}>
                    <Text style={{color: Globals.TextColor, textAlign: 'center', fontSize: 35}}>{title}</Text>
                </Animated.View>
            </TouchableNativeFeedback>
        );
    };
    return (
        <GradientShell innerStyle={{}} style={[{height: 120}, style]} gradientDir={gradientDir} radius={{topRad: topRad, bottomRad: bottomRad}}>
            <View style={{backgroundColor: Globals.ButtonColor, height: '40%', overflow: 'hidden', justifyContent: 'center', alignItems: 'center', borderTopLeftRadius: topRad, borderTopRightRadius: topRad}}>
                <Text style={[{color: Globals.TextColor, fontWeight: 'bold', fontSize: 20, textAlign: 'center'}, titleStyle]}>{title}</Text>    
            </View> 
            <View style={{width: '100%', height: '60%', flexDirection: 'row'}}>
                { asTicker ? 
                    <TickerButton 
                        title='-' 
                        style={{borderBottomLeftRadius: bottomRad, width: '20%'}}
                        onPress={() => {
                            let newText = Number(text);
                            if (newText == 0) { return; }
                            newText = (newText - 1).toString();
                            setText(newText);
                            setBigData(ctx, key_value, newText);
                        }}
                    /> 
                    : null
                }
                <TextInput
                    
                    onEndEditing={() => {
                        if (!save_data) { return; }
                        // If maxNum is more than -1, make sure to clamp the text to that number.
                        let newText = (maxNum > -1 && parseInt(text) > maxNum) ? maxNum.toString() : text;
                        setText(newText); 
                        setBigData(ctx, key_value, newText);
                    }}
                    editable={!disabled}
                    keyboardType={keyboardType}
                    maxLength={maxLength}
                    onChangeText={text => setText(regexForText == '' ? text : text.replace(regexForText, ''))}
                    value={text}
                    placeholder={title}
                    placeholderTextColor='rgb(100, 100, 100)'
                    style={[styles.textInput, {width: asTicker ? '60%' : '100%', height: '100%', marginRight: '-0.1%'},
                    {borderBottomLeftRadius: asTicker ? 0 : bottomRad, borderTopLeftRadius: 0, borderBottomRightRadius: asTicker ? 0 : bottomRad, borderTopRightRadius: 0}]}
                />
                { asTicker ? 
                    <TickerButton 
                        title='+' 
                        style={{borderBottomRightRadius: bottomRad, width: '20.1%'}}
                        onPress={() => {
                            let newText = Number(text);
                            if (newText == maxNum) { return; }
                            newText = (newText + 1).toString();
                            setText(newText);
                            setBigData(ctx, key_value, newText);
                        }}
                    /> 
                    : null
                }
            </View>
        </GradientShell>
)};

const GradientNumberInput = ({key_value, save_data=true, asTicker = true, style = {}, default_value="0", setParallelState, extraAttributes = {inContainer: false}, disabled, title = "", gradientDir = 1, maxLength = 20, includeButtons = false, maxNum = -1}) => {
    return (
        <GradientTextInput setParallelState={setParallelState} key_value={key_value} asTicker={asTicker} default_value={default_value} save_data={save_data} regexForText={/[^0-9]/g} disabled={disabled} title={title} maxNum={maxNum} extraAttributes={extraAttributes} style={[style]} keyboardType='numeric' maxLength = {maxLength} gradientDir={gradientDir}/>
)};

const GradientTimer = ({key_value, save_data=true, style = {}, extraAttributes = {inContainer: false}, disabled, title = "", regexForText = '', keyboardType = 'web-search', maxLength = 20, gradientDir = 1, maxNum = -1}) => {
    const ctx = useContext(AppContext)
    if (key_value == undefined && save_data) {
        console.error("No key value provided for timer.");
    }

    disabled = disabled == undefined ? (ctx.viewingMatch) : disabled;

    const [time, setTime] = useState(getBigData(ctx, key_value, 0));
    const [startDate, setStartDate] = useState(new Date().getTime());
    const [timerRunning, setTimerRunning] = useState(false);
    const [buttonText, setButtonText] = useState('Start');
    const opacityAnim = useRef(new Animated.Value(1)).current;

    // May have to just get dateTime if not accurate
    useEffect(() => {
        if (!timerRunning) { return; }
        let new_inter = setInterval(() => {
            setTime(new Date().getTime() - startDate);
        }, 1);
        return () => clearInterval(new_inter);
    }, [time, timerRunning])
    
    const bottomRad = (extraAttributes.inContainer && extraAttributes.containerPos == -1 || extraAttributes.containerPos == 2) ? 0 : 15;
    const topRad = (extraAttributes.inContainer && extraAttributes.containerPos == 1 || extraAttributes.containerPos == 2) ? 0 : 15;

    const TickerButton = useMemo(() => ({ style = {}, title = "", onPress = () => {} }) => {
        const opacityTick = useRef(new Animated.Value(1)).current;

        return (
            <TouchableNativeFeedback
                onPressIn={() => (!disabled ? pressInOpacity(opacityTick) : null)}
                onPressOut={() => (!disabled ? pressOutOpacity(opacityTick) : null)}
                onPress={!disabled ? onPress : null}
            >
                <Animated.View style={[{ backgroundColor: Globals.ButtonColor, width: '25%', height: '100%', color: Globals.TextColor, justifyContent: 'center', opacity: opacityTick }, style]}>
                    <Text style={{ color: Globals.TextColor, textAlign: 'center', fontSize: 20, fontWeight: 'bold' }}>{title}</Text>
                </Animated.View>
            </TouchableNativeFeedback>
        );
    }, []);

    const Timer = ({style = {}, text = ""}) => {
        return (
            <Animated.View style={[{backgroundColor: Globals.ButtonColor, marginLeft: '1%', marginRight: '1%', width: '48%', height: '100%', color: Globals.TextColor, justifyContent: 'center', opacity: opacityAnim}, style]}>
                <Text style={{color: Globals.TextColor, textAlign: 'center', fontSize: 25, fontWeight: 'bold', fontVariant: ['tabular-nums']}}>{text}</Text>
            </Animated.View>
        );
    }

    return (
        <GradientShell innerStyle={{flexDirection: 'row'}} style={style} gradientDir={gradientDir} radius={{topRad: topRad, bottomRad: bottomRad}}>
            <TickerButton 
                title={buttonText}
                style={{borderTopLeftRadius: topRad, borderBottomLeftRadius: bottomRad}}
                onPress={() => {
                    setTimerRunning(!timerRunning);
                    if (timerRunning) { // This means that when the state is updated, the timer will no longer be running
                        setButtonText('Start');
                        setBigData(ctx, key_value, Number(time));
                    } else { 
                        setButtonText('Stop'); 
                        setStartDate(new Date().getTime() - time);
                    }
                }}
            /> 
            <Timer text={(Number(time) / 1000).toFixed(3)}/>
            <TickerButton 
                title='Reset' 
                style={{borderTopRightRadius: topRad, borderBottomRightRadius: bottomRad}}
                onPress={() => {
                    setTimerRunning(false);
                    setButtonText('Start');
                    setTime(0);
                    setStartDate(new Date().getTime());
                    setBigData(ctx, key_value, 0);
                }}
            /> 
        </GradientShell>
)};

const GradientCycleTimer = ({key_value, save_data=true, style = {}, extraAttributes = {inContainer: false}, disabled, title = "", regexForText = '', keyboardType = 'web-search', maxLength = 20, gradientDir = 1, maxNum = -1}) => {
    const ctx = useContext(AppContext)
    
    if (key_value == undefined && save_data) {
        console.error("No key value provided for cycle timer.");
    }

    disabled = disabled == undefined ? (ctx.viewingMatch) : disabled;

    let storedTimes = getBigData(ctx, key_value, []);
    const [times, setTimes] = useState(storedTimes);
    const [time, setTime] = useState(storedTimes.length == 0 ? 0 : storedTimes[storedTimes.length - 1]);
    const [startDate, setStartDate] = useState(new Date().getTime());
    const [timerRunning, setTimerRunning] = useState(false);
    const [buttonText, setButtonText] = useState('Start');
    const [cycleButtonText, setCycleButtonText] = useState('Reset');
    const opacityAnim = useRef(new Animated.Value(1)).current;

    // May have to just get dateTime if not accurate
    useEffect(() => {
        if (!timerRunning) { return; }
        let new_inter = setInterval(() => {
            setTime(new Date().getTime() - startDate);
        }, 1);
        return () => clearInterval(new_inter);
    }, [time, timerRunning])
    
    const bottomRad = (extraAttributes.inContainer && extraAttributes.containerPos == -1 || extraAttributes.containerPos == 2) ? 0 : 15;
    const topRad = (extraAttributes.inContainer && extraAttributes.containerPos == 1 || extraAttributes.containerPos == 2) ? 0 : 15;

    const TickerButton = useMemo(() => ({ style = {}, title = "", onPress = () => {} }) => {
        const opacityTick = useRef(new Animated.Value(1)).current;

        return (
            <TouchableNativeFeedback
                onPressIn={() => (!disabled ? pressInOpacity(opacityTick) : null)}
                onPressOut={() => (!disabled ? pressOutOpacity(opacityTick) : null)}
                onPress={!disabled ? onPress : null}
            >
                <Animated.View style={[{ backgroundColor: Globals.ButtonColor, width: '25%', height: '100%', color: Globals.TextColor, justifyContent: 'center', opacity: opacityTick }, style]}>
                    <Text style={{ color: Globals.TextColor, textAlign: 'center', fontSize: 20, fontWeight: 'bold' }}>{title}</Text>
                </Animated.View>
            </TouchableNativeFeedback>
        );
    }, []);

    const Timer = ({style = {}, text = ""}) => {
        return (
            <Animated.View style={[{backgroundColor: Globals.ButtonColor, marginLeft: '1%', marginRight: '1%', width: '48%', height: '100%', color: Globals.TextColor, justifyContent: 'center', opacity: opacityAnim}, style]}>
                <Text style={{color: Globals.TextColor, position: 'absolute', top: 0, width: '100%', textAlign: 'center', fontSize: 10, fontWeight: 'bold'}}>{times.join(', ')}</Text>
                <Text style={{color: Globals.TextColor, textAlign: 'center', fontSize: 25, fontWeight: 'bold', fontVariant: ['tabular-nums']}}>{text}</Text>
            </Animated.View>
        );
    }

    return (
        <GradientShell innerStyle={{flexDirection: 'row'}} style={style} gradientDir={gradientDir} radius={{topRad: topRad, bottomRad: bottomRad}}>
            <TickerButton 
                title={buttonText}
                style={{borderTopLeftRadius: topRad, borderBottomLeftRadius: bottomRad}}
                onPress={() => {
                    setTimerRunning(!timerRunning);
                    if (timerRunning) { // This means that when the state is updated, the timer will no longer be running
                        setButtonText('Start');
                        setCycleButtonText('Reset');
                        setBigData(ctx, key_value, times);
                    } else { 
                        setButtonText('Stop'); 
                        setCycleButtonText('Cycle');
                        setStartDate(new Date().getTime() - time);
                    }
                }}
            /> 
            <Timer text={(Number(time) / 1000).toFixed(3)}/>
            <TickerButton 
                title={cycleButtonText}
                style={{borderTopRightRadius: topRad, borderBottomRightRadius: bottomRad}}
                onPress={() => {
                    if (timerRunning) {
                        let newTimes = [...times, time];
                        setTimes(newTimes);
                    } else {
                        setButtonText('Start');
                        setCycleButtonText('Reset');
                        setTimes([]);
                        setBigData(ctx, key_value, []);
                    }
                    setStartDate(new Date().getTime());
                    setTime(0);
                }}
            /> 
        </GradientShell>
)};

const GradientQRCode = ({text}) => {
    return (
        <View style={{padding: 5, borderRadius: 10, backgroundColor: 'white', marginBottom: 10}}>
            <QRCode
                value={text}
                size={325}
                color= 'black'
                backgroundColor= 'white'
                enableLinearGradient={true}
                linearGradient={[Globals.GradientColor1, Globals.GradientColor2]}
            />
        </View>
    );
}


const styles = StyleSheet.create({
    text: {
        color: Globals.TextColor,
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    title: {
        textAlign: 'center', 
        width: '80%', 
        color: Globals.TextColor,
        fontSize: 40,
        fontWeight: 'bold',
    },
    outerShell: {
        borderRadius: 20,
        marginBottom: 10,
        height: 75,
        width: '80%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerShell: {
        position: 'relative', 
        width: '100%', 
        height: '100%', 
        zIndex: 1, 
        padding: 5
    },
    button: {
        borderRadius: 20,
        marginBottom: 10,
        height: 75,
        width: '80%',
        justifyContent: 'stretch',
        alignItems: 'stretch',
    },
    buttonInner: {
        borderRadius: 15,
        flex: 1,
        backgroundColor: Globals.ButtonColor,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: Globals.TextColor,
        fontWeight: 'bold',
        fontSize: 20,
    },
    dropdownOuter: {
        marginBottom: 10,
        height: 75,
        width: '80%',
        overflow: 'scroll',
        zIndex: 1,
    },
    dropdownGradient: {
        backgroundColor: 'red',
        width: '100%',
        height: '100%',
        borderRadius: 20,
    },
    dropdownInner: { 
        alignSelf: 'center',
        color: Globals.TextColor,
        backgroundColor: Globals.ButtonColor,
        width: '100%',
        height: '100%',
        borderRadius: 15,
    },
    dropdownText: {
        color: Globals.TextColor,
        fontWeight: 'bold',
        fontSize: 20,
    },
    textInputOuter: {
        marginBottom: 10,
        height: 75,
        width: '80%',
        overflow: 'scroll',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    textInputGradient: {
        backgroundColor: 'red',
        width: '100%',
        height: '100%',
        borderRadius: 20,
    },
    textInput: {
        color: Globals.TextColor, 
        backgroundColor: Globals.ButtonColor,
        fontWeight: 'bold',
        textAlign: 'center', 
        fontSize: 20,
        width: '100%',
        height: '100%',
        borderRadius: 15,
    },
    checkboxOuter: {
        width: 75,
        height: 75,
    },
    checkboxInner: {
        borderRadius: 15,
        flex: 1,
        backgroundColor: Globals.ButtonColor,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export {
    GradientShell, 
    GradientButton, 
    GradientDropDown, 
    GradientCheckBox, 
    GradientChoice, 
    GradientMultiChoice, 
    GradientTextInput, 
    GradientNumberInput, 
    GradientTimer,
    GradientCycleTimer,
    GradientQRCode,
};