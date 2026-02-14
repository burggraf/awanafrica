migrate((app) => {
  const collection = app.findCollectionByNameOrId("clubs");
  
  collection.fields.add(new Field({
    name: "joinCode",
    type: "text",
    required: false,
    unique: true
  }));

  collection.fields.add(new Field({
    name: "leaderSecret",
    type: "text",
    required: false
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("clubs");
  
  collection.fields.removeByName("joinCode");
  collection.fields.removeByName("leaderSecret");

  return app.save(collection);
})
