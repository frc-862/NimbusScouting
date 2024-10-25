import React, { useState, useCallback, useRef, useEffect } from "react";
import { View, TouchableOpacity, Text, Animated } from "react-native";
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist";
import { useSharedValue } from "react-native-reanimated";
import DragListContect from "../components/DragListContext";

const NUM_ITEMS = 10;

type Item = {
  key: string;
  is_tier_card: boolean;
  tier_info: string;
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
  const [tierCards, setTierCards] = useState(0);

  useEffect(() => {
    setData(data)
    setTierCards(data.filter((item) => item.is_tier_card).length)
  }, [data])


  const TeamCard = ({ item, index, tierCardsAbove }: { item: Item, index: number | undefined, tierCardsAbove: number }) => {
    return (
      <View style={{ flexDirection: 'row', width: '80%', height: 100, borderRadius: 10, alignContent: 'center', backgroundColor: "blue", margin: 5, padding: 10, }}>
        
        {/* View for the picklist rank of the team */}
        <View style={{height: '100%', justifyContent: 'center', flex: 5}}>
          <Text style={{ textAlign: 'center', fontWeight: "bold", color: "white", fontSize: 32, }}>
            {Number(index) + 1 - tierCardsAbove}
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

  const TierCard = ({ item, index }: { item: Item, index: number | undefined }) => {
    return (
      <View style={{ width: '80%', height: 50, borderRadius: 10, justifyContent: 'center', backgroundColor: "orange", margin: 5, padding: 10, }}>
        <Text style={{ textAlign: 'center', color: "white", fontSize: 20, fontWeight: "bold",}}>{item.tier_info}</Text>
      </View>
    )
  }

  const renderItem = useCallback(
    ({ item, getIndex, drag, isActive }: RenderItemParams<Item>) => {
      const ctx = React.useContext(DragListContect);
      let tierCardsAbove = 0;
      ctx.listData.forEach((listItem : Item, cardIndex : number) => {tierCardsAbove += listItem.is_tier_card && cardIndex <= Number(getIndex()) ? 1 : 0 });
      return (
        <TouchableOpacity
          style={{
            alignItems: "center",
            justifyContent: "center",
            // transform: [{ scale: scale }],
          }}
          onLongPress={drag}
        >
          { item.is_tier_card ? <TierCard item={item} index={getIndex()}/> : <TeamCard item={item} index={getIndex()} tierCardsAbove={tierCardsAbove}/> }
        </TouchableOpacity>
      );
    },
    []
  );

  return (
    <View style={{ width: '100%', height: '100%' }}>
      <DragListContect.Provider value={{ listData }}>
        <DraggableFlatList
          style={{ width: '100%' }}
          data={listData}
          renderItem={renderItem}
          keyExtractor={(item, index) => `draggable-item-${item.key}`}
          onDragEnd={({ data }) => {
            setData(data)
          }}
          extraData={listData}
        />
      </DragListContect.Provider>
    </View>
  );
}

export default DragDropList;