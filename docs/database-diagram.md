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
