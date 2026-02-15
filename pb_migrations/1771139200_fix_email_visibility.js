/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // Update all users to have emailVisibility = true
  // This ensures that anyone who has permission to view the user (via listRule/viewRule)
  // can also see their email address.
  app.db().newQuery("UPDATE users SET emailVisibility = 1").execute();
  
  return null;
}, (app) => {
  // We don't want to revert this as it would hide emails again
  return null;
})
