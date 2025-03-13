import React from "react";
import { ScrollView, Text, View } from "react-native";
import Globals from "../../../Globals";
import FormBuildScreenContext from "../../../contexts/FormBuildScreenContext";


// https://stackoverflow.com/questions/4810841/pretty-print-json-using-javascript
function syntaxHighlight(json: any) {
  if (typeof json != 'string') {
       json = JSON.stringify(json, undefined, 2);
  }
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // const clsColors = {
  //   'string': 'green',
  //   'number': 'darkorange;',
  //   'boolean': 'blue;',
  //   'null': 'magenta;',
  //   'key': 'red;'
  // }

  // const parts: string[] = json.split("\n");
  // const syntaxParts = parts.map((part: string) => {
  //   return part.replace(/(?!\B"[^"]*)\s+(?![^"]*"\B)/g, '');
  //   // var cls: 'string' | 'number' | 'boolean' | 'null' | 'key' = 'number';

  //   // if (part === '' || part === undefined) {
  //   //   return <Text></Text>;
  //   // }

  //   // if (part.length === 1 && part !== " ") {
  //   //   return <Text></Text>
  //   // }




  //   // if (/^"/.test(part)) {
  //   //     if (/:$/.test(part)) {
  //   //         cls = 'key';
  //   //     } else {
  //   //         cls = 'string';
  //   //     }
  //   // } else if (/true|false/.test(part)) {
  //   //     cls = 'boolean';
  //   // } else if (/null/.test(part)) {
  //   //     cls = 'null';
  //   // }
  //   // return <Text style={{color: clsColors[cls]}}>{part}</Text>
  //   // return '<span class="' + cls + '">' + part + '</span>';
  // })
  // console.log(syntaxParts);

  return <Text style={{color: 'white'}}>{json}</Text>;

  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match: string) {
      var cls = 'number';
      if (/^"/.test(match)) {
          if (/:$/.test(match)) {
              cls = 'key';
          } else {
              cls = 'string';
          }
      } else if (/true|false/.test(match)) {
          cls = 'boolean';
      } else if (/null/.test(match)) {
          cls = 'null';
      }
      return '<span class="' + cls + '">' + match + '</span>';
  });
}

export default function FormJsonView() {
  const ctx = React.useContext(FormBuildScreenContext);

  return (
    <ScrollView style={{flex: 1, backgroundColor: Globals.PageContainerColor, overflow: 'hidden'}}>
      { syntaxHighlight(ctx.formJson) }
    </ScrollView>
  )
}