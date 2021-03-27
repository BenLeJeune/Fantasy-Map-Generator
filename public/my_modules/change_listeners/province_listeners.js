function provinceListener(doc) {
    //Simple province listener
    let mapProvinces = doc.getMap("mapData").get("pack").get("provinces");
    pack.provinces = mapProvinces.toArray();

    //Don't need to do anything else hopefully, just simple objects
}

function addProvinceListener( provinceId, doc ) {
    console.log("adding province " + provinceId);

    let provinces = doc.getMap("mapData").get("pack").get("provinces");
    let newProvince = provinces.toArray()[ provinceId ];

    //Adding the province...
    pack.provinces[provinceId] = newProvince;

}

function updateProvinceListener( provinceId, doc ) {

    let mapProvinces = doc.getMap("mapData").get("pack").get("provinces");

    let newProvince = mapProvinces.get(provinceId);
    let oldProvince = pack.provinces[provinceId];

    //If the name has been changed...
    if ( newProvince.name !== oldProvince.name ) {
        //Update the name
        let nameLabel = provs.select("#provinceLabel"+oldProvince.i);
        if (nameLabel) nameLabel.text(newProvince.name);
    }

    //If the fill has been changed
    if ( newProvince.color !== oldProvince.color ) {
        let fill = newProvince.color;
        const g = provs.select("#provincesBody");
        g.select("#province"+newProvince.i).attr("fill", fill);
        g.select("#province-gap"+newProvince.i).attr("stroke", fill);
    }

    //Actually sync the changes
    pack.provinces[provinceId] = newProvince;

}