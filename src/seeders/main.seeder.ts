import { main as statusSeeder } from './status.seeder';
import { main as roleSeeder } from './role.seeder';

async function main() {
  await statusSeeder();
  await roleSeeder();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
