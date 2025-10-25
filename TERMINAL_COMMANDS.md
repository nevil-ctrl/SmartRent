# Команды терминала — быстрое руководство (русский)

Ниже собраны основные команды, которые вам понадобятся для разработки, сборки и деплоя этого проекта. Скопируйте соответствующие команды в ваш терминал (Git Bash на Windows рекомендован).

> Внимание: перед деплоем обязательно создайте файл `.env` на основе `.env.full` или `.env.example` и заполните значения (особенно `MUMBAI_RPC_URL` и `PRIVATE_KEY`).

## Установка зависимостей

Установите node-зависимости проекта:

```bash
npm install
```

Если вы используете Yarn:

```bash
yarn
```

## Подготовка .env

Скопируйте шаблон и заполните значения:

```bash
# Скопировать подробный шаблон
cp .env.full .env
# или, если вы хотите использовать пример
cp .env.example .env
```

После копирования — отредактируйте `.env` и вставьте ваш `MUMBAI_RPC_URL` и `PRIVATE_KEY` (без префикса 0x).

## Разработка фронтенда (Vite)

Запустить dev-сервер:

```bash
npm run dev
```

Сборка фронтенда для продакшена:

```bash
npm run build
```

Предпросмотр собранной версии:

```bash
npm run preview
```

## Hardhat — компиляция и тесты

Компиляция смарт-контрактов:

```bash
npm run compile
# или
npx hardhat compile
```

Запустить тесты (Hardhat mocha/ts):

```bash
npm test
# или
npx hardhat test
```

Посмотреть доступные аккаунты локально (если запущен локальный нод):

```bash
npx hardhat accounts --network localhost
```

## Деплой контрактов

Скрипт деплоя в `scripts/deploy.ts`. Для деплоя на Mumbai используйте:

```bash
npm run deploy:mumbai
# или напрямую
npx hardhat run scripts/deploy.ts --network mumbai
```

Для деплоя в основную сеть Polygon (если настроено):

```bash
npm run deploy:polygon
# или
npx hardhat run scripts/deploy.ts --network polygon
```

После успешного деплоя в консоли обычно печатается адрес деплоя — скопируйте его и вставьте в `.env` в переменную `VITE_SMARTRENT_ADDRESS`.

Если плагин в `hardhat.config` поддерживает верификацию, вы можете запускать команду верификации (пример):

```bash
npx hardhat verify --network mumbai <ADDRESS> "Constructor Arg 1" "Arg 2"
```

(Замените `<ADDRESS>` и параметры на реальные значения.)

## Проверка окружения и диагностика

Если что-то падает при подключении к RPC или деплое, проверьте:
- Правильность `MUMBAI_RPC_URL` (Alchemy/Infura ключ)
- Правильность `PRIVATE_KEY` (без `0x`)
- Наличие интернета и доступность endpoint'а

Примеры проверки соединения (curl):

```bash
# Простой curl-пинг для Alchemy/Infura RPC
curl -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","id":1,"method":"eth_chainId","params":[]}' $MUMBAI_RPC_URL
```

## Полезные вспомогательные команды

Запустить TypeScript-компиляцию (если нужно отдельно):

```bash
npx tsc -w
```

Очистить кеш node_modules и переустановить:

```bash
rm -rf node_modules package-lock.json
npm install
```

Windows: если `rm -rf` не работает в cmd, используйте Git Bash или PowerShell:

```powershell
rm -r -fo node_modules; rm package-lock.json
```

## Частые сценарии (шаги «быстро сделать»)

1) Клонировать репозиторий

```bash
git clone <repo-url>
cd SmartRent
```

2) Установить зависимости и подготовить .env

```bash
npm install
cp .env.full .env
# отредактировать .env
```

3) Запустить фронтенд и проверить интерфейс

```bash
npm run dev
```

4) Скомпилировать и деплоить контракты на Mumbai

```bash
npm run compile
npm run deploy:mumbai
```

---

Если хотите, я могу:
- Автоматически запустить `npm run dev` и проверить ошибки в терминале; или
- Добавить `setup.sh`/`setup.bat`, который будет выполнять базовые шаги (установка, копирование `.env`, компиляция). Скажите, что предпочитаете.