const pgStructure = require('pg-structure').default;

pgStructure({ database: "mydb", user: "toadslop", password: "newPassword" }, { includeSchemas: ["public"] }).then(db => {
  const schemas = db.schemas;
  console.log(db.get("users"))
})