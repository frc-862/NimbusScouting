import React, { useState, useContext, useEffect, useRef }from 'react';
import { View, ScrollView, StatusBar, TextInput, Pressable, Text } from "react-native"
import AppContext from "../components/AppContext";
import FormBuilderContext from '../components/FormBuilderContext';
import { WebButton, WebCheckbox, WebChoice, WebHeader, WebInput, WebPhonePageView } from './WebComponents';
import { PageContent, PageFooter, PageHeader } from './WebAppPageComponents';
import Globals from '../mobile/Globals';

const HomeScreen = () => {
  const ctx = useContext(AppContext);
  return (
    <View style={{flex: 1, backgroundColor: Globals.PageColor, justifyContent: 'center', alignItems: 'center'}}>
      <WebButton title={"To Form Builder"} onClick={() => ctx.setScreens([FormBuildingScreen])} style={{width: 200}}/>
    </View>
  );

}

const baseElements = {
  'checkbox': <WebCheckbox/>,
  'input': <WebInput/>,
  'choice': <WebChoice/>,
  'header': <WebHeader fontSize={20}/>
}

const baseElementJSON = {
  'checkbox': {type: 'checkbox', title: 'Checkbox'},
  'input': {type: 'input', title: 'Input'},
  'choice': {type: 'choice', title: 'Choice', choices: [{label: '1', value: 'one'}, {label: '2', value: 'two'}, {label: '3', value: 'three'}]},
  'header': {type: 'header', title: 'Header'},
}

const allElementProps = [{name: 'title', type: 'string'}];

const elementProperties = {
  'checkbox': [
    {name: 'key_value', type: 'string'}
  ],
  'input': [
    {name: 'key_value', type: 'string'}
  ],
  'choice': [
    {name: 'key_value', type: 'string'}
  ],
  'header': [

  ]
}

const FormBuildingScreen = () => {
  const [focusedElementIndex, setFocusedElementIndex] = useState(null);
  const [scale, setScale] = useState(0.8);
  const [formPages, setFormPages] = useState([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(-1);
  const [currentElement, setCurrentElement] = useState(null);
  const [currentPage, setCurrentPage] = useState(null);

  useEffect(() => {
    if (formPages.length === 0) {
      addPage();
      setCurrentPageIndex(0);
      setFocusedElementIndex(-1);
    }
  }, []);

  useEffect(() => {
    if (currentPageIndex === -1) {
      setCurrentPage(null);
    } else if ((!currentPage) || formPages[currentPageIndex].name !== currentPage.name) {
      setCurrentPage(formPages[currentPageIndex]);
    }

    if (focusedElementIndex === -1) {
      setCurrentElement(null);
    } else if (currentPageIndex !== -1) {
      setCurrentElement(currentPage.elements[focusedElementIndex]);
    }
  }, [formPages, currentPageIndex, focusedElementIndex]);

  const states = {
    focusedElementIndex: focusedElementIndex,
    setFocusedElementIndex: setFocusedElementIndex,
    formPages: formPages,
    setFormPages: setFormPages,
    currentPageIndex: currentPageIndex,
    setCurrentPageIndex: setCurrentPageIndex,
    scale: scale,
    setScale: setScale,
    setSelectedPage: setSelectedPage,
  }

  function setSelectedPage(index) {
    // If there is a difference in the page, make sure to update the formPages array.
    if (currentPage && formPages[currentPageIndex] !== currentPage) {
      setFormPages(formPages.map((page, i) => {
        if (i === currentPageIndex) { return currentPage; }
        return page;
      }));
    }

    setCurrentPageIndex(index);
    setFocusedElementIndex(-1);
  }

  function addElementToPage(elementName) {
    const element = baseElementJSON[elementName];

    // If the element is not found, then return.;
    if (!element) { return; }

    // Change the page at the correct index to include the new element.
    const changedPage = {name: currentPage.name, elements: [...currentPage.elements, {...element, key_value: String(currentPage.elements.length)}]};
    setCurrentPage(changedPage);
  }

  function addPage() {
    setFormPages([...formPages, {name: 'Page ' + (formPages.length + 1), elements: []}])
  }

  function renderElementPropertyFields() {
    const properties = [...allElementProps, ...elementProperties[currentElement.type]];

    // https://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript?page=1&tab=scoredesc#tab-top
    function toTitleCase(str) {
      return str.replace(
        /\w\S*/g,
        function(txt) {
          return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
      );
    }

    const TextPropertyInput = ({property, value}) => {
      const [text, setText] = useState(currentElement[property.name]);
      const name = property.name === "key_value" ? "Key" : toTitleCase(property.name);

      function updatePage() {
        if (property.name === "key_value") {
          if (currentPage.elements.some((elem, index) => index !== focusedElementIndex && elem.key_value === text)) {
            alert("Key value already exists on another element.");
            setText(currentElement.key_value)
            return;
          }
        }

        const newElems = currentPage.elements;
        newElems[focusedElementIndex][property.name] = text;
        setCurrentPage({name: currentPage.name, elements: newElems});
      }

      return (
        <View style={{width: '100%', flexDirection: 'row', alignItems: 'center'}}>
          <Text style={{color: 'white', fontSize: 16, flex: 1, textAlign: 'center', verticalAlign: 'center', marginBottom: 5}}>{name}: </Text>
          <WebInput key={value} onBlur={updatePage} parallelValue={{get: text, set: setText}} title={name} selectTextOnFocus={true} showTitle={false} outerStyle={{flex: 2, height: 25}} style={{fontSize: 15, fontWeight: 'thin', backgroundColor: 'hsl(240, 70%, 20%)'}}/>
        </View>
      );
    }

    return (
      <View style={{width: '100%', flex: 1, alignItems: 'center', paddingLeft: 10, paddingRight: 10}}>
        {
          properties.map((prop, index) => {
            if (!prop) { return null; }

            const value = currentElement[prop.name];

            return <TextPropertyInput key={index} property={prop} value={value}/>;
          })
        }
        <WebButton title='Delete Element' textStyle={{color: 'red'}}/>
      </View>
    )

  }

  const ScaleInput = () => {
    function setEmulatorScale(e) {
      if (!e.nativeEvent) { return; }
      setScale(Math.max(0.1, Math.min(Number(e.nativeEvent.text), 2)));
    }
    return (
        <TextInput 
          selectTextOnFocus={true} 
          style={{outline: 'none', flex: 1, height: 50, backgroundColor: Globals.ButtonColor, color: 'white', textAlign: 'center', fontSize: 20, fontWeight: 'bold'}} 
          defaultValue={String(scale)}
          onBlur={setEmulatorScale}
        />
    );
  }

  return (
    <FormBuilderContext.Provider value={states}>
      <View style={{flex: 1, backgroundColor: Globals.PageColor, flexDirection: 'row'}}>
        <View style={{backgroundColor: Globals.PageContainerColor, flex: 1, alignItems: 'center'}}>
          { /* This is the Hierarchy, where we can see the pages that we have made, and go into them and change their elements & names. */ }
          <View style={{width: '100%', margin: 10, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap'}}>
            <WebHeader title='Hierarchy' fontSize={30} style={{marginRight: 10, marginLeft: 10}}/>
            <WebButton title='+' onClick={addPage} innerStyle={{borderRadius: 10}} style={{width: 30, height: 30, borderRadius: 10, border: '2px solid hsl(39, 70%, 40%)'}} textStyle={{paddingBottom: 3}}/>
          </View>
          <View style={{height: 3, width: '80%', backgroundColor: 'hsl(39, 70%, 40%)', borderRadius: 20, marginBottom: 10}}/>
          <ScrollView style={{flex: 1, width: '100%'}} showsVerticalScrollIndicator={false}>
            {
              formPages.map((page, index) => {
                return (
                  <WebButton 
                    title={page.name} onClick={() => setSelectedPage(index)} 
                    style={{width: '100%', height: 50, borderRadius: 0}} 
                    innerStyle={{borderRadius: 0, backgroundColor: 'hsl(240, 70%, 20%)', border: currentPageIndex != index ? '0 solid black' : '2px solid hsl(39, 70%, 40%)'}} 
                    textStyle={{fontSize: 20, fontWeight: 'thin', textAlign: 'left', paddingLeft: 20}}
                    key={index}
                  />
                );
              })
            }
          </ScrollView>
        </View>

        { /* The is the center View, or the "Emulator", meant to show you what it may look like on a phone */ }
        <ScrollView showsVerticalScrollIndicator={false} style={{backgroundColor: Globals.PageColor}} contentContainerStyle={{flex: 1, alignItems: 'center'}}>
          <View style={{height: 50}}>
            <ScaleInput/>
          </View>

          <WebPhonePageView>
            <PageHeader title={currentPage ? currentPage.name : ""} gradientDir={1}/>

            <PageContent gradientDir={1} scrollable={true}>
              {
                currentPage ? 
                  currentPage.elements.map((elem, index) => {
                    return React.cloneElement(baseElements[elem.type], {key: index, title: elem.title, choices: elem.choices, emulated: true, onEmulateClick: () => setFocusedElementIndex(index)})
                  })
                : null
              }
            </PageContent>

            <PageFooter gradientDir={1} />        
          </WebPhonePageView>
        </ScrollView>

        <View style={{backgroundColor: Globals.PageContainerColor, flex: 1, alignItems: 'center'}}>
          {/* This is the Add Elements section, where you can add elements to the page using the buttons provided */}
          <View style={{width: '100%', flex: 1, alignItems: 'center'}}>
            <WebHeader title='Add Elements' fontSize={30} style={{margin: 10}}/>
            <View style={{height: 3, width: '80%', backgroundColor: 'hsl(39, 70%, 40%)', borderRadius: 20}}/>
            <ScrollView style={{flex: 1, width: '100%'}} contentContainerStyle={{alignItems: 'center', paddingTop: 10}} showsVerticalScrollIndicator={false}>
              {/* Make a button to allow the user to add a header to the page */}
              <WebButton title='Header' onClick={() => addElementToPage('header')} style={{width: '100%', height: 50}}/>
              <View style={{height: 2, width: '60%', backgroundColor: 'hsl(39, 70%, 40%)', borderRadius: 20}}/>

              {/* Make a button to allow the user to add a choice element to the page */}
              <WebButton title='Choice' onClick={() => addElementToPage('choice')} style={{width: '100%', height: 50}}/>
              <View style={{height: 2, width: '65%', backgroundColor: 'hsl(39, 70%, 40%)', borderRadius: 20}}/>

              {/* Make a button to allow the user to add an input element to the page */}
              <WebButton title='Input' onClick={() => addElementToPage('input')} style={{width: '100%', height: 50}}/>
              <View style={{height: 2, width: '60%', backgroundColor: 'hsl(39, 70%, 40%)', borderRadius: 20}}/>

              {/* Make a button to allow the user to add an input element to the page */}
              <WebButton title='Checkbox' onClick={() => addElementToPage('checkbox')} style={{width: '100%', height: 50}}/>
              {/* <View style={{height: 2, width: '60%', backgroundColor: 'hsl(39, 70%, 40%)', borderRadius: 20}}/> */}
            </ScrollView>
          </View>

          {/* This is the Editing section, where you can edit the elements on the page after clicking on them to select them */}
          <View style={{width: '100%', flex: 2, alignItems: 'center'}}>
            <WebHeader title='Editing' fontSize={30} style={{margin: 10}}/>
            <View style={{height: 3, width: '80%', backgroundColor: 'hsl(39, 70%, 40%)', borderRadius: 20, marginBottom: 10}}/>
            { currentElement ? renderElementPropertyFields() : null }
          </View>
        </View>
      </View>
    </FormBuilderContext.Provider>
  );
}

export { HomeScreen, FormBuildingScreen }