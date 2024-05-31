import React from 'react';
import { View, Text } from "react-native";
import Globals from '../../Globals';
import { AppButton, AppCheckbox, AppChoice, AppInput, AppLabel } from '../../GlobalComponents';

const ComponenetTestingScreen = () => {
  return (
    <View style={{flex: 1, flexDirection: 'row', flexWrap: 'wrap', backgroundColor: Globals.PageColor, justifyContent: 'space-evenly', alignContent: 'space-around'}}>
      <View style={{width: '30%', height: '30%', justifyContent: 'center', alignItems: 'center', backgroundColor: 'hsl(240, 70%, 20%)', borderRadius: 20}}>
        <AppLabel title={"Label"}/>
        <AppButton>
          <Text style={{color: 'white'}}>Text</Text>
        </AppButton>
        <AppCheckbox>
          <Text style={{color: 'white'}}>X</Text>
        </AppCheckbox>
        <AppInput default_value={'AA'} showTitle={true} title={"AAA"}/>
        <AppChoice choices={[
            {label: 'Cheese and other cheese', value: 'A', select_color: 'rgba(0, 0, 0, 0.5)'},
            {label: 'B', value: 'B'},
            {label: 'C', value: 'C'},
            {label: 'D', value: 'D'},
            {label: 'E', value: 'E'},
            {label: 'F', value: 'F'},
            {label: 'G', value: 'G'},
          ]}
          showTitle={true}
          title={"Cheeses"}
        />
      </View>
      <View style={{width: '40%', height: '40%', justifyContent: 'center', alignItems: 'center', backgroundColor: 'hsl(240, 70%, 20%)', borderRadius: 20}}>
        <AppLabel title={"Label"}/>
        <AppButton>
          <Text style={{color: 'white'}}>Text</Text>
        </AppButton>
        <AppCheckbox>
          <Text style={{color: 'white'}}>X</Text>
        </AppCheckbox>
        <AppInput default_value={'AA'} showTitle={true} title={"AAA"}/>
        <AppChoice choices={[
            {label: 'A', value: 'A', select_color: 'rgba(0, 0, 0, 0.5)'},
            {label: 'B', value: 'B'},
            {label: 'C', value: 'C'},
            {label: 'D', value: 'D'},
            {label: 'E', value: 'E'},
            {label: 'F', value: 'F'},
            {label: 'G', value: 'G'},
          ]}
          showTitle={true}
          title={"Cheeses"}
        />
      </View>
      <View style={{width: '20%', height: '35%', justifyContent: 'center', alignItems: 'center', backgroundColor: 'hsl(240, 70%, 20%)', borderRadius: 20}}>
        <AppLabel title={"Label"}/>
        <AppButton>
          <Text style={{color: 'white'}}>Text</Text>
        </AppButton>
        <AppCheckbox>
          <Text style={{color: 'white'}}>X</Text>
        </AppCheckbox>
        <AppInput default_value={'AA'} showTitle={true} title={"AAA"}/>
        <AppChoice choices={[
            {label: 'A', value: 'A', select_color: 'rgba(0, 0, 0, 0.5)'},
            {label: 'B', value: 'B'},
            {label: 'C', value: 'C'},
            {label: 'D', value: 'D'},
            {label: 'E', value: 'E'},
            {label: 'F', value: 'F'},
            {label: 'G', value: 'G'},
          ]}
          showTitle={true}
          title={"Cheeses"}
        />
      </View>
      <View style={{width: 300, height: 300, justifyContent: 'center', alignItems: 'center', backgroundColor: 'hsl(240, 70%, 20%)', borderRadius: 20}}>
        <AppLabel title={"Label"}/>
        <AppButton>
          <Text style={{color: 'white'}}>Text</Text>
        </AppButton>
        <AppCheckbox>
          <Text style={{color: 'white'}}>X</Text>
        </AppCheckbox>
        <AppInput default_value={'AA'} showTitle={true} title={"AAA"}/>
        <AppChoice choices={[
            {label: 'A', value: 'A', select_color: 'rgba(0, 0, 0, 0.5)'},
            {label: 'B', value: 'B'},
            {label: 'C', value: 'C'},
            {label: 'D', value: 'D'},
            {label: 'E', value: 'E'},
            {label: 'F', value: 'F'},
            {label: 'G', value: 'G'},
          ]}
          showTitle={true}
          title={"Cheeses"}
        />
      </View>
      <View style={{width: 200, height: 400, justifyContent: 'center', alignItems: 'center', backgroundColor: 'hsl(240, 70%, 20%)', borderRadius: 20}}>
        <AppLabel title={"Label"}/>
        <AppButton>
          <Text style={{color: 'white'}}>Text</Text>
        </AppButton>
        <AppCheckbox>
          <Text style={{color: 'white'}}>X</Text>
        </AppCheckbox>
        <AppInput default_value={'AA'} showTitle={true} title={"AAA"}/>
        <AppChoice choices={[
            {label: 'A', value: 'A', select_color: 'rgba(0, 0, 0, 0.5)'},
            {label: 'B', value: 'B'},
            {label: 'C', value: 'C'},
            {label: 'D', value: 'D'},
            {label: 'E', value: 'E'},
            {label: 'F', value: 'F'},
            {label: 'G', value: 'G'},
          ]}
          showTitle={true}
          title={"Cheeses"}
        />
      </View>
      <View style={{width: 100, height: 350, justifyContent: 'center', alignItems: 'center', backgroundColor: 'hsl(240, 70%, 20%)', borderRadius: 20}}>
        <AppLabel title={"Label"}/>
        <AppButton>
          <Text style={{color: 'white'}}>Text</Text>
        </AppButton>
        <AppCheckbox>
          <Text style={{color: 'white'}}>X</Text>
        </AppCheckbox>
        <AppInput default_value={'AA'} showTitle={true} title={"AAA"}/>
        <AppChoice choices={[
            {label: 'A', value: 'A', select_color: 'rgba(0, 0, 0, 0.5)'},
            {label: 'B', value: 'B'},
            {label: 'C', value: 'C'},
            {label: 'D', value: 'D'},
            {label: 'E', value: 'E'},
            {label: 'F', value: 'F'},
            {label: 'G', value: 'G'},
          ]}
          showTitle={true}
          title={"Cheeses"}
        />
      </View>
    </View>
  )
}

export default ComponenetTestingScreen;