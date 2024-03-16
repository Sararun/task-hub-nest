import { main as statusSeeder } from './status.seeder';

async function main() {
  await statusSeeder();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
