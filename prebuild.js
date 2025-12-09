const fs = require("fs");
fs.mkdirSync(".vercel/output/data", { recursive: true });
fs.copyFileSync("prisma/dev.db", ".vercel/output/data/dev.db");
