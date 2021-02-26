const PORT = 3000;

const docSet = new Automerge.DocSet();

//console.log the doc whenever it changes
docSet.registerHandler((docId, doc) => {
    console.log(`[${ docId }] ${ JSON.stringify(doc) }`);
})