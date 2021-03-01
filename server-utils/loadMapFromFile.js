const fs = require("fs");
//Used for triangulating points
const calculateVoronoi = require("./calculateVoronoi");
const reGraph = require("./reGraph");
const reMarkFeatures = require("./reMarkFeatures");
const { getNameBases } = require("./nameGenerator");

const loadFromMapFile = ( mapUrl ) => new Promise((resolve, reject) => {
    //Lots of the parsing code taken from save-and-load.js
    fs.readFile(  mapUrl, 'utf8', (err, data) => {
        if (err) {
            console.log("Cannot load map from URL: ", err);
            return;
        }
        else {
            return resolve(data);
        }
    } )
}).then( parseMapData );

const parseMapData = ( loadedMap ) => {

    const data = loadedMap.split("\r\n");
    //THIS SHOULD BE THE FIRST THING THAT THE SERVER DOES
    //SO WE CAN CREATE A NEW DOC
    return getDoc( data );

};

const getDoc = ( data ) => {
    let doc = {};
    //PARSE GRID DATA
    let grid = JSON.parse(data[6]);
    calculateVoronoi(grid, grid.points, grid);
    grid.cells.h = Uint8Array.from(data[7].split(","));
    grid.cells.prec = Uint8Array.from(data[8].split(","));
    grid.cells.f = Uint16Array.from(data[9].split(","));
    grid.cells.t = Int8Array.from(data[10].split(","));
    grid.cells.temp = Int8Array.from(data[11].split(","));
    doc.grid = grid;


    //PARSE PACK DATA
    let pack = {};
    reGraph( grid, pack );
    reMarkFeatures( grid, pack );

    pack.features = JSON.parse(data[12]);
    pack.cultures = JSON.parse(data[13]);
    pack.states = JSON.parse(data[14]);
    pack.burgs = JSON.parse(data[15]);
    pack.religions = data[29] ? JSON.parse(data[29]) : [{i: 0, name: "No religion"}];
    pack.provinces = data[30] ? JSON.parse(data[30]) : [0];
    pack.rivers = data[32] ? JSON.parse(data[32]) : [];

    console.log("working on cells");
    const cells = pack.cells;
    cells.biome = Uint8Array.from(data[16].split(","));
    cells.burg = Uint16Array.from(data[17].split(","));
    cells.conf = Uint8Array.from(data[18].split(","));
    cells.culture = Uint16Array.from(data[19].split(","));
    cells.fl = Uint16Array.from(data[20].split(","));
    cells.pop = Float32Array.from(data[21].split(","));
    cells.r = Uint16Array.from(data[22].split(","));
    cells.road = Uint16Array.from(data[23].split(","));
    cells.s = Uint16Array.from(data[24].split(","));
    cells.state = Uint16Array.from(data[25].split(","));
    cells.religion = data[26] ? Uint16Array.from(data[26].split(",")) : new Uint16Array(cells.i.length);
    cells.province = data[27] ? Uint16Array.from(data[27].split(",")) : new Uint16Array(cells.i.length);
    cells.crossroad = data[28] ? Uint16Array.from(data[28].split(",")) : new Uint16Array(cells.i.length);

    console.log("namebases");
    let nameBases = getNameBases();
    if (data[31]) {
        const namesDL = data[31].split("/");
        namesDL.forEach((d, i) => {
        const e = d.split("|");
        if (!e.length) return;
            const b = e[5].split(",").length > 2 || !nameBases[i] ? e[5] : nameBases[i].b;
            nameBases[i] = {name:e[0], min:e[1], max:e[2], d:e[3], m:e[4], b};
        });
    }  
    doc.pack = pack;
    return doc;
}

module.exports = loadFromMapFile;