import { MET_VERIFIED } from "../../lib/generated/met-verified";
import { writeFileSync } from "fs";
writeFileSync(process.argv[2], JSON.stringify(MET_VERIFIED), "utf8");
console.log(MET_VERIFIED.length);
