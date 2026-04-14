---
paths: ['**/*.module.css', '**/*Form*/**/*', '**/*form*', 'src/ui/**/*']
---

# Styling and Forms

## Mantine Components (ОБЯЗАТЕЛЬНО!)

**Всегда используй Mantine компоненты вместо HTML элементов:**

| HTML            | Mantine                                        | Пример                        |
| --------------- | ---------------------------------------------- | ----------------------------- |
| `<div>`         | `<Box>`, `<Stack>`, `<Group>`, `<Flex>`        | `<Stack gap="md">`            |
| `<button>`      | `<Button>`, `<ActionIcon>`, `<UnstyledButton>` | `<Button variant="filled">`   |
| `<input>`       | `<TextInput>`, `<NumberInput>`, `<Textarea>`   | `<TextInput label="Name" />`  |
| `<select>`      | `<Select>`, `<NativeSelect>`                   | `<Select data={options} />`   |
| `<span>`, `<p>` | `<Text>`                                       | `<Text size="sm" c="dimmed">` |
| `<h1>`-`<h6>`   | `<Title>`                                      | `<Title order={2}>`           |
| `<a>`           | `<Anchor>`                                     | `<Anchor href="/">`           |
| `<img>`         | `<Image>`                                      | `<Image src={url} />`         |
| `<table>`       | `<Table>`                                      | `<Table striped>`             |

**Стилизация через Mantine props:**

```typescript
// ✅ Правильно: Mantine props
<Box p="md" bg="dark.7" c="gray.0">
  <Text size="lg" fw={600} c="blue.6">Title</Text>
  <Stack gap="sm">
    <Button variant="filled" color="orange">Action</Button>
  </Stack>
</Box>

// ❌ Неправильно: HTML + inline styles
<div style={{ padding: '16px', background: '#25262B' }}>
  <span style={{ fontSize: '18px', color: '#228be6' }}>Title</span>
</div>
```

## Color System (ОБЯЗАТЕЛЬНО!)

**НИКОГДА не используй hardcoded hex цвета!**

### В TypeScript/JSX:

```typescript
// ✅ Mantine color props
<Text c="blue.6">Blue text</Text>
<Box bg="dark.7">Dark background</Box>
<Button color="orange">Primary</Button>

// ✅ Palette imports (когда нужен цвет как значение)
import { darkColorScales } from '@/ui/themes/palette-dark'
const color = darkColorScales.blue[6]

// ❌ ЗАПРЕЩЕНО
<Text style={{ color: '#228be6' }}>
const color = '#ffffff'
```

### В CSS Modules:

```css
/* ✅ Правильно: CSS переменные */
.container {
  background: var(--mantine-color-body);
  color: var(--mantine-color-text);
  border: 1px solid var(--mantine-color-default-border);
}

.highlight {
  color: var(--mantine-color-blue-6);
  background: var(--mantine-color-blue-light);
}

/* ❌ ЗАПРЕЩЕНО */
.bad {
  color: #228be6;
  background: #ffffff;
}
```

**Exception**: palette definition files (`src/ui/themes/palette-*.ts`) may contain hex colors as source tokens.

### Доступные CSS переменные:

| Переменная                           | Назначение                                           |
| ------------------------------------ | ---------------------------------------------------- |
| `--mantine-color-body`               | Фон страницы                                         |
| `--mantine-color-text`               | Основной текст                                       |
| `--mantine-color-dimmed`             | Приглушённый текст                                   |
| `--mantine-color-{name}-{0-9}`       | Цвета палитры (blue, orange, green, red, gray, dark) |
| `--mantine-spacing-{xs,sm,md,lg,xl}` | Отступы                                              |
| `--mantine-radius-{xs,sm,md,lg,xl}`  | Радиусы                                              |

**Exception**: `rgba()` с цветами из палитры допустим для прозрачности (glassmorphism). Всегда добавляй комментарий с оригинальным цветом:

```css
/* dark[6] = #25262B с прозрачностью 0.4 */
background-color: rgba(37, 38, 43, 0.4);
```

## CSS Modules

```css
/* styles.module.css */
.container {
  padding: var(--mantine-spacing-md);
  background: var(--mantine-color-body);
}

.card {
  border: 1px solid var(--mantine-color-default-border);
  border-radius: var(--mantine-radius-md);
}
```

**Rules**:

- ✅ CSS Modules только для кастомных стилей
- ✅ Предпочитай Mantine props: `<Box p="md" bg="dark.7" />`
- ❌ No inline `style={{}}` в JSX
- ❌ No global CSS (только `app/globals.css`)

## Form Validation

### Valibot + Mantine Forms

```typescript
import { useForm } from '@mantine/form'
import { createMantineValidator } from '@/lib/create-mantine-validator'
import { UserSchema } from '@/domain/user'

export function useUserFormProps() {
  const form = useForm({
    initialValues: {
      first_name: '',
      last_name: '',
      email: '',
    },
    validate: createMantineValidator(UserSchema),
  })

  const handleSubmit = form.onSubmit((values) => {
    // values is typed as User
    updateUser(values)
  })

  return { form, handleSubmit }
}
```

**Rules**:

- ✅ Use `createMantineValidator` to bridge Valibot → Mantine
- ✅ Define validation in domain schemas
- ✅ Type-safe form values via `InferOutput<typeof Schema>`
- ✅ Handle submission in hooks, not in View components
