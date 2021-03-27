const isArrayUpdate = changeDelta => { //If the update is a simple delete/insert
    if ( changeDelta.length === 3 ) {
        return changeDelta[0].hasOwnProperty("retain")
                && changeDelta[1].hasOwnProperty("insert")
                && changeDelta[2].hasOwnProperty("delete")
    }
    return false;
};

const isSingleInsertUpdate = changeDelta => {
    if ( changeDelta.length === 2 ) {
        return changeDelta[0].hasOwnProperty("retain")
                && changeDelta[1].hasOwnProperty("insert");
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
        else if ( isSingleInsertUpdate( event.changes.delta ) ) {
            let stateId = event.changes.delta[0]["retain"];
            addStateListener( stateId, doc );
        }
    } )

    //--------------
    // CELLS, PROVINCES, OTHER PACK CHANGES
    //--------------
    mapPack.observe( event => {
        console.log("mapPack event:", event);
        if ( event.hasOwnProperty("keysChanged") ) {
            if ( event.keysChanged.has("cells") ) cellListener(doc); //We're updating the cells
            if ( event.keysChanged.has("provinces") ) provinceListener(doc); //We're updating the provinces
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
        else if ( isSingleInsertUpdate( event.changes.delta ) ) {
            let burgId = event.changes.delta[0]["retain"];
            addBurgListener( burgId, doc );
        }
    });

    //------------
    // CELL CHANGES e.g heightmap, state, province, etc
    //-------------
    let changes = mapData.get("changes");
    
    changes.get("heightmap").observe( event => {
        console.log("changing heightmap"); 
    } );

    changes.get("states").observe( event => {
        console.log("changing states");
        console.log(event);
        StateRedrawListener( doc, event );
    } );

    changes.get("provinces").observe( () => {
        console.log("changing provinces");
        provinceRedrawListener( doc );
    })

    changes.get("layers").observe( () => {
        console.log("changing layers");
        layerRedrawListener( doc );
    } )


    mapLoaded = true;

}

//REDRAWING STUFF
function postStatesManualAssignment(affectedStates, affectedProvinces) {
    
}