migrate((app) => {
  const collection = app.findCollectionByNameOrId("programs");

  // Admin access rule (Global, Missionary, Country, Region)
  const isAdmin = `(
    @collection.admin_roles.user ?= @request.auth.id && (
      @collection.admin_roles.role ?= 'Global' || 
      @collection.admin_roles.role ?= 'Missionary' ||
      (@collection.admin_roles.role ?= 'Country' && @collection.admin_roles.country ?= club.country) || 
      (@collection.admin_roles.role ?= 'Region' && @collection.admin_roles.region ?= club.region)
    )
  )`;

  // Director access rule
  const isDirector = `(
    @collection.club_memberships.club ?= club.id && 
    @collection.club_memberships.user ?= @request.auth.id && 
    @collection.club_memberships.roles ?~ 'Director'
  )`;

  // View Rule: Any authenticated member of the club, or admin
  const isMember = `club.club_memberships_via_club.user.id ?= @request.auth.id`;
  
  const viewRule = `@request.auth.id != "" && (${isMember} || ${isAdmin} || ${isDirector})`;
  
  // Create/Update/Delete Rule: Only Directors or Admins
  const modifyRule = `@request.auth.id != "" && (${isAdmin} || ${isDirector})`;

  collection.listRule = viewRule;
  collection.viewRule = viewRule;
  collection.createRule = modifyRule;
  collection.updateRule = modifyRule;
  collection.deleteRule = modifyRule;

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("programs");
  collection.listRule = "@request.auth.id != '' && club.club_memberships_via_club.user.id ?= @request.auth.id";
  collection.viewRule = "@request.auth.id != '' && club.club_memberships_via_club.user.id ?= @request.auth.id";
  collection.createRule = null;
  collection.updateRule = null;
  collection.deleteRule = null;
  return app.save(collection);
})
