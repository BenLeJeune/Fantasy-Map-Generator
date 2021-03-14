
function regenerateFromState() {
    // try {
        applyStyleOnLoad();
        invokeActiveZooming(); //Adds the active zooming feature
        console.group("Regenerating map from state...");

        applyMapSize(); //Applies the map size

        //placePoints() not required, we already have points

        //calculateVoronoi(grid, grid.points); //Don't need, already have vertices

        drawScaleBar(); //Draws the scale bar

        //HeightmapGenerator.generate() not required, have heightmap
        console.log("regenerate:", pack.cells);

        markFeatures()

        OceanLayers();

        drawCoastline();

        Rivers.generate();
        defineBiomes();
        BurgsAndStates.drawBurgs();
        BurgsAndStates.drawStateLabels();
        drawStates();
        drawBorders();

        Rivers.specify();
        
        console.groupEnd("Regenerating map from state...");

    // }
    // catch (err) {
    //     console.log(err);
    // }
}