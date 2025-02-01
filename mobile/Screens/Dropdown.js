/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import Globals from '../../Globals';

const DropdownComponent = ({outerStyle, style, default_value, data, dropdownPosition="auto", placeholder = "Dropdown 1", onChange = (item) => {}, onBlur = () => {}, onFocus = () => {}}) => {
  // console.log(default_value, data.some((item) => item.value === default_value));
  if (data === undefined) {
    data = [
      { label: 'KKKKKKKKKKKKKKKKKKK', value: 'k' },
      { label: 'Item 2', value: '2' },
      { label: 'Item 3', value: '3' },
      { label: 'Item 4', value: '4' },
      { label: 'Item 5', value: '5' },
      { label: 'Item 6', value: '6' },
      { label: 'Item 7', value: '7' },
      { label: 'Item 8', value: '8' },
    ];
  }

  const [value, setValue] = useState(data.some((item) => item.value === default_value) ? default_value : "");
  const [isFocus, setIsFocus] = useState(false);

  const renderLabel = () => {
    if (value || isFocus) {
      return (
        <Text style={[styles.label, { color: Globals.TextColor, borderColor: isFocus ? Globals.GradientColor2 : Globals.ButtonColor}]}>
          {placeholder}
        </Text>
      );
    }
    return null;
  };

  return (
    <View style={[styles.container, outerStyle]}>
      {renderLabel()}
      <Dropdown
        style={[styles.dropdown, { borderColor: isFocus ? Globals.GradientColor2 : Globals.ButtonColor }, style]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        data={data}
        autoScroll
        keyboardAvoiding={true}
        dropdownPosition={dropdownPosition}
        search
        // maxHeight={300}
        // minHeight={100}
        labelField="label"
        valueField="value"
        placeholder={!isFocus ? placeholder : '...'}
        searchPlaceholder="Search..."
        value={value}
        onFocus={() => {setIsFocus(true); onFocus();}}
        onBlur={() => {setIsFocus(false); onBlur();}}
        onChange={(item) => {
          setValue(item.value);
          setIsFocus(false);
          onChange(item);
        }}
      />
    </View>
  );
};

// const data = [
//   { label: 'Item 1', value: '1' },
//   { label: 'Item 2', value: '2' },
//   { label: 'Item 3', value: '3' },
// ];

// const DropdownComponent = () => {
//   const [value, setValue] = useState(null);

//   return (
//     <View style={[styles.container]}>
//       <Dropdown
//         style={styles.dropdown}
//         placeholderStyle={styles.placeholderStyle}
//         selectedTextStyle={styles.selectedTextStyle}
//         inputSearchStyle={styles.inputSearchStyle}
//         iconStyle={styles.iconStyle}
//         data={data}
//         labelField="label"
//         valueField="value"
//         placeholder="Select item"
//         autoScroll
//         search
//         value={value}
//         onChange={item => setValue(item.value)}
//       />
//     </View>
//   );
// };

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  dropdown: {
    width: '100%',
    height: 75,
    backgroundColor: Globals.ButtonColor,
    borderColor: 'gray',
    borderWidth: 2,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 0,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: 'absolute',
    fontWeight: 'bold',
    left: 18,
    top: -8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: Globals.ButtonColor,
    backgroundColor: Globals.ButtonColor,
    overflow: 'hidden',
  },
  placeholderStyle: {
    fontSize: 16,
    height: 75,
    lineHeight: 75,
    color: Globals.TextColor,
  },
  selectedTextStyle: {
    fontSize: 16,
    height: 75,
    lineHeight: 75,
    color: Globals.TextColor,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});

export default DropdownComponent;