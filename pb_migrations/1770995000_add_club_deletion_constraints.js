migrate((app) => {
  const collections = ["countries", "regions", "clubs"];
  
  collections.forEach(collName => {
    app.onModelBeforeDelete(collName).bind((e) => {
      const id = e.model.id;
      let collectionsToCheck = [];
      let fieldName = "";

      if (collName === "countries") {
        collectionsToCheck = ["regions", "admin_roles"];
        fieldName = "country";
      } else if (collName === "regions") {
        collectionsToCheck = ["clubs", "admin_roles"];
        fieldName = "region";
      } else if (collName === "clubs") {
        collectionsToCheck = [
          "club_memberships",
          "programs",
          "club_years",
          "students",
          "events",
          "admin_roles"
        ];
        fieldName = "club";
      }
      
      const displayName = collName === "countries" ? "country" : collName.slice(0, -1);
      
      for (const checkColl of collectionsToCheck) {
        try {
          // Special case for admin_roles where the field might be different 
          // but we already mapped them to 'country', 'region', 'club' in our logic
          const result = app.dao().findFirstRecordByFilter(checkColl, fieldName + " = {:id}", { id: id });
          if (result) {
            throw new BadRequestError("Cannot delete " + displayName + " with existing related data (" + checkColl + ").");
          }
        } catch (err) {
          if (err.message.includes("no such table") || err.message.includes("no rows in result set")) {
              continue;
          }
          throw err;
        }
      }
      
      return e.next();
    });
  });
}, (app) => {
});
