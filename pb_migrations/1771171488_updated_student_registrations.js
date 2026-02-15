/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("studentregistra")

  // update collection data
  unmarshal({
    "name": "clubber_registrations"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("studentregistra")

  // update collection data
  unmarshal({
    "name": "student_registrations"
  }, collection)

  return app.save(collection)
})
