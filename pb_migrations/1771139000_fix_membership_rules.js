migrate((app) => {
  const coll = app.findCollectionByNameOrId("club_memberships");
  
  // Standard users can only see their own memberships
  // Admins can see all (handled via system or we add it here)
  coll.listRule = "user = @request.auth.id";
  coll.viewRule = "user = @request.auth.id";
  
  // Create rule was already set correctly in 1770932100 but let's make sure
  // it allows creating Guardian/Pending during onboarding
  coll.createRule = "@request.auth.id != '' && user = @request.auth.id";

  app.save(coll);
}, (app) => {})
