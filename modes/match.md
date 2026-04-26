# Modo: match — Interactive Candidate Matching

Cuando el usuario ejecuta `/career-ops match {job-slug}` o `/career-ops match --candidate {slug}`, ejecutar matching interactivo.

## Input Handling

- Si se especifica `job-slug`: Buscar en `data/jobs/{job-slug}.yml`, rankear todos los candidatos en `data/candidates/`
- Si se especifica `--candidate {slug}`: Buscar candidato en `data/candidates/{slug}/`, rankear todas las jobs en `data/jobs/`

## Output Format

Mostrar tabla ranked con:

| Rank | Candidate/Job | Score | Key Matches | Gaps |
|------|---------------|-------|-------------|------|
| 1    | ...          | 4.2   | Skills: 80%, Archetype: Match | Availability: On-project |

Para cada top match, incluir:
- Breve explicación del score
- Top 3 skills matches con CV referencias
- Archetype alignment
- Availability status
- Rate fit
- Hard filters (clearance, visa)

## Interactive Features

- Preguntar si quiere ver detalles completos de un match específico
- Ofrecer generar reportes PDF o markdown
- Sugerir next steps (contactar candidato, aplicar a job)

## Reverse Matching

Para `--candidate {slug}`:
- Rankear jobs por fit score
- Mostrar tabla similar, pero con job details
- Útil para account managers asignando proyectos a consultores