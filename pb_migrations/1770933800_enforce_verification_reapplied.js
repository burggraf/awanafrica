migrate((app) => {
  const collection = app.findCollectionByNameOrId("users");
  
  collection.authRule = "verified = true";

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("users");
  
  collection.authRule = "";

  return app.save(collection);
})
