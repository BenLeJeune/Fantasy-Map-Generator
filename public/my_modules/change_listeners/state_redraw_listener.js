function StateRedrawListener( doc, event ) {
    let mapData = doc.getMap("mapData");
    if ( mapData.get("changes").get("states").toArray().length === 2 ) {
        console.log("Redrawing states...")

        let affectedStates = mapData.get("changes").get("states").get(0);
        let affectedProvinces = mapData.get("changes").get("states").get(1);

        if ( affectedStates.length ) {
            if ( !layerIsOn("toggleStates")) toggleStates(); else drawStates();
            BurgsAndStates.drawStateLabels([...new Set( affectedStates )]);
            adjustProvinces([...new Set(affectedProvinces)]);
            drawBorders();
            if (layerIsOn("toggleProvinces")) drawProvinces();
        }
    }
}

function adjustProvinces(affectedProvinces) {
    const cells = pack.cells, provinces = pack.provinces, states = pack.states;
    const form = {"Zone":1, "Area":1, "Territory":2, "Province":1};

    affectedProvinces.forEach(p => {
        // do nothing if neutral lands are captured
        if (!p) return;

        // remove province from state provinces list
        const old = provinces[p].state;
        if (states[old].provinces.includes(p)) states[old].provinces.splice(states[old].provinces.indexOf(p), 1);

        // find states owning at least 1 province cell
        const provCells = cells.i.filter(i => cells.province[i] === p);
        const provStates = [...new Set(provCells.map(i => cells.state[i]))];

        // assign province to its center owner; if center is neutral, remove province
        const owner = cells.state[provinces[p].center];
        if (owner) {
        const name = provinces[p].name;

        // if province is historical part of abouther state province, unite with old province
        const part = states[owner].provinces.find(n => name.includes(provinces[n].name));
        if (part) {
            provinces[p].removed = true;
            provCells.filter(i => cells.state[i] === owner).forEach(i => cells.province[i] = part);
        } else {
            provinces[p].state = owner;
            states[owner].provinces.push(p);
            provinces[p].color = getMixedColor(states[owner].color);
        }
        } else {
        provinces[p].removed = true;
        provCells.filter(i => !cells.state[i]).forEach(i => cells.province[i] = 0);
        }

        // create new provinces for non-main part
        provStates.filter(s => s && s !== owner).forEach(s => createProvince(p, s, provCells.filter(i => cells.state[i] === s)));
    });

    function createProvince(initProv, state, provCells) {
        const province = provinces.length;
        provCells.forEach(i => cells.province[i] = province);

        const burgCell = provCells.find(i => cells.burg[i]);
        const center = burgCell ? burgCell : provCells[0];
        const burg = burgCell ? cells.burg[burgCell] : 0;

        const name = burgCell && P(.7) ? getAdjective(pack.burgs[burg].name) 
        : getAdjective(states[state].name) + " " + provinces[initProv].name.split(" ").slice(-1)[0];
        const formName = name.split(" ").length > 1 ? provinces[initProv].formName : rw(form);
        const fullName = name + " " + formName;
        const color = getMixedColor(states[state].color);
        provinces.push({i:province, state, center, burg, name, formName, fullName, color});
    }

}

function provinceRedrawListener( doc ) {
    let mapData = doc.getMap("mapData");
    if ( mapData.get("changes").get("provinces").toArray().length === 1 ) {
        //We're adjusting the provinces
        let affectedProvinces = mapData.get("changes").get("provinces").get(0);
        adjustProvinces([...new Set(affectedProvinces)]);
    }
}
 