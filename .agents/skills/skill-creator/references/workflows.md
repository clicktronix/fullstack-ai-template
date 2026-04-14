# Workflow Patterns

Use these patterns when skills involve multi-step processes or decision-based logic.

## Sequential Workflows

Break complex tasks into numbered steps. It is often helpful to give Claude an overview of the process towards the beginning of SKILL.md.

**Example: PDF Form Filling Process**

```markdown
## Overview

This skill handles PDF form filling through a 5-step process:

1. Analyze the PDF structure
2. Identify fillable fields
3. Map user data to fields
4. Fill the form
5. Verify the output

## Step 1: Analyze PDF Structure

First, examine the PDF to understand its layout:

- Use `scripts/analyze_pdf.py` to extract structure
- Identify form type (tax form, application, survey, etc.)
- Note any special requirements or constraints

## Step 2: Identify Fillable Fields

Extract all fillable fields:

- Run `scripts/extract_fields.py` on the PDF
- Review field names and types
- Map fields to expected data types

## Step 3: Map User Data

Match user-provided data to form fields:

- Validate data types match field requirements
- Handle missing or optional fields
- Transform data as needed (date formats, etc.)

## Step 4: Fill the Form

Execute the form filling:

- Use `scripts/fill_form.py` with mapped data
- Handle any errors gracefully
- Preserve existing content if required

## Step 5: Verify Output

Confirm successful completion:

- Open filled PDF and review
- Verify all fields populated correctly
- Check for any visual issues
```

## Conditional Workflows

Use branching logic when tasks have multiple pathways.

**Example: Document Modification Types**

```markdown
## Workflow Decision Tree

First, determine the modification type:

### If Creating a New Document:

1. Choose template from `assets/templates/`
2. Customize structure based on requirements
3. Add content sections
4. Apply formatting
5. Save and validate

### If Editing an Existing Document:

1. Open and analyze current document
2. Identify sections to modify
3. Preserve formatting and styles
4. Make targeted changes
5. Review changes before saving

### If Converting Document Format:

1. Analyze source document structure
2. Map elements to target format
3. Handle format-specific features
4. Convert and validate
5. Clean up any conversion artifacts
```

## Decision Tree Pattern

For complex routing based on multiple factors:

```markdown
## Request Routing

Analyze the request and route appropriately:

Is it a data query?
├── Yes → Does it need real-time data?
│ ├── Yes → Use streaming API
│ └── No → Use cached data
└── No → Is it a mutation?
├── Yes → Validate permissions first
└── No → Handle as informational request
```

## Iterative Workflow Pattern

For tasks that may require multiple passes:

```markdown
## Code Review Process

### Pass 1: Structure Review

- Check file organization
- Verify naming conventions
- Assess modularity

### Pass 2: Logic Review

- Trace execution paths
- Identify edge cases
- Check error handling

### Pass 3: Quality Review

- Review test coverage
- Check documentation
- Assess performance

Repeat passes as needed until all issues resolved.
```

## Parallel Workflow Pattern

For independent tasks that can run simultaneously:

```markdown
## Build Pipeline

Execute these steps in parallel when dependencies allow:

**Parallel Group 1:**

- Lint code
- Run unit tests
- Check types

**Parallel Group 2 (after Group 1):**

- Build production bundle
- Generate documentation
- Run integration tests

**Final Step:**

- Deploy if all checks pass
```
