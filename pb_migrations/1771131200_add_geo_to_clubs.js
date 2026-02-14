migrate((app) => {
  const collection = app.findCollectionByNameOrId("clubs");
  
  collection.fields.add(new Field({
    name: "lat",
    type: "number",
    required: false
  }));

  collection.fields.add(new Field({
    name: "lng",
    type: "number",
    required: false
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("clubs");
  
  collection.fields.removeByName("lat");
  collection.fields.removeByName("lng");

  return app.save(collection);
})
