function noteListener( note, doc ) {
    
    let mapNotes = doc.getMap("mapData").get("notes");

    let newNote = mapNotes.get(note);
    let oldNote = notes[note];
    console.log("Updating note", newNote);
    notes[note] = newNote;

}

function addNoteListener( noteId, doc ) {
    console.log("Note has been added!");

    let mapNotes = doc.getMap("mapData").get("notes");
    let newNote = mapNotes.get(noteId);

    notes[noteId] = newNote;
}

function deleteNoteListener( noteIndex, doc ) {

    notes.splice( noteIndex, 1 );

}