# Database design (MVP #1)

Filled from the Week 2 requirements and the built schema. The Mermaid diagram is
at [docs/database-diagram.md](./database-diagram.md).

## What the app needs to save
- Each person who signs up, and their optional "what best describes you?" answer.
- Each bank connection a person makes through Plaid, including its read-only access token.
- Each bank account inside a connection (name, type, latest balance).
- Each transaction (spending), pulled from a connected account or added by hand.
- Each spending category used to group transactions.
- Each bill a person tracks (name, amount, due date, recurrence, paid status).
- Each reminder tied to a bill (when to nudge, whether it was sent).
- For each connected credit card, the honest payment figures from Plaid Liabilities (statement balance, minimum payment, next due date), refreshed each cycle. *(Planned, see below.)*

## Tables

### profiles — one row per person, linked to Supabase Auth
| Column | Type | Required | Meaning |
| --- | --- | --- | --- |
| id | uuid | Yes | The person (matches Supabase Auth id). |
| persona | text | No | Optional "what best describes you?" answer. |
| created_at | timestamptz | Yes | When they joined. |

### plaid_items — one row per connected bank
| Column | Type | Required | Meaning |
| --- | --- | --- | --- |
| id | uuid | Yes | Unique id for this connection. |
| user_id | uuid | Yes | The person who owns it. |
| access_token | text | Yes | Read-only Plaid token (server-only, never in the browser). |
| item_id | text | Yes | Plaid's id for the connection. |
| institution_name | text | No | The bank's name. |
| cursor | text | No | Our place when syncing transactions. |
| created_at | timestamptz | Yes | When it was connected. |

### linked_accounts — one row per bank account
| Column | Type | Required | Meaning |
| --- | --- | --- | --- |
| id | uuid | Yes | Unique id. |
| user_id | uuid | Yes | The person who owns it. |
| plaid_item_id | uuid | No | Which connection it belongs to. |
| plaid_account_id | text | No | Plaid's id for the account. |
| bank_name | text | Yes | The bank's name. |
| account_name | text | No | The account's name (e.g. Checking). |
| balance | numeric | No | Latest balance. |
| account_type | text | No | depository, credit, loan, investment. |
| account_subtype | text | No | checking, savings, credit card, etc. |

### transactions — one row per transaction
| Column | Type | Required | Meaning |
| --- | --- | --- | --- |
| id | uuid | Yes | Unique id. |
| user_id | uuid | Yes | The person who owns it. |
| account_id | uuid | No | Which account it came from. |
| category_id | uuid | No | Which category it is in. |
| amount | numeric | Yes | How much. |
| description | text | No | What it was (e.g. Starbucks). |
| date | date | Yes | When it happened. |
| is_manual | boolean | Yes | Added by hand or imported. |
| plaid_transaction_id | text | No | Plaid's id, used to avoid duplicates. |

### categories — one row per spending category
| Column | Type | Required | Meaning |
| --- | --- | --- | --- |
| id | uuid | Yes | Unique id. |
| user_id | uuid | Yes | The person who owns it. |
| name | text | Yes | Category name (e.g. Groceries). |

### bills — one row per bill
| Column | Type | Required | Meaning |
| --- | --- | --- | --- |
| id | uuid | Yes | Unique id. |
| user_id | uuid | Yes | The person who owns it. |
| name | text | Yes | The bill's name. |
| amount | numeric | Yes | How much. |
| due_date | date | Yes | When it is due. |
| recurrence | text | Yes | none, weekly, monthly. |
| status | text | Yes | upcoming or paid. |
| created_at | timestamptz | Yes | When it was added. |

### reminders — one row per bill reminder
| Column | Type | Required | Meaning |
| --- | --- | --- | --- |
| id | uuid | Yes | Unique id. |
| user_id | uuid | Yes | The person who owns it. |
| bill_id | uuid | Yes | Which bill it is for. |
| remind_at | timestamptz | Yes | When to send the reminder. |
| channel | text | Yes | email or in_app. |
| sent | boolean | Yes | Whether it has been sent. |

## Planned: credit cards (Plaid Liabilities)
Not yet in the database. Design of record for tickets T52–T55; see
[ADR-0010](./adr/0010-credit-cards-plaid-liabilities.md). Ships as migration
`0005_card_liabilities`. A credit card is detected for free from
`linked_accounts.account_type = 'credit'`; only the payment figures below need
the paid Plaid Liabilities product.

### card_liabilities — one row per connected credit card
| Column | Type | Required | Meaning |
| --- | --- | --- | --- |
| account_id | uuid | Yes | The credit card account (PK, and FK to `linked_accounts.id`). One row per card. |
| user_id | uuid | Yes | The person who owns it (for Row Level Security). |
| statement_balance | numeric | No | Plaid `last_statement_balance`: the honest "what's due this cycle" and the default "add to bills" amount. |
| minimum_payment | numeric | No | Plaid `minimum_payment_amount`: the "minimum" button and the guardrail. |
| due_date | date | No | Plaid `next_payment_due_date`: the card bill's due date and reminder timing. |
| current_balance | numeric | No | Plaid `balances.current`: display only, **never** counted as spendable. |
| last_refreshed_at | timestamptz | No | When we last pulled these figures (tracks the cycle refresh). |

### bills — two new columns (links a bill to a card)
| Column | Type | Required | Meaning |
| --- | --- | --- | --- |
| source_card_id | uuid | No | Set when the bill is a card payment; FK to `linked_accounts.id`. Null for ordinary bills. |
| basis | text | No | How the amount is decided: `statement`, `minimum`, or `custom`. Null for ordinary bills. |

Each cycle the auto-refresh (T55) uses `basis`: `statement` and `minimum` bills
pull a fresh amount **and** due date from `card_liabilities`; `custom` keeps its
amount and only refreshes the due date.

## How the tables connect
- One person has many plaid items, linked accounts, transactions, categories, bills, and reminders; each belongs to one person.
- One plaid item has many linked accounts; each linked account belongs to one connection.
- One linked account has many transactions; each transaction belongs to one account.
- One category tags many transactions; each transaction has one category.
- One bill has many reminders; each reminder belongs to one bill.
- *(Planned)* One credit card `linked_account` has one `card_liabilities` row; a card-payment bill points back to its card through `bills.source_card_id`.

## Access rules (Row Level Security)
- [x] RLS is turned on for every table.
- [x] Each table has a rule that lets people see only their own rows.
- [x] Tested with two accounts; one person could not see the other person's information.
- [ ] *(Planned)* `card_liabilities` gets the same `auth.uid() = user_id` policy when it ships.

## Migration files
- [x] Every database change is a SQL migration in `supabase/migrations`.
- [x] Named so each one's purpose is clear: `0001_init_schema`, `0002_plaid`, `0003_fix_txn_unique_index`, `0004_account_types`.
- [ ] *(Planned)* `0005_card_liabilities` — adds the `card_liabilities` table and the `bills.source_card_id` / `bills.basis` columns (ticket T52).
