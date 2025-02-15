import React, {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import DragList, {DragListRenderItemInfo} from 'react-native-draglist';
import { ScrollView } from 'react-native-gesture-handler';

const SOUND_OF_SILENCE = ['hello', 'darkness', 'my', 'old', 'friend', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

export default function DraggableLyrics() {
  const [data, setData] = useState(SOUND_OF_SILENCE);

  function keyExtractor(str: string, _index: number) {
    return str;
  }

  function renderItem(info: DragListRenderItemInfo<string>) {
    const {item, onDragStart, onDragEnd, isActive} = info;
    const index = data.indexOf(item);

    return (
      <TouchableOpacity
        key={item}
        onPressIn={onDragStart}
        onPressOut={onDragEnd}
        style={{backgroundColor: isActive ? 'purple' : 'orange', padding: 20, width: '100%'}}>
        <Text style={{textAlign: 'center', color: 'white'}}>{item} + {index}</Text>
      </TouchableOpacity>
    );
  }

  async function onReordered(fromIndex: number, toIndex: number) {
    const copy = [...data]; // Don't modify react data in-place
    const removed = copy.splice(fromIndex, 1);

    copy.splice(toIndex, 0, removed[0]); // Now insert at the new pos
    setData(copy);
  }

  return (
    <View>
        <DragList
          data={data}
          keyExtractor={keyExtractor}
          onReordered={onReordered}
          renderItem={renderItem}
          onDragEnd={() => {
            setData(data);
          }}
        />
    </View>
  );
}