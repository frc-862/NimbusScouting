import React, { memo, useMemo, useEffect, useContext, useRef, useState } from "react";
import { View, ScrollView, Animated, PanResponder, Text, StyleSheet, FlatList } from "react-native";
import Draggable from 'react-native-draggable';
import Globals from "../../Globals";
import { PanGestureHandler } from "react-native-gesture-handler";
import Basic from "../Testing";
import { AppButton } from "../../GlobalComponents";

const DragListContext = React.createContext();

const DraggableList = ({children}) => {
  const [elems, setElems] = useState([]);
  const [draggingIndex, setDraggingIndex] = useState(-1);
  const [startDragY, setStartDragY] = useState(undefined);
  const panGestureHandler = useRef();
  
  const states = { elems, setElems, draggingIndex, setDraggingIndex, panGestureHandler };

  function addElem(e, child) {
    console.log(e.nativeEvent.layout.width)
    elems.push({child: child, width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height, translateY: 0})
    if (elems.length === children.length) {
      setElems([...elems]);
    }
  }

  if (elems.length !== children.length) {
  
    return (
      children.map((child, index) => {
        return React.cloneElement(child, {onLayout: (e) => {addElem(e, child)}});
      }
    ));
  }

  return (
    <DragListContext.Provider value={states}>
      <View>
        {
          elems.map((elem, index) => {
            // return <Draggable elem={elem} index={index} states={states}/>

            const beingDragged = index === draggingIndex;

            return (
              <View style={{width: elem.width, height: elem.height, zIndex: beingDragged ? 10 : 0}}>
                <Animated.View style={{position: 'absolute', transform: [{translateY: elem.translateY}, {scale: beingDragged ? 1.1 : 1}]}}>
                  { elem.child }
                </Animated.View>
                <PanGestureHandler key={index} 
                  onGestureEvent={(e) => {
                    newElems = elems;

                    if (newElems[draggingIndex] === undefined) return;
                    
                    newElems[draggingIndex].translateY = e.nativeEvent.absoluteY - startDragY;

                    // Check if it is below the element below it.
                    if (newElems[draggingIndex].translateY > newElems[draggingIndex].height && newElems[draggingIndex + 1] !== undefined) {
                      setStartDragY(startDragY + newElems[draggingIndex + 1].height);
                      let temp = newElems[draggingIndex];
                      newElems[draggingIndex].translateY = 0;
                      newElems[draggingIndex] = newElems[draggingIndex + 1];
                      newElems[draggingIndex + 1] = temp;
                      setDraggingIndex(draggingIndex + 1);
                    }

                    // Check if it is above the element above it.
                    if (newElems[draggingIndex].translateY < -newElems[draggingIndex].height && newElems[draggingIndex - 1] !== undefined) {
                      setStartDragY(startDragY - newElems[draggingIndex - 1].height);
                      let temp = newElems[draggingIndex];
                      newElems[draggingIndex].translateY = 0;
                      newElems[draggingIndex] = newElems[draggingIndex - 1];
                      newElems[draggingIndex - 1] = temp;
                      setDraggingIndex(draggingIndex - 1);
                    }

                    setElems([...newElems]);
                  }}
                  onActivated={(e) => {
                    console.log("AIWDIHAWUIH")
                    setDraggingIndex(index); 
                    setStartDragY(e.nativeEvent.absoluteY)
                  }}
                  onEnded={(e) => {
                    newElems = elems;
                    newElems[draggingIndex].translateY = 0;
                    setElems([...newElems]);
                    setDraggingIndex(-1);
                  }}
                >
                  <View style={{zIndex: beingDragged ? 10 : 0, width: elem.width, height: elem.height}}></View>
                </PanGestureHandler>
              </View>
            )
          })
        }
      </View>
    </DragListContext.Provider>
  )
};

const DraggableListTwo = ({children}) => {
  const [elems, setElems] = useState([]);
  const [draggingIndex, setDraggingIndex] = useState(-1);
  const [startDragY, setStartDragY] = useState(undefined);
  const panGestureHandler = useRef();
  
  const states = { elems, setElems, draggingIndex, setDraggingIndex, panGestureHandler };

  function addElem(e, child) {
    console.log(e.nativeEvent.layout.width)
    elems.push({child: child, width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height, translateY: 0})
    if (elems.length === children.length) {
      setElems([...elems]);
    }
  }

  if (elems.length !== children.length) {
  
    return (
      children.map((child, index) => {
        return React.cloneElement(child, {onLayout: (e) => {addElem(e, child)}});
      }
    ));
  }

  return (
    <DragListContext.Provider value={states}>
      <View>
        {
          elems.map((elem, index) => {
            // return <Draggable elem={elem} index={index} states={states}/>

            const beingDragged = index === draggingIndex;

            const returnList = [];

            if (beingDragged) {

            }

            returnList.push(
              <View style={{width: elem.width, height: elem.height, zIndex: beingDragged ? 10 : 0}}>
                <Animated.View style={{position: 'absolute', transform: [{translateY: elem.translateY}, {scale: beingDragged ? 1.1 : 1}]}}>
                  { elem.child }
                </Animated.View>
                <PanGestureHandler key={index} 
                  onGestureEvent={(e) => {
                    newElems = elems;

                    if (newElems[draggingIndex] === undefined) return;
                    
                    newElems[draggingIndex].translateY = e.nativeEvent.absoluteY - startDragY;

                    // Check if it is below the element below it.
                    if (newElems[draggingIndex].translateY > newElems[draggingIndex].height && newElems[draggingIndex + 1] !== undefined) {
                      setStartDragY(startDragY + newElems[draggingIndex + 1].height);
                      let temp = newElems[draggingIndex];
                      newElems[draggingIndex].translateY = 0;
                      newElems[draggingIndex] = newElems[draggingIndex + 1];
                      newElems[draggingIndex + 1] = temp;
                      setDraggingIndex(draggingIndex + 1);
                    }

                    // Check if it is above the element above it.
                    if (newElems[draggingIndex].translateY < -newElems[draggingIndex].height && newElems[draggingIndex - 1] !== undefined) {
                      setStartDragY(startDragY - newElems[draggingIndex - 1].height);
                      let temp = newElems[draggingIndex];
                      newElems[draggingIndex].translateY = 0;
                      newElems[draggingIndex] = newElems[draggingIndex - 1];
                      newElems[draggingIndex - 1] = temp;
                      setDraggingIndex(draggingIndex - 1);
                    }

                    setElems([...newElems]);
                  }}
                  onActivated={(e) => {
                    setElems(elems.filter((element) => element != elem)); setDraggingIndex(index); setStartDragY(e.nativeEvent.absoluteY)}}
                  onEnded={(e) => {
                    newElems = elems;
                    newElems[draggingIndex].translateY = 0;
                    setElems([...newElems]);
                    setDraggingIndex(-1);
                  }}
                >
                  <View style={{zIndex: beingDragged ? 10 : 0, width: elem.width, height: elem.height}}></View>
                </PanGestureHandler>
              </View>
            )

            return returnList;
          })
        }
      </View>
    </DragListContext.Provider>
  )
};

const PicklistScreen = () => {
  return (
    <ScrollView style={{flex: 1, backgroundColor: Globals.PageColor}} contentContainerStyle= {{justifyContent: 'center', alignItems: 'center'}}>
        <DraggableList>
          <AppButton><Text>AIAWOIDHAWDIUH</Text></AppButton>
          <Text style={{width: 50, height: 50, backgroundColor: 'blue'}}>AAAAAAAAAA</Text>
          <View style={{width: 50, height: 50, backgroundColor: 'green'}}></View>
          <View style={{width: 50, height: 50, backgroundColor: 'blue'}}></View>
          <View style={{width: 50, height: 50, backgroundColor: 'green'}}></View>
          <View style={{width: 50, height: 50, backgroundColor: 'blue'}}></View>
          <View style={{width: 50, height: 50, backgroundColor: 'green'}}></View>
          <View style={{width: 50, height: 50, backgroundColor: 'blue'}}></View>
          <View style={{width: 50, height: 50, backgroundColor: 'green'}}></View>
          <View style={{width: 50, height: 50, backgroundColor: 'blue'}}></View>
          <View style={{width: 50, height: 50, backgroundColor: 'green'}}></View>
          <View style={{width: 50, height: 50, backgroundColor: 'blue'}}></View>
        </DraggableList>
    </ScrollView>
  );
}

export default PicklistScreen;