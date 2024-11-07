import React, { useEffect, useState, useRef } from "react";
import { View, Text, Dimensions, AppRegistry, Modal, Animated, Button } from "react-native";
import { APIGet, getDatabaseDataFromURL } from "../../backend/APIRequests";
import Globals from "../../Globals";
import LineChart from "../LineGraph";
import { ReanimatedModuleProvider } from "react-native-reanimated";

const TeamsDataScreen = () => {
  const [matches, setMatches] = useState([]);
  const [data, setData] = useState({labels: [], datasets: [{data: []}]});
  const [loaded, setLoaded] = useState(false);
  const loadingOpacity = useRef(new Animated.Value(1)).current;

  const loadingFadeOut = Animated.timing(loadingOpacity, {
    toValue: 0,
    duration: 1000,
    useNativeDriver: true
  });

  const loadingFadeIn = Animated.timing(loadingOpacity, {
    toValue: 1,
    duration: 1000,
    useNativeDriver: true
  });

  async function getMatches() {
    let data = await getDatabaseDataFromURL('/matches', {}, {}, 'localhost', 4000, 3000);
    setMatches(data);
  }

  useEffect(() => { 
    if (matches.length === 0) {
      getMatches();
    }
    loadingFadeOut.start(() => {setLoaded(true)}); // Comment out later
  }, []);

  
  
  // useEffect(() => {
  //   if (matches.length === 0) {
  //     return;
  //   }

  //   // Sort the matches by match number.
  //   matches.sort((a, b) => Number(a.data["0{match_num}"]) - Number(b.data["0{match_num}"]));

  //   setData({
  //     // Change the labels
  //     labels: matches.map((match) => match.data["0{match_num}"]),
  //     // Change the data for each label
  //     datasets: [{data: matches.map((match) => Number(match.data["3{numbers}"]))}]
  //   });

  //   loadingFadeOut.start(() => {setLoaded(true)});
  // }, [matches]);


  const initialData = [
    { x: 0, y: 20 },
    { x: 1, y: 30 },
    { x: 2, y: 10 },
    { x: 3, y: 50 },
    { x: 4, y: 40 },
  ];

  const [testData, setTestData] = useState(initialData);

  const updateData = () => {
    const points = Math.floor(Math.random() * 100) + 2;
    const newData = Array.from({ length: points }, (item, index) => {
      return ({
        x: index,
        y: Math.floor(Math.random() * 100),
      })
    });
    //console.log(a);

    // const newData = testData.map(point => ({
    //   x: point.x,
    //   y: Math.floor(Math.random() * 100),
    // }));
    setTestData(newData);
  };


  return [
    <View style={{flex: 1, backgroundColor: Globals.PageColor, justifyContent: 'center', alignItems: 'center'}}>
      { loaded ? null :
        <Animated.View style={{zIndex: 1000, opacity: loadingOpacity, position: 'absolute', width: '100%', height: '100%', backgroundColor: Globals.PageColor, flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={{color: 'white', fontSize: 50, fontWeight: "bold"}}>Loading API Data...</Text>
        </Animated.View>
      }

      <Text>Bezier Line Chart</Text>
      {/* <LineChart
        data={data}
        width={400} // from react-native
        height={220}
        yAxisInterval={1} // optional, defaults to 1
        yLabelsOffset={10}
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
      /> */}
      <LineChart data={initialData} translation={{x: 50, y: 50}} padding={100} width={1600} height={800}/>
      <Button title="Update Data" onPress={updateData} />
    </View>
  ]
}

export default TeamsDataScreen;