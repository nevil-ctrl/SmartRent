Где взять ключи и как безопасно заполнить `.env`

1) MUMBAI_RPC_URL (Alchemy / Infura / public)
- Alchemy:
  1. Зарегистрируйтесь на https://www.alchemy.com/
  2. Создайте приложение (App) -> выберите сеть Polygon Mumbai
  3. Скопируйте HTTP URL (пример: https://polygon-mumbai.g.alchemy.com/v2/<KEY>)
- Infura:
  1. Зарегистрируйтесь на https://infura.io/
  2. Создайте проект, выберите Polygon + сеть Mumbai
  3. Скопируйте endpoint
- Public RPC (устойчивость/надёжность может быть ниже): https://rpc-mumbai.maticvigil.com

2) PRIVATE_KEY
- Откройте MetaMask -> Аккаунт -> Экспортировать приватный ключ (enter password -> copy private key).
- Скопируйте и вставьте в `.env` без префикса `0x`.
- ВАЖНО: Никогда не публикуйте `.env` в публичных репозиториях. Добавьте `.env` в `.gitignore`.

3) POLYGONSCAN_API_KEY
- Перейдите на https://polygonscan.com/ -> войдите или зарегистрируйтесь -> My API Keys -> Create New API Key
- Скопируйте ключ и вставьте в `.env`.

4) INFURA IPFS (опционально)
- Если вы хотите сохранять файлы на IPFS через Infura:
  - Зарегистрируйтесь на https://infura.io/
  - Создайте проект -> выберите IPFS -> получите Project ID и Project Secret
  - Вставьте в VITE_IPFS_PROJECT_ID и VITE_IPFS_PROJECT_SECRET

5) Как безопасно работать с приватными данными
- Никогда не пушьте `.env` в git.
- Для CI используйте секреты GitHub Actions / GitLab CI variables.
- Для локальной работы держите приватный ключ в менеджере паролей.

Примеры команд (локально, в корне проекта):

# Скопировать пример и отредактировать
cp .env.example .env
# Откройте .env в редакторе (VS Code, Notepad) и вставьте ваши ключи

# Проверить, что файл .env не добавлен в git
git status --ignored

Если хотите, могу пройти с вами шаг-за-шагом по созданию аккаунта Alchemy/Infura и получению ключей — скажите, какую платформу предпочтёте.