const d3 = require("d3");
const { rn, getPackPolygon } = require("./utils");
const calculateVoronoi = require("./calculateVoronoi");
//Recalculates the Voronoi Graph to pack cells
function reGraph( grid, pack ) {
  console.time("reGraph");
  let cells = grid.cells, points = grid.points, features = grid.features;
  const newCells = {p:[], g:[], h:[], t:[], f:[], r:[], biome:[]}; // to store new data
  const spacing2 = grid.spacing ** 2;

  for (const i of cells.i) {
    const height = cells.h[i];
    const type = cells.t[i];
    if (height < 20 && type !== -1 && type !== -2) continue; // exclude all deep ocean points
    if (type === -2 && (i%4=== 0 || features[cells.f[i]].type === "lake")) continue; // exclude non-coastal lake points
    const x = points[i][0], y = points[i][1];

    function addNewPoint(x, y) {
      newCells.p.push([x, y]);
      newCells.g.push(i);
      newCells.h.push(height);
    }

    addNewPoint(x, y); // add point to array
    // add additional points for cells along coast
    if (type === 1 || type === -1) {
      if (cells.b[i]) continue; // not for near-border cells
      cells.c[i].forEach(function(e) {
        if (i > e) return;
        if (cells.t[e] === type) {
          const dist2 = (y - points[e][1]) ** 2 + (x - points[e][0]) ** 2;
          if (dist2 < spacing2) return; // too close to each other
          const x1 = rn((x + points[e][0]) / 2, 1);
          const y1 = rn((y + points[e][1]) / 2, 1);
          addNewPoint(x1, y1);
        }
      });
    }
  }


  calculateVoronoi(pack, newCells.p, grid);
  cells = pack.cells;
  cells.p = newCells.p; // points coordinates [x, y]
  cells.g = grid.cells.i.length < 65535 ? Uint16Array.from(newCells.g) : Uint32Array.from(newCells.g); // reference to initial grid cell
  cells.q = d3.quadtree(cells.p.map((p, d) => [p[0], p[1], d])); // points quadtree for fast search
  cells.h = new Uint8Array(newCells.h); // heights
  cells.area = new Uint16Array(cells.i.length); // cell area
  cells.i.forEach(i => cells.area[i] = Math.abs(d3.polygonArea(getPackPolygon(i, pack))));

  console.timeEnd("reGraph");

}

module.exports = reGraph;