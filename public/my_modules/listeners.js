const isArrayUpdate = changeDelta => {
    if ( changeDelta.length === 3 ) {
        return changeDelta[0].hasOwnProperty("retain")
                && changeDelta[1].hasOwnProperty("insert")
                && changeDelta[2].hasOwnProperty("delete")
    }
    return false;
}

function setupListeners( doc ) {
    //Whenever a transaction happens
    doc.on("afterAllTransactions", ( doc, transactions ) => {
        console.log("A transaction has occurred");
    });

    //MapData
    let mapData = doc.getMap("mapData");
    let mapPack = mapData.get("pack");
    let mapBurgs = mapPack.get("burgs");
    let mapStates = mapPack.get("states");

    //---------------
    // STATES
    //---------------
    mapStates.observe( event => {
        if ( isArrayUpdate( event.changes.delta ) ) {
            //We're updating a state
            let stateId = event.changes.delta[0].retain;
            stateListener( stateId, doc );
        }
    } )

    //--------------
    // BURGS
    //--------------
    mapBurgs.observe( event => {
        if ( isArrayUpdate( event.changes.delta ) ) {
            let burgId = event.changes.delta[0]["retain"];
            burgListener( burgId, doc );
        }
    })

    mapLoaded = true;

}