# Avond4Daagse backend lokaal draaien

Met deze stappen heb je de database (Docker) en Swagger lokaal aan de praat. Alle commando's draai je in **PowerShell** of de **Terminal in Rider**.

## Wat je nodig hebt

| Programma | Waarvoor | Controleren |
|---|---|---|
| [.NET 10 SDK](https://dotnet.microsoft.com/download) | de API bouwen en starten | `dotnet --version` (moet 10.x zijn) |
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | de PostgreSQL-database | `docker --version` |
| EF Core tool | de database-tabellen aanmaken | `dotnet ef --version` |

De EF Core tool installeer je één keer met:

```powershell
dotnet tool install --global dotnet-ef
```

## Stap 1: project ophalen

```powershell
git clone <link-naar-de-repository>
cd avond4daagse4\avond4daagseBackend
```

Alle volgende commando's draai je in de map `avond4daagseBackend`, de map waar `compose.yaml` en het `.csproj`-bestand staan. Heb je de repository al, haal dan eerst de laatste wijzigingen op met `git pull`.

## Stap 2: database starten (Docker)

Zorg dat **Docker Desktop open is** en klaar is met opstarten. Start dan de database:

```powershell
docker compose up -d
```

Controleer of hij draait:

```powershell
docker ps
```

Je ziet `avond4daagse-db` met status `Up` en poort `5433->5432`. De database heeft deze instellingen:

| Instelling | Waarde |
|---|---|
| Host | `localhost` |
| Poort | `5433` |
| Database | `avond4daagse` |
| Gebruiker | `appuser` |
| Wachtwoord | `apppassword` |

Deze wachtwoorden zijn alleen voor lokaal gebruik. Gebruik ze nergens anders.

## Stap 3: tabellen aanmaken

De migraties staan al in de repository (map `Migrations`). Je hoeft er zelf geen te maken. Voer alleen uit:

```powershell
dotnet ef database update
```

Hiermee worden alle tabellen aangemaakt en de rollen toegevoegd. Je ziet `Done.` als het gelukt is. Een rode `fail:`-regel over `__EFMigrationsHistory` de eerste keer is normaal.

## Stap 4: API starten

```powershell
dotnet run
```

Wacht tot je in de console `Now listening on: http://localhost:5278` ziet. Staat er een andere poort, gebruik dan die.

## Stap 5: Swagger openen

Open in je browser:

```
http://localhost:5278/swagger
```

Hier zie je alle endpoints. Klik op een endpoint, kies **Try it out**, vul de gegevens in en klik op **Execute**. Swagger werkt alleen in de Development-omgeving. Dat staat in `launchSettings.json` goed ingesteld.

## Inloggen in Swagger

Veel endpoints zijn beveiligd met rollen. Zo log je in:

1. **Registreren:** `POST /api/Auth/register`

   ```json
   {
     "naam": "Jouw Naam",
     "email": "jij@example.com",
     "wachtwoord": "minstens8tekens",
   }
   ```

  
2. **Inloggen:** `POST /api/Auth/login` met je e-mail en wachtwoord. Je browser bewaart de cookie, en Swagger stuurt hem daarna automatisch mee.

3. **Controleren:** `GET /api/Auth/me` toont je naam en rollen.

4. **Een andere rol testen:** log uit met `POST /api/Auth/logout`, registreer een nieuwe gebruiker met een andere `rolId` en log opnieuw in. De rol zit in je cookie, dus een nieuwe rol werkt pas na opnieuw inloggen.

## Handige commando's

| Doel | Commando |
|---|---|
| Database stoppen | `docker compose down` |
| Database starten | `docker compose up -d` |
| Database en alle data wissen | `docker compose down -v` |
| Tabellen opnieuw aanmaken | `dotnet ef database update` |
| Alleen de tabellen wissen | `dotnet ef database drop`, daarna `dotnet ef database update` |
| Kijken welke migraties er zijn | `dotnet ef migrations list` |
| Code controleren op fouten | `dotnet build` |

Als je `docker compose down -v` of `dotnet ef database drop` gebruikt, is alle data weg. Doe dat alleen in je eigen lokale omgeving.

## Veelvoorkomende problemen

**`Failed to connect to 127.0.0.1:5433`**
De database draait niet. Open Docker Desktop, wacht tot hij klaar is, en draai `docker compose up -d`.

**`The container name "/avond4daagse-db" is already in use`**
Er bestaat al een container met die naam. Start hem met `docker start avond4daagse-db`, of verwijder hem eerst met `docker rm -f avond4daagse-db` en draai `docker compose up -d` opnieuw.

**`port is already allocated` of poort 5433 is bezet**
Iets anders gebruikt die poort. Kijk met `docker ps` of er een andere database draait en stop die, of verander in `compose.yaml` de poort naar bijvoorbeeld `"5434:5432"` en zet dezelfde poort in je connection string. Commit die wijziging niet zonder overleg met de groep, anders krijgen je groepsgenoten jouw poort.

**`dotnet ef` wordt niet gevonden**
Installeer de tool met `dotnet tool install --global dotnet-ef` en open daarna een nieuwe terminal.

**`Build failed` bij `dotnet ef` of `dotnet run`**
Draai `dotnet build`. Die toont de fouten met bestand en regelnummer.

**Swagger geeft een 401 of 403**
401 betekent dat je niet ingelogd bent, 403 dat je wel bent ingelogd maar de verkeerde rol hebt. Log in met een gebruiker met de juiste rol.

**Swagger laat een oude versie zien**
Stop de app met Ctrl+C en start hem opnieuw met `dotnet run --launch-profile http`.

**`Rol not found` bij registreren**
De rollen ontbreken in je database. Draai `dotnet ef database update`.
