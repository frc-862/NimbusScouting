import { View, StyleSheet, StatusBar, Platform } from "react-native";
import { 
  GradientChoice, 
  GradientCheckBox,
  GradientNumberInput, 
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
const exampleJson = JSON.stringify(require('../web/examples/form_example.json'));
// JSON.stringify({
//   "page_list": ["Auton", "Teleop", "Endgame", "General"],
//   "Auton": [
//     {
//       "type": "header",
//       "title": "Starting Position",
//       "headerNum": 2
//     },
//     {
//       "type": "choice",
//       "title": "Starting Position",
//       "key_value": "starting_position",
//       "choices": [
//         {"label": "Amp", "value": "amp", "select_color": "rgba(0, 0, 255, 0.3)"},
//         {"label": "Center", "value": "center", "select_color": "rgba(0, 0, 255, 0.3)"},
//         {"label": "Source", "value": "source", "select_color": "rgba(0, 0, 255, 0.3)"}
//       ],
//     },
//     {
//       "type": "header",
//       "title": "Collection",
//       "headerNum": 2
//     },
//     { 
//       "type": "container",
//       "style": {"width": '90%'},
//       "children": [
//         {
//           "type": "input",
//           "title": "Notes Collected",
//           "key_value": "notes_collected",
//           "only_numbers": true,
//           "max_num": 9,
//           "default_value": "0"
//         },
//         {
//           "type": "choice",
//           "title": "Collection Location",
//           "key_value": "collection_location",
//           "choices": [
//             {"label": "Starting Line", "value": "start_line", "select_color": "rgba(0, 0, 255, 0.3)"}, 
//             {"label": "Center Line", "value": "center_line", "select_color": "rgba(0, 0, 255, 0.3)"},
//           ],
//           "multi_select": true
//         }
//       ]
//     },
//     {
//       "type": "header",
//       "title": "Scoring",
//       "headerNum": 2
//     },
//     {
//       "type": "container",
//       "children": [
//         {
//           "type": "input",
//           "title": "SPEAKER",
//           "key_value": "speaker_scored",
//           "only_numbers": true,
//           "max_num": 9,
//           "default_value": "0"
//         },
//         {
//           "type": "input",
//           "title": "AMP",
//           "key_value": "amp_scored",
//           "only_numbers": true,
//           "max_num": 9,
//           "default_value": "0"
//         },
//       ]
//     },
//     {
//       "type": "header",
//       "title": "Leave Starting Zone",
//       "headerNum": 2
//     },
//     {
//       "type": "checkbox",
//       "key_value": "leave",
//       "title": "Leave",
//       "select_color": "rgba(0, 0, 255, 0.6)"
//     }
//   ],

//   "Teleop": [
//     {
//       "type": "header",
//       "title": "Collection",
//       "headerNum": 1
//     },
//     { 
//       "type": "container",
//       "style": {"width": '90%'},
//       "children": [
//         {
//           "type": "input",
//           "title": "Ground",
//           "key_value": "ground_collect",
//           "only_numbers": true,
//           "max_num": 999,
//           "default_value": "0"
//         },
//         {
//           "type": "input",
//           "title": "Source Ground",
//           "key_value": "source_ground_collect",
//           "only_numbers": true,
//           "max_num": 999,
//           "default_value": "0"
//         },
//         {
//           "type": "input",
//           "title": "Source Chute",
//           "key_value": "source_chute_collect",
//           "only_numbers": true,
//           "max_num": 999,
//           "default_value": "0"
//         },
//       ]
//     },
//     {
//       "type": "header",
//       "title": "Shooting",
//       "headerNum": 1
//     },
//     {
//       "type": "container",
//       "children": [
//         {
//           "type": "input",
//           "title": "SPEAKER",
//           "key_value": "speaker_scored",
//           "only_numbers": true,
//           "max_num": 999,
//           "default_value": "0"
//         },
//         {
//           "type": "input",
//           "title": "AMP",
//           "key_value": "amp_scored",
//           "only_numbers": true,
//           "max_num": 999,
//           "default_value": "0"
//         },
//         {
//           "type": "input",
//           "title": "Passing",
//           "key_value": "passing_shot",
//           "only_numbers": true,
//           "max_num": 999,
//           "default_value": "0"
//         },
//       ]
//     }
//   ],
  
//   "Endgame": [
//     {
//       "type": "header",
//       "title": "Climbing",
//       "headerNum": 1
//     },
//     {
//       "type": "choice",
//       "title": "Climb",
//       "key_value": "climb",
//       "choices": [
//         {"label": "Single Climb", "value": "single", "select_color": "rgba(0, 0, 255, 0.3)"}, 
//         {"label": "Double Climb", "value": "double", "select_color": "rgba(0, 0, 255, 0.3)"}, 
//         {"label": "Park", "value": "park", "select_color": "rgba(0, 0, 255, 0.3)"},
//       ]
//     },
//     {
//       "type": "header",
//       "title": "Robot Trapped",
//       "headerNum": 2
//     },
//     {
//       "type": "checkbox",
//       "key_value": "trap",
//       "title": "Trapped",
//       "select_color": "rgba(0, 0, 255, 0.6)"
//     }
//   ],
//   "General": [
//     {
//       "type": "header",
//       "title": "Played Defense",
//       "headerNum": 1
//     },
//     {
//       "type": "choice",
//       "key_value": "defense",
//       "title": "Played Defense",
//       "choices": [
//         {"label": "Never", "value": "never", "select_color": "rgba(0, 0, 255, 0.3)"}, 
//         {"label": "A little", "value": "little", "select_color": "rgba(0, 0, 255, 0.3)"},
//         {"label": "A while", "value": "while", "select_color": "rgba(0, 0, 255, 0.3)"},
//         {"label": "Always", "value": "always", "select_color": "rgba(0, 0, 255, 0.3)"}
//       ]
//     },
//     {
//       "type": "header",
//       "title": "Notes Stuck",
//       "headerNum": 1
//     },
//     {
//       "type": "choice",
//       "key_value": "note_stuck",
//       "title": "Notes Stuck",
//       "choices": [
//         {"label": "0", "value": "zero", "select_color": "rgba(0, 0, 255, 0.3)"}, 
//         {"label": "1", "value": "one", "select_color": "rgba(0, 0, 255, 0.3)"},
//         {"label": "2+", "value": "twoPlus", "select_color": "rgba(0, 0, 255, 0.3)"}
//       ]
//     },
//     {
//       "type": "header",
//       "title": "Was Disabled",
//       "headerNum": 1
//     },
//     {
//       "type": "choice",
//       "key_value": "disabled",
//       "title": "Was Disabled",
//       "choices": [
//         {"label": "Never", "value": "never", "select_color": "rgba(0, 0, 255, 0.3)"}, 
//         {"label": "Short", "value": "short", "select_color": "rgba(0, 0, 255, 0.3)"},
//         {"label": "Long", "value": "long", "select_color": "rgba(0, 0, 255, 0.3)"},
//         {"label": "Entire Match", "value": "entire", "select_color": "rgba(0, 0, 255, 0.3)"}
//       ]
//     }
//   ]
// });

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
  const json = JSON.parse(jsonString || exampleJson);
  const finalData = {};

  for (const pageIndex in json) {
    const page = json[pageIndex];
    for (const element of page.elements) {
      if (element.key_value) {
        if (element.type === 'choice') {
          // Map the string with the indexes into a list of numbers for the indexes
          const selectedIndexes = element.default_value.replace(',', '').split(' ').map((item) => Number(item));
          const selectedValues = element.choices.filter((choice, index) => selectedIndexes.includes(index)).map((choice) => choice.value); 
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

const styles = StyleSheet.create({
  page: {
    width: '100%',
    height: '100%',
    backgroundColor: Globals.PageColor,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    paddingTop: Platform.OS === 'android' ? 20 : 0,
    margin: 0,
  },
});

export { FormBuilder, GetFormJSONAsMatch, exampleJson };
