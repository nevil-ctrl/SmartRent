Развёртывание на Polygon Mumbai — инструкция

Коротко: я подготовил скрипт `scripts/deploy.ts`. Чтобы задеплоить на Mumbai и подключить фронтенд — выполните шаги ниже.

1) Подготовьте .env
- Скопируйте `.env.example` в `.env` и заполните поля:
  - MUMBAI_RPC_URL — RPC endpoint (Alchemy, Infura или публичный)
  - PRIVATE_KEY — приватный ключ аккаунта, который будет деплоить (без префикса 0x)
  - POLYGONSCAN_API_KEY — для верификации контрактов (опционально)

Пример (Linux/WSL/Git Bash):
```bash
cp .env.example .env
# Откройте .env и вставьте ваши значения
```

2) Установите зависимости (если не сделали)
```bash
npm install
```

3) Запуск деплоя на Mumbai
```bash
# npm script использует переменные из process.env
# Убедитесь, что в .env указаны MUMBAI_RPC_URL и PRIVATE_KEY
npm run deploy:mumbai
```

Что делает скрипт
- Деплоит: ListingRegistry, RentalEscrow, Arbitration, SubscriptionManager, Reputation, SmartRent
- Инициализирует SmartRent (вызывает initializePlatform)
- Выдаёт роль ARBITRATOR автору деплоя (для тестирования)
- Сохраняет `artifacts/deployment.json` с адресами контрактов
- Пытается верифицировать контракты на Polygonscan (если POLYGONSCAN_API_KEY задан)

4) Что вставить в фронтенд
- После успешного деплоя откройте `artifacts/deployment.json`. Там будут адреса контрактов.
- Откройте `src/hooks/useContracts.ts` и в `CONTRACT_ADDRESSES` для сети `80001` вставьте полученные адреса, например:
  CONTRACT_ADDRESSES[80001].SmartRent = "0x...";

5) Настройка MetaMask и RPC
- В MetaMask добавьте сеть Polygon Mumbai (если ещё не добавлена). Настройка:
  - Network Name: Polygon Mumbai
  - RPC URL: ваш MUMBAI_RPC_URL (или общедоступный: https://rpc-mumbai.maticvigil.com)
  - Chain ID: 80001
  - Currency: MATIC
  - Block Explorer URL: https://mumbai.polygonscan.com

6) IPFS (pinning)
- Для надёжного хранения файлов используйте Infura, Pinata или web3.storage. В `src/utils/ipfs.ts` есть заготовка — замените конфиг на ваш API key при необходимости.

7) PDF + подпись
- В `src/components/SignPDFButton.tsx` пример: генерируем простой PDF (jsPDF), загружаем в IPFS, подписываем hash через signer.signMessage и затем вызываем контрактный метод `signContract(rentalId, ipfsHash)`.
- Текущая smart-contract логика для `agreeReturn` ожидает, что обе стороны уже вызвали `signContract` (on-chain флаг tenantSigned/landlordSigned). В этом MVP подписи ECDSA выполняются офф-чейн для доказуемости, а on-chain хранится только IPFS hash и отметка подписи от адреса (через вызов `signContract`).

8) Отладка: контракт не найден на сети
- Если фронтенд показывает `Contract not deployed on this network`, значит адрес в `CONTRACT_ADDRESSES` не проставлен правильно.
- Проверьте `artifacts/deployment.json` и вставьте адрес в `useContracts.ts`.

9) Common errors и решения
- Error: "Contract not deployed on this network" — вставьте верный адрес
- MetaMask не добавляет сеть — используйте правильный chainId (80001) и корректный RPC
- IPFS upload fails — проверьте API key/credentials

10) Команды для быстрой проверки
```bash
# Компиляция контрактов
npm run compile

# Запуск тестов (Hardhat)
npm run test

# Запуск локального фронтенда
npm run dev
```

Если хотите, я могу:
- Запустить деплой у себя (нужны ваши MUMBAI_RPC_URL и PRIVATE_KEY) — или вы прислать их, или сделать шаги вместе пошагово.
- Автоматически проставить адреса в `useContracts.ts` после деплоя.

---
