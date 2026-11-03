# Basket

Семейные группы и совместные списки покупок. Next.js App Router, Supabase Auth / PostgreSQL / Realtime, Google OAuth. Языки: EN, RO, RU, UK; язык по умолчанию — RU.

## Запуск

Node.js 24.x (`.nvmrc`), npm 12.0.1.

```sh
npm ci
npm run dev
```

Создайте `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Для production задайте `NEXT_PUBLIC_SITE_URL` равным публичному HTTPS origin приложения. После изменения `NEXT_PUBLIC_*` нужна пересборка. Secret / service_role ключи в приложение не передаются.

## Google OAuth

В Google Cloud создайте Web OAuth client, затем включите Google в Supabase → Authentication → Providers. Google Client ID / Secret хранятся в настройках провайдера Supabase.

Google Authorized redirect URI:

```text
https://YOUR_PROJECT.supabase.co/auth/v1/callback
```

В Supabase → Authentication → URL Configuration:

- Site URL: `https://basket-gray-three.vercel.app` для текущего production.
- Redirect URLs: адреса callback ниже. Варианты с query нужны для передачи локали и возврата к приглашению.

```text
http://localhost:3000/auth/callback
http://localhost:3000/auth/callback?next=**
https://basket-gray-three.vercel.app/auth/callback
https://basket-gray-three.vercel.app/auth/callback?next=**
```

Callback обменивает code на сессию и возвращает пользователя в локализованный dashboard или приглашение. Допустимые пути проверяются allowlist; состояние входа на landing определяется сервером. После входа landing показывает переход в dashboard.

## База данных

Supabase CLI установлен как dev dependency. Для настройки проекта:

```sh
npx supabase login
npx supabase link --project-ref YOUR_PROJECT
npx supabase migration list --remote
npx supabase db push --remote --dry-run
npx supabase db push --remote
npm run db:types
```

Миграция находится в `supabase/migrations`. `db:types` генерирует типы удалённой БД; прикладной контракт — `src/types/database.ts`. Доступ к группам, спискам и приглашениям ограничен RLS и RPC. Подробнее: [SECURITY.md](docs/SECURITY.md).

## Структура и стиль

Структура и SCSS-утилиты адаптированы по [Betman](https://github.com/dev-parallaxsoft/betman).

- `app/[locale]` — маршруты, серверная загрузка; `_view` — интерактивные компоненты страницы.
- `groups/[group-id]/lists/[list-id]` — параметры маршрутов без camelCase. Публичные URL от имён параметров не зависят.
- `components`, `modules`, `widgets` — компоненты в папках PascalCase, `index.tsx` и `index.module.scss`.
- `constant/regex.ts` — регулярные выражения; `constant/validation.ts` — лимиты полей; `constant/errors.ts` — ключи валидации и соответствия ошибок БД.
- `helpers/validation.ts` — общие Zod-правила; схемы доменов — рядом с модулями; тексты ошибок — `messages/{locale}.json`.
- `scss` — функции и миксины Betman без primitives. Config подключается через `sassOptions.additionalData`; глобальные стили — в locale layout.

Компоненты и обработчики — стрелочные функции, props — отдельные типы. Отступы два пробела, одинарные JS/TS-кавычки, без `;`. ESLint / Stylelint исправляют форматирование без Prettier.

```sh
npm run lint:fix
npm run stylelint:fix
npm run check
npm run build
npm run start
```

`check` запускает ESLint, Stylelint и TypeScript. Исправления при сохранении настроены в WebStorm. `package.json#allowScripts` разрешает install scripts только указанных версий пакетов. `vercel.json` удаляет неподдерживаемую переменную npm `cache-dir` перед установкой и сборкой.
