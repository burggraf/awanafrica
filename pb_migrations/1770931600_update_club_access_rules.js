migrate((app) => {
  const clubs = app.findCollectionByNameOrId("clubs");
  
  const adminCondition = "@collection.admin_roles.user.id ?= @request.auth.id && (" +
    "@collection.admin_roles.role ?= 'Global' || " +
    "(@collection.admin_roles.role ?= 'Country' && @collection.admin_roles.country ?= region.country) || " +
    "(@collection.admin_roles.role ?= 'Region' && @collection.admin_roles.region ?= region)" +
    ")";

  const membershipCondition = "@collection.club_memberships.club.id ?= id && @collection.club_memberships.user.id ?= @request.auth.id";

  clubs.listRule = `@request.auth.id != "" && (${adminCondition} || ${membershipCondition})`;
  clubs.viewRule = clubs.listRule;

  return app.save(clubs);
}, (app) => {
  const clubs = app.findCollectionByNameOrId("clubs");
  
  // Revert to old membership-only rule
  clubs.listRule = "@request.auth.id != '' && @collection.club_memberships.club.id ?= id && @collection.club_memberships.user.id ?= @request.auth.id";
  clubs.viewRule = clubs.listRule;

  return app.save(clubs);
})
