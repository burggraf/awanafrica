migrate((app) => {
  const clubs = app.findCollectionByNameOrId("clubs");
  
  // Restore proper hierarchical access rules
  const adminCondition = `@request.auth.id != "" && @collection.admin_roles.user.id ?= @request.auth.id && (@collection.admin_roles.role ?= "Global" || (@collection.admin_roles.role ?= "Country" && @collection.admin_roles.country ?= region.country) || (@collection.admin_roles.role ?= "Region" && @collection.admin_roles.region ?= region))`;
  
  const membershipCondition = `@request.auth.id != "" && @collection.club_memberships.club ?= id && @collection.club_memberships.user ?= @request.auth.id`;
  
  clubs.listRule = `(${adminCondition}) || (${membershipCondition})`;
  clubs.viewRule = clubs.listRule;
  clubs.createRule = adminCondition;
  clubs.updateRule = adminCondition;
  clubs.deleteRule = adminCondition;

  return app.save(clubs);
}, (app) => {
  // Rollback - open access
  const clubs = app.findCollectionByNameOrId("clubs");
  clubs.listRule = '@request.auth.id != ""';
  clubs.viewRule = '@request.auth.id != ""';
  clubs.createRule = '@request.auth.id != ""';
  clubs.updateRule = '@request.auth.id != ""';
  clubs.deleteRule = '@request.auth.id != ""';
  return app.save(clubs);
})
