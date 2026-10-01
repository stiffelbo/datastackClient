Product Comments / Activity — struktura danych
Cel
Warstwa aktywności produktu składa się obecnie z trzech podstawowych typów danych:
products
│
├── product_comments
│
├── product_files
│   └── product_file_comments
│
└── mentions

Frontend nie powinien odwzorowywać bezpośrednio tego podziału. ProductActivityModel agreguje dane do jednolitego DTO obsługiwanego przez komponent Comments/Activity.
product_comments
Komentarze bezpośrednio przypisane do produktu.
Najważniejsze pola:
id
product_id
content

is_pinned
pinned_at

created_at
created_by
updated_at
updated_by

is_deleted
deleted_by
deleted_at

Założenia
- id zachowuje podczas migracji ID z GEM.
- content przechowuje treść HTML.
- komentarz może być przypięty do góry rolki;
- soft delete pozostaje częścią modelu komentarzy;
- created_by, updated_by, deleted_by wskazują users.id.
product_files
Repozytorium plików produktu.
id
product_id

name
type

status_id
status_changed_at
status_changed_by

is_pinned
pinned_at

created_at
created_by
updated_at
updated_by

is_deleted
deleted_by
deleted_at

Typ pliku
Na obecnym etapie:
type VARCHAR(32)

pozostaje wartością legacy, np.:
wizualizacja

Docelowo może zostać przeniesiony do product_definitions.
Status
status_id
    ↓
product_definitions.id

Zmiana statusu posiada własny audit:
status_changed_at
status_changed_by

Jest to szczególnie istotne dla workflow zatwierdzania wizualizacji.
Pin
Plik, podobnie jak komentarz, może być przypięty:
is_pinned
pinned_at

Przypięta wizualizacja może być wykorzystywana m.in. jako reprezentacyjny obraz produktu.
product_file_comments
Komentarze przypisane bezpośrednio do pliku.
id
product_file_id
content

created_at
created_by
updated_at
updated_by

is_deleted
deleted_by
deleted_at

Relacja:
product_files.id
      │
      └── product_file_comments.product_file_id

W warstwie Activity komentarze te będą prezentowane jako dzieci elementu plikowego:
FILE
├── file comment
├── file comment
└── file comment

product_definitions
Centralny słownik definicji wykorzystywany przez moduł produktu.
id
name
description

category
ref
params
remarks

is_active

created_at
created_by
updated_at
updated_by

is_deleted
deleted_by
deleted_at

Semantyka
category określa kategorię definicji, natomiast ref jej zastosowanie.
Przykładowo:
category = file_status
ref      = product_files.status_id

lub:
category = product_type
ref      = products.type_id

params pozostaje elastycznym polem na dodatkową konfigurację, np.:
legacy_id
color
ustawienia definicji

mentions
Generyczna tabela wzmianek użytkowników.
Nie jest związana FK bezpośrednio z tabelami komentarzy, ponieważ Comments Utility ma działać interdyscyplinarnie.
id

ref_type
ref_id

comment_type
comment_id

user_id

is_read
read_at

created_at
created_by

Adresowanie
ref_type + ref_id wskazuje główną encję:
ref_type = products
ref_id   = 123

comment_type + comment_id wskazuje konkretny komentarz wewnątrz tej encji:
comment_type = comment
comment_id   = 55

Przykład komentarza do pliku:
ref_type     = products
ref_id       = 123

comment_type = file_comment
comment_id   = 91

user_id      = 17

Dzięki comment_type identyczne ID z różnych tabel nie powodują kolizji:
product_comments.id      = 55
product_file_comments.id = 55

są rozróżniane jako:
comment / 55
file_comment / 55

Stan odczytu
Mention jest jednocześnie podstawą prostego inboxa/powiadomień:
is_read
read_at

Pozwala to później pobierać np.:
mentions użytkownika
nieprzeczytane mentions
licznik nieprzeczytanych

Bez budowania na tym etapie pełnego systemu notifications.
Relacje logiczne
                         products
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
       product_comments              product_files
              │                           │
              │                           ▼
              │                  product_file_comments
              │                           │
              └─────────────┬─────────────┘
                            │
                         mentions

mentions nie posiada fizycznego FK do komentarza. Powiązanie jest polimorficzne:
ref_type
ref_id
comment_type
comment_id

Warstwa Activity
Fizyczna struktura DB pozostaje rozdzielona:
product_comments
product_files
product_file_comments

ale backend składa ją przez:
ProductActivityModel

do jednolitego strumienia:
Activity
│
├── Comment
│
├── Comment
│
├── File
│   ├── FileComment
│   └── FileComment
│
├── Comment
│
└── File

Do DTO backend dołącza również:
author
mentions
status
pin state
permissions / RLS

Backend jest źródłem prawdy dla uprawnień:
editable
deletable
pinnable
replyable
status change
approval
...

React ma te reguły renderować, a nie wyliczać.
Ważne założenie architektoniczne
Baza przechowuje domenę, ProductActivityModel buduje kontrakt, Comments Utility renderuje kontrakt.
DB
 ↓
ProductActivityModel
 ↓
Comments DTO
 ↓
Comments / Activity React

Dzięki temu istniejący podział legacy na osobne tabele nie przecieka do generycznego komponentu Comments, a później ten sam mechanizm będzie można zastosować dla orders, jira_issues i innych encji.