# Connexió IA de Comptes

## Que funciona ara

Comptes té una pantalla de **Moviment ràpid** on l'usuari escriu o dicta una
frase. La frase es pot enviar a una ruta server-side de Next/Vercel:

```text
POST /api/ai/parse-movement
```

La ruta nomes rep la frase actual, comptes actius, categories/subcategories
actives i la data local. No rep l'historial complet, backups ni tot el
`localStorage`.

La IA retorna un esborrany estructurat. Comptes el valida, el mostra editable i
nomes desa el moviment localment quan l'usuari prem **Confirmar i guardar**.

## Seguretat

- La clau `OPENAI_API_KEY` viu nomes al servidor.
- No existeix cap `NEXT_PUBLIC_OPENAI_API_KEY`.
- Cap endpoint public crea moviments directament.
- El servidor no modifica dades financeres.
- Un xat extern no pot accedir al `localStorage` del dispositiu.

## Sense clau

Si `OPENAI_API_KEY` no existeix, Comptes mostra que la funció intel·ligent encara
no està configurada. La resta de l'app continua funcionant offline i local-first.

## Per connectar ChatGPT directament en el futur

Caldria afegir una arquitectura amb:

- servidor/API autenticada;
- usuari o token;
- cua de moviments pendents;
- confirmacio dins de Comptes abans de guardar;
- possible MCP/App de ChatGPT;
- sincronitzacio o backend per compartir estat entre dispositius.

Fins llavors, la IA dins de Comptes nomes crea esborranys revisables.
