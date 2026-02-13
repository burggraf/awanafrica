migrate((app) => {
  const collection = app.findCollectionByNameOrId("clubs");
  
  // Find the 'venue' field
  const venueField = collection.fields.getByName("venue");
  if (venueField) {
    venueField.values = ["Church", "School", "Community Center", "Christian Camp", "Other"];
    app.save(collection);
  }
}, (app) => {
  // no-op
})
