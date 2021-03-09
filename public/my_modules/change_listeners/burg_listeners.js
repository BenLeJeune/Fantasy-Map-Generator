function burgListener( burgId , doc ) {

    let mapBurgs = doc.getMap("mapData").get("pack").get("burgs"); 

    let newBurg = mapBurgs.get(burgId);
    let currentBurg = pack.burgs[burgId];
    
    //Name change
    if ( newBurg.name !== currentBurg.name ) {
        //Gets label, updates text
        let element = burgLabels.select(`[data-id='${ burgId }']`);
        element.text( newBurg.name );
    }

    //Status changes
    //Changing status as a port
    if ( newBurg.port !== currentBurg.port ) {
        //If it is no longer a port
        if ( !newBurg.port || newBurg.port === 0 ) {
            //Removes anchor element
            const anchor = document.querySelector(("#anchors [data-id='" + burgId + "']"));
            if ( anchor ) anchor.remove();
        }
        else {
            //It is becoming a port
            //We add an anchor element
            const g = newBurg.capital ? "cities" : "towns";
            const group = anchors.select("g#"+g);
            const size = +group.attr("size");
            group.append("use").attr("xlink:href", "#icon-anchor").attr("data-id", burgId)
                .attr("x", rn(newBurg.x - size * .47, 2)).attr("y", rn(newBurg.y - size * .47, 2))
                .attr("width", size).attr("height", size);
        }
    }

    //Changing status as capital
    if ( newBurg.capital !== currentBurg.capital ) {
        //If it is becoming a capital
        if ( newBurg.capital === 1 ) {
            //Move it to the "cities" group (make label bigger)
            moveBurgToGroup( burgId , "cities" );
        }
        else if ( newBurg.capital === 0 ) {
            //Else move it to the "towns" group (make label smaller)
            moveBurgToGroup( burgId, "towns" );
        }
    }

    //Sync all the changes
    pack.burgs[ burgId ] = newBurg;
}