
migrate((app) => {
  const collection = app.findCollectionByNameOrId("users");
  
  collection.options.onlyVerified = true;
  
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("users");
  collection.options.onlyVerified = false;
  return app.save(collection);
})
