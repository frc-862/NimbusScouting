import React, { useState, useEffect, useContext, useMemo, useCallback } from "react";
import { View, TouchableOpacity, Text, Animated, Pressable } from "react-native";
import DragList, { DragListRenderItemInfo } from "react-native-draglist";
import Globals from "../Globals";

type Item = {
  key: string;
  is_tier_card: boolean;
  tier_info: string;
  team_number: number;
  team_name: string;
  picked: boolean;
  identifiers: boolean[];
};

type DragDropProps = {
  data: Item[];
  onDataChanged: (data: Item[]) => void;
}

/**
 * A list of teams that can be reordered by dragging and dropping, and can be picked by tapping.
 * 
 * @param {Item[]} data The list of teams to display.
 * @param {(data: Item[]) => void} onDataChanged The function to call when the data changes. 
 * 
 * @returns {JSX.Element} The drag and drop list.
 */
function DragDropList({ data, onDataChanged } : DragDropProps) {
  const [listData, setData] = useState(data);
  const [tierCards, setTierCards] = useState(0);

  useEffect(() => {
    setData(data)
    setTierCards(data.filter((item) => item.is_tier_card).length)
  }, [data])

  useEffect(() => {
    if (listData.length === 0) {
      return;    
    }
    onDataChanged(listData);
  }, [listData])

  const rankingMap = useMemo(() => {
    const map = new Map();
    let offset = 0;
  
    listData.forEach((item, index) => {
      if (item.is_tier_card) {
        offset++;
      }
      map.set(item.key, index - offset + 1);
    });
  
    return map;
  }, [listData]);

  const TeamCard = React.memo(({ item, index, dragStartFunc, dragEndFunc, ranking }: { item: Item, index: number | undefined, dragStartFunc: () => void, dragEndFunc: () => void, ranking: number }) => {
    
    return (
      <View style={{ flexDirection: 'row', width: '80%', height: 50, borderRadius: 10, overflow: 'hidden', alignContent: 'center', backgroundColor: item.picked ? "rgba(255, 0, 0, 0.5)" : Globals.GradientColor1, margin: 2.5 }}>
        
        {/* View for the picklist rank of the team */}
        <Pressable style={{height: '100%', justifyContent: 'center', alignItems: 'center', flex: 2}} onPressIn={() => {dragStartFunc();}} onPressOut={() => {dragEndFunc();}}>
          <View style={{backgroundColor: 'orange', height: 2, width: '50%'}}></View>
          <Text style={{ textAlign: 'center', fontWeight: "bold", color: Globals.GradientColor2, fontSize: 28, }}>
            {ranking}
          </Text>
          <View style={{backgroundColor: 'orange', height: 2, width: '50%'}}></View>
        </Pressable>

        {/* View for the team info (as in name and number) */}
        <View style={{height: '100%', justifyContent: 'center', flex: 10}}>
          <Text style={{ textAlign: 'center', color: "white", fontSize: 24, fontWeight: "bold",}}>
            {item.team_number}
          </Text>
          <Text style={{ textAlign: 'center', fontWeight: "bold", color: "white", fontSize: 12, maxWidth: '100%'}} numberOfLines={1} ellipsizeMode='tail'>
            {item.team_name}
          </Text>
        </View>

        <View style={{height: '100%', justifyContent: 'center', flex: 2, flexWrap: 'wrap', flexDirection: 'row'}}>
          <TouchableOpacity style={{height: '50%', width: '50%', justifyContent: 'center', alignItems: 'center', backgroundColor: item.identifiers[0] ? Globals.GradientColor2 : 'transparent'}}
            onPress={() => {
              setData((prevData) => {
                const copy = [...prevData];
                if (index !== undefined) {
                  copy[index].identifiers[0] = !copy[index].identifiers[0];
                }
                return copy;
              });
            }}
          >
            <Text style={{ textAlign: 'center',color: "white", fontSize: 16, fontWeight: "bold",}}>
              A
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={{height: '50%', width: '50%', justifyContent: 'center', alignItems: 'center', backgroundColor: item.identifiers[1] ? Globals.GradientColor2 : 'transparent'}}
            onPress={() => {
              setData((prevData) => {
                const copy = [...prevData];
                if (index !== undefined) {
                  copy[index].identifiers[1] = !copy[index].identifiers[1];
                }
                return copy;
              });
            }}
          >
            <Text style={{ textAlign: 'center',color: "white", fontSize: 16, fontWeight: "bold",}}>
              C
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={{height: '50%', width: '50%', justifyContent: 'center', alignItems: 'center', backgroundColor: item.identifiers[2] ? Globals.GradientColor2 : 'transparent'}}
            onPress={() => {
              setData((prevData) => {
                const copy = [...prevData];
                if (index !== undefined) {
                  copy[index].identifiers[2] = !copy[index].identifiers[2];
                }
                return copy;
              });
            }}
          >
            <Text style={{ textAlign: 'center',color: "white", fontSize: 16, fontWeight: "bold",}}>
              D
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={{height: '50%', width: '50%', justifyContent: 'center', alignItems: 'center', backgroundColor: item.identifiers[3] ? Globals.GradientColor2 : 'transparent'}}
            onPress={() => {
              setData((prevData) => {
                const copy = [...prevData];
                if (index !== undefined) {
                  copy[index].identifiers[3] = !copy[index].identifiers[3];
                }
                return copy;
              });
            }}
          >
            <Text style={{ textAlign: 'center',color: "white", fontSize: 16, fontWeight: "bold",}}>
              X
            </Text>
          </TouchableOpacity>
        </View>

        {/* View for the team ranking and WLT ratio */}
        {/* <View style={{height: '100%', justifyContent: 'center', flex: 8}}>
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
        </View> */}

      </View>
    );
  });

  const TierCard = React.memo(({ item, index, dragStartFunc, dragEndFunc }: { item: Item, index: number | undefined, dragStartFunc: () => void, dragEndFunc: () => void }) => {
    return (
      <View style={{ width: '80%', overflow: 'hidden', height: 40, borderRadius: 10, justifyContent: 'center', backgroundColor: Globals.GradientColor2, margin: 2.5 }}>
        <Text style={{ textAlign: 'center', color: Globals.GradientColor1, fontSize: 20, fontWeight: "bold",}}>{item.tier_info}</Text>
        <Pressable style={{position: 'absolute', height: '100%', width: '10%', left: 5, justifyContent: 'center', alignItems: 'center'}} onPressIn={() => {dragStartFunc();}} onPressOut={() => {dragEndFunc();}}>
          <View style={{backgroundColor: 'orange', height: 2, width: '70%', marginBottom: 5}}></View>
          <View style={{backgroundColor: 'orange', height: 2, width: '70%'}}></View>
        </Pressable>
      </View>
    )
  });

  const renderItem = useCallback(({ item, onDragStart, onDragEnd, isActive }: DragListRenderItemInfo<Item>) => {
    const index = listData.indexOf(item);
    const ranking = rankingMap.get(item.key) || 0;
    return (
      <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>
        { item.is_tier_card ? <TierCard item={item} index={index} dragStartFunc={onDragStart} dragEndFunc={onDragEnd}/> :
        ( <TouchableOpacity
          style={{
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={() => {
            setData((prevData) => {
              const copy = [...prevData];
              copy[index].picked = !copy[index].picked;
              return copy;
            });
          }}
        >
          <TeamCard item={item} index={index} ranking={ranking} dragStartFunc={onDragStart} dragEndFunc={onDragEnd}/>
        </TouchableOpacity> )
        }
      </View>
    );
  }, [listData, rankingMap]);

  async function onReordered(fromIndex: number, toIndex: number) {
    setData((prevData) => {
      const copy = [...prevData];
      const removed = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, removed[0]);
      return copy; // ✅ This ensures state updates optimally
    });
  }

  return (
    <View style={{ width: '100%', height: '100%' }}>
      <DragList
        style={{ width: '100%' }}
        data={listData}
        onReordered={onReordered}
        renderItem={renderItem}
        keyExtractor={(item, index) => `draggable-item-${item.key}`}
        extraData={listData}
      />
    </View>
  );
}

export default DragDropList;