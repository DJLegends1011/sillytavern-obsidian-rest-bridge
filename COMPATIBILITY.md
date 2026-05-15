# Compatibility Matrix

## Supported

| Route | Status | Notes |
| --- | --- | --- |
| `GET /` | supported | Status and auth check. |
| `GET /vault/` | supported | Directory listing. |
| `GET /vault/{path}` | supported | File or directory read. |
| `PUT/POST/PATCH /vault/{path}` | supported | Filesystem-backed writes. |
| `DELETE /vault/{path}` | supported | File or empty-directory delete. |
| `GET /tags/` | supported | Markdown/frontmatter tag aggregation. |
| `POST /search/simple/` | supported | Full-text filename/content search. |
| `GET /commands/` | supported | Discovery-only compatibility route. |

## Unsupported

| Route | Status | Reason |
| --- | --- | --- |
| `/active/` | unsupported | Requires live Obsidian UI state. |
| `/periodic/...` | unsupported | Requires Obsidian periodic note APIs. |
| `/open/{path}` | unsupported | Requires opening a note in the Obsidian UI. |
| `/commands/{commandId}` | unsupported | No Obsidian command palette in Termux bridge mode. |

## Intentionally Different

| Route | Status | Difference |
| --- | --- | --- |
| `POST /search/` | intentionally different | Uses simplified filesystem-backed full-text search instead of Dataview/JsonLogic query engines. |
