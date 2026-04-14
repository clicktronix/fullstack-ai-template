---
name: DB migration lessons
description: Lessons from HNSW index rebuild - statement timeouts, connection handling, Supabase limitations
type: feedback
---

На Supabase Micro-плане HNSW index build на 39K векторов занимает 5+ часов. Важные уроки:

**Why:** Потеряли 5 часов из-за обрыва psql-соединения, который откатил CREATE INDEX.

**How to apply:**

- `supabase db push` имеет statement_timeout ~2мин (не переопределяется)
- SET statement_timeout работает через psql, но НЕ через supabase db push
- CREATE INDEX (не CONCURRENTLY) откатывается при обрыве клиента → всегда запускать через `nohup`
- HNSW index (151MB) на blogs замедляет UPDATE до 671мс/строку (663 buffer hits) → перед массовым UPDATE дропать HNSW
- Для массовых UPDATE: дропнуть все индексы на изменяемую колонку → UPDATE → пересоздать (HOT optimization)
- Всегда проверять pg_stat_progress_create_index для мониторинга
- DB_URL для psql: в agent/.env (DATABASE_URL)
