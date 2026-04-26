# Modo: batch-match — Bulk Candidate Matching

Cuando el usuario ejecuta `/career-ops batch-match`, procesar todos los jobs en `data/jobs/` y generar matching reports para cada uno.

## Process Flow

1. Cargar todos los candidatos de `data/candidates/`
2. Para cada job en `data/jobs/` con status 'open':
   - Calcular fit scores para todos los candidatos
   - Generar report detallado en `output/batch-match-{job-slug}.md`
   - Rankear candidatos por score descendente

## Output Format por Job

### Job: {title} ({slug})
**Archetype:** {archetype} | **Budget:** {budget_range} | **Requirements:** {count}

#### Top Candidates

| Rank | Candidate | Score | Skills Match | Archetype Fit | Availability | Rate Fit |
|------|-----------|-------|--------------|---------------|-------------|----------|
| 1    | {slug}   | 4.5   | 85%         | Match        | Available   | Fit      |

#### Detailed Matches

Para cada candidato con score > 3.5:
- Lista de skills matches con CV referencias
- Proof points relevantes
- Gaps identificados y estrategias de mitigación

## Automation

- Ejecutar automáticamente cuando se agregan nuevos jobs a `data/jobs/`
- Enviar notificaciones (email/slack) para matches > 4.0
- Archivar reports en `reports/matches/{date}/`

## Performance

- Paralelizar cálculos de matching si > 10 candidatos
- Cache results para jobs sin cambios