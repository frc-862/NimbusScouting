import React, { useState, useCallback, useRef, useEffect } from "react";
import { View, TouchableOpacity, Text, Animated } from "react-native";
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist";

const NUM_ITEMS = 10;

const AnimTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

type Item = {
  key: string;
  team_number: number;
  ranking: number;
  qual_wins: number;
  qual_losses: number;
  qual_ties: number;
  alliance: number | null;
  alliance_pick: number | null;
  elim_wins: number | null;
  elim_losses: number | null;
  elim_ties: number | null;
};

type DragDropProps = {
  data: Item[];
}

function DragDropList({ data } : DragDropProps) {
  const [listData, setData] = useState(data);

  useEffect(() => { 
    setData(data)
  }, [data])

  // const scale = useRef(new Animated.Value(1)).current;

  const TeamCard = ({ item, index }: { item: Item, index: number | undefined }) => {
    return (
      <View style={{ flexDirection: 'row', width: '80%', height: 100, borderRadius: 10, alignContent: 'center', backgroundColor: "blue", margin: 5, padding: 10, }}>
        
        {/* View for the picklist rank of the team */}
        <View style={{height: '100%', justifyContent: 'center', flex: 5}}>
          <Text style={{ textAlign: 'center', fontWeight: "bold", color: "white", fontSize: 32, }}>
            {Number(index) + 1}
          </Text>
        </View>

        {/* View for the team info (as in name and number) */}
        <View style={{height: '100%', justifyContent: 'center', flex: 10}}>
          <Text style={{ textAlign: 'center', color: "white", fontSize: 28, fontWeight: "bold",}}>
            {item.team_number}
          </Text>
          <Text style={{ textAlign: 'center', fontWeight: "bold", color: "white", fontSize: 20, }}>
            Team Name
          </Text>
        </View>

        {/* View for the team ranking and WLT ratio */}
        <View style={{height: '100%', justifyContent: 'center', flex: 8}}>
          <Text style={{ textAlign: 'right', color: "white", fontSize: 16, fontWeight: "bold",}}>
            Ranking: {item.ranking}
          </Text>
          <Text style={{ textAlign: 'right', fontWeight: "bold", color: "white", fontSize: 16, }}>
            Wins: {item.qual_wins}
          </Text>
          <Text style={{ textAlign: 'right', fontWeight: "bold", color: "white", fontSize: 16, }}>
            Losses: {item.qual_losses}
          </Text>
          <Text style={{ textAlign: 'right', fontWeight: "bold", color: "white", fontSize: 16, }}>
            Ties: {item.qual_ties}
          </Text>
        </View>

      </View>
    );
  }

  const renderItem = useCallback(
    ({ item, getIndex, drag, isActive }: RenderItemParams<Item>) => {
      return (
        <AnimTouchableOpacity
          style={{
            alignItems: "center",
            justifyContent: "center",
            // transform: [{ scale: scale }],
          }}
          onLongPress={drag}
        >
          <TeamCard item={item} index={getIndex()} />
        </AnimTouchableOpacity>
      );
    },
    []
  );

  return (
    <View style={{ width: '100%', height: '100%' }}>
      <DraggableFlatList
        style={{ width: '100%' }}
        data={listData}
        renderItem={renderItem}
        keyExtractor={(item, index) => `draggable-item-${item.key}`}
        // onDragBegin={() => {Animated.timing(scale, { toValue: 1.1, duration: 100, useNativeDriver: true }).start()}}
        // onRelease={() => {Animated.timing(scale, { toValue: 1, duration: 500, useNativeDriver: true }).start()}}
        onDragEnd={({ data }) => {
          setData(data)
        }}
        extraData={listData}
      />
    </View>
  );
}

export default DragDropList;