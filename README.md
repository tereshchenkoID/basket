# Basket

Семейные группы и совместные списки покупок. Next.js App Router, Supabase Auth / PostgreSQL / Realtime, Google OAuth. Языки: EN, RO, RU, UK; по умолчанию — EN.

## Запуск

Node.js 24.x (`.nvmrc`), npm 12.0.1.

```sh
npm ci
npm run dev
```

Настройки в `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

В production `NEXT_PUBLIC_SITE_URL` должен содержать публичный HTTPS origin. После изменения `NEXT_PUBLIC_*` нужна пересборка. Secret / service_role ключи в приложение не передаются.

## Google OAuth

Включите Google в Supabase → Authentication → Providers. Google Client ID / Secret хранятся там. Authorized redirect URI в Google Cloud:

```text
https://YOUR_PROJECT.supabase.co/auth/v1/callback
```

Supabase → Authentication → URL Configuration:

- Site URL для текущего production: `https://basket-gray-three.vercel.app`.
- Redirect URLs:

```text
http://localhost:3000/auth/callback
http://localhost:3000/auth/callback?next=**
https://basket-gray-three.vercel.app/auth/callback
https://basket-gray-three.vercel.app/auth/callback?next=**
```

Callback обменивает code на сессию и возвращает в локализованный dashboard или приглашение. Пути возврата проверяются allowlist. Landing определяет вход на сервере и показывает соответствующую CTA.

## База данных

Миграции — `supabase/migrations`, прикладные типы — `src/types/database.ts`. Supabase CLI установлен как dev dependency. После `npx supabase login` и `npx supabase link --project-ref YOUR_PROJECT` проверьте изменения через `npx supabase db push --remote --dry-run`, затем применяйте `npx supabase db push --remote`. Команда `npm run db:types` генерирует типы удалённой БД в отдельный файл для сравнения с прикладным контрактом.

Доступ к данным ограничен RLS и RPC. Подробнее: [SECURITY.md](docs/SECURITY.md).

## Структура и интерфейс

- `app/[locale]` — серверные маршруты; `_view` — представления страниц, включая главную. Компоненты одной страницы лежат рядом с её `_view`. Параметры: `[group-id]`, `[list-id]`.
- `components` — Box, Grid, типографика и контролы; `modules` — переиспользуемые формы и состояния; `widgets` — шапка и футер.
- `modules/*/repository.ts` — Supabase-запросы; `query.ts` / `action.ts` — серверные адаптеры.
- `types` — общие типы; `constant` — лимиты, регулярные выражения и соответствия ошибок; `messages` — переводы.
- `scss` — токены, функции и миксины. Config подключается через `sassOptions.additionalData`, глобальные стили — в locale layout.

Форма создания списка находится перед карточками. Внутри списка добавление товаров закрепляется под шапкой. Язык выбирается рядом с кнопкой меню; профиль, выход и оформление находятся в боковой панели. Светлая, тёмная и системная темы сохраняются в cookie `basket-theme`. Общий `Empty` используется для пустых данных и ошибок. `loading.tsx` оставлены на границах страниц с серверной загрузкой и реэкспортируют один `Loading`.

Переиспользуйте Box/Grid, Heading/Text и общие контролы. Компоненты — стрелочные функции, props — отдельные типы. Отступы два пробела, одинарные JS/TS-кавычки, без `;`; CSS-классы — одно слово. Форматирование проверяют ESLint и Stylelint, без Prettier. Локальные правила `eslint.rules.mjs` закрепляют многострочные JSX-списки, условия и `clsx` с объектами условных классов.

## Проверки и каталог компонентов

```sh
npm run lint:fix
npm run stylelint:fix
npm run check
npm run build
```

`check` запускает ESLint, Stylelint и TypeScript. Production запускается через `npm run start`.

Каталог: `http://localhost:3000/en/ui-kit`. Доступен только в development; в production возвращает 404. Категории и страницы компонентов содержат состояния, API и копируемые примеры. Ссылок на каталог в пользовательской навигации нет. Примеры доменных форм работают локально, без записи в БД.
