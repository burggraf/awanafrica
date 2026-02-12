migrate((app) => {
  const collections = ["club_memberships", "admin_roles"];
  for (const name of collections) {
    const coll = app.findCollectionByNameOrId(name);
    const fieldName = name === "club_memberships" ? "roles" : "role";
    const field = coll.fields.getByName(fieldName);
    
    // Explicitly set the values
    if (name === "club_memberships") {
      field.values = ["Director", "Secretary", "Treasurer", "Leader", "Guardian", "Pending"];
    } else {
      field.values = ["Global", "Country", "Region", "Pending"];
    }
    
    app.save(coll);
    // Use app.logger or similar if console.log doesn't work well in PB JS VM, 
    // but console.log usually goes to stdout
    console.log(`>>> SCHEMA UPDATE: ${name}.${fieldName} set to ${field.values.join(", ")}`);
  }
}, (app) => {
})
