migrate((app) => {
  const collection = app.findCollectionByNameOrId("clubs");
  
  // Allow anyone to list and view clubs so they can find them during onboarding.
  // We keep it restricted to authenticated users for now, or we can make it public
  // if we want people to browse clubs before registering.
  collection.listRule = ""; // Empty string means public (read-only)
  collection.viewRule = ""; 

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("clubs");
  
  // Revert to authenticated + membership rule
  // Note: This matches the rule from 1770931200_create_club_system.js
  collection.listRule = "@request.auth.id != '' && @collection.club_memberships.club.id ?= id && @collection.club_memberships.user.id ?= @request.auth.id";
  collection.viewRule = "@request.auth.id != '' && @collection.club_memberships.club.id ?= id && @collection.club_memberships.user.id ?= @request.auth.id";

  return app.save(collection);
})
