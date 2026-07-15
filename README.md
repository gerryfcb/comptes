# Comptes

Aplicació web moderna preparada com a PWA instal·lable, construïda amb Next.js,
TypeScript, PostgreSQL i Drizzle ORM.

## Requisits

- Node.js 22 LTS
- Una base de dades PostgreSQL

## Posada en marxa

```bash
cp .env.example .env.local
npm install
npm run dev
```

Obre `http://localhost:3000`.

## Base de dades

Configura `DATABASE_URL` i executa:

```bash
npm run db:generate
npm run db:migrate
```

## Comprovacions

```bash
npm run check
npm run build
```

## Desplegament

El projecte està preparat per desplegar-se a Vercel. Cal configurar-hi
`DATABASE_URL` i connectar una base PostgreSQL gestionada.
