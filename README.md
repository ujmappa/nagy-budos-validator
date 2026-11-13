# A Nagy Büdös Validátor

Kilenc mező. Valódi Zod-validáció. Nulla hasznos hibaüzenet.

## Futtatás

Node.js 20+ szükséges.

```bash
npm install
npm start
```

Nyisd meg: **http://localhost:3000**

Fejlesztői indítás: `npm run dev`. Tesztek: `npm test`. Formázás: `npm run format`.

A `sources/public/index.html` kizárólag a felületet és az API-hívást tartalmazza. **Nem működik önmagában fájlként megnyitva**: futó Express-szerver kell hozzá.

## API

`POST /api/validate`, `Content-Type: application/json`:

```json
{
  "f0": "...",
  "f1": "...",
  "f2": "...",
  "f3": "...",
  "f4": "...",
  "f5": "...",
  "f6": "...",
  "f7": "...",
  "f8": "..."
}
```

- 200: `{ "success": true, "message": "..." }`
- 422: `{ "success": false, "message": "..." }`
- 400: érvénytelen JSON, ugyancsak sértő, semmitmondó válasszal.

A válasz **soha** nem tartalmazza a hibás mezők nevét, az elvárt formátumot vagy a Zod issue-kat. Ezek a szerver konzolján jelennek meg, így a valódi validáció megfigyelhető a fejlesztőnek. Ne publikáld személyes adatokkal: mintafelület, nem adatkezelésre kész rendszer.

## Felépítés

- `sources/schema.js` — a kilenc valódi szerveroldali Zod-szabály (és csak itt)
- `sources/messages.js` — 32 magyar hibaüzenet
- `sources/app.js` — Express API, logolás, statikus frontend
- `sources/server.js` — indítás
- `sources/public/index.html` — a korábbi UI, kizárólag API-kliens
- `sources/public/styles.css` — a felület stílusai
- `tests/validator.test.js` — sématesztek és HTTP-tesztek

A korábbi „csaló üzemmód” és automatikus kitöltés megszűnt, mert szükségszerűen kiszivárogtatta a szabályokat a böngészőbe. A pontos szabályokat fejlesztőként a `sources/schema.js`-ben látod.
