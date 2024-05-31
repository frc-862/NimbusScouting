import { WebCheckbox, WebInput, WebChoice, WebHeader } from "./Components"

const Elements = {
  'checkbox': <WebCheckbox/>,
  'input': <WebInput/>,
  'choice': <WebChoice/>,
  'label': <WebHeader emulatedStyle={{width: '90%'}} style={{textAlign: 'center'}} fontSize={20}/>
}

const ElementJSON = {
  'checkbox': {
    type: 'checkbox', 
    title: 'Checkbox',
  },
  'input': {
    type: 'input', 
    title: 'Input',
  },
  'choice': {
    type: 'choice', 
    title: 'Choice', 
    choices: [
      {label: '1', value: 'one', select_color: 'rgba(0, 0, 0, 0)'}, 
      {label: '2', value: 'two', select_color: 'rgba(0, 0, 0, 0)'}, 
      {label: '3', value: 'three', select_color: 'rgba(0, 0, 0, 0)'}
    ]
  },
  'label': {
    type: 'label', 
    title: 'Label', 
    fontSize: 20
  },
}

const ElementProperties = {
  'checkbox': [
    {name: 'title', type: 'string'},
    {name: 'key_value', display_name: 'Key', type: 'string'},
    {name: 'default_value', display_name: 'Checked', type: 'boolean'},
    {name: 'checkedColor', display_name: 'Color', type: 'color'}
  ],
  'input': [
    {name: 'title', type: 'string'},
    {name: 'key_value', display_name: 'Key', type: 'string'},
    {name: 'default_value', display_name: 'Default', type: 'string'}
  ],
  'choice': [
    {name: 'title', type: 'string'},
    {name: 'key_value', display_name: 'Key', type: 'string'},
    {name: 'default_value', display_name: 'Selected Indexes', type: 'string'},
    {name: 'choices', type: 'list', listType: 'object', 
      properties: [
        {name: 'label', type: 'string'},
        {name: 'value', type: 'string'},
        {name: 'select_color', display_name: 'Color', type: 'color'}
      ]
    }
  ],
  'label': [
    {name: 'title', type: 'string'},
    {name: 'fontSize', display_name: 'Font Size', type: 'number'},
  ]
}

export {Elements, ElementJSON, ElementProperties}