
migrate((app) => {
  const collection = app.findCollectionByNameOrId("users");
  
  // In PB 0.36+, onlyVerified is a property of the collection itself
  // but since we want to be sure, we can also set it in the AuthRule if needed.
  // However, the official way in JS hooks/migrations is to set it on the collection.
  collection.authRule = "verified = true";
  
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("users");
  collection.authRule = "";
  return app.save(collection);
})
