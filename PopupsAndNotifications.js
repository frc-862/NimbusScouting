import React, { useState, useEffect } from 'react';
import { Modal, StyleSheet, Text, View, TouchableNativeFeedback, Keyboard } from 'react-native';
import { GradientButton, GradientShell, GradientTextInput } from './GradientComponents';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ModalPopup = ({headerText, infoText, buttonText, visible, setVisible, type, gradientDir = 0, statePackage}) => {
  infoText = infoText != undefined ? infoText : "Info Text Here";
  buttonText = buttonText != undefined ? buttonText : "Button Text Here";
  visible = visible ? visible : false;

  if (type == "info") {
    return (
      <View style={styles.centeredView}>
        <Modal
          animationType="fade"
          transparent={true}
          visible={visible}
          onRequestClose={() => {
            setVisible(false);
          }}>
          <View style={[styles.centeredView, {backgroundColor: 'rgba(0, 0, 0, 0.5)'}]}>
            <GradientShell style={{height: '15%', width: '70%'}} radius={{topRad: 15, bottomRad: 15}} gradientDir={gradientDir}>
              <View style={{backgroundColor: 'rgb(0, 0, 50)', borderRadius: 15, width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
                <View style={{flexGrow: 1, justifyContent: 'center', marginBottom: 10}}>
                  <Text style={{textAlign: 'center', color: 'white', fontSize: 30, marginTop: 20}}>{headerText}</Text>
                  { infoText ? <Text style={{textAlign: 'center', color: 'white', marginTop: 5}}>{infoText}</Text> : null } 
                </View>
                <GradientButton style={{width: '103%', height: '50%', marginBottom: -5}} gradientDir={gradientDir} title={buttonText} textStyle={{fontSize: 20, top: 0}} onPress={() => setVisible(false)}/>
              </View>
            </GradientShell>
          </View>
        </Modal>
      </View>
    );
  } else if (type == "nameInput") {
    const [continueButtonDisabled, setContinueButtonDisabled] = useState(false);
    const [finalName, setFinalName] = useState('');

    useEffect(() => {
      if (finalName != '') {
        setContinueButtonDisabled(false);
      } else {
        setContinueButtonDisabled(true);
      }
    }, [finalName]);

    return (
        <View style={styles.centeredView}>
          <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={() => {
              setVisible(false);
          }}>
            <TouchableNativeFeedback onPress={() => Keyboard.dismiss()}>
              <View style={[styles.centeredView, {backgroundColor: 'rgba(0, 0, 0, 0.5)'}]}>
                <GradientShell style={{height: '90%', width: '90%'}} radius={{topRad: 15, bottomRad: 15}} gradientDir={gradientDir}>
                  <View style={{backgroundColor: 'rgb(0, 0, 50)', borderRadius: 15, width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={{textAlign: 'center', color: 'white', fontSize: 40, marginTop: 20, fontWeight: 'bold'}}>{headerText}</Text>
                    { infoText ? <Text style={{textAlign: 'center', color: 'white', marginTop: 5, fontSize: 16, fontWeight: 'bold', marginBottom: 15}}>{infoText}</Text> : null } 
                    <GradientTextInput title="Enter your name" save_data={false} setParallelState={setFinalName} disabled={false}/>
                    <GradientButton gradientDir={gradientDir} disabled={continueButtonDisabled} title={buttonText} textStyle={{fontSize: 20, top: 0}} onPress={() => { setVisible(false); statePackage.setName(finalName); AsyncStorage.setItem('name', finalName); }}/>
                  </View>
                </GradientShell>
              </View>
            </TouchableNativeFeedback>
          </Modal>
        </View>
    );
  }
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    zIndex: -1000,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 15,
    padding: 10,
    width: '100%',
    bottom: 0,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  dropdownGradient: {
    backgroundColor: 'red',
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
});

export { ModalPopup };