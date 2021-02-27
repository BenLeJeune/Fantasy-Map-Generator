const {frontend_constants} = require("automerge/src/automerge");


//This function will be used to "symbol" secrets in JSON

console.log(frontend_constants);

const jsonSymbolEncoder = ( obj ) => {

    console.log("object:", obj);

    //declare the destination object
    const destinationObject = {};
    
    //iterate through ownKeys (which includes symbols)
    for ( let key of Reflect.ownKeys(obj) ) {
        switch (typeof key) {
            case "string": {
                //Simply - only need to add the value
                console.log("Adding key string ", key)
                destinationObject[key] = obj[key];
                break;
            }
            case "symbol": {
                console.log("Converting symbol ", key.toString())
                //Convert these into a string
                destinationObject[ `symbol-${key.toString()}` ] = obj[key];
                break;
            }
            default: {
                console.log("hmmm. not sure what happened here...");
            }
        }
    }

    return destinationObject;

}


const jsonSymbolParser = obj => {

    //declare the destination object
    const destinationObject = {};

    //iterate through the keys - no need for ownkeys this time, only strings.
    for ( let key of Object.keys(obj) ) {
        
        //see if any stringified symbol have been found here...
        
        if ( key.indexOf("symbol-Symbol(") !== -1 ) {
            //this should be a good enough check
            let symbolResult = key.replace("symbol-", "");

            for ( let symbolConstant of Object.values( frontend_constants ) ) {

                if ( symbolConstant.toString() === symbolResult ) {
                    //If they produce the same thing, they're the same
                    destinationObject[ symbolConstant ] = obj[key];
                    console.log(symbolConstant.toString());

                    console.log("equal?: ", symbolConstant === frontend_constants.STATE )
                }

            }

        }
        else {
            //Just a regular old key
            destinationObject[ key ] = obj[key];
        }
    }

    return destinationObject;

}

module.exports = {
    jsonSymbolParser,
    jsonSymbolEncoder
}