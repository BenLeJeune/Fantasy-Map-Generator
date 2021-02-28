const d3 = require("d3");

// Re-mark features (ocean, lakes, islands)
function reMarkFeatures( grid, pack ) {
  console.time("reMarkFeatures");
  const cells = pack.cells, features = pack.features = [0], temp = grid.cells.temp;
  cells.f = new Uint16Array(cells.i.length); // cell feature number
  cells.t = new Int16Array(cells.i.length); // cell type: 1 = land along coast; -1 = water along coast;
  cells.haven = cells.i.length < 65535 ? new Uint16Array(cells.i.length) : new Uint32Array(cells.i.length);// cell haven (opposite water cell);
  cells.harbor = new Uint8Array(cells.i.length); // cell harbor (number of adjacent water cells);

  for (let i=1, queue=[0]; queue[0] !== -1; i++) {
    const start = queue[0]; // first cell
    cells.f[start] = i; // assign feature number
    const land = cells.h[start] >= 20;
    let border = false; // true if feature touches map border
    let cellNumber = 1; // to count cells number in a feature

    while (queue.length) {
      const q = queue.pop();
      if (cells.b[q]) border = true;
      cells.c[q].forEach(function(e) {
        const eLand = cells.h[e] >= 20;
        if (land && !eLand) {
          cells.t[q] = 1;
          cells.t[e] = -1;
          cells.harbor[q]++;
          if (!cells.haven[q]) cells.haven[q] = e;
        } else if (land && eLand) {
          if (!cells.t[e] && cells.t[q] === 1) cells.t[e] = 2;
          else if (!cells.t[q] && cells.t[e] === 1) cells.t[q] = 2;
        }
        if (!cells.f[e] && land === eLand) {
          queue.push(e);
          cells.f[e] = i;
          cellNumber++;
        }
      });
    }

    const type = land ? "island" : border ? "ocean" : "lake";
    let group;
    if (type === "lake") group = defineLakeGroup(start, cellNumber, temp[cells.g[start]]);
    else if (type === "ocean") group = defineOceanGroup(cellNumber);
    else if (type === "island") group = defineIslandGroup(start, cellNumber);
    features.push({i, land, border, type, cells: cellNumber, firstCell: start, group});
    queue[0] = cells.f.findIndex(f => !f); // find unmarked cell
  }

  function defineLakeGroup(cell, number, temp) {
    if (temp > 31) return "dry";
    if (temp > 24) return "salt";
    if (temp < -3) return "frozen";
    const height = d3.max(cells.c[cell].map(c => cells.h[c]));
    if (height > 69 && number < 3 && cell%5 === 0) return "sinkhole";
    if (height > 69 && number < 10 && cell%5 === 0) return "lava";
    return "freshwater";
  }

  function defineOceanGroup(number) {
    if (number > grid.cells.i.length / 25) return "ocean";
    if (number > grid.cells.i.length / 100) return "sea";
    return "gulf";
  }

  function defineIslandGroup(cell, number) {
    if (cell && features[cells.f[cell-1]].type === "lake") return "lake_island";
    if (number > grid.cells.i.length / 10) return "continent";
    if (number > grid.cells.i.length / 1000) return "island";
    return "isle";
  }

  console.timeEnd("reMarkFeatures");
}

module.exports = reMarkFeatures;