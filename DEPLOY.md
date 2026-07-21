# Publicar i recuperar Comptes

## Abans de fer canvis

1. A l’iPhone, obre **Configuració → Còpies de seguretat**.
2. Prem **Exportar còpia** i desa el JSON a Fitxers, iCloud Drive, Google Drive o una carpeta segura.

## Comprovar i publicar

Des de la carpeta del projecte, executa:

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run build
git add .
git commit -m "Descripció del canvi"
git push
```

Vercel desplega automàticament la branca connectada. Al tauler de Vercel, obre el projecte i comprova que el desplegament més recent figura com a **Ready**. Obre també la URL de producció i comprova Inici, Moviments i Configuració.

La PWA mostrarà **Hi ha una actualització disponible**. Acaba qualsevol formulari o moviment en curs i prem **Actualitzar**. Les dades de `localStorage` no formen part de la memòria cau i no s’esborren durant l’actualització.

## Tornar a una versió anterior

Al projecte de Vercel, obre **Deployments**, selecciona l’últim desplegament que funcionava i usa l’opció **Promote to Production** (o **Rollback**, si apareix). Això canvia els fitxers publicats, però no les dades locals de l’iPhone.

## Si apareix una pantalla blanca

1. Tanca completament la PWA i torna-la a obrir amb connexió.
2. Si continua igual, obre la URL a Safari i recarrega-la; espera que acabi i torna a obrir la PWA.
3. Torna a un desplegament anterior des de Vercel.
4. No esborris les dades de Safari ni desinstal·lis la PWA abans de recuperar o confirmar una còpia.

## Restaurar una còpia

Obre **Configuració → Còpies de seguretat → Importar còpia**, selecciona el JSON i confirma. La importació substitueix les dades del dispositiu, recalcula els saldos a partir dels moviments i torna a Inici. És recomanable exportar l’estat actual abans d’importar.

Si les dades locals estan corruptes, Comptes no les esborra ni carrega una plantilla: mostra directament la pantalla de recuperació perquè puguis importar una còpia vàlida.
