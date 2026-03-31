# Subagentes de Codex instalados para `cops-platform`

## Fuente verificada

Repositorio analizado: [VoltAgent/awesome-codex-subagents](https://github.com/VoltAgent/awesome-codex-subagents)

La instalación recomendada por ese repositorio usa:

- `~/.codex/agents/` para agentes globales
- `.codex/agents/` para agentes por proyecto

En este proyecto se eligió **instalación local al repo** para que el módulo de tickets tenga prioridad propia.

## Ubicación instalada

`/Users/oviedo/Documents/GitHub/cops-platform/.codex/agents`

## Agentes instalados

### Descubrimiento y mapeo

- `agent-installer.toml`
- `code-mapper.toml`

### Implementación

- `nextjs-developer.toml`
- `typescript-pro.toml`
- `fullstack-developer.toml`
- `refactoring-specialist.toml`

### Revisión

- `reviewer.toml`
- `architect-reviewer.toml`

### Documentación

- `documentation-engineer.toml`

## Por qué estos y no los 136+

Porque INSTALAR TODO es ruido, no estrategia.

Para este repo lo correcto es cargar el conjunto mínimo que cubre:

1. mapeo del módulo
2. desarrollo Next.js/TypeScript
3. revisión técnica y arquitectónica
4. refactor seguro
5. documentación fiel al código

## Verificación manual

1. Reinicia o refresca Codex.
2. Abre este repo.
3. Verifica que Codex detecte agentes en `.codex/agents/`.

## Criterio de uso recomendado

- Usa `code-mapper` antes de tocar archivos grandes.
- Usa `nextjs-developer` si cambias rutas, Server Actions o boundaries server/client.
- Usa `typescript-pro` cuando el problema sea contrato, tipos o `as any`.
- Usa `refactoring-specialist` si vas a partir archivos grandes sin cambiar comportamiento.
- Usa `reviewer` y `architect-reviewer` antes de cerrar cambios relevantes.
