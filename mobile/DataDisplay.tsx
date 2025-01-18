import React, { useEffect, useState } from 'react';

import LineChart from './LineGraph';
import PieChart from './PieChart';
import { HeaderTitle } from './PageComponents';

import { View, Text, ScrollView, Pressable } from "react-native";
import { GradientButton } from './GradientComponents';
import { AppCheckbox } from '../GlobalComponents';



interface DataDisplayProps {
  dataFilters: { 
    form: any;
    dataYValues: {
      value: string;
      conditionalValue?: any;
    }[];
    overrideXAxisValue?: string;
    dataUse: string;
  };
  d: any[];
  displayStyleOverride?: any;
  onDisplaySizeChange?: (recomSize: {x: number, y: number}) => void;
}

const DataDisplay : React.FC<DataDisplayProps> = ({
  dataFilters, d, displayStyleOverride, onDisplaySizeChange = (recomSize: {x: number, y: number}) => {}
}) => {

  const [data, setData] = useState<{x: number[], y: any[][]}>({x: [], y: [[]]});
  // How our data show be displayed. ("auto" means that we want it to choose a line chart for numerical data, and a pie chart for categorical data, or a percentage thingy or something for true/false values)
  const [displayStyle, setDisplayStyle] = useState<string | undefined>(undefined);


  useEffect(() => {
    // If we have not been given any data, return nothing.
    if (!d) {
      return;
    }

    // Filter our data for use in constructing the graphs, or rankings, or avg, etc.
    filterData(d);
  }, [d, dataFilters, displayStyleOverride]);


  // Get the type of data we are working with.
  function getDisplayType(data: any[]) {
    if (displayStyleOverride != "auto") {
      return displayStyleOverride;
    }

    if (data.length === 0) {
      return undefined;
    }

    if (data[0].constructor == Boolean)
      return "percentage";
    else if (data[0].constructor == Array || data[0].constructor == String)
      return "pie";
    else if (!isNaN(data[0]))
      return "line";
    else
      return undefined;
  }

  // Filter our data for use in constructing the graphs, or rankings, or avg, etc.
  function filterData(rawData: any[]) {
    const finalData = [];
    let graphType = undefined;

    // If there is no data, dont try doing anything with it. 
    if (rawData.length === 0 || !rawData) {
      return undefined;
    }

    // console.log(rawData[0].data.event);
    // First, filter our data by the form.
    let filteredData = rawData.filter((match: any) => match.data.form.name === dataFilters.form.name && match.data.form.year === dataFilters.form.year);

    // First loop through the conditional values, and filter the data by them.
    for (let dataY of dataFilters.dataYValues) {
      if (!dataY.conditionalValue && dataY.conditionalValue !== 0) {
        continue
      }

      console.log("Condition: ", dataY.value, "", dataY.conditionalValue);
      // Filter the data by the conditional value. (Each match that the data is being pulled from must have the conditional value)
      filteredData = filteredData.filter((match: any) => String(match.data[dataY.value]) === String(dataY.conditionalValue));
    }

    // Next, loop through everything else, making sure that our y values are not conditional, finding the data for the lines.
    for (const dataY of dataFilters.dataYValues) {
      if (dataY.conditionalValue || dataY.conditionalValue === 0) {
        continue;
      }

      let isFaultyData = false;

      // Next, filter our data by the value and page. 
      const yData = filteredData.map((match) => {
        const val = match.data[dataY.value];

        // Something is going on w/ our data, so we should not use it.
        if (val === null || val === undefined) {
          isFaultyData = true;
        }

        return val;
      });

      // As long as our data is not faulty (nothing went wrong), add it to the final data.
      if (isFaultyData) {
        continue;
      }

      // Make sure to find what kind of data we are working with, and if it is not the same as the other data, give an error.
      let typeFound = getDisplayType(yData);
      if (graphType !== undefined && graphType !== typeFound) {
        console.log("Data types do not match!");
        return undefined;
      }
      graphType = typeFound;
    
      finalData.push(yData);
    }

    let xData: number[] = [];
    if (dataFilters.overrideXAxisValue !== null) {
      xData = filteredData.map((match) => match.data[String(dataFilters.overrideXAxisValue)]);
    } else {
      // If there is no override set for the x-axis, use the default value (Match Number).
      xData = filteredData.map((match) => match.data[`0{match_num}`]);
    }

    if (graphType === undefined || graphType === "Unknown") { 
      // Give back an empty line graph
      return undefined
    }

    setData({x: xData, y: finalData});
    setDisplayStyle(graphType);

    return { finalData, graphType };
  }


  function constructLineChart() {
    const lineChartData = data.y[0].map((item: any, i: number) => ({x: data.x[i], y: item}));
    return [
      <LineChart key={0} data={lineChartData} translation={{x: 20, y: 10}} strokeWidth={3} padding={40} width={300} height={180} verticalSteps={-1}/>,
      <Text key={1} style={{color: 'white', textAlign: 'center'}}>x-axis: {dataFilters.overrideXAxisValue?.substring(1, dataFilters.overrideXAxisValue.length - 2) || "match_num"}</Text>
    ]
  }

  function constructPieChart() {
    // Find how many of each unique item there is in the data.
    const itemValues = data.y[0].reduce((acc, itemList: string[]) => {
      if (itemList.constructor === String) {
        acc[itemList] ? acc[itemList]++ : acc[itemList] = 1;
        return acc;
      }
      itemList.forEach((item: string) => {
        if (acc[item] === undefined) {
          acc[item] = 1;
        } else {
          acc[item]++;
        }
      });

      return acc;
    }, {});
    console.log(data.y[0])
    console.log(itemValues);
    // Transform it into data we can use for our pie chart.
    const pieChartData = Object.keys(itemValues).map((key) => ({label: key, value: itemValues[key]}));
    
    return (
      <View>
        <PieChart height={190} width={190} data={pieChartData} />
      </View>
    );
  }

  function constructTrueFalseDisplay() {
    let percentTrue = ((data.y[0].reduce((acc, item) => item ? acc + 1 : acc, 0) / data.y[0].length) * 100).toFixed(2);


    return (
      <Text style={{color: 'white', fontSize: 60, fontWeight: '900'}}>{percentTrue}%</Text>
    )
  }

  function constructRankingDisplay() {
    if (isNaN(data.y[0][0])) {
      return (
        <HeaderTitle title='Your y-data is not numbers!' fontSize={30}/>
      )
    }

    let cumulativeData: any = {};
    let amountsData: any = {};
    data.y[0].forEach((item: any, i: number) => {
      if (cumulativeData[data.x[i]] === undefined) {
        cumulativeData[data.x[i]] = item;
        amountsData[data.x[i]] = 1;
      } else {
        cumulativeData[data.x[i]] += item;
        amountsData[data.x[i]]++;
      }
    });

    let avgData = Object.keys(cumulativeData).map((key) => ({
      x: key, y: (cumulativeData[key] / amountsData[key]).toFixed(2)
    })).sort((a, b) => Number(b.y) - Number(a.y));


    return (
      <ScrollView style={{flex: 1, width: '100%'}} contentContainerStyle={{alignItems: 'center'}}>
        <HeaderTitle title='Rankings (Averaged):' fontSize={30}/>
        { 
          avgData.map((item: any, i: number) => (
            <Pressable key={i} style={{width: '100%', justifyContent: 'center', alignItems: 'center'}}>
              <HeaderTitle style={{flex: 1}} title={`x: ${item.x}, y: ${item.y}`}/>
            </Pressable>
          )) 
        }
      </ScrollView>
    )
  }

  // Construct the data display based on the data we have filtered
  function constructDataDisplay() {

    // If there is no data we can display, return a message saying so.
    if (!data.y) {
      onDisplaySizeChange({x: 0, y: 40});
      return (
        <HeaderTitle title='No Data to Display!' fontSize={30}/>
      )
    }

    // If we have data, and we know what kind of data it is, display it.
    if (displayStyle === "line" && data.x.length > 0) {
      if (data.x.length >= 100) {
        onDisplaySizeChange({x: 0, y: 40});
        return <HeaderTitle title='Too much data to display!' fontSize={30}/>
      }
      onDisplaySizeChange({x: 0, y: 220});
      return constructLineChart();
    }

    if (displayStyle === "pie") { // No need to check for x data as pie charts don't need it.
      if (data.x.length >= 100) {
        onDisplaySizeChange({x: 0, y: 40});
        return <HeaderTitle title='Too much data to display!' fontSize={30}/>
      }
      onDisplaySizeChange({x: 0, y: 190});
      return constructPieChart();
    }

    if (displayStyle === "percentage") {
      onDisplaySizeChange({x: 0, y: 60});
      return constructTrueFalseDisplay();
    }

    if (displayStyle === "ranking") {
      onDisplaySizeChange({x: 0, y: 190});
      return constructRankingDisplay();
    }
  }

  return constructDataDisplay();
}

export default DataDisplay;