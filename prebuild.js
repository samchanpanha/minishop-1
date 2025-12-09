const fs = require("fs");

// Ensure prisma directory exists
if (!fs.existsSync("prisma")) {
    fs.mkdirSync("prisma", { recursive: true });
}

// Create empty db file if it doesn't exist (for Prisma generate)
if (!fs.existsSync("prisma/dev.db")) {
    console.log("Creating empty database file for Prisma...");
    fs.writeFileSync("prisma/dev.db", "");
}

console.log("Prebuild complete - database file ready");
