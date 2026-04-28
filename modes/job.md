# Mode: Job Ingestion

Use this mode to transform raw job description text or a JD file into a structured YAML entry in `data/jobs/`.

## Instructions

1.  **Read Template**: Load `examples/jobs/example-job.yml` to understand the exact structure and fields required.
2.  **Extract Data**: Parse the input (pasted text or file content) and extract:
    *   `title`: The official job title.
    *   `company`: The company name.
    *   `client_slug`: A kebab-case version of the company name (e.g., "Acme Corp" -> "acme-corp").
    *   `requirements`: A list of mandatory skills and experience.
    *   `nice_to_haves`: A list of preferred but not mandatory skills.
    *   `archetype`: Classify the role into one of the system archetypes (see `modes/_shared.md`):
        *   AI Platform / LLMOps
        *   Agentic / Automation
        *   Technical AI PM
        *   AI Solutions Architect
        *   AI Forward Deployed
        *   AI Transformation
    *   `budget_range`: Salary or hourly rate if mentioned (otherwise "Not specified").
    *   `clearance_required`: List any security clearance mentioned (empty list if none).
    *   `visa_required`: `true` if sponsorship is mentioned as NOT provided or required, `false` otherwise.
    *   `domain`: Industry or technical domain (e.g., "AI/ML", "FinTech").
    *   `description_raw`: A brief summary or the full description if concise.
    *   `status`: Always set to `open`.
3.  **Propose File**: 
    *   Target path: `data/jobs/{client_slug}.yml` (or `{client_slug}-{role-slug}.yml` if the company has multiple roles).
    *   Show the extracted YAML to the user for confirmation.
4.  **Create File**: Once confirmed, use `write_to_file` to create the job entry.

## Example Output Structure

```yaml
title: "Senior AI Engineer"
company: "OpenAI"
client_slug: "openai"
requirements:
  - "5+ years of Python"
  - "Deep understanding of Transformers"
nice_to_haves:
  - "Experience with Triton"
archetype: "AI Platform / LLMOps"
budget_range: "$200k - $300k"
clearance_required: []
visa_required: false
domain: "AI Research"
description_raw: "Building the future of AGI..."
status: open
```
