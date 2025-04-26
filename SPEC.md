# TractoRent
Specyfikacja aplikacji do rezerwacja maszyn rolniczych

## 1. Wstęp
Aplikacja internetowa służy do rezerwowania maszyn rolniczych przez członków spółdzielni rolniczej. Każdy członek może rezerwować dostępne maszyny na zasadzie "kto pierwszy, ten lepszy" przez interfejs internetowy. Rezerwacje są przyjmowane wyłącznie na całe dni i nie mogą być planowane na więcej niż 3 miesiące naprzód.

## 2. Wymagania projektu

### 2.1. Wymagania biznesowe
- Rezerwacja sprzętu na pełne dni.
- Maksymalny termin rezerwacji: 3 miesiące wprzód.
- Brak możliwości rezerwacji przeszłych dat.
- Brak możliwości rezerwacji godzinowych.
- Kolizje rezerwacji muszą być blokowane.

## 2.2. Wymagania funkcjonalne
- Wyświetlanie listy wszystkich maszyn.
- Wyświetlanie dostępności danej maszyny.
- Tworzenie nowej rezerwacji.
- Anulowanie własnej rezerwacji.
- Logowanie i wylogowywanie użytkowników.
- Tworzenie, edytowanie i usuwanie maszyn (tylko dla administratora).
- Tworzenie i usuwanie rezerwacji innych (tylko dla administratora).

## 2.3. Wymagania niefunkcjonalne
- SSR (Server Side Rendering) za pomocą EJS lub Pug.
- Użycie Node.js, Express i Sequelize z SQLite.
- Bezpieczeństwo: autoryzacja i walidacja danych.
- Prosty, responsywny interfejs użytkownika

## 3. Specyfikacja systemu

### 3.1. Technologie
- Node.js (LTS)
- Express.js
- Sequelize ORM
- SQLite3
- EJS
- CSS

### 3.2 Architektura aplikacji
Aplikacja jest zaprojektowana zgodnie z zasadami warstwowej architektury. Każda warstwa ma swoją odpowiedzialność i komunikuje się bezpośrednio tylko z warstwą sąsiednią.
Warstwy aplikacji

| Warstwa                     | Opis                                                                                                                                            |
|-----------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| Prezentacji (Frontend)      | Odpowiada za wyświetlanie stron użytkownikowi. Widoki są generowane na serwerze za pomocą EJS/Pug i przesyłane jako gotowe strony HTML.         |
| Logiki biznesowej (Backend) | Odpowiada za przetwarzanie żądań HTTP, walidację danych, reguły aplikacyjne i sterowanie przepływem danych między użytkownikiem a bazą danych.  |
| Dostępu do danych (ORM)     | Modele Sequelize mapują dane z bazy danych do obiektów JavaScript oraz umożliwiają wykonywanie operacji CRUD (create, read, update, delete).    |
| Baza danych                 | Przechowuje dane aplikacji w relacyjnej formie (SQLite3)                                                                                        |


#### Schemat przepływu danych
Przeglądarka → Router → Kontroler → Model Sequelize → Baza danych SQLite

### 3.3. Modele danych

### Machine

| Nazwa pola | Typ danych | Zasada            |
|------------|------------|-------------------|
| id         | INTEGER (PK, AutoIncrement) | Nie może być NULL |
| name       | STRING      | Nie może być NULL |
| type       | STRING      | Nie może być NULL |
| description| TEXT        | Może być NULL     |

### Reservation

| Nazwa pola | Typ danych | Zasada |
|------------|------------|-------|
| id         | INTEGER (PK, AutoIncrement) | Nie może być NULL |
| machineId  | INTEGER     | Nie może być NULL (FK do Machine) |
| userId     | INTEGER     | Nie może być NULL (FK do User) |
| date       | DATEONLY    | Nie może być NULL |

### User

| Nazwa pola | Typ danych | Zasada |
|------------|------------|-------|
| id         | INTEGER (PK, AutoIncrement) | Nie może być NULL |
| username   | STRING      | Nie może być NULL |
| email      | STRING      | Nie może być NULL|
| password   | STRING      | Nie może być NULL |
| role       | STRING      | Nie może być NULL (`USER` lub `ADMIN`) |


### Relacje
- **User** posiada wiele **Reservation**.
- **Machine** posiada wiele **Reservation**.
- **Reservation** należy zarówno do **User**, jak i do **Machine**.

### 3.4. Uprawnienia użytkowników

| Funkcja                           | USER       | ADMIN      |
|-----------------------------------|------------|------------|
| Rejestracja i logowanie           | ✅         | ✅          |
| Wyświetlanie maszyn               | ✅         | ✅          |
| Tworzenie rezerwacji              | ✅         | ✅          |
| Anulowanie własnych rezerwacji    | ✅         | ✅          |
| Wyświetlanie dstępności maszyny   | ✅         | ✅          |
| Tworzenie/edycja/usuwanie maszyn  | ❌         | ✅          |
| Tworzenie/usuwanie rezerwacjami   | ❌         | ✅          |

### 3.5 Przykładowe scenariusze użycia aplikacji

- **Użytkownik** loguje się i rezerwuje traktor na wybrany dzień.
- **Użytkownik** anuluje swoją rezerwację.
- **Administrator** zmienia opis maszyny.
- **Administrator** usuwa rezerwację użytkownika.