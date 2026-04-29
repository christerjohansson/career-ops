# Modo: pipeline -- Inbox de URLs (Second Brain)

Processa URLs de vagas acumuladas em `data/pipeline.md`. O candidato adiciona URLs quando quiser e depois executa `/career pipeline` para processar todas de uma vez.

## Workflow

1. **Ler** `data/pipeline.md` → buscar itens `- [ ]` na secao "Pendentes"
2. **Para cada URL pendente**:
   a. **Extraer JD** usando Playwright (browser_navigate + browser_snapshot) → WebFetch → WebSearch
   b. Se a URL nao for acessivel → marcar como `- [!]` com nota e continuar
   c. **Salvar/Normalizar JD**: Salvar o conteudo extraido na pasta `jds/` com um nome descritivo (ex: `jds/empresa-vaga.md`). Se ja for um prefixo `local:`, verificar se o arquivo existe.
   d. **Mover de "Pendientes" para "Processadas"**: `- [x] local:jds/arquivo.md | Empresa | Vaga`
3. **Se houver multiplas URLs pendentes**, lancar agentes em paralelo (Agent tool com `run_in_background`) para maximizar velocidade.
4. **Ao terminar**, mostrar tabela resumo:

```
| Empresa | Vaga | Arquivo Local | Status |
```

## Formato de pipeline.md

```markdown
## Pendentes
- [ ] https://jobs.example.com/posting/123
- [ ] https://boards.greenhouse.io/company/jobs/456 | Company Inc | Senior PM
- [!] https://private.url/job — Erro: login necessario

## Processadas
- [x] local:jds/acme-corp-ai-pm.md | Acme Corp | AI PM
- [x] local:jds/bigco-sa.md | BigCo | SA
```

> Nota: Os titulos das secoes podem estar em EN ("Pending"/"Processed"), ES ("Pendientes"/"Procesadas"), DE ("Offen"/"Verarbeitet") ou PT-BR ("Pendentes"/"Processadas"). Ao ler, ser flexivel; ao escrever, manter o estilo da arquivo existente.

## Deteccao inteligente de JD a partir da URL

1. **Playwright (preferido):** `browser_navigate` + `browser_snapshot`. Funciona com todas as SPAs.
2. **WebFetch (fallback):** Para paginas estaticas ou quando Playwright nao esta disponivel.
3. **WebSearch (ultimo recurso):** Buscar em portais secundarios que indexam o JD.

**Casos especiais:**
- **LinkedIn**: Pode exigir login → marcar com `[!]` e pedir ao candidato para colar o texto
- **PDF**: Se a URL aponta para um PDF, ler diretamente com o Read tool
- **`local:` prefix**: Ler arquivo local. Exemplo: `local:jds/linkedin-pm-ai.md` → ler `jds/linkedin-pm-ai.md`
- **Gupy / Greenhouse / Lever**: Plataformas comuns no Brasil. Playwright funciona bem com todas
- **Vagas.com.br / InfoJobs / Catho**: Portais brasileiros, geralmente acessiveis via WebFetch
- **LinkedIn BR**: Mesmas restricoes do LinkedIn global — pode exigir login


