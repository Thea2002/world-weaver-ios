# Notion-Sync und Generatoren erweitern

## Ziel
- Notion dauerhaft über die sichere Projektverbindung nutzen.
- Den Push sichtbar und zuverlässig machen, einschließlich klarer Erfolgs- und Fehlermeldungen.
- Zusätzliche TTRPG-Settings ergänzen.
- One-Shots sowie eine frei wählbare Anzahl für passende Generator-Ausgaben ermöglichen.

## Umsetzung
1. **Notion-Verbindung modernisieren**
   - Den im Browser gespeicherten Schlüssel entfernen und alle Notion-Aufrufe über die verbundene Notion-Integration ausführen.
   - Die angegebene „Journal“-Datenbank als gespeichertes Standardziel hinterlegen.
   - Notions aktuelle Datenquellen-Struktur verwenden und die vorhandenen Spalten der Datenbank berücksichtigen.
   - Beim Push pro Notiz Fehler zurückgeben, statt sie still zu verschlucken; Erfolg, Anzahl und konkrete Fehler in den Einstellungen anzeigen.
2. **Settings erweitern**
   - Ravenloft, Barovia, Dragonlance, Ravnica, Princes of the Apocalypse, Out of the Abyss, Call of Cthulhu und Tomb of Annihilation mit passenden Kanon-Leitlinien ergänzen.
   - Die bestehende Mehrfachauswahl und dauerhafte Speicherung beibehalten.
3. **Generatoren erweitern**
   - Einen One-Shot-Generator mit Spielzeit, Gruppenstufe, Ton und Setting-Bezug ergänzen.
   - Eine Mengenwahl hinzufügen, die etwa Items, Quests, NSCs oder andere passende Einträge in der gewünschten Anzahl erzeugt.
   - Menge als klare Prompt-Vorgabe und gespeicherte Property übernehmen.
4. **Prüfen**
   - Notion-Push gegen die verbundene Journal-Datenbank testen.
   - Generator-Auswahl und neue Settings auf Mobilansicht prüfen.

## Technische Details
- Notion API `2025-09-03`, Datenquelle `3da25bbf-71c0-80b4-bb66-000bbeb14aa3`.
- Zugangsdaten bleiben ausschließlich serverseitig; der zuvor gepostete Token wird nicht im App-Code gespeichert.
