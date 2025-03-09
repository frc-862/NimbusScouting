// Objects are Pass By Reference, so I needed this
import React from "react";
import { ScrollView, Text, View } from "react-native";
import Globals from "../../../Globals";
import FormBuildScreenContext, { FormBuildScreenContextType } from "../../../contexts/FormBuildScreenContext";
import FormJsonView from "./FormJsonView";
import PagesListView from "./PagesListView";
import FormBuildExampleView from "./FormBulidExampleView";

// https://stackoverflow.com/questions/7574054/javascript-how-to-pass-object-by-value - Paul Varghese
function clone(obj: any){
  if(obj == null || typeof(obj) != 'object')
      return obj;

  var temp = new obj.constructor(); 
  for(var key in obj)
      temp[key] = clone(obj[key]);

  return temp;
}

// https://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript?page=1&tab=scoredesc#tab-top
function toTitleCase(str: string) {
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

export default function FormBuildingScreenv2() {
  const [formJson, setFormJson] = React.useState([]);
  const [pages, setPages] = React.useState([{name: "aaaaa", uuid: uuidv4(), elements: []}, {name: "bbbbb", uuid: uuidv4(), elements: []}]);

  const ctx: FormBuildScreenContextType = {
    formJson,
    pages,
  }

  return (
    <FormBuildScreenContext.Provider value={ctx}>
      <View style={{flex: 1, flexDirection: 'row', backgroundColor: Globals.PageColor}}>
        <PagesListView onPress={(index: number) => {console.log("Pressed Page: " + index)}}/>

        <FormBuildExampleView>
          <Text style={{color: 'white'}}>SHOW EXAMPLE</Text>
        </FormBuildExampleView>
        
        <FormJsonView />
      </View>
    </FormBuildScreenContext.Provider>
  )
}