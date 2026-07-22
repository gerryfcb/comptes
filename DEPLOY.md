# Publicar i recuperar Comptes

## Abans de fer canvis

1. A l'iPhone, obre **Configuració -> Còpies de seguretat**.
2. Prem **Exportar copia** i desa el JSON a Fitxers, iCloud Drive, Google Drive o una carpeta segura.

## Comprovar i publicar

Des de la carpeta del projecte, executa:

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run build
git add .
git commit -m "Descripcio del canvi"
git push
```

Vercel desplega automàticament la branca connectada. Al tauler de Vercel, obre el projecte i comprova que el desplegament més recent figura com a **Ready**. Obre la URL de producció i comprova Inici, Moviments i Configuració.

## Variable opcional per IA

Per activar **Moviment ràpid** amb interpretació d'IA, afegeix a Vercel:

```text
OPENAI_API_KEY=...
```

La clau ha de viure nomes a les variables d'entorn de Vercel o a `.env.local` en desenvolupament. No facis servir `NEXT_PUBLIC_OPENAI_API_KEY` i no posis cap clau al repositori.

Sense aquesta variable, Comptes continua funcionant amb formularis manuals, backups, PWA i offline.

L'us de l'API d'OpenAI te cost separat i no depen del pla de ChatGPT.

## Actualitzacio a l'iPhone

La PWA pot mostrar **Hi ha una actualitzacio disponible**. Acaba qualsevol formulari o moviment en curs i prem **Actualitzar**. Les dades de `localStorage` no formen part de la memoria cau i no s'esborren durant l'actualitzacio.

## Tornar a una versio anterior

Al projecte de Vercel, obre **Deployments**, selecciona l'ultim desplegament que funcionava i usa **Promote to Production** o **Rollback**. Aixo canvia els fitxers publicats, pero no les dades locals de l'iPhone.

## Restaurar una copia

Obre **Configuració -> Còpies de seguretat -> Importar còpia**, selecciona el JSON i confirma. La importació substitueix les dades del dispositiu, recalcula els saldos a partir dels moviments i torna a Inici.

## Si apareix una pantalla blanca

1. Tanca completament la PWA i torna-la a obrir amb connexio.
2. Obre la URL a Safari i recarrega-la.
3. Torna a un desplegament anterior des de Vercel.
4. No esborris les dades de Safari ni desinstal·lis la PWA abans de recuperar o confirmar una copia.
