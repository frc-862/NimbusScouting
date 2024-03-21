import { View, StyleSheet, StatusBar, Platform } from "react-native";
import { 
  GradientButton, 
  GradientChoice, 
  GradientDropDown, 
  GradientCheckBox,
  GradientMultiChoice, 
  GradientNumberInput, 
  GradientTextInput,
  GradientTimer,
  GradientCycleTimer,
  GradientQRCode,
} from './GradientComponents';
import {
  HeaderTitle,
  PageHeader,
  PageFooter,
  PageContent,
  RelatedContentContainer,
} from './PageComponents';

// Example JSON string for the form builder:
const exampleJson = JSON.stringify({
  "page_list": ["Auton", "Teleop", "Endgame"],
  "Auton": [
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
          "title": "Notes Collected",
          "default_value": "0",
          "key_value": "notes_collected",
          "only_numbers": true,
          "max_num": 9
        },
        {
          "type": "choice",
          "title": "Collection Location",
          "key_value": "collection_location",
          "choices": [
            {"label": "Starting Line", "value": "start_line", "selectColor": "rgba(0, 0, 255, 0.3)"}, 
            {"label": "Middle", "value": "middle", "selectColor": "rgba(0, 0, 255, 0.3)"},
            {"label": "Preload", "value": "preload", "selectColor": "rgba(0, 0, 255, 0.3)"}
          ],
          "multi_select": true
        }
      ]
    },
    {
      "type": "header",
      "title": "Scoring",
      "props": {
        "headerNum": 1
      }
    },
    {
      "type": "container",
      "children": [
        {
          "type": "input",
          "title": "AMP",
          "default_value": "0",
          "key_value": "amp_scored",
          "only_numbers": true,
          "max_num": 9
        },
        {
          "type": "input",
          "default_value": "0",
          "title": "SPEAKER",
          "key_value": "speaker_scored",
          "only_numbers": true,
          "max_num": 9
        }
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
          "title": "Notes Collected",
          "default_value": "0",
          "key_value": "notes_collected",
          "only_numbers": true,
          "max_num": 999
        },
        {
          "type": "choice",
          "title": "Collection Type",
          "key_value": "collection_type",
          "choices": [
            {"label": "Ground", "value": "ground", "selectColor": "rgba(0, 0, 255, 0.3)"}, 
            {"label": "Substation", "value": "substation", "selectColor": "rgba(0, 0, 255, 0.3)"}
          ],
          "multi_select": true
        }
      ]
    },
    {
      "type": "header",
      "title": "Scoring",
      "props": {
        "headerNum": 1
      }
    },
    {
      "type": "container",
      "children": [
        {
          "type": "input",
          "title": "AMP",
          "default_value": "0",
          "key_value": "amp_scored",
          "only_numbers": true,
          "max_num": 999
        },
        {
          "type": "input",
          "title": "SPEAKER",
          "default_value": "0",
          "key_value": "speaker_scored",
          "only_numbers": true,
          "max_num": 999
        },
        {
          "type": "input",
          "title": "Amplified",
          "default_value": "0",
          "key_value": "amplified_scored",
          "only_numbers": true,
          "max_num": 999
        }
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
      "type": "container",
      "style": {"width": '90%'},
      "children": [
        {
          "type": "choice",
          "title": "Climb",
          "key_value": "climb",
          "choices": [
            {"label": "Climb", "value": "climb", "selectColor": "rgba(0, 0, 255, 0.3)"}, 
            {"label": "Spotlit", "value": "spotlit", "selectColor": "rgba(0, 0, 255, 0.3)"},
            {"label": "Trap", "value": "trap", "selectColor": "rgba(0, 0, 255, 0.3)"}
          ],
          "multi_select": true
        },
        {
          "type": "choice",
          "title": "Harmony",
          "key_value": "harmony",
          "choices": [
            {"label": "Harmony +1", "value": "harmony1", "selectColor": "rgba(0, 0, 255, 0.3)"}, 
            {"label": "Harmony +2", "value": "harmony2", "selectColor": "rgba(0, 0, 255, 0.3)"}
          ]
        },
      ]
    },
    {
      "type": "header",
      "title": "Robot Parked",
      "props": {
        "headerNum": 2
      }
    },
    {
      "type": "checkbox",
      "key_value": "park",
      "title": "Park",
      "props": {
        "select_color": "rgba(0, 0, 255, 0.6)"
      }
    },
    {
      "type": "header",
      "title": "Human Player",
      "props": {
        "headerNum": 1
      }
    },
    {
      "type": "container",
      "children": [
        {
          "type": "input",
          "key_value": "spotlit_attempts",
          "default_value": "0",
          "title": "Spotlit Attempts",
          "only_numbers": true,
          "max_num": 3
        },
        {
          "type": "input",
          "key_value": "successful_spotlits",
          "default_value": "0",
          "title": "Successful Attempts",
          "only_numbers": true,
          "max_num": 3
        }
      ]
    }
  ]
});

const FormBuilderPageShell = (props) => {
  return (
    <View style={[styles.page, props.style]}>
      <PageHeader gradientDir={props.gradientDir} title={props.title}/>

      <PageContent gradientDir={props.gradientDir} statePackage={props.statePackage} scrollable={true}>
        {props.children}
      </PageContent>

      <PageFooter gradientDir={props.gradientDir} statePackage={props.statePackage}/>        
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
      if (props.only_numbers) {
        return (<GradientNumberInput key={index} a={"a"} default_value={props.default_value} key_value={props.key_value} title={props.title} style={props.style} maxNum={props.max_num}/>);
      }
      return (<GradientTextInput key={index} a={"a"} default_value={props.default_value} key_value={props.key_value} title={props.title} style={props.style}/>);
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
  const json = jsonString || JSON.parse(exampleJson);
  let finalPages = [];
  for (let pageNameIndex in json.page_list) {
    let page = json[json.page_list[pageNameIndex]];

    let pageComponents = [];

    for (let componentIndex in page) {
      let component = page[componentIndex];

      pageComponents.push(FormBuilderElement(component, componentIndex));
    }
    finalPages.push(({style, statePackage, gradientDir}) => (<FormBuilderPageShell title={json.page_list[pageNameIndex]} style={style} statePackage={statePackage} gradientDir={gradientDir}>{pageComponents}</FormBuilderPageShell>));
  }
  return finalPages;
}

const styles = StyleSheet.create({
  page: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgb(0, 0, 65)',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    paddingTop: Platform.OS === 'android' ? 20 : 0,
    margin: 0,
  },
});

export { FormBuilder, GetFormJSONAsMatch, EncodeJSON, DecodeJSON };
