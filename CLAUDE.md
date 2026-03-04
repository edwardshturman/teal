# Guide to the `edwardshturman/teal` codebase for Claude Code

This project (named Teal, for the moment) is a minimalist, paginated Twitter timeline viewer

## Technical details of the project

### Tech stack

- Node version: 24.x
- Package manager: Bun
  - All installs, invocations, and scripts should use `bun`, e.g. `bun i`, `bun add`, `bun run`, `bunx`
  - All packages should be pinned to their exact SemVer
- Language: TypeScript (strict mode)
- Framework: Next.js 16 (App Router) with Turbopack
- Styling: Tailwind

### Code style

- No semicolons in JavaScript/TypeScript files
- No trailing commas
- Path alias: `@/*` maps to root directory

### Architecture

#### Components

- Generally, all reusable components live in `components/`
- Each component has its own directory, with:
  - The actual component file, e.g. `Tweet.tsx`
  - An `index.ts` re-exporting the file

## Heuristics

### Committing work

- Never commit or push unless explicitly instructed — always offer the user a chance to review first

### Answering questions

- When being asked a question, do not make any changes unless instructed to
- When the user uses language like "isn't it the case that (...)?", do not blindly accept the proposition. They are simply asking you a question. Assess the truthfulness of their premises & soundness of any arguments, and ultimately, answer the question
