import React, { memo, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, PointerEvent, GestureResponderEvent, Animated, Easing } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import * as d3_shape from 'd3-shape';
import * as d3 from 'd3';
import { interpolatePath } from 'd3-interpolate-path';

interface LineChartProps {
  data: { x: number; y: number }[];
  width: number;
  height: number;
  translation?: { x: number; y: number };
  padding?: number;
  strokeWidth?: number;
  strokeColor?: string;
  verticalSteps?: number;
}

const AnimPath = Animated.createAnimatedComponent(Path);

const LineChart: React.FC<LineChartProps> = memo(({
  data,
  width,
  height,
  translation = { x: 0, y: 0 },
  padding = 0,
  strokeWidth = 5,
  strokeColor = 'hsla(39, 70%, 40%, 1)',
  verticalSteps = -1,
}) => {

  // Make sure that if the verticalSteps is set to -1, we default to the data length.
  if (verticalSteps === -1) {
    verticalSteps = data.length;
  }

  const prevDataRef = useRef<{x: number, y: number}[]>();

  const [pathData, setPathData] = useState<{prev: string, current: string}>({prev: "", current: ""});

  const [interpolatedPath, setInterpolatedPath] = useState<string | null>(null);
  const progress = useRef(new Animated.Value(0)).current;

  const [activePoint, setActivePoint] = useState<{ x: number; y: number } | null>(null);

  const yMax = Math.max(...data.map(p => p.y));

  const currentStepX = (width / (data.length - 1))//Math.max(...data.map(p => p.x)));
  const currentStepY = (height / Math.max(...data.map(p => p.y)));

  function generatePathData(pointData: { x: number; y: number }[]) {
    // const generator = d3.line<{ x: number; y: number }>().curve(d3.curveBumpX);
    // generator.x(d => d.x * currentStepX);

    const stepX = (width / (pointData.length - 1))//Math.max(...pointData.map(p => p.x)));
    const stepY = (height / Math.max(...pointData.map(p => p.y)));

    const lineGenerator = d3_shape
      .line<{ x: number; y: number }>()
      .x((d, i) => i * stepX)
      .y(d => height - d.y * stepY)
      .curve(d3_shape.curveBumpX);

    return lineGenerator(pointData);
  }

  function generateVerticalLines(onlyUpToLine: boolean = false) {
    return data.map((point, index) => (
      <Line
        x1={index * currentStepX + translation.x}
        y1={height + translation.y}
        x2={index * currentStepX + translation.x}
        y2={onlyUpToLine ? height - point.y * currentStepY + translation.y : translation.y}
        stroke="rgba(255, 255, 255, 0.5)"
        strokeWidth="1"
        strokeDasharray={[4, 2]} // 4 units of dash, 2 units of gap
        key={index}
      />
    ));
  }

  function generateHorizontalLines(steps: number = data.length) {
    const step = height / steps;
    return Array.from({length: steps + 1}, (_, i) => {
      const y = i * step;
      if (y > height) {
        return null;
      }
      return (
        <Line
          x1={translation.x}
          y1={height - y + translation.y}
          x2={width + translation.x}
          y2={height - y + translation.y}
          stroke="rgba(255, 255, 255, 0.5)"
          strokeWidth="1"
          strokeDasharray={[4, 2]} // 4 units of dash, 2 units of gap
          key={i}
        />
      );
    });
  }

  const handleMoveMobile = (event: GestureResponderEvent) => {
    // const locationX = event.nativeEvent.offsetX;
    // console.log("Try Reduce");
    // const closestPoint = data.reduce((prev, curr) =>
    //   Math.abs(locationX - curr.x * currentStepX - translation.x) <
    //   Math.abs(locationX - prev.x * currentStepX - translation.x)
    //     ? curr
    //     : prev
    // );
    // console.log("Complete Reduce");
    // setActivePoint(closestPoint);
  }

  useEffect(() => {
    const prevData = prevDataRef.current;
    prevDataRef.current = data;

    const newPathData = {prev: String(generatePathData(prevData ? prevData : data)), current: String(generatePathData(data))};

    setPathData(newPathData);
  }, [data]);

  useEffect(() => {
    progress.setValue(0);

    const pathInterpolator = interpolatePath(pathData.prev, pathData.current);

    // Listener for animated value changes
    const pathAnimation = progress.addListener(({ value }) => {
      const path = pathInterpolator(value);
      // console.log(path);
      setInterpolatedPath(path);
    });

    // Start animation
    Animated.timing(progress, {
      toValue: 1,
      duration: 500,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    }).start();

    // Cleanup listener on unmount
    return () => {
      progress.removeListener(pathAnimation);
    };
  }, [pathData]);
  
  return (
    <View>
      <Svg height={height + padding} width={width + padding} onTouchMove={(event) => { handleMoveMobile(event)}} onTouchEnd={() => setActivePoint(null)}>
        { generateHorizontalLines(verticalSteps) }
        { generateVerticalLines() }

        { /* Draw the path */ }
        <AnimPath
          d={interpolatedPath ? interpolatedPath : ""}
          // d={String(pathData.current)} // Static path for testing
          translateX={translation.x}
          translateY={translation.y}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />

        { /* Fill the area under the line */ }
        <AnimPath
          d={(interpolatedPath ? interpolatedPath + `L${width} ${height}L0 ${height}` : "")} // Static path for testing
          translateX={translation.x}
          translateY={translation.y}
          fill='hsla(39, 70%, 40%, 0.3)'
        />

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
          <Text key={index} numberOfLines={1} style={{position: 'absolute', color: 'white', left: index * (width / (data.length - 1)) + translation.x - 10, textAlign: 'center', top: height + translation.y + 10, overflow: "visible", width: 20, fontSize: 10}}>{point.x}</Text>
      ))}
      { Array.from({length: verticalSteps + 1}).map((_, index) => (
          <Text key={index} numberOfLines={1} style={{position: 'absolute', color: 'white', left: translation.x - 25, textAlign: 'center', top: index * (height / (verticalSteps)) + translation.y - 6, overflow: "visible", width: 20, fontSize: 10}}>{((yMax / (verticalSteps)) * (verticalSteps - index)).toFixed(0)}</Text>
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