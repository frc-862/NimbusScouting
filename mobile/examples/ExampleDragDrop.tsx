import React, { useState, useCallback, useRef } from "react";
import { View, TouchableOpacity, Text, Animated } from "react-native";
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist";

const NUM_ITEMS = 10;

const AnimTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

function getColor(i: number) {
  const multiplier = 255 / (NUM_ITEMS - 1);
  const colorVal = i * multiplier;
  return `rgb(${colorVal}, ${Math.abs(128 - colorVal)}, ${255 - colorVal})`;
}

const exampleData: Item[] = [...Array(20)].map((d, index) => {
  const backgroundColor = getColor(index);
  return {
    key: `item-${backgroundColor}`,
    label: String(index),
    backgroundColor
  };
});

type Item = {
  key: string;
  label: string;
  backgroundColor: string;
};

function Example() {
  const [data, setData] = useState(exampleData);

  const scale = useRef(new Animated.Value(1)).current;

  const renderItem = useCallback(
    ({ item, getIndex, drag, isActive }: RenderItemParams<Item>) => {
      return (
        <AnimTouchableOpacity
          style={{
            alignItems: "center",
            justifyContent: "center",
            transform: [{ scale: scale }],
          }}
          onLongPress={drag}
        >
          <Text
            style={{
              fontWeight: "bold",
              color: "white",
              fontSize: 32,
            }}
          >
            {item.label}
          </Text>
        </AnimTouchableOpacity>
      );
    },
    []
  );

  return (
    <View style={{ flex: 1 }}>
      <DraggableFlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => `draggable-item-${item.key}`}
        onDragBegin={() => {Animated.timing(scale, { toValue: 1.1, duration: 100, useNativeDriver: true }).start()}}
        onRelease={() => {Animated.timing(scale, { toValue: 1, duration: 500, useNativeDriver: true }).start()}}
        onDragEnd={({ data }) => {
          setData(data)
        }}
      />
    </View>
  );
}

export default Example;