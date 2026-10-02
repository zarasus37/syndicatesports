---
name: web-a11y
description: "Web accessibility audit against WCAG 2.1 AA: keyboard navigation, ARIA, color contrast, screen reader compatibility."
user-invocable: true
disable-model-invocation: false
model: sonnet
source: pandaos
allowed-tools: Read, Grep, Glob, Bash
---

# Web Accessibility Audit

Systematic accessibility audit against WCAG 2.1 AA standards covering keyboard navigation, ARIA usage, color contrast, and semantic HTML.

## STEP 1: IDENTIFY SCOPE

Parse $ARGUMENTS for a specific component or page. If not specified, audit all recently changed UI files.

## STEP 2: KEYBOARD NAVIGATION

- All interactive elements (links, buttons, inputs, modals) must be reachable via Tab
- Focus order must be logical and follow visual reading order
- Focus must be visible — no `outline: none` without a custom focus style
- Modal dialogs must trap focus inside and return focus on close
- Custom interactive elements (divs with onClick) must have `role` and keyboard handlers

## STEP 3: SEMANTIC HTML

- Use native HTML elements where possible: `<button>` not `<div onClick>`, `<nav>` not `<div class="nav">`
- Headings (`h1`-`h6`) reflect document hierarchy — no heading levels skipped
- Lists use `<ul>`/`<ol>` + `<li>`, not divs
- Forms have `<label>` elements associated with inputs (via `for`/`htmlFor` or wrapping)
- Images have descriptive `alt` text; decorative images use `alt=""`

## STEP 4: ARIA USAGE

- No redundant ARIA: `<button role="button">` is wrong — the role is implied
- Use `aria-label` when visible text is absent (icon-only buttons)
- Use `aria-describedby` to associate error messages with inputs
- `aria-live` regions for dynamic content that updates without a page load
- `aria-expanded`, `aria-haspopup` on dropdowns and menus

## STEP 5: COLOR CONTRAST

Check contrast ratios:
- Normal text (< 18pt): minimum 4.5:1
- Large text (>= 18pt or 14pt bold): minimum 3:1
- Interactive component boundaries: minimum 3:1

Flag any text/background combination that falls below the threshold. Propose specific color corrections.

## STEP 6: MOTION AND ANIMATION

- Animations must respect `prefers-reduced-motion`
- No content that flashes more than 3 times per second

## STEP 7: REPORT

Output findings as:
- **FAIL** — WCAG 2.1 AA violation (must fix)
- **WARN** — Best practice issue (should fix)
- **PASS** — Compliant

For each FAIL: exact file path, WCAG criterion reference (e.g., 1.4.3 Contrast), and specific fix.

## IMPLEMENTATION PATTERNS

Concrete ARIA and keyboard patterns for complex interactive components.

### Modal Focus Trap

A modal must trap focus: Tab and Shift+Tab must cycle only through focusable elements inside the dialog. Focus returns to the trigger element on close.

```tsx
// Minimum viable focus trap using the native dialog element
// <dialog> handles focus trapping natively in modern browsers
<dialog ref={dialogRef} aria-labelledby="modal-title" aria-modal="true">
  <h2 id="modal-title">Confirm Delete</h2>
  <p>This action cannot be undone.</p>
  <button onClick={onCancel}>Cancel</button>
  <button onClick={onConfirm}>Delete</button>
</dialog>
```

For custom div-based modals (when `<dialog>` is not an option), trap focus manually:
- On open: move focus to the first focusable element inside the modal
- On Tab: if focus is on the last focusable element, wrap to the first
- On Shift+Tab: if focus is on the first focusable element, wrap to the last
- On Escape: close the modal and return focus to the trigger
- Use `aria-modal="true"` and `role="dialog"` on the container

Prefer `@radix-ui/react-dialog` or `@headlessui/react` Dialog — they implement this correctly out of the box.

### Virtualized Lists

When virtualizing a list, assistive technologies need to know the total item count even though most items are not in the DOM:

```tsx
<div
  role="listbox"              // or "list" for non-interactive
  aria-label="Search results"
  aria-rowcount={totalItems}  // total count, not just rendered count
>
  {virtualItems.map((virtualItem) => (
    <div
      key={virtualItem.key}
      role="option"
      aria-rowindex={virtualItem.index + 1}  // 1-based
      aria-selected={selectedIndex === virtualItem.index}
    >
      {items[virtualItem.index].label}
    </div>
  ))}
</div>
```

For virtualized grids use `aria-rowcount` + `aria-colcount` on the grid element and `aria-rowindex` + `aria-colindex` on each cell.

### Tab Panels

```tsx
// Tab list
<div role="tablist" aria-label="Account settings">
  <button
    role="tab"
    id="tab-general"
    aria-controls="panel-general"
    aria-selected={activeTab === 'general'}
    tabIndex={activeTab === 'general' ? 0 : -1}
    onClick={() => setActiveTab('general')}
  >
    General
  </button>
  <button
    role="tab"
    id="tab-security"
    aria-controls="panel-security"
    aria-selected={activeTab === 'security'}
    tabIndex={activeTab === 'security' ? 0 : -1}
    onClick={() => setActiveTab('security')}
  >
    Security
  </button>
</div>

// Tab panels
<div
  role="tabpanel"
  id="panel-general"
  aria-labelledby="tab-general"
  hidden={activeTab !== 'general'}
>
  {/* content */}
</div>
```

Keyboard behavior for tab lists: Left/Right arrow keys move between tabs and activate the new tab (roving tabindex pattern — only the active tab has `tabIndex={0}`).

### Data Tables

Use semantic table roles for data grids. When using a custom div-based layout:

```tsx
<div role="table" aria-label="Invoice history" aria-rowcount={invoices.length + 1}>
  <div role="rowgroup">  {/* thead equivalent */}
    <div role="row" aria-rowindex={1}>
      <div role="columnheader" aria-sort="descending">Date</div>
      <div role="columnheader">Amount</div>
      <div role="columnheader">Status</div>
    </div>
  </div>
  <div role="rowgroup">  {/* tbody equivalent */}
    {invoices.map((invoice, i) => (
      <div key={invoice.id} role="row" aria-rowindex={i + 2}>
        <div role="cell">{invoice.date}</div>
        <div role="cell">{invoice.amount}</div>
        <div role="cell">{invoice.status}</div>
      </div>
    ))}
  </div>
</div>
```

Prefer native `<table>` elements — they get all these roles for free. Only use div-based table roles when the layout cannot be expressed with native table markup (e.g., virtualized tables with fixed headers).

## ANTI-PATTERNS

- `role="button"` on `<button>` elements
- `aria-label` duplicating visible text that is already clear
- Skip links hidden from keyboard users
- Placeholder text as the only label for an input
- `tabindex` values greater than 0 (breaks natural tab order)
