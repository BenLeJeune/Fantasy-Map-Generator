function stateListener( stateId, doc ) {
   
    let mapStates = doc.getMap("mapData").get("pack").get("states");

    let newState = mapStates.get(stateId);
    let currentState = pack.states[stateId];

    //Change fill color
    if ( newState.color !== currentState.color ) {
        let fill = newState.color;
        statesBody.select("#state"+stateId).attr("fill", fill);
        statesBody.select("#state-gap"+stateId).attr("stroke", fill);
        const halo = d3.color(fill) ? d3.color(fill).darker().hex() : "#666666";
        statesHalo.select("#state-border"+stateId).attr("stroke", halo);

        // recolor regiments
        const solidColor = fill[0] === "#" ? fill : "#999";
        const darkerColor = d3.color(solidColor).darker().hex();
        armies.select("#army"+stateId).attr("fill", solidColor);
        armies.select("#army"+stateId).selectAll("g > rect:nth-of-type(2)").attr("fill", darkerColor);
    }

    //Other stuff (culture, type, expansionism) should sync automatically

    //Some changes have to occur after the data has been updated, so we clone the old burg
    let oldState = _.cloneDeep( currentState );

    //Sync all the changes
    pack.states[stateId] = newState;

    //Changed fullName - redraw the label to match
    if ( newState.fullName !== oldState.fullName ) {
        BurgsAndStates.drawStateLabels([ stateId ])
    }

}

function addStateListener( stateId, doc ) {
    console.log("adding state " + stateId);

    let states = doc.getMap("mapData").get("pack").get("states");
    let newState = states.toArray()[stateId];

    //Adding a state...
    pack.states[stateId] = newState;
}