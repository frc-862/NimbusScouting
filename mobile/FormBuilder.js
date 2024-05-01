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
import Globals from "./Globals";
import { useContext } from "react";
import AppContext from "../components/AppContext";

// Example JSON string for the form builder:
const exampleJson = JSON.stringify({
  "page_list": ["Auton", "Teleop", "Endgame", "General"],
  "Auton": [
    {
      "type": "header",
      "title": "Starting Position",
      "props": {
        "headerNum": 2
      }
    },
    {
      "type": "choice",
      "title": "Starting Position",
      "key_value": "starting_position",
      "choices": [
        {"label": "Amp", "value": "amp", "selectColor": "rgba(0, 0, 255, 0.3)"},
        {"label": "Center", "value": "center", "selectColor": "rgba(0, 0, 255, 0.3)"},
        {"label": "Source", "value": "source", "selectColor": "rgba(0, 0, 255, 0.3)"}
      ],
    },
    {
      "type": "header",
      "title": "Collection",
      "props": {
        "headerNum": 2
      }
    },
    { 
      "type": "container",
      "style": {"width": '90%'},
      "children": [
        {
          "type": "input",
          "title": "Notes Collected",
          "key_value": "notes_collected",
          "props": {
            "only_numbers": true,
            "max_num": 9,
            "default_value": "0"
          }
        },
        {
          "type": "choice",
          "title": "Collection Location",
          "key_value": "collection_location",
          "choices": [
            {"label": "Starting Line", "value": "start_line", "selectColor": "rgba(0, 0, 255, 0.3)"}, 
            {"label": "Center Line", "value": "center_line", "selectColor": "rgba(0, 0, 255, 0.3)"},
          ],
          "multi_select": true
        }
      ]
    },
    {
      "type": "header",
      "title": "Scoring",
      "props": {
        "headerNum": 2
      }
    },
    {
      "type": "container",
      "children": [
        {
          "type": "input",
          "title": "SPEAKER",
          "key_value": "speaker_scored",
          "props": {
            "only_numbers": true,
            "max_num": 9,
            "default_value": "0"
          }
        },
        {
          "type": "input",
          "title": "AMP",
          "key_value": "amp_scored",
          "props": {
            "only_numbers": true,
            "max_num": 9,
            "default_value": "0"
          }
        },
      ]
    },
    {
      "type": "header",
      "title": "Leave Starting Zone",
      "props": {
        "headerNum": 2
      }
    },
    {
      "type": "checkbox",
      "key_value": "leave",
      "title": "Leave",
      "props": {
        "select_color": "rgba(0, 0, 255, 0.6)"
      }
    }
  ],

  "Teleop": [
    {
      "type": "header",
      "title": "Collection",
      "props": {
        "headerNum": 1
      }
    },
    { 
      "type": "container",
      "style": {"width": '90%'},
      "children": [
        {
          "type": "input",
          "title": "Ground",
          "key_value": "ground_collect",
          "props": {
            "only_numbers": true,
            "max_num": 999,
            "default_value": "0"
          }
        },
        {
          "type": "input",
          "title": "Source Ground",
          "key_value": "source_ground_collect",
          "props": {
            "only_numbers": true,
            "max_num": 999,
            "default_value": "0"
          }
        },
        {
          "type": "input",
          "title": "Source Chute",
          "key_value": "source_chute_collect",
          "props": {
            "only_numbers": true,
            "max_num": 999,
            "default_value": "0"
          }
        },
      ]
    },
    {
      "type": "header",
      "title": "Shooting",
      "props": {
        "headerNum": 1
      }
    },
    {
      "type": "container",
      "children": [
        {
          "type": "input",
          "title": "SPEAKER",
          "key_value": "speaker_scored",
          "props": {
            "only_numbers": true,
            "max_num": 999,
            "default_value": "0"
          }
        },
        {
          "type": "input",
          "title": "AMP",
          "key_value": "amp_scored",
          "props": {
            "only_numbers": true,
            "max_num": 999,
            "default_value": "0"
          }
        },
        {
          "type": "input",
          "title": "Passing",
          "key_value": "passing_shot",
          "props": {
            "only_numbers": true,
            "max_num": 999,
            "default_value": "0"
          }
        },
      ]
    }
  ],
  
  "Endgame": [
    {
      "type": "header",
      "title": "Climbing",
      "props": {
        "headerNum": 1
      }
    },
    {
      "type": "choice",
      "title": "Climb",
      "key_value": "climb",
      "choices": [
        {"label": "Single Climb", "value": "single", "selectColor": "rgba(0, 0, 255, 0.3)"}, 
        {"label": "Double Climb", "value": "double", "selectColor": "rgba(0, 0, 255, 0.3)"}, 
        {"label": "Park", "value": "park", "selectColor": "rgba(0, 0, 255, 0.3)"},
      ]
    },
    {
      "type": "header",
      "title": "Robot Trapped",
      "props": {
        "headerNum": 2
      }
    },
    {
      "type": "checkbox",
      "key_value": "trap",
      "title": "Trapped",
      "props": {
        "select_color": "rgba(0, 0, 255, 0.6)"
      }
    }
  ],
  "General": [
    {
      "type": "header",
      "title": "Played Defense",
      "props": {
        "headerNum": 1
      }
    },
    {
      "type": "choice",
      "key_value": "defense",
      "title": "Played Defense",
      "choices": [
        {"label": "Never", "value": "never", "selectColor": "rgba(0, 0, 255, 0.3)"}, 
        {"label": "A little", "value": "little", "selectColor": "rgba(0, 0, 255, 0.3)"},
        {"label": "A while", "value": "while", "selectColor": "rgba(0, 0, 255, 0.3)"},
        {"label": "Always", "value": "always", "selectColor": "rgba(0, 0, 255, 0.3)"}
      ]
    },
    {
      "type": "header",
      "title": "Notes Stuck",
      "props": {
        "headerNum": 1
      }
    },
    {
      "type": "choice",
      "key_value": "note_stuck",
      "title": "Notes Stuck",
      "choices": [
        {"label": "0", "value": "zero", "selectColor": "rgba(0, 0, 255, 0.3)"}, 
        {"label": "1", "value": "one", "selectColor": "rgba(0, 0, 255, 0.3)"},
        {"label": "2+", "value": "twoPlus", "selectColor": "rgba(0, 0, 255, 0.3)"}
      ]
    },
    {
      "type": "header",
      "title": "Was Disabled",
      "props": {
        "headerNum": 1
      }
    },
    {
      "type": "choice",
      "key_value": "disabled",
      "title": "Was Disabled",
      "choices": [
        {"label": "Never", "value": "never", "selectColor": "rgba(0, 0, 255, 0.3)"}, 
        {"label": "Short", "value": "short", "selectColor": "rgba(0, 0, 255, 0.3)"},
        {"label": "Long", "value": "long", "selectColor": "rgba(0, 0, 255, 0.3)"},
        {"label": "Entire Match", "value": "entire", "selectColor": "rgba(0, 0, 255, 0.3)"}
      ]
    }
  ]
});

const FormBuilderPageShell = (props) => {
  const ctx = useContext(AppContext);

  return (
    <View style={[styles.page, props.style]}>
      <PageHeader gradientDir={props.gradientDir} infoText={`Event: ${ctx.APIData.event.slice(0, 4) + " " + ctx.APIData.event_name}`} title={props.title}/>

      <PageContent gradientDir={props.gradientDir} scrollable={true}>
        {props.children}
      </PageContent>

      <PageFooter gradientDir={props.gradientDir}/>        
      <StatusBar style="light" />
    </View>
  )
}

/*
  In the JSON strings inputted into the form builder, every element must have a type.
  This type will determine what the form builder will render.

  After, most elements will have a title and key_value, depending on what they are used for.
  Additionally, elements may have a prop object, which will be used to determine the properties of the element on render.
*/

function FormBuilderElement(props, index) {
  switch (props.type) {
    case "header":
      // Returns a header title with the properties that were inputted.
      return (<HeaderTitle key={index} title={props.title} style={props.style} headerNum={props.props.headerNum}/>);
    case "container":
      // Returns a header title with the properties and the children (so it is recursive) that were inputted.
      return (<RelatedContentContainer key={index} style={props.style}>{props.children.map(((child, index) => FormBuilderElement(child, index)))}</RelatedContentContainer>);
    case "input":
      // Returns a text input with the properties that were inputted.
      if (props.props.only_numbers) {
        return (<GradientNumberInput key={index} a={"a"} default_value={props.props.default_value} key_value={props.key_value} title={props.title} style={{height: 100}} maxNum={props.props.max_num}/>);
      }
      return (<GradientTextInput key={index} a={"a"} default_value={props.default_value} key_value={props.key_value} title={props.title} style={{height: 100}}/>);
    case "checkbox":
      // Returns a checkbox with the properties that were inputted.
      return (<GradientCheckBox key={index} key_value={props.key_value} title={props.title} style={props.style} selectColor={props.props.select_color}/>);
    case "choice":
      // Returns a choice with the properties that were inputted.
      return (<GradientChoice key={index} key_value={props.key_value} title={props.title} data={props.choices} multiselect={props.multi_select} style={props.style}/>);
    default:
      // Otherwise, just an empty view.
      return (<View></View>);
  }
}

const GetFormJSONAsMatch = (formJsonString) => {
  const formJson = JSON.parse(formJsonString || exampleJson);
  const finalData = {};
  const pageList = [];

  const UnpackJSONToMatch = (listToUnpack, finalData, pageName) => {
    for (let i in listToUnpack) {
      let component = listToUnpack[i];  
      if (component.type == "container") { UnpackJSONToMatch(component.children, finalData, pageName); }
      // If the component does not have a key_value, it is not a component that will be used to store data.
      if (!component.hasOwnProperty("key_value")) { continue; }

      let default_value = component.default_value || "";
      if (component.type == "checkbox") { default_value = default_value || false; }
      if (component.only_numbers) { default_value = default_value || 0 }

      // Store an empty value to start.
      finalData[pageName.toLowerCase()][component.key_value] = default_value;
    }
  }

  for (let pageNameIndex in formJson.page_list) {
    const pageName = formJson.page_list[pageNameIndex];

    pageList.push(pageName.toLowerCase());
    finalData[pageName.toLowerCase()] = {};

    UnpackJSONToMatch(formJson[pageName], finalData, pageName)
  }

  finalData.page_keys = pageList;

  return finalData;
}

const EncodeJSON = (json, formString) => {
  const formJson = JSON.parse(formString || exampleJson);
  const finalData = {};
  let num = 0;

  const UnpackJSONToEncoded = (listToUnpack, finalData, pageName, pageNum) => {
    for (let i in listToUnpack) {
      let component = listToUnpack[i];  
      if (component.type == "container") { UnpackJSONToEncoded(component.children, finalData, pageName, pageNum); }
      // If the component does not have a key_value, it is not a component that will be used to store data.
      if (!component.hasOwnProperty("key_value")) { continue; }
      // Store an empty value to start.
      finalData[pageNum][num] = json[pageName.toLowerCase()][component.key_value];
      num++;
    }
  }

  for (let pageNameIndex in formJson.page_list) {
    const pageName = formJson.page_list[pageNameIndex];
    const page = formJson[pageName];

    finalData[num] = {};
    num++;

    const pageNum = num - 1;

    UnpackJSONToEncoded(page, finalData, pageName, pageNum)
  }

  finalData["page_keys"] = json["page_keys"];
  finalData["event"] = json["event"];
  finalData["prematch"] = json["prematch"];
  finalData["view_only"] = json["view_only"];
  finalData["scout_name"] = json["scout_name"];

  return finalData;
}

const DecodeJSON = (json, formString) => {
  const formJson = JSON.parse(formString || exampleJson);
  const finalData = {};
  let num = 0;

  const UnpackJSONToDecoded = (listToUnpack, finalData, pageName, pageNum) => {
    for (let i in listToUnpack) {
      let component = listToUnpack[i];  
      if (component.type == "container") { UnpackJSONToDecoded(component.children, finalData, pageName, pageNum); }
      // If the component does not have a key_value, it is not a component that will be used to store data.
      if (!component.hasOwnProperty("key_value")) { continue; }
      // Store an empty value to start.
      finalData[pageName.toLowerCase()][component.key_value] = json[pageNum][num];
      num++;
    }
  }

  for (let pageNameIndex in formJson.page_list) {
    const pageName = formJson.page_list[pageNameIndex];
    const page = formJson[pageName];

    finalData[pageName.toLowerCase()] = {};
    num++;

    const pageNum = num - 1;

    UnpackJSONToDecoded(page, finalData, pageName, pageNum)
  }

  finalData["page_keys"] = json["page_keys"];
  finalData["event"] = json["event"];
  finalData["prematch"] = json["prematch"];
  finalData["view_only"] = json["view_only"];
  finalData["scout_name"] = json["scout_name"];

  return finalData;
}

const FormBuilder = (jsonString) => {
  const json = JSON.parse(jsonString || exampleJson);
  let finalPages = [];
  for (let pageNameIndex in json.page_list) {
    let page = json[json.page_list[pageNameIndex]];

    let pageComponents = [];

    for (let componentIndex in page) {
      let component = page[componentIndex];

      pageComponents.push(FormBuilderElement(component, componentIndex));
    }
    finalPages.push(({style, gradientDir}) => 
    (
      <FormBuilderPageShell 
        title={json.page_list[pageNameIndex]} 
        style={style}
        gradientDir={gradientDir}
      >
          {pageComponents}
      </FormBuilderPageShell>));
  }

  console.log("Final Pages:", finalPages)

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

export { FormBuilder, GetFormJSONAsMatch, EncodeJSON, DecodeJSON, exampleJson };
