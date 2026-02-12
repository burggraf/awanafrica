migrate((app) => {
  const clubs = app.findCollectionByNameOrId("clubs");
  
  // Use a more robust join-like pattern for admin roles
  // We check if there's a record in admin_roles for the current user that matches the required scope
  const adminCondition = `(
    @collection.admin_roles.user ?= @request.auth.id && (
      @collection.admin_roles.role ?= 'Global' || 
      (@collection.admin_roles.role ?= 'Country' && @collection.admin_roles.country ?= region.country) || 
      (@collection.admin_roles.role ?= 'Region' && @collection.admin_roles.region ?= region)
    )
  )`;

  const membershipCondition = `(
    @collection.club_memberships.club ?= id && 
    @collection.club_memberships.user ?= @request.auth.id
  )`;

  clubs.listRule = `@request.auth.id != "" && (${adminCondition} || ${membershipCondition})`;
  clubs.viewRule = clubs.listRule;

  return app.save(clubs);
}, (app) => {
  const clubs = app.findCollectionByNameOrId("clubs");
  
  clubs.listRule = "@request.auth.id != '' && @collection.club_memberships.club.id ?= id && @collection.club_memberships.user.id ?= @request.auth.id";
  clubs.viewRule = clubs.listRule;

  return app.save(clubs);
})
