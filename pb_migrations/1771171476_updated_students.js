/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("students0000001")

  // update collection data
  unmarshal({
    "name": "clubbers"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("students0000001")

  // update collection data
  unmarshal({
    "name": "students"
  }, collection)

  return app.save(collection)
})
