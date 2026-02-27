import { build as viteBuild } from "vite";

async function buildAll() {
  console.log("building client...");
  await viteBuild();
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
