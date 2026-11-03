# Basket v0.2

Мобильное приложение для совместных семейных покупок: Google-вход, несколько групп, одноразовые приглашения, общие списки и синхронизация через Supabase Realtime. Используются только Next.js и бесплатные возможности Supabase; дополнительные серверы для работы приложения, платные API, Edge Functions, бюджеты и AI не требуются.

**Статус:** код и миграция реализованы, unit-тесты и проверки безопасности выполнены на настоящей локальной PostgreSQL 17. В облачный проект миграция ещё не применена: в текущем окружении Supabase CLI не авторизован. Перед использованием v0.2 примените миграцию по инструкции ниже и выполните проверку Realtime с двумя Google-аккаунтами. Успешный вход Google проверялся на предыдущем этапе; это не подтверждение новых облачных сценариев.

## Установка и запуск

Требуется Node.js >=22.13, npm. Версии зафиксированы в `package-lock.json`.

```sh
npm ci
# Создайте .env с переменными из блока ниже
npm run dev
```

Откройте [localhost:3000](http://localhost:3000). Язык по умолчанию — `ru`; также доступны `en`, `ro`, `uk`. Существующий `.env` не перезаписывайте.

```env
NEXT_PUBLIC_SUPABASE_URL=https://loawocnrcgxghhvvrexg.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Project URL можно взять в Supabase Dashboard → Connect / Project Settings → Data API. Publishable key (`sb_publishable_…`) находится в Project Settings → API Keys. Принимается именно новый Publishable key; legacy JWT, secret и service_role приложение не использует. Секрет Google хранится только в настройках провайдера Supabase. Env-файлы, временные файлы CLI, пароли и access tokens не должны попадать в Git.

После изменения `NEXT_PUBLIC_*` перезапустите dev-сервер или пересоберите production. Без публичной конфигурации главная/login работают с отключённым входом. Без миграции dashboard показывает ошибку загрузки с пояснением; фиктивные группы не подставляются.

## Supabase CLI v3 и миграции

CLI установлен как dev dependency. `supabase/config.toml` уже создан командой `npx supabase init`; повторять инициализацию в этом checkout не нужно. При создании отдельного окружения используйте `npx supabase init`.

Выполните в терминале:

```sh
npx supabase login
npx supabase link --project-ref loawocnrcgxghhvvrexg
npx supabase migration list --remote
npx supabase db push --remote --dry-run
```

Проверьте, что выбран именно ваш проект и план содержит только `20261103000100_family_shopping.sql`. Миграция создаёт шесть таблиц, индексы, ограничения, профильный trigger, RLS, RPC и добавляет четыре таблицы в публикацию Realtime. Существующие auth users получают профили через `ON CONFLICT DO NOTHING`. Нет `DROP`, `TRUNCATE` или удаления пользовательских данных. Если одноимённые таблицы уже созданы вне этой миграции, сначала согласуйте существующую схему; не обходите конфликт удалением таблиц.

Затем примените и проверьте историю:

```sh
npx supabase db push --remote
npx supabase migration list --remote
npm run db:types
```

CLI v3 по умолчанию работает с локальной БД: `--remote` здесь обязателен. Не используйте `db reset --remote` на облачном проекте. CLI запросит подтверждение удалённой операции; пароль вводите интерактивно, не сохраняйте в файлы репозитория или аргументы команд. Не используйте Supabase service_role для операций приложения.

`npm run db:types` вызывает `supabase gen types --remote --schema public` и сохраняет результат в `src/types/database.generated.ts` только после успешного завершения. Текущий типизированный контракт находится в `src/types/database.ts`; сравните сгенерированную схему с ним перед обновлением. Не подменяйте доменные enum-типы произвольными строками без проверки. При ошибке авторизации существующие типы сохраняются.

Локальная Supabase-среда опциональна и требует Docker (`npx supabase start`, `npx supabase db push`, `npx supabase migration list`). Для `npm run test:db` Docker не нужен: тест запускает отдельную временную PostgreSQL 17 на loopback-порту 55439. Это исключительно тестовая зависимость, не сервер приложения и не замена Supabase Auth/Realtime.

## Google OAuth

1. В Google Cloud Console / Google Auth Platform настройте Branding, Audience и OAuth consent screen. Для External → Testing добавьте тестовые аккаунты.
2. Создайте OAuth Client типа **Web application**.
3. При необходимости добавьте Authorized JavaScript origin `http://localhost:3000`.
4. Authorized redirect URI Google:

   ```text
   https://loawocnrcgxghhvvrexg.supabase.co/auth/v1/callback
   ```

5. В Supabase → Authentication → Sign In / Providers → Google включите провайдер и сохраните Google Client ID / Client Secret. Client Secret не добавляется в код или `NEXT_PUBLIC_*`.
6. Для первого входа убедитесь, что регистрация новых пользователей разрешена.

Supabase → Authentication → URL Configuration:

| Поле          | Значение                              |
| ------------- | ------------------------------------- |
| Site URL      | `http://localhost:3000`               |
| Redirect URLs | `http://localhost:3000/auth/callback` |

Callback Google возвращает в Supabase, callback Supabase возвращает в Basket. OAuth приложения добавляет безопасный query `next`. Для приглашений после входа открывается `/{locale}/invite/TOKEN`, а не автоматическое вступление.

Открывайте приложение с тем же hostname, что указан в `NEXT_PUBLIC_SITE_URL`: PKCE cookies с `127.0.0.1` не переходят на `localhost`.

Для публичного демо добавьте точный **HTTPS origin + `/auth/callback`** в Supabase Redirect URLs, задайте HTTPS origin в `NEXT_PUBLIC_SITE_URL` и при необходимости обновите Supabase Site URL / Google JavaScript origin. Для другого проекта замените callback Google. Не используйте широкие wildcard для production.

## Работа с группами и покупками

- Dashboard: группы пользователя, количество активных участников и некупленных товаров активных списков; создание нескольких групп.
- Создание группы одной транзакцией создаёт владельца и первый список с названием на текущем языке.
- Владелец переименовывает группу, создаёт/отзывает одноразовые ссылки на 7 дней и удаляет участников.
- Участник может покинуть группу. Владелец не может выйти или назначить другого владельца в этом MVP.
- Приглашённый сначала входит через Google, видит только название группы и подтверждает вступление. Ссылки нельзя принимать простым GET-запросом.
- Список: создание, переименование, архив/восстановление; товары с количеством и единицами, добавление, редактирование, удаление, отметка покупки и прогресс.
- Некупленные товары идут первыми. Повторная отправка добавления с тем же operation UUID не создаёт дубль; одинаковые названия с разными UUID допускаются.
- В архивном списке товары доступны для чтения, изменения запрещены базой до восстановления.

Все названия нормализуются по пробелам. Лимиты: группа 80 символов, список 100, товар 120; количество — конечное положительное число до 1 000 000. Пользовательские названия не переводятся.

## Realtime и доступ

Миграция добавляет `groups`, `group_members`, `shopping_lists`, `shopping_items` в `supabase_realtime`. Проверьте наличие этих таблиц в публикации после применения миграции; RLS должен оставаться включённым.

Подписки ограничены текущей группой и открытым списком; на dashboard подписка только на собственное членство. Слушаются INSERT/UPDATE. Изменения вызывают повторное чтение через сервер и RLS с коротким debounce. Строки из payload не добавляются в клиентские массивы. При восстановлении подписки, online и возврате на вкладку выполняется повторная загрузка. Бесконечного polling нет; каналы удаляются при уходе со страницы.

Служебные `group_members.removed_at` и `shopping_items.deleted_at` нужны для безопасных Realtime UPDATE: DELETE не поддерживает те же гарантии RLS и фильтрации. Удалённому участнику остаётся доступна только собственная строка отзыва, без названия группы, участников, списков и товаров. База немедленно запрещает ему чтение и изменения. Подробнее: [безопасность](docs/SECURITY.md).

## Структура и форматирование

Структура адаптирована по [Betman](https://github.com/dev-parallaxsoft/betman):

```text
src/
  app/
    [locale]/
      dashboard/_view/
      groups/[groupId]/_view/
      groups/[groupId]/lists/[listId]/_view/
      invite/[token]/_view/
      login/
    actions/auth.ts
    auth/callback/route.ts
  components/ActionForm/       Общая форма: pending, ошибки, защита двойной отправки
  modules/
    Groups/                   schema.ts, action.ts, query.ts, index.module.scss
    Invites/                  Валидация, криптографические токены, preview и принятие
    Shopping/                 Списки, товары, ItemRow
    Providers/Google/         Рабочий Supabase Google-вход
    Providers/Logout/
    Languages/
    Avatar/
    WorkspaceState/
  widgets/Header/             Общая шапка
  widgets/Footer/             Общий footer
  hooks/useWorkspaceRealtime.ts
  helpers/validation.ts
  lib/                        Supabase clients, Auth, конфигурация, общие серверные утилиты
  types/                      Типы БД и результатов операций
  i18n/
  messages/                   en, ro, ru, uk
  scss/globals.scss           Reset и CSS custom properties
supabase/migrations/          Воспроизводимая схема и права
scripts/                      HTTP smoke и безопасная генерация типов
tests/                       Unit и интеграционные проверки PostgreSQL
```

Компоненты/виджеты — папки PascalCase с `index.tsx` и `index.module.scss`. Серверная загрузка и авторизация остаются в `page.tsx`; интерактивный интерфейс — в `_view`. Доменные схемы и действия находятся рядом. Пустые слои `store`, `context`, `sections` не создавались.

**ESLint + Stylelint, как в Betman:** ESLint использует `@stylistic/eslint-plugin`, `typescript-eslint` и `simple-import-sort`: отступы в два пробела, одинарные JS/TS-кавычки, двойные JSX-кавычки, без `;`, пробелы и переносы в объектах/импортах, сортировка импортов. JSX-правила перенесены из Betman без дополнительного принудительного форматтера. `.editorconfig` задаёт базовые отступы и переводы строк.

Stylelint использует `stylelint-config-standard-scss`, `stylelint-order` и `@stylistic/stylelint-plugin`, как в Betman. Проверяются порядок CSS-свойств, пустые строки и правила SCSS. Для Basket сохранены проверка kebab-case классов и проверка всех `src/**/*.scss`, включая глобальные стили.

```sh
npm run lint:fix
npm run stylelint:fix
npm run check
npm run test:db
npm run build
npm run start
# Во втором терминале:
npm run test:smoke
```

`npm run check` проверяет ESLint и Stylelint без предупреждений, TypeScript и unit-тесты. `npm run lint:fix` исправляет JS/TS/TSX, `npm run stylelint:fix` исправляет SCSS напрямую. Исправимые нарушения сохраняются даже при оставшихся неисправимых ошибках; ненулевой exit code сообщает об этих остаточных ошибках. Синтаксические ошибки SCSS, из-за которых парсер не может разобрать файл, нужно сначала исправить вручную. `test:db` и production build запускаются отдельно. Изменения в SQL обязательно перепроверяйте через `test:db`. [Подробности тестирования](docs/TESTING.md).

## Безопасность и ограничения проверки

- Все шесть таблиц имеют RLS; публичные роли не могут напрямую менять группы/членство/приглашения/списки/товары. Единственный путь мутаций — проверенные RPC.
- `SECURITY DEFINER` использует пустой `search_path`, квалифицированные таблицы, `auth.uid()` и ограниченный EXECUTE. Profile trigger вызывается только базой, не пользователем.
- Профили доступны напрямую только владельцу; участники видят минимальные имена/аватары через защищённую RPC без email.
- Одноразовость приглашения защищена `FOR UPDATE`; хранятся SHA-256 hashes от случайных 32-байтных токенов. Принятие идемпотентно для действующего участника.
- `created_by` / `purchased_by` назначает база; перенос записей в другую группу/список запрещён API и привилегиями.
- OAuth/Invite redirect проходят точный allowlist; origin берётся из доверенной конфигурации. Referrer отключён; dev request-логи приглашений и OAuth callback выключены. На хостинге дополнительно исключите эти пути и login query из access-логов и аналитики.
- Приватные страницы динамические и `private, no-store`; сервер проверяет личность через `getUser` / `getClaims`. Ручного хранения auth tokens в localStorage нет.

Проверки PostgreSQL используют настоящий процесс БД и роли `authenticated`/`anon`, а не моки. JWT adapter `auth.uid()` в тестовой БД воспроизводит контракт Supabase. Они проверяют SQL, RLS, привилегии и блокировки; не запускают PostgREST, Google Auth или Realtime gateway.

**До домашнего демо остаётся:** применить облачную миграцию, сгенерировать и сравнить типы, пройти сценарии из `docs/TESTING.md` двумя реальными Google-пользователями на двух устройствах, проверить offline/reconnect и отзыв доступа. Новый облачный функционал не объявляется проверенным до этих шагов.

Официальные справочники: [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client), [Google provider](https://supabase.com/docs/guides/auth/social-login/auth-google), [Postgres Changes](https://supabase.com/docs/guides/realtime/postgres-changes), [CLI v3](https://supabase.com/docs/guides/local-development/cli/migrating-to-v3).
