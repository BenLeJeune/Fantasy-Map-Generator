function stateListener( stateId, doc ) {
   
    let mapStates = doc.getMap("mapData").get("pack").get("states");

    let newState = mapStates.get(stateId);
    let currentState = pack.states[stateId];

    //Sync all the changes
    pack.states[stateId] = newState;

}