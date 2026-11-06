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

В production `NEXT_PUBLIC_SITE_URL` должен содержать публичный HTTPS origin. После изменения `NEXT_PUBLIC_*` нужна пересборка. Secret / service_role ключи никогда не передаются клиенту; фоновая очистка чеков использует отдельный серверный ключ.

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

- `app/[locale]` — серверные маршруты. `page.tsx` содержит запросы, перенаправления и метаданные; `_view/index.tsx` — клиентский `Section` со всей разметкой страницы, включая ошибки; стили страницы находятся в `_view/index.module.scss`. Компоненты одной страницы лежат рядом с её `_view`. Параметры: `[group-id]`, `[list-id]`.
- `(account)` объединяет dashboard, группы, списки, приглашения и dev-каталог без изменения URL. Единственный серверный guard — `getAccount()` в `app/actions/account.ts`: layout и загрузчики используют один результат в пределах запроса. Проверки в загрузчиках также покрывают клиентские переходы без повторного выполнения layout. Proxy обновляет Supabase cookies; главная и login остаются публичными. `force-dynamic` не требуется: чтение cookies/headers уже включает динамический рендер.
- `components` — Container, Box, Grid, типографика и контролы; `modules` — переиспользуемые формы и состояния; `widgets` — шапка, футер, общие модалки и уведомления. Breadcrumbs находится в `modules`.
- `lib/{groups,shopping,invites}` — схемы, Supabase-запросы и серверные адаптеры (`schema.ts`, `repository.ts`, `query.ts`, `action.ts`). В `modules` находятся только переиспользуемые UI-модули, например `GroupForm` и `ListForm`.
- `types` — только переиспользуемые типы; props и внутренние типы конкретного компонента/страницы лежат в соседнем `types.ts`; `constant` — лимиты, регулярные выражения и соответствия ошибок; `messages` — переводы по страницам; `Workspace` содержит общие тексты и сообщения авторизации.
- `scss` — токены, функции и миксины. В `theme.scss` — только цвета (`bg`, `surface`, `text`, `primary`, `danger`); общие CSS-переменные и глобальные правила — в `layout.scss`. Размеры текста задаются числами 1–7, радиусы — `sm` / `lg`. Config подключается через `sassOptions.additionalData`, глобальные стили — в locale layout.

Форма создания списка находится перед карточками. Внутри списка добавление товаров закрепляется под шапкой. Крошки показывают группу и список; удаление доступно рядом с редактированием, использует вариант danger и требует подтверждения. Язык выбирается рядом с кнопкой меню; профиль, выход и оформление находятся в боковой панели. Светлая, тёмная и системная темы сохраняются в cookie `basket-theme`. Общий `Empty` используется для пустых данных и ошибок. Один `app/[locale]/(account)/loading.tsx` использует общий `Loading` для защищённых страниц. Неизвестные страницы показывают локализованную 404 через обычный `not-found.tsx`.

Переиспользуйте Box/Grid, Heading/Text и общие контролы. Компоненты — стрелочные функции, props — отдельные локальные типы. Статические константы, схемы и маппинги именуются в `UPPER_SNAKE_CASE`. Маршруты берутся из `constant/navigation.ts`: `NAVIGATION`, `ROUTES_USER`, `ROUTES_AUTH`, `ROUTES_DEV`; динамические пути создаются через `.url(id)`. Поле `text` содержит ключ перевода, для общих ссылок — из `Workspace`. Внешняя ссылка автора хранится в `constant/brand.ts`. Иконки подключаются через `Icon` (`name="arrow-left"`, `size`, SVG props); Select и кнопки получают имя иконки строкой. Базовые Text/Heading/Box/Grid получают обычные свойства типографики и раскладки; стили конкретного блока остаются в его модуле. Text/Heading принимают `weight="regular|medium|semibold|bold"` и `transform="none|uppercase|lowercase|capitalize"`; оба свойства поддерживают responsive-значения. Локаль проверяется общей конфигурацией next-intl и читается серверными страницами через `getLocale()`. Отступы два пробела, одинарные JS/TS-кавычки, без `;`; CSS-классы — одно слово. Форматирование проверяют ESLint и Stylelint, без Prettier. Локальные правила `eslint.rules.mjs` закрепляют многострочные JSX-списки, условия и `clsx` с объектами условных классов.

Модалки открываются через `useModalStore.open` и реестр `widgets/Modals/registry.tsx`; общий `Modal` принимает заголовок и children, закрывается по Escape, клику снаружи и кнопке справа. Zustand хранит только временное состояние интерфейса. Один `Toastify` в layout показывает локализованный результат операций через `useMutation`; тема уведомлений использует общие CSS-токены.

## Проверки и каталог компонентов

```sh
npm run lint:fix
npm run stylelint:fix
npm run check
npm test
npm run build
```

`check` запускает ESLint, Stylelint и TypeScript. Production запускается через `npm run start`.

Каталог: `http://localhost:3000/en/ui-kit`. Доступен только в development; в production возвращает 404. Каталог содержит только `src/components`: layout, typography, form и overlay. На странице компонента — Props, Preview со состояниями и Usage с копированием кода. Модули, виджеты и доменные формы в каталог не входят. Ссылок на каталог в пользовательской навигации нет.

Dropdown использует нативный `details` с анимацией раскрытия и поддержкой reduced motion. Методы входа находятся в `modules/Providers`. Focus и disabled используют общие токены из layout; размеры в SCSS задаются через `rem()`.

`Container` задаёт ширину контента, адаптивные отступы и safe area; используется вместо свойства `container` у Box. Общий запрос текущего пользователя находится в `app/actions/static.ts`, проверка доступа — в `app/actions/account.ts`. React `cache` устраняет повторные вызовы только в пределах серверного рендера. Глобальный сброс списков, изображений и placeholder находится в `layout.scss`; модули содержат только отличающиеся стили.

CSS-переменные объявлены явно: цвета — в `scss/theme.scss`, размеры и отступы — в `app/[locale]/layout.scss`. Имена не генерируются через `@each`, поэтому редактор может находить объявления при переходе из `var(--...)`.

## Удаление групп и вкладки

Группы удаляются мягко с восстановлением владельцем в течение 30 дней. Активные/удалённые группы и активные/архивные списки разделены Tabs; вкладка сохраняется в URL, сортировка независима. Удаление находится в настройках группы и требует подтверждения. Детали миграций, Cron, прав и проверок: [GROUP_LIFECYCLE.md](docs/GROUP_LIFECYCLE.md).

## Патч Next.js 16.4.5

`scripts/patch-next.mjs` исправляет условный `use()` внутри `InnerLayoutRouter`: чтение deferred RSC и ожидание отсутствующего сегмента вынесены в стабильные дочерние компоненты. Это устраняет предупреждение React 19.3 при переходах, сохраняя Suspense. Патч применяется через `postinstall`, `predev` и `prebuild`, проверяет точную версию Next и поддерживает ESM/CJS. При обновлении Next нужно проверить наличие upstream-исправления и удалить либо пересмотреть патч.

## Чеки и история покупок

Необязательный магазин списка, сканирование нескольких фотографий, проверка и история личных/групповых покупок: [RECEIPTS.md](docs/RECEIPTS.md). Миграция применена к production с отдельного разрешения владельца; настройку и live-проверку фоновой очистки ещё нужно завершить. Документ описывает настройку приватного Storage, серверной очистки, ограничения OCR и выполненные регрессионные проверки.
