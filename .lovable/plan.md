## Tikslas

Sutvarkyti Resend integraciją taip, kad:
- Kontaktai turėtų pilną `first_name` / `last_name`
- Tikri Resend **Custom Events** (`user.signup`, `subscription.started`, `credits.low`, etc.) realiai pasiektų Resend dashboard'ą
- Tavo automacijos (screenshot'e matytos) pradėtų veikti

**Aukščiausias prioritetas: NIEKAS aplikacijoje neturi sulūžti.**

---

## Saugumo principai (visi pakeitimai laikosi šių taisyklių)

1. **Jokių breaking changes egzistuojančiuose API kontrakto laukuose** — visi dabartiniai client iškvietimai į `sync-resend-contact` ir `track-resend-event` toliau veiks be jokių pakeitimų. Naujas funkcionalumas pridedamas **adityviai**.
2. **Kiekvienas Resend API call apgaubtas try/catch** — jei Resend nepasiekiamas, lūžta tik logas, ne user flow.
3. **Jokių pakeitimų signup / login / Stripe / generation / credits logikoje** — tik Resend sinchronizacijos vidiniai veikimas.
4. **Jokių DB schema migracijų** — tik edge funkcijų ir client kodo pakeitimai. (Vienintelis DB pakeitimas — neprivalomas: supaprastinti `handle_new_user` trigger, BET tik jei tu aprovinsi atskirai. Default'as = nediliam.)
5. **Backwards compatible**: jei naujas event'ų siuntimas kažkur sugenda, kontaktas vis tiek bus sukurtas/atnaujintas (kaip dabar).
6. **Visos funkcijos paleidžiamos asinchroniškai (`fire-and-forget`)** klient'e su `.catch(() => {})` — niekada neblokuoja UI.
7. **Visi resend event'ai logiamiimi į `resend_event_log`** kad galėtum debugint be Resend dashboard'o.

---

## Ką darom — 3 etapai (po kiekvieno gali testuoti)

### Etapas 1 — Sutvarkyti `sync-resend-contact` (saugiausias, jokio rizikos)

**Kas keičiasi:** edge funkcija dabar priims ir naudos visus laukus, kuriuos client jau siunčia (bet ji ignoruoja).

- ✅ Priimti `body.first_name`, `body.last_name`, `body.display_name` ir naudoti **prieš** profilio fallback
- ✅ Jei `user_id` neperduotas — surasti profilį pagal `email`
- ✅ Jei vardas vis tiek tuščias — fallback į `email.split('@')[0]`
- ✅ Logginti pilną payload į `resend_event_log` (geresnis debug)
- ✅ **NICE-TO-HAVE**: jei perduotas `properties.plan` — pridėti į log payload (Resend audience metadata API tų laukų nepriima, tai tik logas)

**Rizika:** Nulis. Funkcija toliau priima tą patį payload formatą, tiesiog dabar **naudoja** laukus, kurie anksčiau buvo ignoruojami.

**Test:** užregistruok testinį user'į → eik į Resend Audience → matysi pilną vardą.

---

### Etapas 2 — Sukurti tikrą Custom Events siuntimą `track-resend-event`

**Kas keičiasi:** funkcija dabar siųs realų event'ą į Resend Contact Events endpoint'ą.

- ✅ Step A: užtikrinti kad kontaktas egzistuoja audience'e (PUT/POST upsert) — **jei sugenda, eina toliau**, nes Resend grąžins „contact not found" prie event call'o ir mes vis tiek loginsim
- ✅ Step B: `POST /audiences/{id}/contacts/{email}/events` su `{ name: event, data: attributes }`
- ✅ Step C: log į `resend_event_log` su `status: 'sent' | 'failed'` ir Resend response

**Saugumo apsaugos:**
- Visa logika apgaubta **outer try/catch** — funkcija visada grąžina `200 { ok: true|false }`, niekada nemeta error'o caller'iui
- Caller'iai (DB triggeriai per `_invoke_edge_function`, `check-subscription`, `enqueue_generation`) jau dabar `try/catch` apgaubti — net jei kas nors mestų, jie ignoruoja
- **Resend API URL ir endpoint pavadinimas patikrintas pagal oficialią dokumentaciją** prieš deploy'ą

**Rizika:** Praktiškai nulis. Blogiausiu atveju event'ai nepasiekia Resend, bet:
- App'as veikia normaliai
- Kontaktas vis tiek sukuriamas
- Klaidą matom `resend_event_log` lentelėje
- Jokios user-facing pasekmės

**Test:**
1. Naujas signup → Onboarding complete
2. Resend → Audience → contact → Activity tab → matysi `Custom event: user.signup`
3. Aktyvuok automaciją Resend dashboard'e su trigger'iu „Custom event: user.signup"
4. Po sekančio test signup'o automacija realiai išsiųs welcome email'ą

---

### Etapas 3 — Patobulinti client iškvietimus (minimalūs pakeitimai)

**Kas keičiasi tik 3 vietose** — visos pridedam praleistus laukus, jokių esamų laukų nešalinam:

#### `Auth.tsx` (po sėkmingo signup)
- Pridedame `user_id` į payload (jau yra, tik įsitikinam)
- **Rizika:** nulis — tai tik naujas papildomas laukas

#### `Onboarding.tsx` (po onboarding complete)
- Pridedam **antrą** iškvietimą po `sync-resend-contact`: `track-resend-event` su `event: 'user.signup_completed'` ir pilnu profilio payload (plan, families, categories)
- **Rizika:** nulis — naujas adityvus iškvietimas, fire-and-forget, su `.catch(() => {})`
- **Kodėl ne `user.signup`?** Nes DB trigger'is `handle_new_user` jau iškviečia `sync-resend-contact` su `event: user.signup` signup'o metu. Naujasis `signup_completed` yra atskiras event'as kuris reiškia „profilis pilnai užpildytas" — tinka automacijoms su pilnais duomenimis

#### `Settings.tsx` (po profilio/kategorijų save)
- Pridedam `track-resend-event` su `event: 'profile.updated'` šalia esamo `sync-resend-contact`
- **Rizika:** nulis — naujas adityvus iškvietimas

**NIEKAS nešalinam, NIEKAS nepervadinam.**

---

## Ko **NEDARYSIM** (apsisaugojimas nuo lūžimo)

❌ **Nediliam** `handle_new_user` DB triggerio. Jis lieka kaip yra. Užtenka kad jis iškviečia `sync-resend-contact` (nieko kito jis nedaro Resend pusėje).

❌ **Nekeičiame** jokios kitos DB funkcijos (`enqueue_generation`, `deduct_credits`, `change_user_plan`).

❌ **Nekeičiame** Stripe webhook ar `check-subscription` logikos — jis jau iškviečia `track-resend-event` ir po Etapo 2 tas event'as **automatiškai pradės veikti**.

❌ **Negeneruojame** DB migracijų.

❌ **Negaminame** naujų lentelių.

❌ **Nekeičiame** `resend_event_log` lentelės schemos.

❌ **Neatliekame** backfill'o esamiems user'iams automatiškai. (Tai galėsi padaryti rankiniu būdu iš Admin → Email Marketing → Resync, jau egzistuoja.)

---

## Failai, kuriuos liečiam

```text
supabase/functions/sync-resend-contact/index.ts   ← Etapas 1: praplečiam, suderinama
supabase/functions/track-resend-event/index.ts    ← Etapas 2: pridedam realų event call
src/pages/Auth.tsx                                 ← Etapas 3: patikrinam payload (mažas)
src/pages/Onboarding.tsx                           ← Etapas 3: +1 fire-and-forget call
src/pages/Settings.tsx                             ← Etapas 3: +1 fire-and-forget call
```

**Iš viso 5 failai. Jokių schema migracijų. Jokių lentelių. Jokių trigger'ių keitimų.**

---

## Rollback planas (jei kas vis dėlto nepatiks)

- Edge funkcijos versionuojamos automatiškai → galima atstatyti vienu spustelėjimu
- Client kodo pakeitimai = 3 mažos `.catch(() => {})` apgaubtos vietos → trivialu atšaukti
- Niekas DB neliečiama → nieko neperregresuoti

---

## Po implementacijos — ką pamatysi

1. **Resend Audience kontaktai**: pilnas First Name / Last Name (ne tuščias)
2. **Resend → Audience → konkretus kontaktas → Activity tab**: matysi:
   - `Custom event: user.signup` (iš DB trigger)
   - `Custom event: user.signup_completed` (po onboarding)
   - `Custom event: subscription.started` (kai paima planą)
   - `Custom event: credits.low` (kai balansas <10)
   - `Custom event: profile.updated` (kai keičia kategorijas)
3. **Resend → Automations**: tavo screenshot'e matyta „Sign Up - Welcome Email" automacija su trigger'iu „Custom event: user.signup" **realiai suveiks**
4. **Tavo Admin → Email Marketing**: log'ai rodys `status: ok` visiems event'ams

---

## Aprovinimas

Aprovink šį planą ir paleisiu **iškart visus 3 etapus** (jie saugūs ir nepriklausomi). Po deploy'o tu testuoji vieną signup, patikrini Resend dashboard'e ir patvirtini ar matosi event'ai.

Jei nori — galiu paleisti **tik Etapą 1 ir Etapą 2 pirma** (be client pakeitimų), o Etapą 3 daryti atskirame žingsnyje. Pasakyk savo preferenciją aprov'inime.
