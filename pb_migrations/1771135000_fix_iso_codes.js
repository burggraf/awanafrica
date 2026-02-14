migrate((app) => {
  const fixes = [
    { name: "Lesotho", isoCode: "LS" },
    { name: "Madagascar", isoCode: "MG" }
  ];

  for (const f of fixes) {
    try {
      const record = app.findFirstRecordByFilter("countries", `name = "${f.name}"`);
      record.set("isoCode", f.isoCode);
      app.save(record);
    } catch (e) {}
  }
}, (app) => {})
