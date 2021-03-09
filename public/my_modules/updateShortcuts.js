function docUpdateBurg(id) {
    console.log(`updating ${ id }`)
    if ( Array.isArray( id ) ) {
        for ( burg of id ) {
            window.changeDoc( doc => {
                let burgs = doc.getMap("mapData").get("pack").get("burgs");
                burgs.delete( burg, 1 );
                burgs.insert( burg, [ pack.burgs[burg] ] )
            })
        }
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

function docUpdateState(state) {
    window.changeDoc( doc => {
        let states = doc.getMap("mapData").get("pack").get("states");
        doc.transact(() => {
            states.delete( state, 1 );
            states.insert( state, [ pack.states[state] ] )
        })
    } )
}