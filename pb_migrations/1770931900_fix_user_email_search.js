migrate((app) => {
  const users = app.findCollectionByNameOrId("_pb_users_auth_");
  
  // Set manageRule to allow admins to see and search all fields
  users.manageRule = "@collection.admin_roles.user.id ?= @request.auth.id";
  
  // Update existing users to have email visibility true so they are searchable by standard list rules too
  // and so the email field is returned in results.
  app.db().newQuery("UPDATE users SET emailVisibility = 1").execute();
  
  return app.save(users);
}, (app) => {
  const users = app.findCollectionByNameOrId("_pb_users_auth_");
  users.manageRule = null;
  return app.save(users);
})
