import React, { useState } from 'react';
import { View, TouchableWithoutFeedback } from 'react-native';
import Svg, { G, Path, Text } from 'react-native-svg';
import * as d3 from 'd3';

interface DataItem {
  label: string;
  value: number;
}

interface PieChartProps {
  data: DataItem[];
  width: number;
  height: number;
  innerRadius?: number;
  outerRadius?: number;
  padAngle?: number;
}

const PieChart: React.FC<PieChartProps> = ({
  data,
  width,
  height,
  innerRadius = 0,
  outerRadius = Math.min(width, height) / 2,
  padAngle = 0.00,
}) => {
  const pie = d3.pie<DataItem>().sort(null).value(d => d.value);
  const arcGenerator = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);

  const arcs = pie(data);

  const arcPath = (arc: d3.PieArcDatum<DataItem>) => {
    const path = arcGenerator({
      ...arc,
      innerRadius,
      outerRadius,
      padAngle,
    });
    return path ? path : undefined;     
  };
  
  const arcCentroid = (arc: d3.PieArcDatum<DataItem>) => {
    const centroid = arcGenerator.centroid({
      ...arc,
      innerRadius,
      outerRadius,
    });
    return centroid;
  };

  return (
    <View>
      <Svg width={width} height={height}>
        <G x={width / 2} y={height / 2}>
          {arcs.map((arc, index) => (
            <React.Fragment
              key={index}
            >
              <Path
                d={arcPath(arc) || ''}
                fill={`hsl(35, ${50 + Math.abs(50 - ((50 / arcs.length) * index * 2))}%, ${40 + Math.abs(20 - ((20 / arcs.length) * index * 2))}%)`}
              />
              <Text
                x={arcCentroid(arc)[0]}
                y={arcCentroid(arc)[1]}
                textAnchor="middle"
                fontSize="12"
                fill="white">
                {data[index].label}
              </Text>
            </React.Fragment>
          ))}
        </G>
      </Svg>
    </View>
  );
};

export default PieChart;