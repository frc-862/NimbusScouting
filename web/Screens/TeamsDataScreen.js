import React, { useEffect, useState } from "react";
import { View, Text, Dimensions, AppRegistry, Modal } from "react-native";
import { LineChart } from 'react-native-chart-kit';
import { APIGet, getDatabaseDataFromURL } from "../../backend/APIRequests";
import Globals from "../../Globals";

const TeamsDataScreen = () => {
  //const [APIData, setAPIData] = useState([]);
  // const [filters, setFilters] = useState(["2638"]);
  // const [yFilter, setYFilter] = useState("number");


  // useEffect(() => {
  //   APIGet("http://localhost:4000/matches", 3000).then((data) => {console.log(data); setAPIData(data);});
  // }, []);

  // const filteredMatches = APIData.filter((item) => filters.includes(item.team_info.split("-")[0])).sort((a, b) => a['number'] - b['number']);
  //console.log(filteredMatches);
  const data = {
    labels: ["a", "b", "c"],//filteredMatches.map((item) => item['number']),
    datasets: [
      {
        data: [1, 2, 3]//filteredMatches.map((item) => item[yFilter])
      }
    ]
  }

  return [
    <View style={{flex: 1, backgroundColor: Globals.PageColor, justifyContent: 'center', alignItems: 'center'}}>
      <Text>Bezier Line Chart</Text>
      <LineChart
        data={data}
        width={400} // from react-native
        height={220}
        yAxisInterval={1} // optional, defaults to 1
        yLabelsOffset={1}
        bezier
        chartConfig={{
          backgroundColor: "#e26a00",
          backgroundGradientFrom: "#fb8c00",
          backgroundGradientTo: "#ffa726",
          decimalPlaces: 0, // optional, defaults to 2dp
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16
          },
          propsForDots: {
            r: "4",
            strokeWidth: "2",
            stroke: "#ffa726"
          }
        }}
        withVerticalLines={true}
        withHorizontalLines={true}
        
        style={{
          marginVertical: 8,
          borderRadius: 16
        }}
      />
    </View>,
    // <Modal visible={APIData.length === 0} transparent style={{zIndex: -1000}} animationType={APIData.length !== 0 ? "fade" : "none"}>
    //   <View style={{backgroundColor: Globals.PageColor, flex: 1, justifyContent: 'center', alignItems: 'center'}}>
    //     <Text style={{color: 'white', fontSize: 50, fontWeight: "bold"}}>Loading API Data...</Text>
    //   </View>
    // </Modal>
  ]
}

export default TeamsDataScreen;