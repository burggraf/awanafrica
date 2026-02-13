migrate((app) => {
  const collection = app.findCollectionByNameOrId("clubs");
  
  // Find the 'type' field
  const typeField = collection.fields.getByName("type");
  if (typeField) {
    typeField.name = "venue";
    typeField.values = ["Church", "School", "Community Center", "Christian Camp", "Other"];
    app.save(collection);
  }
}, (app) => {
  const collection = app.findCollectionByNameOrId("clubs");
  const venueField = collection.fields.getByName("venue");
  if (venueField) {
    venueField.name = "type";
    venueField.values = ["church", "school", "other"];
    app.save(collection);
  }
})
