# Output Patterns

Use these patterns when skills need to produce consistent, high-quality output.

## Template Pattern

Provide templates for output format. Match the level of strictness to your needs.

**For strict requirements (like API responses or data formats):**

```markdown
## Report structure

ALWAYS use this exact template structure:

# [Analysis Title]

## Executive summary

[One-paragraph overview of key findings]

## Key findings

- Finding 1 with supporting data
- Finding 2 with supporting data
- Finding 3 with supporting data

## Recommendations

1. Specific actionable recommendation
2. Specific actionable recommendation
```

**For flexible guidance (when adaptation is useful):**

```markdown
## Report structure

Here is a sensible default format, but use your best judgment:

# [Analysis Title]

## Executive summary

[Overview]

## Key findings

[Adapt sections based on what you discover]

## Recommendations

[Tailor to the specific context]

Adjust sections as needed for the specific analysis type.
```

## Examples Pattern

For skills where output quality depends on seeing examples, provide input/output pairs:

```markdown
## Commit message format

Generate commit messages following these examples:

**Example 1:**
Input: Added user authentication with JWT tokens
Output:
feat(auth): implement JWT-based authentication

Add login endpoint and token validation middleware

**Example 2:**
Input: Fixed bug where dates displayed incorrectly in reports
Output:
fix(reports): correct date formatting in timezone conversion

Use UTC timestamps consistently across report generation

Follow this style: type(scope): brief description, then detailed explanation.
```

Examples help Claude understand the desired style and level of detail more clearly than descriptions alone.

## Checklist Pattern

For skills that need to verify completeness:

```markdown
## Before submitting

Verify all requirements:

- [ ] All tests pass
- [ ] Documentation updated
- [ ] No console errors
- [ ] Responsive on mobile
- [ ] Accessibility checks pass
```

## Format Specification Pattern

When exact formatting matters:

```markdown
## Date format

Use ISO 8601 format: YYYY-MM-DD
Examples:

- 2024-01-15 (correct)
- 01/15/2024 (incorrect)
- January 15, 2024 (incorrect)
```

## Structured Output Pattern

For machine-readable outputs:

```markdown
## API Response Format

Return JSON with this structure:

{
"status": "success" | "error",
"data": { ... },
"message": "Human-readable description"
}

Required fields:

- status: Always present
- data: Present on success, null on error
- message: Always present
```
