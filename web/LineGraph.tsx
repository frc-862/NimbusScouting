import React, { memo, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, PointerEvent } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import * as d3 from 'd3-shape';
import { interpolatePath } from 'd3-interpolate-path';
import Animated, { useAnimatedProps, withTiming, useSharedValue } from 'react-native-reanimated';

interface LineChartProps {
  data: { x: number; y: number }[];
  data2: { x: number; y: number }[];
  width: number;
  height: number;
  translation?: { x: number; y: number };
  padding?: number;
  strokeWidth?: number;
  strokeColor?: string;
}

const AnimPath = Animated.createAnimatedComponent(Path);

const LineChart: React.FC<LineChartProps> = memo(({
  data,
  width,
  height,
  translation = { x: 0, y: 0 },
  padding = 0,
  strokeWidth = 5,
  strokeColor = 'blue',
}) => {

  const prevDataRef = useRef<{x: number, y: number}[]>();

  const [pathData, setPathData] = useState<{prev: string | null, current: string | null}>({prev: null, current: null});

  const progress = useSharedValue(0);

  const [activePoint, setActivePoint] = useState<{ x: number; y: number } | null>(null);

  const currentStepX = (width / Math.max(...data.map(p => p.x)));
  const currentStepY = (height / Math.max(...data.map(p => p.y)));

  function generatePathData(pointData: { x: number; y: number }[]) {
    const stepX = (width / Math.max(...pointData.map(p => p.x)));
    const stepY = (height / Math.max(...pointData.map(p => p.y)));

    const lineGenerator = d3
      .line<{ x: number; y: number }>()
      .x(d => d.x * stepX)
      .y(d => height - d.y * stepY)
      .curve(d3.curveBumpX);

    return lineGenerator(pointData);
  }

  function generateVerticalLines(onlyUpToLine: boolean = false) {
    return data.map((point, index) => (
      <Line
        x1={point.x * currentStepX + translation.x}
        y1={height}
        x2={point.x * currentStepX + translation.x}
        y2={onlyUpToLine ? height - point.y * currentStepY + translation.y : translation.y}
        stroke="rgba(255, 255, 255, 0.5)"
        strokeWidth="1"
        strokeDasharray={[4, 2]} // 4 units of dash, 2 units of gap
      />
    ));
  }

  function generateHorizontalLines(steps: number = data.length) {
    const step = height / steps;
    return Array.from({length: steps}, (_, i) => {
      const y = i * step;
      if (y > height) {
        return null;
      }
      return (
        <Line
          x1={translation.x}
          y1={height - y}
          x2={width + translation.x}
          y2={height - y}
          stroke="rgba(255, 255, 255, 0.5)"
          strokeWidth="1"
          strokeDasharray={[4, 2]} // 4 units of dash, 2 units of gap
        />
      );
    });
  }

  const handleMove = (event: PointerEvent) => {
    const locationX = event.nativeEvent.offsetX;
    const closestPoint = data.reduce((prev, curr) =>
      Math.abs(locationX - curr.x * currentStepX - translation.x) <
      Math.abs(locationX - prev.x * currentStepX - translation.x)
        ? curr
        : prev
    );
    setActivePoint(closestPoint);
  };

  useEffect(() => {
    const prevData = prevDataRef.current;
    prevDataRef.current = data;

    const newPathData = {prev: generatePathData(prevData ? prevData : data), current: generatePathData(data)};

    setPathData(newPathData);
  }, [data]);

  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, {duration: 500});
  }, [pathData]);

  const animatedProps = useAnimatedProps(() => ({
    d: interpolatePath(String(pathData.prev), String(pathData.current))(progress.value),
  }));

  return (
    <View>
      <Svg width={width + padding} height={height + padding} onPointerMove={(event) => { handleMove(event, ) } } onPointerLeave={() => setActivePoint(null)}>
        { generateHorizontalLines()}
        { generateVerticalLines() } 
        
        <AnimPath translateX={translation.x} translateY={translation.y} fill="none" stroke={strokeColor} strokeWidth={strokeWidth} animatedProps={animatedProps}/>
        
        {activePoint && (
          <Circle
            cx={activePoint.x * (width / Math.max(...data.map(p => p.x))) + translation.x}
            cy={height - activePoint.y * (height / Math.max(...data.map(p => p.y))) + translation.y}
            r={5}
            fill={"green"}
          />
        )}
      </Svg>
      {activePoint && (
        <View style={styles.tooltip}>
          <Text style={{color: 'white'}}>
            {activePoint.x}, {activePoint.y}
          </Text>
        </View>
      )}
      { data.map((point, index) => (
          <Text key={index} numberOfLines={1} style={{position: 'absolute', color: 'white', left: point.x * (width / Math.max(...data.map(p => p.x))) + translation.x - 10, textAlign: 'center', top: height + 20, overflow: "visible",width: 20, height: 10}}>{point.x}</Text>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  tooltip: {
    position: 'absolute',
    top: 10,
    left: 10,
    padding: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 5,
  },
});

export default LineChart;