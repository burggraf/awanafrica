migrate((app) => {
  const collection = app.findCollectionByNameOrId("clubs");
  collection.fields.add(new Field({ 
    name: "salesforce", 
    type: "text" 
  }));
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("clubs");
  collection.fields.removeByName("salesforce");
  return app.save(collection);
})
