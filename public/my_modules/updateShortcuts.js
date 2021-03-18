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
            mapPack.set("provinces", pack.provinces);
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