//not everything will be able to go in here

function rn(v, d = 0) {
  const m = Math.pow(10, d);
  return Math.round(v * m) / m;
}

function getPackPolygon(i, pack) {
  return pack.cells.v[i].map(v => pack.vertices.p[v]);
}

module.exports = {
    rn,
    getPackPolygon
}