function cellListener( doc ) {
    //BASIC CELL LISTENER
    let mapCells = doc.getMap("mapData").get("pack").get("cells");

    console.log("Before: ", pack.cells);
    console.log("After: ", mapCells);

    pack.cells = _.cloneDeep(mapCells);

    //Fixes iterable issues
    if ( typeof pack.cells.i[Symbol.iterator] !== "function" ) {
        //UInt16Array Time!
        let arr = Uint16Array.from( Object.values( pack.cells.i ) );
        pack.cells.i = arr;
    }

    //redefine cell function
    reDefineCellFunction();


    /// -----------------
    // THIS OCCURS AFTER STATE/PROVINCE REDRAWING
    /// -----------------

    let provinceChanges = doc.getMap("mapData").get("changes").get("provinces");
    if ( provinceChanges.toArray().length === 1 ) {
        ///THIS MEANS WE WANT TO REDRAW AND STUFF
        BurgsAndStates.drawStateLabels();
        if (layerIsOn("toggleStates")) drawStates();
        if (layerIsOn("toggleBorders")) drawBorders();
        if (layerIsOn("toggleProvinces")) drawProvinces();
        window.changeDoc( doc => {
            doc.transact(() => {
                provinceChanges.delete(0, 1);
            })
        } )
    }

}