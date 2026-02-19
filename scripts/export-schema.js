// Helper script to export schema from PocketBase JS runner
module.exports = (app) => {
    const collections = app.findAllCollections();
    const fs = require("fs");
    fs.writeFileSync("pb_schema_generated.json", JSON.stringify(collections, null, 2));
    console.log("Schema exported to pb_schema_generated.json");
};
