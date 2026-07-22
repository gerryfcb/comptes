# Comptes

Comptes es una PWA personal i local-first feta amb Next.js i TypeScript.
Les dades reals viuen al dispositiu amb `localStorage` i es poden exportar o
importar amb backups JSON.

## Requisits

- Node.js 22 LTS
- npm

## Posada en marxa

```bash
cp .env.example .env.local
npm install
npm run dev
```

Obre `http://localhost:3000`.

## Funcions intel·ligents

La pantalla **Moviment ràpid** pot interpretar una frase i convertir-la en un
esborrany de moviment. No desa res automaticament: sempre cal confirmar.

Sense `OPENAI_API_KEY`, la resta de Comptes continua funcionant i la pantalla
mostra que la funció encara no està configurada.

Per provar-ho localment, posa `OPENAI_API_KEY` a `.env.local`. No commitegis
`.env.local`. A Vercel, configura `OPENAI_API_KEY` com a variable d'entorn del
projecte. L'us de l'API es independent del pla de ChatGPT.

## Comprovacions

```bash
npm run lint
npm run typecheck
npm run build
```

## Desplegament

El projecte esta preparat per desplegar-se a Vercel com a app Next.js. No cal
backend propi per a l'us local-first actual.
