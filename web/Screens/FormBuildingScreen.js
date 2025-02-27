import React, { useState, useEffect, useMemo, memo }from 'react';
import { View, Image, ScrollView, TextInput, Pressable, Text, Modal, Linking } from "react-native";
import FormBuilderContext from '../../components/FormBuilderContext';
import { CustomScrollView, WebButton, WebCheckbox, WebHeader, WebInput, WebPhonePageView } from '../FormBuilder/Components';
import { PageContent, PageFooter, PageHeader } from '../FormBuilder/PageComponents';
import { Elements, ElementJSON, ElementProperties } from '../FormBuilder/Defaults';
import Globals from '../../Globals';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppButton, AppCheckbox, AppInput } from '../../GlobalComponents';
import { isLeftHandSideExpression } from 'typescript';
import { APIGet } from '../../backend/APIRequests';

// Objects are Pass By Reference, so I needed this
// https://stackoverflow.com/questions/7574054/javascript-how-to-pass-object-by-value - Paul Varghese
function clone(obj){
  if(obj == null || typeof(obj) != 'object')
      return obj;

  var temp = new obj.constructor(); 
  for(var key in obj)
      temp[key] = clone(obj[key]);

  return temp;
}

// https://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript?page=1&tab=scoredesc#tab-top
function toTitleCase(str) {
  str = str.replace('_', ' ') // Make underscores spaces.
  return str.replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}

// https://stackoverflow.com/questions/105034/how-do-i-create-a-guid-uuid
function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
    (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
  );
}

const FormBuildingScreen = () => {
  const [focusedElementIndex, setFocusedElementIndex] = useState(null);
  const [scale, setScale] = useState(0.8);
  const [formPages, setFormPages] = useState([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(-1);
  const [currentElement, setCurrentElement] = useState(null);
  const [currentPage, setCurrentPage] = useState(null);
  const [showHighlight, setShowHighlight] = useState(true);

  const [baseElements, setBaseElements] = useState(Elements);
  const [baseElementJSON, setBaseElementJSON] = useState(ElementJSON);
  const [elementProperties, setElementProperties] = useState(ElementProperties);
  const [editingBaseElement, setEditingBaseElement] = useState(null);

  // Saving and loading states
  const [showModal, setShowModal] = useState('');
  const [formAPIData, setFormAPIData] = useState([]);

  const saveSvg = require('../../assets/icons/save-icon.svg');
  const loadSvg = require('../../assets/icons/download-icon.svg');
  const uploadSvg = require('../../assets/icons/upload-icon.svg');
  const deleteSvg = require('../../assets/icons/delete-icon.svg');
  const clearSvg = require('../../assets/icons/clear-icon.svg');
  const bugMailSvg = require('../../assets/icons/bug-mail-icon.svg');

  useEffect(() => {
    // Ensure that the user is informed that their project will be lost if they leave the page.
    window.addEventListener("beforeunload", async (ev) => 
    {  
      ev.preventDefault();
    });

    AsyncStorage.getItem('current_form').then((value) => {
      let form = value ? JSON.parse(value) : [];
      setFormPages(form);
      if (form.length === 0) {
        addPage();
        setCurrentPageIndex(0);
        setFocusedElementIndex(-1);
      }
    });

    return () => {
      window.removeEventListener("beforeunload", () => {});
    }
  }, []);

  useEffect(() => {
    if (formPages.length === -1) {
      setCurrentPageIndex(-1);
      setFocusedElementIndex(-1);
      return;
    }
    if (currentPageIndex === -1) {
      setCurrentPageIndex(0);
      setFocusedElementIndex(-1);
    }
  }, [formPages]);

  useEffect(() => {
    
    if (currentPageIndex === -1) {
      setCurrentPage(null);
    } else if ((!currentPage) || formPages[currentPageIndex].name !== currentPage.name) {
      setCurrentPage(formPages[currentPageIndex]);
    }

    if (focusedElementIndex === -1) {
      if (!editingBaseElement) {
        setCurrentElement(null);
      }
    } else if (currentPageIndex !== -1) {
      setEditingBaseElement(null);
      setCurrentElement(currentPage.elements[focusedElementIndex]);
    }
  }, [formPages, currentPageIndex, focusedElementIndex]);

  useEffect(() => {
    if (editingBaseElement) {
      setFocusedElementIndex(-1);
    }
  }, [editingBaseElement]);

  useEffect(() => {
    if (showModal === 'load') {
      fetchFormData().then((data) => {
        setFormAPIData(data);
      });
    }
  }, [showModal]);

  useEffect(() => {
  }, [currentPageIndex])

  const states = {
    focusedElementIndex: focusedElementIndex,
    formPages: formPages,
    currentPageIndex: currentPageIndex,
    currentPage: currentPage,
    scale: scale,
    showHighlight: showHighlight,

    setScale: setScale,
    setSelectedPage: setSelectedPage,
    setCurrentPageName: setCurrentPageName,
    setShowHighlight: setShowHighlight,
  }

  async function fetchFormData() {
    // APIGet('https://api.robocoder.me/', 5000).then((data) => {console.log("a")})
    return fetch('https://api.robocoder.me/forms', {
      mode: 'cors',
      method: 'GET',
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-api-key": undefined,
      },
    })
      .then((resp) => resp.json())
      .then((json) => json)
      .catch((error) => alert(error));
  
  }
  
  async function postFormData(data, formName, formYear) {
    return fetch('https://api.robocoder.me/form', {
        mode: 'cors',
        method: 'POST',
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "x-api-key": process.env.API_KEY,
        },
        body: JSON.stringify({
          year: formYear,
          name: formName,
          form: data
        }),
      })
        .then((resp) => resp)
        .catch((error) => alert(error));
  }

  async function postFormDataAPI(formName, formYear) {
    const newFormPages = formPages.map((page, i) => {
      if (i === currentPageIndex) { return currentPage; }
      return page;
    });

    setFormPages(newFormPages);

    let res = await postFormData(newFormPages, formName, formYear);
    if (res.ok) {
      setShowModal('');
    }
    alert(await res.json());
  }

  async function saveFormData() {
    const newFormPages = formPages.map((page, i) => {
      if (i === currentPageIndex) { return currentPage; }
      return page;
    });

    AsyncStorage.setItem('current_form', JSON.stringify(newFormPages));
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

  function setCurrentPageName(newName) { 
    const newPage = {name: newName, uuid: currentPage.uuid, elements: currentPage.elements};
    setFormPages(formPages.map((page, index) => index === currentPageIndex ? newPage : page));
  }

  function addElementToPage(elementName, shouldHaveKeyValue = true) {
    // The clone function should be used here as otherwise, an object is passed by reference, and that will change ALL of the elems, not just one.
    const element = clone(baseElementJSON[elementName]);

    // If the element is not found, then return.;
    if (!element) { return; }

    // Change the page at the correct index to include the new element.
    const changedPage = {name: currentPage.name, uuid: currentPage.uuid, elements: [...currentPage.elements, {...element, key_value: shouldHaveKeyValue ? String(currentPage.elements.length) : undefined}]};
    setCurrentPage(changedPage);
  }

  function addPage() {
    setFormPages([...formPages, {name: 'Page ' + (formPages.length + 1), uuid: uuidv4(), elements: []}])
  }

  function deletePage(index) {
    const newPages = formPages.filter((page, i) => i !== index);
    setFormPages(newPages);

    if (currentPageIndex == index) {
      setFocusedElementIndex(-1);
    }

    if (currentPageIndex >= newPages.length) {
      setCurrentPageIndex(newPages.length - 1);
    }
  }

  function renderElementPropertyFields() {
    const properties = [...elementProperties[currentElement.type]];

    const ListPropertyInput = ({property, setProperty}) => {
      const [items, setItems] = useState(currentElement[property.name]);
      const name = property.display_name ? toTitleCase(property.display_name) : toTitleCase(property.name);

      function setItemProperty(index, prop, newValue) {
        const newItems = items;
        newItems[index][prop.name] = newValue;
        setItems(newItems);
        setProperty(property, newItems);
      }

      function deleteItem(index) {
        const newItems = items.filter((item, i) => i !== index)
        setItems(newItems);
        setProperty(property, newItems);
      }

      function addItem() {
        const newItems = [...items, baseItem];
        setItems(newItems);
        setProperty(property, newItems);
      }

      const baseItem = useMemo(() => {
        const item = {};
        item['label'] = 'Label'
        item['value'] = 'label';
        item['select_color'] = 'rgba(0, 0, 0, 0)';
        return item;
      }, [property]);

      return (
        <View style={{width: '100%', alignItems: 'center', backgroundColor: Globals.ButtonColor, padding: 5, borderRadius: 20, marginBottom: 2}}>
          <Text style={{color: 'white', fontSize: 16, fontWeight: 'bold', textAlign: 'center', verticalAlign: 'center', marginBottom: 5}}>{name}:</Text>
          <View style={{width: '100%', flexDirection: 'column', alignItems: 'center', flex: 1}}>
            {
              items.map((item, index) => {
                return (
                  <View key={index} style={{width: '100%', flexDirection: 'column', alignItems: 'center', backgroundColor: 'hsl(240, 70%, 20%)', borderRadius: 20, padding: 5, marginVertical: 1}}>
                    {
                      property.properties.map((prop, i) => {
                        switch (prop.type) {
                          case 'string':
                            return <TextPropertyInput key={i} property={prop} setProperty={(prop, newValue) => {setItemProperty(index, prop, newValue)}} value={item[prop.name]}/>;
                          case 'number':
                            return <TextPropertyInput key={i} property={prop} setProperty={(prop, newValue) => {setItemProperty(index, prop, newValue)}} value={item[prop.name]} onlyNumbers={true}/>;
                          case 'list':
                            return <ListPropertyInput key={i} property={prop} setProperty={(prop, newValue) => {setItemProperty(index, prop, newValue)}} value={item[prop.name]}/>;
                          case 'boolean':
                            return <BoolPropertyInput key={i} property={prop} setProperty={(prop, newValue) => {setItemProperty(index, prop, newValue)}} value={item[prop.name]}/>;
                          case 'color':
                            return <ColorPropertyInput key={i} property={prop} setProperty={(prop, newValue) => {setItemProperty(index, prop, newValue)}} value={item[prop.name]}/>;
                          default:
                            break;
                        }
                      })
                    }
                    <WebButton title='Delete Item' outerStyle={{width: '100%', height: 30}} style={{width: '100%', height: '100%'}} textStyle={{color: 'red', fontSize: 15, margin: 5}} onClick={() => {deleteItem(index)}}/>
                  </View>
                )
              })
            }
            <WebButton title='Add Item' outerStyle={{width: '100%', height: 30}} style={{width: '100%', height: '100%'}} textStyle={{color: 'green', fontSize: 15, margin: 5}} onClick={addItem}/>
          </View>
        </View>
      )
    }

    const TextPropertyInput = ({property, value, setProperty, onlyNumbers}) => {
      const [text, setText] = useState(value);
      const name = property.display_name ? toTitleCase(property.display_name) : toTitleCase(property.name);

      function updateElement() {
        if (property.name === "key_value") {
          if (currentPage.elements.some((elem, index) => index !== focusedElementIndex && elem.key_value === text)) {
            alert("Key value already exists on another element.");
            setText(currentElement.key_value)
            return;
          }
        }
        setProperty(property, onlyNumbers ? Number(text) : text);
      }

      return (
        <View style={{width: '100%', flexDirection: 'row', alignItems: 'center', marginVertical: 1}}>
          <Text style={{color: 'white', fontSize: 16, fontWeight: 'bold', flex: 1, textAlign: 'center', verticalAlign: 'center'}}>{name}: </Text>
          <AppInput key={value} onlyNumbers={onlyNumbers} onLeave={updateElement} default_value={text} onValueChanged={setText} title={name} selectTextOnFocus={true} showTitle={false} outerStyle={{flex: 2, height: 25}} style={{fontSize: 15, fontWeight: 'thin', backgroundColor: Globals.ButtonColor}}/>
        </View>
      );
    }

    const ColorPropertyInput = ({property, value, setProperty}) => {

      function getRGBA(colorStr) {
        if (!colorStr) { return [0, 0, 0, 0]; }
        return colorStr.replace('rgba(', '').replace(')', '').split(',').map((val) => Number(val));
      }

      const splitRGBA = getRGBA(value);

      const [red, setRed] = useState(splitRGBA[0]);
      const [green, setGreen] = useState(splitRGBA[1]);
      const [blue, setBlue] = useState(splitRGBA[2]);
      const [alpha, setAlpha] = useState(splitRGBA[3]);

      const [colorString, setColorString] = useState(`${red}, ${green}, ${blue}, ${alpha}`);

      const name = property.display_name ? toTitleCase(property.display_name) : toTitleCase(property.name);

      useEffect(() => { 
        if (colorString.split(',').length !== 4) { 
          setColorString(`${red},${green},${blue},${alpha}`);
          return;
        }
      }, [colorString]);

      useEffect(() => {
        setColorString(`${red},${green},${blue},${alpha}`)
      }, [red, green, blue, alpha]);

      function updateColorString() {
        if (colorString.split(',').length !== 4) { return; }
        const splitRGBA = getRGBA(colorString);

        setRed(splitRGBA[0]);
        setGreen(splitRGBA[1]);
        setBlue(splitRGBA[2]);
        setAlpha(splitRGBA[3]);

        let alphaValue = Number(splitRGBA[3]);
        if (alphaValue > 255) { alphaValue = 1; }
        if (alphaValue > 1) { alphaValue = alphaValue / 255; }

        let colorVal = `rgba(${splitRGBA[0]}, ${splitRGBA[1]}, ${splitRGBA[2]}, ${alphaValue})`;
        setProperty(property, colorVal);
      }

      function updateColor() {
        let alphaValue = Number(alpha);
        if (alphaValue > 255) { alphaValue = 1; }
        if (alphaValue > 1) { alphaValue = alphaValue / 255; }

        let colorVal = `rgba(${red}, ${green}, ${blue}, ${alphaValue})`;
        setProperty(property, colorVal);
      }

      return (
        <View style={{width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 1}}>
          <Text style={{color: 'white', fontSize: 16, fontWeight: 'bold', flex: 1, textAlign: 'center', verticalAlign: 'center'}}>{name}: </Text>
          <View style={{flex: 2, borderRadius: 20, overflow: 'hidden'}}>
            <AppInput onlyNumbers={true} onLeave={updateColor} default_value={red} onValueChanged={setRed} title={name} selectTextOnFocus={true} showTitle={false} outerStyle={{borderRadius: 0, height: 25, width: '100%'}} style={{borderRadius: 0, fontSize: 15, fontWeight: 'thin', backgroundColor: 'rgba(155, 0, 0, 1)'}}/>
            <AppInput onlyNumbers={true} onLeave={updateColor} default_value={green} onValueChanged={setGreen} title={name} selectTextOnFocus={true} showTitle={false} outerStyle={{borderRadius: 0, height: 25, width: '100%'}} style={{borderRadius: 0, fontSize: 15, fontWeight: 'thin', backgroundColor: 'rgba(0, 155, 0, 1)'}}/>
            <AppInput onlyNumbers={true} onLeave={updateColor} default_value={blue} onValueChanged={setBlue} title={name} selectTextOnFocus={true} showTitle={false} outerStyle={{borderRadius: 0, height: 25, width: '100%'}} style={{borderRadius: 0, fontSize: 15, fontWeight: 'thin', backgroundColor: 'rgba(0, 0, 155, 1)'}}/>
            <AppInput onlyNumbers={true} onLeave={updateColor} default_value={alpha} onValueChanged={setAlpha} title={name} selectTextOnFocus={true} showTitle={false} outerStyle={{borderRadius: 0, height: 25, width: '100%'}} style={{borderRadius: 0, fontSize: 15, fontWeight: 'thin', backgroundColor: 'black'}}/>
            <AppInput onlyNumbers={true} onLeave={updateColorString} default_value={colorString} onValueChanged={setColorString} title={name} selectTextOnFocus={true} showTitle={false} outerStyle={{borderRadius: 0, height: 25, width: '100%'}} style={{borderRadius: 0, fontSize: 15, fontWeight: 'thin', backgroundColor: `rgba(${red}, ${green}, ${blue}, ${alpha})`}}/>
          </View>
        </View>
      );
    }

    const BoolPropertyInput = ({property, value, setProperty}) => {
      const [checked, setChecked] = useState(Boolean(value));
      const name = property.display_name ? toTitleCase(property.display_name) : toTitleCase(property.name);

      return (
        <View style={{width: '100%', flexDirection: 'row', alignItems: 'center', marginVertical: 1}}>
          <Text style={{color: 'white', fontSize: 16, fontWeight: 'bold', flex: 1, textAlign: 'center', verticalAlign: 'center', marginBottom: 5}}>{name}: </Text>
          <View style={{flex: 2, justifyContent: 'center', alignItems: 'center'}}>
            <AppCheckbox key={value} checked={checked} outerStyle={{borderRadius: 30}} innerStyle={{borderRadius: 20}} checkedColor='rgba(0, 255, 0, 0.5)' style={{width: 20, height: 20, margin: 5}} onPress={() => {setChecked(!checked); setProperty(property, !checked);}}/>
          </View>
        </View>
      );
    }

    function deleteElement() { 
      // Filter all of the elements that are not the focused element.
      const newElems = currentPage.elements.filter((elem, index) => index !== focusedElementIndex);
      setCurrentPage({name: currentPage.name, uuid: currentPage.uuid, elements: newElems});
      setFocusedElementIndex(-1);
    }

    function updatePage(property, newValue) {
      const newElems = currentPage.elements;
      newElems[focusedElementIndex][property.name] = newValue;
      setCurrentPage({name: currentPage.name, uuid: currentPage.uuid, elements: newElems});
    }

    function updateBaseElement(property, newValue) {
      const newJSON = baseElementJSON;
      newJSON[currentElement.type][property.name] = newValue;
      setBaseElementJSON(newJSON);
    }

    return (
      <View style={{width: '100%', alignItems: 'center', padding: 5, marginBottom: 10, borderRadius: 20, backgroundColor: 'hsl(240, 70%, 20%)'}}>
        <WebButton title='Delete Element' textStyle={{color: 'red', margin: 10}} hoverAnimation="scale-x" onClick={deleteElement}/>
        {
          properties.map((prop, index) => {
            if (!prop) { return null; }


            const value = currentElement[prop.name];

            const updateFunction = editingBaseElement ? updateBaseElement : updatePage;
            
            switch (prop.type) {
              case 'string':
                return <TextPropertyInput key={index} property={prop} setProperty={updateFunction} value={value}/>;
              case 'number':
                return <TextPropertyInput key={index} property={prop} setProperty={updateFunction} value={value} onlyNumbers={true}/>;
              case 'list':
                return <ListPropertyInput key={index} property={prop} setProperty={updateFunction} value={value}/>;
              case 'boolean':
                return <BoolPropertyInput key={index} property={prop} setProperty={updateFunction} value={value}/>;
              case 'color':
                return <ColorPropertyInput key={index} property={prop} setProperty={updateFunction} value={value}/>;
              default:
                break;
            }
          })
        }
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
          style={{outline: 'none', width: 100, height: 50, backgroundColor: Globals.ButtonColor, color: 'white', textAlign: 'center', fontSize: 20, fontWeight: 'bold'}} 
          defaultValue={String(scale)}
          onBlur={setEmulatorScale}
        />
    );
  }

  const ModalComponent = memo(({modalType}) => {
    const [formName, setFormName] = useState('');
    const [formYear, setFormYear] = useState('');
    const [formLoadSearch, setFormLoadSearch] = useState('');
    const [formLoadYear, setFormLoadYear] = useState('');
    const [selectedFormID, setSelectedFormID] = useState(-1);
    const [shownPagesToLoad, setShownPagesToLoad] = useState([]);

    useEffect(() => {
      if (modalType === 'load') {
        if (formLoadYear === '') {
          setShownPagesToLoad([]);
          return;
        }
        setShownPagesToLoad(formAPIData ? formAPIData.filter((form) => form.name.toLowerCase().includes(formLoadSearch.toLowerCase()) && form.year.toLowerCase().includes(formLoadYear.toLowerCase())) : []);
      }
    }, [formLoadSearch, formLoadYear]);

    if (modalType === 'upload') {
      return (
        <View style={{width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', position: 'absolute', justifyContent: 'center', alignItems: 'center', zIndex: -100}}>
          <Pressable style={{width: '100%', height: '100%', position: 'absolute', zIndex: -100}} onPress={() => setShowModal('')}/>
          <View style={{width: 400, padding: 5, backgroundColor: Globals.PageColor, borderRadius: 20, alignItems: 'center', justifyContent: 'center'}}>
            <WebHeader title='Upload Form' fontSize={30} style={{margin: 10, alignItems: 'center', justifyContent: 'center'}}/>
            <WebButton title='X' hoverAnimation="scale" textStyle={{color: 'rgba(255, 0, 0, 0.6)', marginBottom: 2, fontSize: 20, fontWeight: 'thin'}} style={{width: 45, height: 45, position: 'absolute', right: 15, top: 15}} onClick={() => setShowModal('')}/>
            <View style={{padding: 5, flex: 1, width: '100%', alignItems: 'center'}}>
              <View style={{width: '90%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 5}}>
                <Text style={{flex: 1, fontSize: 20, color: 'white', fontWeight: 'bold', verticalAlign: 'center', marginRight: 10, alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>Name</Text>
                <AppInput title={"Form Name"} showTitle={false} default_value={formName} onValueChanged={setFormName} outerStyle={{flex: 3, height: 50}}/>
              </View>
              <View style={{width: '90%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                <Text style={{flex: 1, fontSize: 20, color: 'white', fontWeight: 'bold', verticalAlign: 'center', marginRight: 10, alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>Year</Text>
                <AppInput title={"Form Year"} showTitle={false} default_value={formYear} onValueChanged={setFormYear} outerStyle={{flex: 3, height: 50}}/>
              </View>
            </View>
            <WebButton title='Upload' onClick={() => {postFormDataAPI(formName, formYear);}} style={{width: '100%', height: '100%'}} outerStyle={{width: '100%', height: 50, borderRadius: 20}} innerStyle={{borderRadius: 20}}/>
          </View>
        </View>
      )
    } else if (modalType === 'load') {
      return (
        <View style={{width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', position: 'absolute', justifyContent: 'center', alignItems: 'center', zIndex: -100}}>
          <Pressable style={{width: '100%', height: '100%', position: 'absolute', zIndex: -100}} onPress={() => setShowModal('')}/>
          <View style={{width: 400, padding: 5, backgroundColor: Globals.PageColor, borderRadius: 20, alignItems: 'center', justifyContent: 'center'}}>
            <WebHeader title='Load Form' fontSize={30} style={{margin: 10, alignItems: 'center', justifyContent: 'center'}}/>

            <AppButton outerStyle={{width: 45, height: 45, position: 'absolute', right: 15, top: 15}} onPress={() => setShowModal('')}>
              <Text style={{color: 'rgba(255, 0, 0, 0.6)', marginBottom: 2, fontSize: 20, fontWeight: 'thin'}}>X</Text>
            </AppButton>
            <AppButton 
                outerStyle={{width: 45, height: 45, position: 'absolute', left: 15, top: 15}}
                onPress={() => {
                  if (selectedFormID !== -1) {
                    const formToPrint = JSON.stringify(formAPIData.find((form) => form._id === selectedFormID).form);
                    alert(formToPrint)
                    console.log(formToPrint)
                  }
                }}
              >
                <Text style={{color: 'white', fontSize: 16, textAlign: 'center', verticalAlign: 'center'}}>Print</Text>
            </AppButton>

            <AppInput title='Year (Should be dropdown)' onValueChanged={setFormLoadYear} showTitle={true} outerStyle={{width: '90%', height: 60, marginBottom: 5}}/>
            <AppInput title='Search' onValueChanged={setFormLoadSearch} showTitle={true} outerStyle={{width: '90%', height: 60, marginBottom: 5}}/>
            { shownPagesToLoad.length > 0 ? <Text style={{color: 'white', fontSize: 16, fontWeight: 'bold', textAlign: 'center', verticalAlign: 'center', marginBottom: 5}}>Results:</Text> : null }
            <CustomScrollView addScrollbarSpace={false} style={{maxHeight: 300, width: '90%', marginBottom: 5, borderRadius: 20, overflow: 'hidden'}}>
              {
                shownPagesToLoad.map((form, index) => {
                  return [
                    <AppCheckbox
                      key={form._id}
                      onPress={() => {selectedFormID === form._id ? setSelectedFormID(-1) : setSelectedFormID(form._id);}} 
                      outerStyle={{width: '100%', borderRadius: 0}}
                      style={{borderRadius: 0, padding: 5}}
                      checked={selectedFormID === form._id}
                    >
                      <Text style={{color: 'white', fontSize: 16, fontWeight: 'bold', textAlign: 'center', verticalAlign: 'center'}}>{form.name} - {form.year}</Text>
                    </AppCheckbox>,

                    index !== shownPagesToLoad.length - 1 ? <View style={{height: 2, width: '100%', backgroundColor: 'hsl(39, 70%, 40%)', borderRadius: 20}}/> : null
                  ]
                })
              }
            </CustomScrollView>
            <AppButton 
              outerStyle={{width: '100%', height: 50, borderRadius: 20}} 
              onPress={() => {
                if (selectedFormID !== -1) { 
                  setCurrentPage(null); 
                  setCurrentPageIndex(0); 
                  setCurrentElement(null);
                  setFocusedElementIndex(-1);
                  setFormPages(formAPIData.find((form) => form._id === selectedFormID).form); 
                  setShowModal('');
                }
              }}
            >
              <Text style={{color: 'white', fontSize: 16, fontWeight: 'bold', textAlign: 'center', verticalAlign: 'center'}}>Load</Text>
            </AppButton>
          </View>
        </View>
      )
    }
  });

  return (
    <FormBuilderContext.Provider value={states}>
      <View style={{flex: 1, backgroundColor: Globals.PageColor, flexDirection: 'row'}}>
        <View style={{backgroundColor: Globals.PageContainerColor, flex: 1, alignItems: 'center'}}>
          { /* This is the Hierarchy, where we can see the pages that we have made, and go into them and change their elements & names. */ }
          <View style={{width: '100%', margin: 10, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap'}}>
            <WebHeader title='Hierarchy' fontSize={30} style={{marginRight: 10, marginLeft: 10}}/>
            <WebButton title='+' hoverAnimation="scale" onClick={addPage} innerStyle={{borderRadius: 10}} outerStyle={{borderRadius: 10}} style={{width: 30, height: 30, borderRadius: 10, border: '2px solid hsl(39, 70%, 40%)'}} textStyle={{paddingBottom: 3}}/>
          </View>
          <View style={{height: 3, width: '80%', backgroundColor: 'hsl(39, 70%, 40%)', borderRadius: 20, marginBottom: 10}}/>
          <CustomScrollView style={{flex: 1, width: '100%'}} showsVerticalScrollIndicator={false}>
            {
              formPages.map((page, index) => {
                return (
                  <View key={index} style={{width: '100%', flexDirection: 'row', alignItems: 'center', backgroundColor: 'hsl(240, 70%, 20%)', border: currentPageIndex != index ? '0 solid black' : '2px solid hsl(39, 70%, 40%)'}}>
                    <Pressable onPress={() => setSelectedPage(index)} style={{padding: 10, flex: 1, height: '100%'}}>
                      <Text style={{color: 'white', fontSize: 20, fontWeight: 'thin', textAlign: 'left', verticalAlign: 'center'}}>{page.name}</Text>
                    </Pressable>
                    <View style={{width: 40, height: '100%', padding: 5, paddingLeft: 0, justifyContent: 'center'}}>
                      <WebButton 
                        onClick={() => {
                          deletePage(index);
                        }} 
                        title="x" 
                        hoverAnimation="scale"
                        textStyle={{position: 'absolute', fontSize: 30, fontWeight: 'normal', marginBottom: 9, color: 'red'}} 
                        style={{width: '100%', height: '100%'}} 
                        outerStyle={{width: '100%', height: '100%', borderRadius: 10, border: '2px solid hsl(39, 70%, 40%)'}}
                      />
                    </View>
                  </View>
                );
              })
            }
          </CustomScrollView>
        </View>

        {/* Add a border of sorts */}
        <View style={{width: 5, height: '100%', backgroundColor: 'hsl(39, 70%, 40%)'}}/>

        { /* The is the center View, or the "Emulator", meant to show you what it may look like on a phone */ }
        <ScrollView showsVerticalScrollIndicator={false} style={{backgroundColor: Globals.PageColor}} contentContainerStyle={{flex: 1, alignItems: 'center'}}>
          <View style={{width: '100%', height: 40, flexDirection: 'row'}}>
            <AppButton onPress={() => {saveFormData();}} hoverAnimation="scale" style={{width: 40, height: 40}} outerStyle={{borderRadius: 0}}>
              <Image source={saveSvg} style={{tintColor: 'white', width: 20, height: 20}}/>
            </AppButton>
            <AppButton onPress={() => setShowModal('upload')} hoverAnimation="scale" style={{width: 40, height: 40}} outerStyle={{borderRadius: 0}}>
              <Image source={uploadSvg} style={{tintColor: 'white', maxWidth: 26, maxHeight: 18}}/>
            </AppButton>
            <AppButton onPress={() => setShowModal('load')} hoverAnimation="scale" style={{width: 40, height: 40}} outerStyle={{borderRadius: 0}}>
              <Image source={loadSvg} style={{tintColor: 'white', maxWidth: 23, maxHeight: 20}}/>
            </AppButton>
            <View style={{flex: 1, height: '100%', backgroundColor: Globals.ButtonColor}}/>
            <AppButton onPress={() => Linking.openURL(`mailto:jeeves51243@gmail.com?subject=${encodeURIComponent("I found a bug it the form builder! Here is what it is...")}`)} hoverAnimation="scale" style={{width: 40, height: 40}} outerStyle={{borderRadius: 0}}>
              <Image source={bugMailSvg} style={{tintColor: 'white', maxWidth: 26, maxHeight: 18}}/>
            </AppButton>
            <AppButton onPress={() => alert("delete form (show confirmation modal)")} hoverAnimation="scale" style={{width: 40, height: 40}} outerStyle={{borderRadius: 0}}>
              <Image source={clearSvg} style={{tintColor: 'red', maxWidth: 20, maxHeight: 20}}/>
            </AppButton>
          </View>
          <View style={{height: 5, width: '100%', backgroundColor: 'hsl(39, 70%, 40%)'}}/>

          <WebPhonePageView>
            <PageHeader key={currentPage ? currentPage.name : ""} title={currentPage ? currentPage.name : ""} gradientDir={1}/>

            <PageContent gradientDir={1} scrollable={true}>
              {
                currentPage ? 
                  currentPage.elements.map((elem, index) => {
                    const props = {};
                    for (const key of Object.keys(elem)) {
                      props[key] = elem[key];
                    }
                    return React.cloneElement(baseElements[elem.type], {key: index, ...props, title: elem.title, choices: elem.choices, selected: elem === currentElement, emulated: true, onEmulateClick: () => setFocusedElementIndex(index)})
                  })
                : null
              }
            </PageContent>

            <PageFooter gradientDir={1} />        
          </WebPhonePageView>
        </ScrollView>

        {/* Add a border of sorts */}
        <View style={{width: 5, height: '100%', backgroundColor: 'hsl(39, 70%, 40%)'}}/>

        <View style={{backgroundColor: Globals.PageContainerColor, flex: 1, alignItems: 'center'}}>
          {/* This is the Add Elements section, where you can add elements to the page using the buttons provided */}
          <View style={{width: '100%', flex: 1, alignItems: 'center'}}>
            <WebHeader title='Add Elements' fontSize={30} style={{margin: 10, textAlign: 'center'}}/>
            <View style={{height: 3, width: '80%', backgroundColor: 'hsl(39, 70%, 40%)', borderRadius: 20}}/>
            <CustomScrollView style={{flex: 1, width: '100%'}} addScrollbarSpace={false} contentContainerStyle={{alignItems: 'center', paddingTop: 10}} showsVerticalScrollIndicator={false}>
              { 
                ['label', 'choice', 'input', 'checkbox'].map((componentType, index) => (
                  [<View key={componentType} style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%'}}>
                    <WebButton title={toTitleCase(componentType)} onClick={() => addElementToPage(componentType, !(componentType === 'label'))} outerStyle={{width: '100%', height: 50}} style={{width: '100%', height: '100%'}}/>
                    <WebButton 
                      hoverAnimation='scale'
                      title='Edit Base Values' 
                      onClick={() => { 
                        setEditingBaseElement(componentType); 
                        setCurrentElement(baseElementJSON[componentType]); 
                      }} 
                      innerStyle={{backgroundColor: editingBaseElement === componentType ? 'rgba(255, 0, 0, 0.3)' : Globals.ButtonColor}} 
                      outerStyle={{width: 60, height: '100%', position: 'absolute', right: 0}} 
                      style={{width: '100%', height: '100%'}}
                      textStyle={{fontSize: 10, textAlign: 'center', fontWeight: 'thin'}}
                    />
                  </View>,
                  <View style={{height: 2, width: '60%', backgroundColor: 'hsl(39, 70%, 40%)', borderRadius: 20}}/>]
                ))
              }
            </CustomScrollView>
          </View>

          <View style={{width: '100%', height: 5, backgroundColor: 'hsl(39, 70%, 40%)'}}/>
          {/* This is the Editing section, where you can edit the elements on the page after clicking on them to select them */}
          <View style={{width: '100%', flex: 3, alignItems: 'center', paddingHorizontal: 10}}>
            <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
              <WebHeader title='Editing' fontSize={30} style={{margin: 10}}/>
              <AppCheckbox
                checked={showHighlight} 
                onValueChanged={setShowHighlight} 
                checkedColor={'rgba(255, 0, 0, 0.6)'} 
                outerStyle={{width: 75, height: 30, border: '2px solid hsl(39, 70%, 40%)'}}
                style={{justifyContent: 'center', alignItems: 'center'}}
              >
                <Text style={{textAlign: 'center', verticalAlign: 'center', width: '90%', color: 'white', fontSize: 10}}>Show Highlight</Text>
              </AppCheckbox>
            </View>
            <View style={{height: 3, width: '80%', backgroundColor: 'hsl(39, 70%, 40%)', borderRadius: 20, marginBottom: 10}}/>
            <CustomScrollView style={{flex: 1, width: '100%'}} addScrollbarSpace={true} contentContainerStyle={{alignItems: 'center', paddingTop: 10}} showsVerticalScrollIndicator={false}>
              { currentElement ? renderElementPropertyFields() : null }
            </CustomScrollView>
          </View>
        </View>
      </View>
      <Modal style={{zIndex: -100}} visible={showModal} collapsable={true} transparent={true}>
        <ModalComponent modalType={showModal}/>
      </Modal>
    </FormBuilderContext.Provider>
  );
}

export default FormBuildingScreen;