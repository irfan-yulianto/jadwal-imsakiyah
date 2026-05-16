## 2024-05-16 - Search Input Clear Button
**Learning:** Both LocationSearch and MosqueFinder components use search inputs, but they lack a quick way to clear the text. Users often need to clear the input, especially on mobile, which is tedious without a clear button.
**Action:** Implemented a clear button inside the search inputs that conditionally renders when there is text, leveraging the newly added `XIcon` for consistency.
