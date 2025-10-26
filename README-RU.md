# 🏠 SmartRent - Децентрализованная платформа аренды

## 🎉 Что нового?

✅ **Активные смарт-контракты на главной странице**  
✅ **Система откликов/заявок на аренду**  
✅ **Просмотр деталей контрактов**  
✅ **Поддержка Polygon Amoy testnet**  
✅ **Работа БЕЗ тестовых MATIC (локальная нода)**  
✅ **Исправлена ошибка со стилями**

---

## ⚡ Быстрый старт

### 💡 Нет MATIC? Есть 2 варианта!

#### Вариант 1: Mock данные (БЕЗ блокчейна вообще)
```bash
npm run dev
# Откройте http://localhost:5173
# Всё работает сразу! ✨
```

#### Вариант 2: Локальная Hardhat нода (БЕЗ тестовых MATIC)
```bash
# Терминал 1
npm run node

# Терминал 2
npm run deploy:local
npm run dev
```
**Подробно:** `РАБОТА-БЕЗ-MATIC.md`

---

### 1️⃣ Получить тестовые MATIC (для Polygon Amoy)

```bash
# Откройте файл для подробных инструкций:
ПОЛУЧИТЬ-ТЕСТОВЫЕ-MATIC.md
```

**Или быстро:**

- Перейдите: https://faucet.polygon.technology/
- Выберите сеть: **Polygon Amoy**
- Получите **0.5 MATIC** (бесплатно)

### 2️⃣ Установить зависимости

```bash
npm install
```

### 3️⃣ Создать .env файл

```bash
echo "PRIVATE_KEY=ваш_приватный_ключ_без_0x" > .env
echo "AMOY_RPC_URL=https://rpc-amoy.polygon.technology" >> .env
```

### 4️⃣ Задеплоить контракты

```bash
npm run deploy:amoy
```

### 5️⃣ Обновить адрес контракта

```bash
# Скопируйте адрес SmartRent из вывода деплоя
npm run update-address 80002 0xВАШ_АДРЕС_КОНТРАКТА
```

### 6️⃣ Запустить приложение

```bash
npm run dev
```

Откройте: **http://localhost:5173**

---

## 📚 Подробные инструкции

- **ЧТО-ИЗМЕНИЛОСЬ.md** - ⭐ **НАЧНИТЕ С ЭТОГО!** Краткая справка
- **РАБОТА-БЕЗ-MATIC.md** - ⭐ **Работа без тестовых токенов!**
- **БЫСТРЫЙ-СТАРТ.md** - Полное руководство с примерами
- **ВСЁ-РАБОТАЕТ-ПРЯМО-СЕЙЧАС.md** - Что уже работает (старая версия)

---

## 🎨 Новые функции

### 📋 Активные смарт-контракты

На главной странице теперь отображаются все активные контракты аренды:

- Информация об участниках
- Статус контракта
- Финансовые детали
- Оставшееся время
- Ссылка на PolygonScan

### ✉️ Система откликов

Пользователи могут подавать заявки на аренду:

- Выбор дат с календарем
- Автоматический расчет стоимости
- Контактная информация
- Сообщение арендодателю
- Создание rental контракта в блокчейне

### 📄 Просмотр контрактов

Детальная информация о каждом контракте:

- IPFS хэш
- Адреса участников
- Статус подписей
- История изменений

---

## 🛠️ Команды

```bash
# Разработка
npm run dev              # Запустить приложение
npm run node             # Запустить локальную ноду Hardhat
npm run compile          # Скомпилировать контракты
npm run test             # Запустить тесты

# Деплой
npm run deploy:local     # Hardhat Local (для разработки)
npm run deploy:amoy      # Polygon Amoy (для тестирования)
npm run deploy:polygon   # Polygon Mainnet (для продакшена)

# Утилиты
npm run update-address <chainId> <address>  # Обновить адрес контракта
```

---

## 🌐 Сети

### Polygon Amoy Testnet (Рекомендуется для тестирования)

```
Network: Polygon Amoy Testnet
RPC: https://rpc-amoy.polygon.technology
Chain ID: 80002
Symbol: MATIC
Explorer: https://amoy.polygonscan.com
```

### Hardhat Local (Для разработки)

```
Network: Hardhat Local
RPC: http://127.0.0.1:8545
Chain ID: 1337
```

---

## 📁 Структура проекта

```
SmartRent/
├── contracts/              # Смарт-контракты (Solidity)
│   ├── SmartRent.sol
│   ├── ListingRegistry.sol
│   ├── RentalEscrow.sol
│   └── ...
├── scripts/                # Скрипты деплоя
│   ├── deploy.cjs
│   └── update-contract-address.cjs
├── src/
│   ├── components/         # React компоненты
│   │   ├── ActiveContractsSection.tsx  ⭐ НОВОЕ
│   │   ├── RentalApplicationModal.tsx  ⭐ НОВОЕ
│   │   ├── ListingCard.tsx
│   │   └── ...
│   ├── hooks/              # React hooks
│   │   ├── useContracts.ts
│   │   ├── useWeb3.ts
│   │   └── ...
│   ├── pages/              # Страницы
│   │   ├── BrowseListingsPage.tsx
│   │   ├── MyListingsPage.tsx
│   │   └── ...
│   └── App.tsx             # Главный компонент
├── БЫСТРЫЙ-СТАРТ.md                    ⭐ НОВОЕ
├── ПОЛУЧИТЬ-ТЕСТОВЫЕ-MATIC.md          ⭐ НОВОЕ
├── CHANGELOG-NEW-FEATURES.md           ⭐ НОВОЕ
└── README-RU.md                        ⭐ НОВОЕ
```

---

## 🎯 Что дальше?

1. ✅ Получите тестовые MATIC
2. ✅ Задеплойте контракты
3. ✅ Создайте первый листинг
4. ✅ Подайте заявку на аренду
5. ✅ Посмотрите активные контракты

**Все работает с mock данными даже без блокчейна!**

---

## 💡 Полезные ссылки

- **Polygon Faucet:** https://faucet.polygon.technology/
- **Polygon Amoy Explorer:** https://amoy.polygonscan.com
- **Документация Polygon:** https://docs.polygon.technology/
- **MetaMask:** https://metamask.io/

---

## ❓ Помощь

Если что-то не работает:

1. Прочитайте **БЫСТРЫЙ-СТАРТ.md**
2. Проверьте консоль браузера
3. Проверьте MetaMask (правильная сеть?)
4. Проверьте баланс MATIC
5. Убедитесь что контракты задеплоены

---

## 📞 Контакты

Если нужна помощь:

- Откройте issue на GitHub
- Проверьте документацию
- Посмотрите примеры в коде

---

**🚀 Приятной разработки!**

Made with ❤️ using React, TypeScript, Ethers.js, Hardhat, and Polygon
