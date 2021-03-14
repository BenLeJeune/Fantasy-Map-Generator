function provinceListener(doc) {
    //Simple province listener
    let mapProvinces = doc.getMap("mapData").get("pack").get("provinces");
    pack.provinces = _.cloneDeep( mapProvinces );

    //Don't need to do anything else hopefully, just simple objects
}