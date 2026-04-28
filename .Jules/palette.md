## 2026-04-28 - Input Fields Missing Accessible Labels

**Learning:** Relying solely on `placeholder` attributes for input fields creates accessibility issues, as placeholders disappear when typing and aren't reliably read by all screen readers.

**Action:** Always provide an `aria-label` (or a visible `<label>`) for inputs, especially icon-only or inline search inputs where a visible label isn't feasible.
