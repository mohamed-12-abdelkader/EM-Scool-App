# DESIGN.md — Clast.io 2026 Visual System

Source of truth: [`ui.md`](../ui.md) + Phase 1 portals.

## Brand
- **Name:** Clast · **Badge:** K-12 OS
- **Voice:** High-craft B2B EdTech SaaS — crisp light surfaces, dark slate hero/CTA, indigo CTAs, emerald/amber/rose status.

## Tokens (`src/theme/tokens.ts`)
| Token | Value |
|---|---|
| Canvas | `#F8FAFC` |
| Surface | `#FFFFFF` |
| Dark canvas | `#090D16` |
| Brand primary | `#4F46E5` |
| Brand accent | `#7C3AED` |
| Success / Warning / Danger | `#10B981` / `#F59E0B` / `#EF4444` |

## Typography
- **UI / Marketing:** Plus Jakarta Sans (400–800)
- **Tabular / codes / KPIs:** JetBrains Mono + `fontVariant: ['tabular-nums']`
- **Arabic portal copy (optional):** Cairo

## Surfaces
| Route group | Purpose |
|---|---|
| `(public)/` | Landing, admissions apply — LTR marketing |
| `(auth)/signin` | Split-screen login — LTR |
| `(super-admin)` `(school-admin)` `(teacher)` `(parent)` `(student)` `(operations)` | Phase 1 portals — use same tokens |

## Signature patterns
1. **MockWidget** — live coded UI preview cards (never screenshots)
2. **PillBadge** — tinted status pills
3. **Navbar** — sticky glass header + indigo CTA
4. **Dark CTA banner** — `#090D16` footer close

## Next-build rule
Any new Phase 2–4 screen must import colors/fonts/radii/shadows from `@/theme/tokens` and reuse `MockWidget` / `PillBadge` / `Button` — do not introduce a second palette.
