# Database diagram

The MVP #1 schema. Every table has Row Level Security so each person can only
see their own rows. GitHub renders the Mermaid diagram below as a picture.

```mermaid
erDiagram
  USERS ||--o{ PROFILES : has
  USERS ||--o{ PLAID_ITEMS : has
  USERS ||--o{ LINKED_ACCOUNTS : has
  USERS ||--o{ TRANSACTIONS : has
  USERS ||--o{ CATEGORIES : has
  USERS ||--o{ BILLS : has
  PLAID_ITEMS ||--o{ LINKED_ACCOUNTS : groups
  LINKED_ACCOUNTS ||--o{ TRANSACTIONS : contains
  CATEGORIES ||--o{ TRANSACTIONS : tags
  BILLS ||--o{ REMINDERS : triggers
  LINKED_ACCOUNTS ||--o| CARD_LIABILITIES : "has (planned)"
  LINKED_ACCOUNTS ||--o{ BILLS : "card payment (planned)"

  PROFILES {
    uuid id PK
    text persona
    timestamptz created_at
  }
  PLAID_ITEMS {
    uuid id PK
    uuid user_id FK
    text access_token
    text item_id
    text institution_name
    text cursor
  }
  LINKED_ACCOUNTS {
    uuid id PK
    uuid user_id FK
    uuid plaid_item_id FK
    text plaid_account_id
    text bank_name
    text account_name
    numeric balance
    text account_type
    text account_subtype
  }
  TRANSACTIONS {
    uuid id PK
    uuid user_id FK
    uuid account_id FK
    uuid category_id FK
    numeric amount
    text description
    date date
    boolean is_manual
    text plaid_transaction_id
  }
  CATEGORIES {
    uuid id PK
    uuid user_id FK
    text name
  }
  BILLS {
    uuid id PK
    uuid user_id FK
    text name
    numeric amount
    date due_date
    text recurrence
    text status
    uuid source_card_id FK "planned"
    text basis "planned"
  }
  CARD_LIABILITIES {
    uuid account_id PK "planned, FK to LINKED_ACCOUNTS"
    uuid user_id FK "planned"
    numeric statement_balance "planned"
    numeric minimum_payment "planned"
    date due_date "planned"
    numeric current_balance "planned"
    timestamptz last_refreshed_at "planned"
  }
  REMINDERS {
    uuid id PK
    uuid user_id FK
    uuid bill_id FK
    timestamptz remind_at
    text channel
    boolean sent
  }
```

Note: `USERS` is Supabase Auth's built-in `auth.users` table. Every other table
links to it by `user_id` (and `PROFILES` by `id`).

Items marked **planned** (`CARD_LIABILITIES`, and `BILLS.source_card_id` /
`BILLS.basis`) are the credit-card additions from
[ADR-0010](./adr/0010-credit-cards-plaid-liabilities.md); they ship in migration
`0005_card_liabilities` (ticket T52) and are not yet in the database.
