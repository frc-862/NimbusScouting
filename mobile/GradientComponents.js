import React, { useContext, useEffect } from 'react';
import QRCode from 'react-native-qrcode-svg';
import { 
  Text, 
  View,
  StyleSheet,
} from 'react-native';
import * as Svg from 'react-native-svg';
import Globals from '../Globals';
import AppContext from '../components/AppContext';
import { AppButton, AppCheckbox, AppChoice, AppInput } from '../GlobalComponents';


function setUnsetKey(ctx, key, value) {
    if (!ctx.matchData[key]) {
        setMatchDataKey(ctx, key, value);
    }
}

function setMatchDataKey(ctx, key, data) {
    ctx.matchData[key] = data;
    ctx.setMatchData(ctx.matchData)
}

function getMatchDataValue(ctx, key, if_null) {
    return ctx.matchData[key] || if_null;
}

function getFullKey(ctx, key) {
    return `${ctx.screenIndex}{${key}}`;
}

const GradientButton = ({textStyle = {}, innerStyle = {}, outerStyle, style = {}, disabled, onPress = ()=>{}, title = "", gradientDir = 1}) => {
    return (
        <AppButton gradientDirection={gradientDir} outerStyle={[{height: 75, width: '80%', margin: 5, borderRadius: 20}, outerStyle]} style={[{width: '100%', borderRadius: 15, height: '100%'}, style]} innerStyle={[{borderRadius: 15}, innerStyle]} onPress={() => { if (!disabled) {onPress();}}}><Text style={[{fontSize: 20, fontWeight: 'bold', color: 'white'}, textStyle]}>{title}</Text></AppButton>
    )
};

const GradientCheckBox = ({key_value, onValueChanged = () => {}, style = {}, outerStyle, disabled, title = "", checkedColor = 'rgba(0,255,0,0.3)', gradientDir = 1}) => {
    const ctx = useContext(AppContext)
    const full_key = getFullKey(ctx, key_value);

    useEffect(() => {
        setUnsetKey(ctx, full_key, false);
    }, []);
    
    function onChange(newValue) {
        onValueChanged(newValue);
        setMatchDataKey(ctx, full_key, newValue);
    }
    
    return (<AppCheckbox checked={ctx.matchData[full_key]} onValueChanged={onChange} style={style} outerStyle={[{justifyContent: 'center', alignItems: 'center', marginBottom: 10, width: '50%', height: 50},outerStyle]} checkedColor={checkedColor}><Text style={{color: 'white', fontSize: 17, fontWeight: 'bold'}}>{title}</Text></AppCheckbox>)
}

const GradientChoice = ({key_value, onValueChanged = (newIndexes) => {}, multiChoice = false, style = {}, outerStyle, choices = [], disabled, title = "", gradientDir = 1}) => {
    const ctx = useContext(AppContext)
    const full_key = getFullKey(ctx, key_value);

    useEffect(() => {
        setUnsetKey(ctx, full_key, []);
    }, []);

    function onChange(newValue) {
        onValueChanged(newValue);
        const selectedChoices = choices.filter((choice, index) => newValue.includes(index)).map((choice) => choice.value);
        setMatchDataKey(ctx, full_key, selectedChoices);
    }

    return (<AppChoice default_choices={ctx.matchData[full_key]} title={title} style={style} outerStyle={[{marginBottom: 10, width: '80%'}, outerStyle]} choices={choices} multiChoice={multiChoice} onValueChanged={onChange}/>)
};

const GradientTextInput = ({key_value, style = {}, default_value="", onValueChanged = () => {}, disabled, title = "", outerStyle, onlyNumbers = false, regex = '', inputMode = 'search', maxLength = 20, gradientDir = 1}) => {
    const ctx = useContext(AppContext)
    const full_key = getFullKey(ctx, key_value);

    useEffect(() => {
        setUnsetKey(ctx, full_key, '');
    }, []);

    function onChange(newValue) {
        onValueChanged(newValue);
        setMatchDataKey(ctx, full_key, newValue);
    }
    
    return (<AppInput default_value={ctx.matchData[full_key]} title={title} style={style} outerStyle={[{marginBottom: 10, width: '80%'}, outerStyle]} onValueChanged={onChange} regex={onlyNumbers ? /[^0-9]/g : regex} inputMode={onlyNumbers ? 'numeric' : inputMode}/>)
};

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
    GradientButton, 
    GradientCheckBox, 
    GradientChoice,
    GradientTextInput, 
    GradientQRCode,
};