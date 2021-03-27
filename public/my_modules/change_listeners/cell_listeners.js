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
}