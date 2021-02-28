const Delaunator = require("delaunator"); //used for triangluating stuff
const Voronoi = require("./voronoi"); //similar
const d3 = require("d3");

// calculate Delaunay and then Voronoi diagram
function calculateVoronoi(graph, points, grid) {
  console.time("calculateDelaunay");
  const n = points.length;
  const allPoints = points.concat(grid.boundary); //CHANGED FROM grid.boundary TO graph.boundary
  const delaunay = Delaunator.from(allPoints);
  console.timeEnd("calculateDelaunay");

  console.time("calculateVoronoi");
  const voronoi = new Voronoi(delaunay, allPoints, n);
  graph.cells = voronoi.cells;
  graph.cells.i = n < 65535 ? Uint16Array.from(d3.range(n)) : Uint32Array.from(d3.range(n)); // array of indexes
  graph.vertices = voronoi.vertices;
  console.timeEnd("calculateVoronoi");
}

module.exports = calculateVoronoi