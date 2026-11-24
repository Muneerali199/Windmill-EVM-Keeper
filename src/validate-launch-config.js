import "dotenv/config";

const errors = [];

if (!process.env.RPC_URL?.trim()) {
  errors.push("RPC_URL is missing.");
}
if (!/^0x[0-9a-fA-F]{64}$/.test(process.env.PRIVATE_KEY?.trim() ?? "")) {
  errors.push("PRIVATE_KEY must be 0x followed by exactly 64 hexadecimal characters.");
}
if (!process.env.CONTRACT_ADDRESS?.trim()) {
  errors.push("CONTRACT_ADDRESS is missing.");
}

if (errors.length > 0) {
  console.error("[3/3] Invalid keeper configuration:");
  for (const error of errors) {
    console.error(`  - ${error}`);
  }
  process.exitCode = 1;
}
