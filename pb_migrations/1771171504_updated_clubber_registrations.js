/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("studentregistra")

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": true,
    "collectionId": "students0000001",
    "hidden": false,
    "id": "relation3072569139",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "clubber",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("studentregistra")

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": true,
    "collectionId": "students0000001",
    "hidden": false,
    "id": "relation3072569139",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "student",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
