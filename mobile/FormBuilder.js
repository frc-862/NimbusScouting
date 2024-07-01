import { View, StyleSheet, StatusBar, Platform } from "react-native";
import { 
  GradientChoice, 
  GradientCheckBox,
  GradientTextInput,
} from './GradientComponents';
import {
  HeaderTitle,
  PageHeader,
  PageFooter,
  PageContent,
  RelatedContentContainer,
} from './PageComponents';
import Globals from "../Globals";
import React, { useContext } from "react";
import AppContext from "../components/AppContext";
import ScreenShell from "./Screens/ScreenShell";

// Example JSON string for the form builder:
const exampleJson = JSON.stringify(require('../web/examples/form_component_testing_example.json'));

const FormBuilderPageShell = (props) => {

  // InfoText: `Event: ${ctx.APIData.event.slice(0, 4) + " " + ctx.APIData.event_name}`
  return (
    <ScreenShell gradientDir={props.gradientDir}>
      {props.children}
    </ScreenShell>
  )
}

/*
  In the JSON strings inputted into the form builder, every element must have a type.
  This type will determine what the form builder will render.

  After, most elements will have a title and key_value, depending on what they are used for.
  Additionally, elements may have a prop object, which will be used to determine the properties of the element on render.
*/

const GetFormJSONAsMatch = (jsonString) => {
  const json = JSON.parse(jsonString);
  const finalData = {};

  for (const pageIndex in json) {
    const page = json[pageIndex];
    for (const element of page.elements) {
      if (element.key_value) {
        if (element.type === 'choice') {
          let selectedValues = [];
          // Map the string with the indexes into a list of numbers for the indexes
          if (element.default_value) {
            const selectedIndexes = element.default_value.replace(',', '').split(' ').map((item) => Number(item));
            selectedValues = element.choices.filter((choice, index) => selectedIndexes.includes(index)).map((choice) => choice.value); 
          }

          finalData[`${Number(pageIndex) + 1}{${element.key_value}}`] = selectedValues || [];
        } else {
          finalData[`${Number(pageIndex) + 1}{${element.key_value}}`] = element.default_value || '';
        }
      }
    }
  }

  return finalData;
}

// All four elements that are currently supported by the form builder.
const Elements = {
  'checkbox': <GradientCheckBox/>,
  'input': <GradientTextInput/>,
  'choice': <GradientChoice/>,
  'label': <HeaderTitle/>
}

// This takes the elements of the page and returns a list of them translated into React components.
function MakePageElements(elementsJson) {
  const elements = [];
  for (let elementIndex in elementsJson) {
    const element = elementsJson[elementIndex];
    elements.push(React.cloneElement(Elements[element.type], {key: elementIndex, ...element}));
  }
  return elements;
}

// This takes that form JSON string and translates each of its pages and elements into React components.
function FormBuilder(jsonString) {
  const json = JSON.parse(jsonString || exampleJson);
  const finalPages = [];

  for (const page of json) {
    finalPages.push({
      screen: ({style, gradientDir}) => <FormBuilderPageShell key={page.uuid} title={page.name} style={style} gradientDir={gradientDir}>
        { MakePageElements(page.elements) }
      </FormBuilderPageShell>,
      name: page.name,
      uuid: page.uuid
    });
  }
  
  return finalPages;
}

export { FormBuilder, GetFormJSONAsMatch, exampleJson };
