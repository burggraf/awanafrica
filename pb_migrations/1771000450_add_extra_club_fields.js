migrate((app) => {
  const collection = app.findCollectionByNameOrId("clubs");
  
  collection.fields.add(new Field({
    name: "type",
    type: "select",
    values: ["Leader Based", "Other"],
    required: true,
    defaultValue: "Leader Based"
  }));

  collection.fields.add(new Field({
    name: "denomination",
    type: "text"
  }));

  collection.fields.add(new Field({
    name: "location",
    type: "text"
  }));

  collection.fields.add(new Field({
    name: "missionary",
    type: "relation",
    collectionId: "_pb_users_auth_",
    required: false
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("clubs");
  
  collection.fields.removeByName("type");
  collection.fields.removeByName("denomination");
  collection.fields.removeByName("location");
  collection.fields.removeByName("missionary");

  return app.save(collection);
})
