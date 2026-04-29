# Режим: pipeline — Очередь URL (Second Brain)

Обрабатывает URL вакансий из `data/pipeline.md`. Пользователь добавляет URL когда угодно, затем запускает `/career pipeline` для обработки.

## Workflow

1. **Прочитать** `data/pipeline.md` → найти `- [ ]` в секции "Ожидающие" (или "Pendientes" / "Pending" — pipeline.md может содержать заголовки на любом языке)
2. **Для каждого URL**:
   a. **Извлечь JD** через Playwright → WebFetch → WebSearch
   b. Если URL недоступен → пометить `- [!]` с заметкой, продолжить
   c. **Сохранить/Нормализовать JD**: Сохранить извлеченный текст в папку `jds/` с понятным именем (напр. `jds/company-role.md`). Если префикс уже `local:`, просто проверить существование файла.
   d. **Переместить из "Ожидающие" в "Обработанные"**: `- [x] local:jds/filename.md | Компания | Роль`
3. **Если несколько URL**, запустить агентов параллельно (Agent tool с `run_in_background`). **Ограничение:** Playwright требует ресурсов — использовать **только один** Playwright-агент одновременно (правило `_shared.md`).
4. **По завершении** показать таблицу:

```
| Компания | Роль | Локальный Файл | Статус |
```

## Формат pipeline.md

```markdown
## Ожидающие
- [ ] https://jobs.example.com/posting/123
- [ ] https://hh.ru/vacancy/12345678 | Компания | Senior Backend
- [!] https://private.url/job — Ошибка: требуется авторизация

## Обработанные
- [x] local:jds/acme-corp-ai-pm.md | Acme Corp | AI PM
- [x] local:jds/bigco-backend.md | BigCo | Backend
```

## Определение JD из URL

1. **Playwright (предпочтительно):** `browser_navigate` + `browser_snapshot`. Работает со всеми SPA.
2. **WebFetch (fallback):** Для статических страниц.
3. **WebSearch (последний ресурс):** Поиск на вторичных порталах.

**Особые случаи:**
- **hh.ru**: API доступен: `https://api.hh.ru/vacancies/{id}` — JSON с полным описанием
- **LinkedIn**: Может требовать логин → пометить `[!]`, попросить вставить текст
- **PDF**: Если URL на PDF — прочитать через Read tool
- **`local:` префикс**: Читать локальный файл. Пример: `local:jds/company-role.md`

