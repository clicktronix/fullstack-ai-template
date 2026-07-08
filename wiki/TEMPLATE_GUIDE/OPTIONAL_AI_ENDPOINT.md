# Optional AI Endpoint Contract

The template ships with a small AI-flavored flow for `work-items`.

By default, it does **not** require any external AI backend. The assistant panel works with a deterministic fallback implemented in:

- `src/adapters/outbound/api/assistant-suggestions.ts`

If you set `AI_SUGGESTIONS_API_URL`, the template will call your external endpoint instead.

## Environment variables

```bash
AI_SUGGESTIONS_API_URL=
AI_SUGGESTIONS_API_KEY=
```

`AI_SUGGESTIONS_API_KEY` is optional and sent as a Bearer token when provided.

## Request shape

The outbound adapter sends a `POST` request with JSON body:

```json
{
  "workItems": [
    {
      "id": "item-1",
      "title": "Ship onboarding",
      "description": "Finalize the first-run experience",
      "status": "active",
      "is_priority": true,
      "label_ids": ["label-1"],
      "created_at": "2026-04-14T10:00:00.000Z",
      "updated_at": "2026-04-14T10:00:00.000Z"
    }
  ],
  "labels": [
    {
      "id": "label-1",
      "name": "Product",
      "color": "blue",
      "created_at": "2026-04-14T10:00:00.000Z"
    }
  ],
  "filters": {
    "status": "active",
    "search": "onboarding",
    "labelId": "label-1",
    "priorityOnly": true,
    "additionalContext": "We need to ship this week"
  }
}
```

## Expected response shape

The endpoint should return:

```json
{
  "generated_at": "2026-04-14T10:00:00.000Z",
  "suggestions": [
    {
      "id": "suggestion-1",
      "title": "Prioritize onboarding stabilization",
      "summary": "Move the onboarding item into the priority lane and keep the Product label attached.",
      "priority": "high"
    }
  ]
}
```

Allowed `priority` values:

- `high`
- `medium`
- `low`

The response is validated against the template domain schema before it reaches UI state.

## Recommendation

Keep this endpoint small and deterministic at first:

- accept the current filtered slice
- return 2-5 actionable suggestions
- avoid long-running streaming flows in the base template

If your product needs richer AI behavior later, add it as a separate feature slice instead of overloading this starter example.
