---
paths:
  ['**/*.module.css', '**/*Form*/**/*', '**/*form*', 'src/shared/ui/**/*', 'src/modules/**/ui/**/*']
---

# Styling and Forms

- Prefer Mantine layout, input, feedback, and action components.
- Use component props for simple styling and CSS Modules for selectors, responsive rules, or
  repeated states.
- Use theme tokens and CSS variables; palette definition files are the only source of hex colors.
- Keep cards at 8px radius or less unless the design system says otherwise.
- Use familiar icons in tool buttons and add tooltips for unfamiliar icon-only actions.
- Build stable loading, error, empty, disabled, and success states without layout shifts.

Forms use Mantine Form plus a named Valibot schema through `createMantineValidator`. Parse again at
the server boundary. Keep framework navigation outside broad catches.
