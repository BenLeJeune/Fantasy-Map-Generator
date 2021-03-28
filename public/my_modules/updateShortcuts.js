/// ----------
/// DELETE&INSERT UPDATES
/// ----------
function docUpdateBurg(id) {
    console.log(`updating ${ id }`)
    if ( Array.isArray( id ) ) {
        window.changeDoc( doc => {
            let burgs = doc.getMap("mapData").get("pack").get("burgs");
            doc.transact(() => {
                for ( burg of id ) {
                    burgs.delete( burg, 1 );
                    burgs.insert( burg, [ pack.burgs[burg] ] );
                }
            })
        } )
    } 
    else {
        window.changeDoc( doc => {
            let burgs = doc.getMap("mapData").get("pack").get("burgs");
            doc.transact(() => {
                burgs.delete( id, 1 );
                burgs.insert( id, [ pack.burgs[id] ] )
            }) 
        })
    }
}

function docUpdateCells() {
    window.changeDoc( doc => {
        let mapPack = doc.getMap("mapData").get("pack");
        doc.transact(() => {
            mapPack.set("cells", pack.cells);
        })
    } )
};

function docUpdateProvinces() {
    window.changeDoc( doc => {
        let mapPack = doc.getMap("mapData").get("pack");
        doc.transact(() => {
            let provinces = pack.provinces;
            let mapProvinces = window.toSharedArray(provinces);
            console.log("MapProvinces ->", mapProvinces);
            mapPack.set("provinces", mapProvinces);
        })
    } )
}

function docUpdateState(state) {
    window.changeDoc( doc => {
        let states = doc.getMap("mapData").get("pack").get("states");
        doc.transact(() => {
            states.delete( state, 1 );
            states.insert( state, [ pack.states[state] ] )
        })
    } )
}

function docUpdateProvince(province) {
    window.changeDoc( doc => {
        let provinces = doc.getMap("mapData").get("pack").get("provinces");
        doc.transact(() => {
            provinces.delete( province, 1 );
            provinces.insert( province, [ pack.provinces[province] ] );
        })
    } )
}

/// ----------
/// DELETIONS
/// ----------

//Burg deletions can be accomplished by updating (they aren't truly "removed")

/// ----------
/// TRIGGER REDRAWS WHEN "PAINTING"
/// ----------
function docTriggerStateChange( affectedStates ) {
    window.changeDoc( doc => {
        let stateChanges = doc.getMap("mapData").get("changes").get("states");
        try {
            stateChanges.delete( 0, 1 );
        }
        catch {
            console.log("Failed to delete the states awaiting change. If the error below is 'array out of range' or similar, this is likely the first edit you have made in this session.")
        }
        stateChanges.insert( 0, [affectedStates] );
    } )
}

function docTriggerProvinceChange( affectedProvinces ) {
    window.changeDoc( doc => {
        let provinceChanges = doc.getMap("mapData").get("changes").get("provinces");
        try {
            provinceChanges.delete(0, 1);
        }
        catch {
            console.log("failed to delete province changes, this is probably the first change you made this session.");
        }
        provinceChanges.insert( 0, [affectedProvinces] );
    } )
}

function docTriggerHeightmapChanges() {
    window.changeDoc( doc => {
        let heightmapChanges = doc.getMap("mapData").get("changes").get("heightmap");
        try {
            heightmapChanges.delete(0, 1);
        }
        catch {
            console.log("failed to delete, probably first heightmap change");
        }
        heightmapChanges.insert( 0, [doc.clientID] );
    } )
}

function docTriggerLayerDraws( layers ) {
    window.changeDoc( doc => {
        let layerDrawChanges = doc.getMap("mapData").get("changes").get("layers");
        try {
            layerDrawChanges.delete(0, 1);
        }
        catch {
            console.log("failed to delete, probably the first change");
        }
        layerDrawChanges.insert( 0, [ layers ] )
    } )
}

/// ----------
/// INSERTIONS (CREATING SOMETHING)
/// ----------

function docCreateBurg( id ) {
    window.changeDoc( doc => {
        let burgs = doc.getMap("mapData").get("pack").get("burgs");
        doc.transact(() => {
            burgs.insert( id, [ pack.burgs[id] ] );
        })
    } )
}

function docCreateState( id ) {
    window.changeDoc( doc => {
        let states = doc.getMap("mapData").get("pack").get("states");
        states.insert( id, [ pack.states[id] ] )
    } )
}

function docCreateProvince( id ) {
    console.log("Creating province", id)
    window.changeDoc( doc => {
        let provinces = doc.getMap("mapData").get("pack").get("provinces");
        provinces.insert( id, [ pack.provinces[id] ] );
    } )
}