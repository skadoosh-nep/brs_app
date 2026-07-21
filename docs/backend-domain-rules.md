# Backend Domain Rules

## Auth

complete authentication and each api is called via bearer auth authentication

## Companies

Company is top-level tenant.

All projects belong to a company.

---

## Fiscal Year

Every transaction belongs to a fiscal year.

Fiscal year determines numbering sequences.

---

## Projects

Projects are accounting dimensions.

Transactions may be project scoped.

---

## Parties

Parties represent:

- Customers
- Vendors
- Suppliers
- Contractors

---

## Ledgers

Ledger balances are maintained by backend.

Frontend never updates balances directly.

---

## Journal Voucher

Rules:

- At least 2 entries
- Debit total must equal credit total

---

## Receipt Voucher

Represents money received.

Effects:

Cash/Bank ↑

Counter Ledger ↓

---

## Payment Voucher

Represents money paid.

Effects:

Cash/Bank ↓

Counter Ledger ↑

---

## Contra Voucher

Transfer between:

Cash ↔ Bank

Bank ↔ Bank

Cash ↔ Cash

---

## Voucher Factory

Single backend endpoint responsible for voucher creation.

Voucher type determines posting behavior.

---

## Voucher Numbering

Generated automatically.

Fiscal year scoped.

Examples:

RV-2082-00001
PV-2082-00001
JV-2082-00001

Frontend must not generate.

---

## Reports

Report data originates from backend.

Frontend only renders data.

No local accounting calculations.
