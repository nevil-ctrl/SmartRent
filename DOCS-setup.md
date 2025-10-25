Что делать — краткая инструкция (Windows)

Этот файл объясняет, какие команды вводить в терминал и почему вы видели ошибку

Ошибка, которую вы видели:

> Failed to load PostCSS config (searchPath: C:/Users/ASUS/Desktop/SmartRent): [Error] Cannot find module '@tailwindcss/postcss'

Причина:
- В проекте оставался файл `postcss.config.cjs`, который подключал плагин `@tailwindcss/postcss`. Мы удалили Tailwind из `package.json`, поэтому модуль больше не установлен — Vite пытается загрузить PostCSS конфиг и падает.

Что я сделал (и что уже сделано в репозитории):
- Удалил `tailwind.config.js` и `postcss.config.cjs` из проекта.
- Убрал Tailwind-плагин из `vite.config.ts`.
- Заменил содержимое `src/index.css`, чтобы работало без Tailwind.
- Удалил Tailwind-пакеты из `package.json` и запустил `npm install`.

Если у вас всё ещё возникает ошибка — вероятно, сервер dev уже запущен и кэширует старое состояние; нужно перезапустить dev-сервер.

Короткие команды (скопируйте и выполняйте в Git Bash / WSL / PowerShell в папке проекта):

# 1) Убедиться, что нет постконфигурации
ls -la postcss.config.cjs || echo "postcss.config.cjs not found"

# 2) Установить/обновить зависимости после правок package.json
npm install

# 3) Перезапустить dev-сервер Vite
npm run dev

# 4) Если вы видите ошибки поиска модуля — удалить node_modules и package-lock и переустановить
rm -rf node_modules package-lock.json
npm install

Foundry / forge (опционально)

Почему `npm install ds-test` выдаёт 404:
- `ds-test` и `forge-std` — это библиотеки для Foundry (инструмент `forge`), а не npm-пакеты. Их нельзя установить через npm.

Как установить Foundry (рекомендую использовать WSL на Windows):
1) Установите WSL (если ещё не установлен):
   - В PowerShell (run as Admin):
     wsl --install
   - Перезагрузите систему, запустите Ubuntu и завершите настройку.

2) В WSL (Ubuntu) выполните:
```bash
curl -L https://foundry.paradigm.xyz | bash
source ~/.bashrc
foundryup
```
Это установит `forge`, `cast`, `anvil` и пр.

3) В проекте (WSL) выполните:
```bash
forge install foundry-rs/forge-std
forge test
```

Важно: на Windows (Git Bash / MSYS) `foundryup` и `forge` иногда не работают корректно — WSL гораздо стабильнее.

Исправление предупреждений в Solidity (рекомендации)
- В `contracts/Counter.t.sol` переименовать `assert(...)` во что-то иное (например, `assertTrue(...)`) — чтобы не shadow-ить builtin.
- В `contracts/Reputation.sol` удалить неиспользуемую переменную `oldRating` или использовать её.

Если вы хотите, чтобы я автоматически:
- исправил предупреждения в коде (поменял имя функции `assert` и убрал `oldRating`) — ответьте "исправь warnings"; я внесу изменения и проверю сборку.
- попытался установить Foundry на вашей машине — укажите, будете ли вы использовать WSL или Git Bash.

Готов продолжать — скажите, что делаем дальше.
