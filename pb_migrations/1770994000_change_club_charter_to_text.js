migrate((app) => {
  const collection = app.findCollectionByNameOrId("clubs");
  
  // We need to remove the old numeric field first because PocketBase 
  // won't allow adding another field with the same name.
  // Then we add the new text field.
  try {
    collection.fields.removeByName("charter");
  } catch (e) {
    // ignore if it doesn't exist
  }

  collection.fields.add(new Field({
    name: "charter",
    type: "text",
    unique: true,
    min: 1,
    max: 100
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("clubs");

  try {
    collection.fields.removeByName("charter");
  } catch (e) {}

  collection.fields.add(new Field({
    name: "charter",
    type: "number",
    unique: true
  }));

  return app.save(collection);
})
