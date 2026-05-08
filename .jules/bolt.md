## 2026-05-04 - Debounce large local dataset filtering
**Learning:** `CITIES.filter` on a 500+ item array runs synchronously on every keystroke when attached to an uncontrolled `searchQuery` state, causing micro-stutters and unnecessary React reconciliations during typing.
**Action:** Always wrap large, client-side array filtering in a small `setTimeout` (e.g., 300ms) debounce, or use a deferred value hook, to allow the UI thread to breathe while the user is actively typing.
