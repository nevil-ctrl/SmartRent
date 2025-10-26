#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

// Читаем аргументы командной строки
const args = process.argv.slice(2);
const chainId = args[0];
const contractAddress = args[1];

if (!chainId || !contractAddress) {
  console.error(
    "❌ Usage: node update-contract-address.cjs <chainId> <contractAddress>"
  );
  console.error(
    "   Example: node update-contract-address.cjs 80002 0x1234567890123456789012345678901234567890"
  );
  process.exit(1);
}

// Проверяем, что адрес валидный
if (!contractAddress.startsWith("0x") || contractAddress.length !== 42) {
  console.error(
    "❌ Invalid contract address format. Must start with 0x and be 42 characters long."
  );
  process.exit(1);
}

// Путь к файлу useContracts.ts
const contractsFilePath = path.join(__dirname, "../src/hooks/useContracts.ts");

try {
  // Читаем файл
  let fileContent = fs.readFileSync(contractsFilePath, "utf8");

  // Находим и обновляем адрес для указанного chainId
  const regex = new RegExp(
    `(${chainId}:\\s*{[\\s\\S]*?SmartRent:\\s*")([^"]*)(")`,
    "g"
  );

  if (!fileContent.match(regex)) {
    console.error(`❌ Could not find chainId ${chainId} in CONTRACT_ADDRESSES`);
    process.exit(1);
  }

  fileContent = fileContent.replace(regex, `$1${contractAddress}$3`);

  // Записываем обновленный файл
  fs.writeFileSync(contractsFilePath, fileContent, "utf8");

  console.log("✅ Contract address updated successfully!");
  console.log(`   Chain ID: ${chainId}`);
  console.log(`   Address: ${contractAddress}`);
  console.log(`   File: ${contractsFilePath}`);

  // Также создаем/обновляем .env файл
  const envPath = path.join(__dirname, "../.env");
  let envContent = "";

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf8");
  }

  // Обновляем или добавляем VITE_SMARTRENT_ADDRESS
  const viteAddressRegex = /VITE_SMARTRENT_ADDRESS=.*/;
  if (envContent.match(viteAddressRegex)) {
    envContent = envContent.replace(
      viteAddressRegex,
      `VITE_SMARTRENT_ADDRESS=${contractAddress}`
    );
  } else {
    envContent += `\nVITE_SMARTRENT_ADDRESS=${contractAddress}\n`;
  }

  fs.writeFileSync(envPath, envContent, "utf8");
  console.log("✅ .env file updated!");

  console.log("\n🎉 All done! You can now run: npm run dev");
} catch (error) {
  console.error("❌ Error updating contract address:", error.message);
  process.exit(1);
}
