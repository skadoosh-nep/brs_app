# BRS Mobile Screen Mapping

Source of truth: FastAPI OpenAPI schema.

API base prefix:

```txt
/api/v1
```

Authentication:

```txt
Bearer Token
```

---

# 1. App Navigation Overview

```txt
Auth Stack
 ├── Splash
 ├── Signup
 ├── Login
 └── Forgot Password

Main App
 ├── Dashboard
 ├── Company
 ├── Users
 ├── Fiscal Years
 ├── Masters
 ├── Parties
 ├── Projects
 ├── Cost Categories
 ├── Account Groups
 ├── Ledgers
 ├── Vouchers
 ├── Voucher Factory
 ├── Reports
 └── Settings
```

---

# 2. Auth Screens

## Splash Screen

Route:

```txt
/auth/splash
```

Purpose:

- Check saved access token
- Refresh session if needed
- Navigate to Login or Dashboard

Backend:

```txt
GET /health
POST /api/v1/auth/refresh
```

---

## Signup Screen

Route:

```txt
/auth/signup
```

Backend:

```txt
POST /api/v1/auth/signup
```

Fields:

- name
- email
- password
- confirm_password

---

## Login Screen

Route:

```txt
/auth/login
```

Backend:

```txt
POST /api/v1/auth/login
```

Fields:

- email
- password

---

## Logout Action

Route:

```txt
/settings/logout
```

Backend:

```txt
POST /api/v1/auth/logout
```

---

# 3. Dashboard

## Dashboard Home

Route:

```txt
/dashboard
```

Suggested backend data:

```txt
GET /api/v1/companies/current
GET /api/v1/fiscal-years?is_active=true
GET /api/v1/projects?page=1&page_size=5
GET /api/v1/vouchers?page=1&page_size=5
GET /api/v1/reports/cash-book
GET /api/v1/reports/bank-book
GET /api/v1/reports/trial-balance
```

Widgets:

- Current Company
- Active Fiscal Year
- Recent Projects
- Recent Vouchers
- Cash Book Summary
- Bank Book Summary
- Trial Balance Summary

---

# 4. Company Screens

## Create Company

Route:

```txt
/company/create
```

Backend:

```txt
POST /api/v1/companies
```

Fields:

- name
- address
- pan_no
- phone
- email

---

## Current Company Detail

Route:

```txt
/company/current
```

Backend:

```txt
GET /api/v1/companies/current
```

---

## Edit Current Company

Route:

```txt
/company/current/edit
```

Backend:

```txt
PUT /api/v1/companies/current
```

Fields:

- name
- address
- pan_no
- phone
- email

---

# 5. Users Screens

## User List

Route:

```txt
/users
```

Backend:

```txt
GET /api/v1/users
```

Filters:

- page
- page_size
- role
- is_active

---

## Create User

Route:

```txt
/users/create
```

Backend:

```txt
POST /api/v1/users
```

Fields:

- company_id
- name
- email
- password
- role

Roles:

```txt
admin
user
accountant
```

---

## User Detail

Route:

```txt
/users/:userId
```

Backend:

```txt
GET /api/v1/users/{user_id}
```

---

## Edit User

Route:

```txt
/users/:userId/edit
```

Backend:

```txt
PATCH /api/v1/users/{user_id}
```

Fields:

- name
- role
- is_active

---

# 6. Fiscal Year Screens

## Fiscal Year List

Route:

```txt
/fiscal-years
```

Backend:

```txt
GET /api/v1/fiscal-years
```

Filters:

- page
- page_size
- is_active

---

## Create Fiscal Year

Route:

```txt
/fiscal-years/create
```

Backend:

```txt
POST /api/v1/fiscal-years
```

Fields:

- company_id
- name
- start_date
- end_date
- is_active

---

## Fiscal Year Detail

Route:

```txt
/fiscal-years/:fiscalYearId
```

Backend:

```txt
GET /api/v1/fiscal-years/{fiscal_year_id}
```

---

## Edit Fiscal Year

Route:

```txt
/fiscal-years/:fiscalYearId/edit
```

Backend:

```txt
PATCH /api/v1/fiscal-years/{fiscal_year_id}
```

Fields:

- name
- start_date
- end_date

---

## Activate Fiscal Year

Route:

```txt
/fiscal-years/:fiscalYearId/activate
```

Backend:

```txt
POST /api/v1/fiscal-years/{fiscal_year_id}/activate
```

---

# 7. Masters Screens

## Masters Home

Route:

```txt
/masters
```

Backend:

```txt
GET /api/v1/masters/party-types
GET /api/v1/masters/project-statuses
GET /api/v1/masters/cost-category-types
GET /api/v1/masters/account-group-types
```

Sections:

- Party Types
- Project Statuses
- Cost Category Types
- Account Group Types

---

## Party Types

Route:

```txt
/masters/party-types
```

Backend:

```txt
GET /api/v1/masters/party-types
```

---

## Project Statuses

Route:

```txt
/masters/project-statuses
```

Backend:

```txt
GET /api/v1/masters/project-statuses
```

---

## Cost Category Types

Route:

```txt
/masters/cost-category-types
```

Backend:

```txt
GET /api/v1/masters/cost-category-types
```

---

## Account Group Types

Route:

```txt
/masters/account-group-types
```

Backend:

```txt
GET /api/v1/masters/account-group-types
```

---

# 8. Parties Screens

## Party List

Route:

```txt
/parties
```

Backend:

```txt
GET /api/v1/parties
```

Filters:

- page
- page_size
- party_type_id
- is_active

---

## Create Party

Route:

```txt
/parties/create
```

Backend:

```txt
POST /api/v1/parties
```

Fields:

- company_id
- party_type_id
- name
- phone
- email
- address
- pan_no

---

## Party Detail

Route:

```txt
/parties/:partyId
```

Backend:

```txt
GET /api/v1/parties/{party_id}
```

Tabs:

- Profile
- Related Ledgers
- Related Vouchers

---

## Edit Party

Route:

```txt
/parties/:partyId/edit
```

Backend:

```txt
PATCH /api/v1/parties/{party_id}
```

---

## Delete Party

Route:

```txt
/parties/:partyId/delete
```

Backend:

```txt
DELETE /api/v1/parties/{party_id}
```

---

# 9. Projects Screens

## Project List

Route:

```txt
/projects
```

Backend:

```txt
GET /api/v1/projects
```

Filters:

- page
- page_size
- project_status_id

---

## Create Project

Route:

```txt
/projects/create
```

Backend:

```txt
POST /api/v1/projects
```

Fields:

- company_id
- project_status_id
- project_code
- name
- client_id
- location
- contract_amount
- start_date
- end_date
- description

---

## Project Detail

Route:

```txt
/projects/:projectId
```

Backend:

```txt
GET /api/v1/projects/{project_id}
```

Tabs:

- Summary
- Vouchers
- Ledger
- Cost Summary
- Profit/Loss

Related report APIs:

```txt
GET /api/v1/reports/projects/{project_id}/ledger
GET /api/v1/reports/projects/{project_id}/cost-summary
GET /api/v1/reports/projects/{project_id}/profit-loss
```

---

## Edit Project

Route:

```txt
/projects/:projectId/edit
```

Backend:

```txt
PATCH /api/v1/projects/{project_id}
```

---

## Delete Project

Route:

```txt
/projects/:projectId/delete
```

Backend:

```txt
DELETE /api/v1/projects/{project_id}
```

---

# 10. Cost Category Screens

## Cost Category List

Route:

```txt
/cost-categories
```

Backend:

```txt
GET /api/v1/cost-categories
```

Filters:

- page
- page_size
- cost_category_type_id
- is_active

---

## Create Cost Category

Route:

```txt
/cost-categories/create
```

Backend:

```txt
POST /api/v1/cost-categories
```

Fields:

- company_id
- cost_category_type_id
- name

---

## Cost Category Detail

Route:

```txt
/cost-categories/:costCategoryId
```

Backend:

```txt
GET /api/v1/cost-categories/{cost_category_id}
```

---

## Edit Cost Category

Route:

```txt
/cost-categories/:costCategoryId/edit
```

Backend:

```txt
PATCH /api/v1/cost-categories/{cost_category_id}
```

---

## Delete Cost Category

Route:

```txt
/cost-categories/:costCategoryId/delete
```

Backend:

```txt
DELETE /api/v1/cost-categories/{cost_category_id}
```

---

# 11. Account Group Screens

## Account Group List

Route:

```txt
/account-groups
```

Backend:

```txt
GET /api/v1/account-groups
```

Filters:

- page
- page_size
- company_id
- account_group_type_id
- is_active

---

## Account Group Tree

Route:

```txt
/account-groups/tree
```

Backend:

```txt
GET /api/v1/account-groups/tree
```

Required query:

- company_id

---

## Generate Default Account Group Tree

Route:

```txt
/account-groups/generate-default-tree
```

Backend:

```txt
POST /api/v1/account-groups/generate-default-tree
```

Required query:

- company_id

---

## Create Account Group

Route:

```txt
/account-groups/create
```

Backend:

```txt
POST /api/v1/account-groups
```

Fields:

- company_id
- account_group_type_id
- parent_group_id
- name
- is_active

---

## Account Group Detail

Route:

```txt
/account-groups/:accountGroupId
```

Backend:

```txt
GET /api/v1/account-groups/{account_group_id}
```

---

## Edit Account Group

Route:

```txt
/account-groups/:accountGroupId/edit
```

Backend:

```txt
PATCH /api/v1/account-groups/{account_group_id}
```

---

## Delete Account Group

Route:

```txt
/account-groups/:accountGroupId/delete
```

Backend:

```txt
DELETE /api/v1/account-groups/{account_group_id}
```

---

# 12. Ledger Screens

## Ledger List

Route:

```txt
/ledgers
```

Backend:

```txt
GET /api/v1/ledgers
```

Filters:

- page
- page_size
- company_id
- account_group_id
- is_cash_bank
- is_active

---

## Create Ledger

Route:

```txt
/ledgers/create
```

Backend:

```txt
POST /api/v1/ledgers
```

Fields:

- company_id
- account_group_id
- party_id
- name
- opening_balance
- opening_balance_type
- is_cash_bank
- allow_project_tracking
- is_active

---

## Ledger Detail

Route:

```txt
/ledgers/:ledgerId
```

Backend:

```txt
GET /api/v1/ledgers/{ledger_id}
```

Tabs:

- Details
- Statement
- Vouchers

Related report API:

```txt
GET /api/v1/reports/ledger/{ledger_id}
```

---

## Edit Ledger

Route:

```txt
/ledgers/:ledgerId/edit
```

Backend:

```txt
PATCH /api/v1/ledgers/{ledger_id}
```

---

## Delete Ledger

Route:

```txt
/ledgers/:ledgerId/delete
```

Backend:

```txt
DELETE /api/v1/ledgers/{ledger_id}
```

---

# 13. Voucher Type Screens

## Voucher Type List

Route:

```txt
/voucher-types
```

Backend:

```txt
GET /api/v1/voucher-types
```

Filters:

- is_active

---

## Voucher Type Detail

Route:

```txt
/voucher-types/:voucherTypeId
```

Backend:

```txt
GET /api/v1/voucher-types/{voucher_type_id}
```

---

# 14. Generic Voucher Screens

## Voucher List

Route:

```txt
/vouchers
```

Backend:

```txt
GET /api/v1/vouchers
```

Filters:

- page
- page_size
- company_id
- fiscal_year_id
- voucher_type_id
- status
- from_date
- to_date

---

## Create Generic Voucher

Route:

```txt
/vouchers/create
```

Backend:

```txt
POST /api/v1/vouchers
```

Fields:

- company_id
- fiscal_year_id
- voucher_type_id
- voucher_date
- reference_no
- party_id
- project_id
- narration
- lines

Line fields:

- ledger_id
- project_id
- party_id
- cost_category_id
- description
- debit_amount
- credit_amount

---

## Voucher Detail

Route:

```txt
/vouchers/:voucherId
```

Backend:

```txt
GET /api/v1/vouchers/{voucher_id}
```

Display:

- Voucher number
- Voucher date
- Voucher type
- Status
- Party
- Project
- Narration
- Debit/Credit lines

---

## Edit Voucher

Route:

```txt
/vouchers/:voucherId/edit
```

Backend:

```txt
PATCH /api/v1/vouchers/{voucher_id}
```

---

## Post Voucher

Route:

```txt
/vouchers/:voucherId/post
```

Backend:

```txt
POST /api/v1/vouchers/{voucher_id}/post
```

UI behavior:

- Confirm before posting
- Disable edit after successful post if backend treats posted vouchers as locked

---

## Cancel Voucher

Route:

```txt
/vouchers/:voucherId/cancel
```

Backend:

```txt
POST /api/v1/vouchers/{voucher_id}/cancel
```

UI behavior:

- Confirm before cancel
- Require reason only if backend later adds reason field

---

## Delete Voucher

Route:

```txt
/vouchers/:voucherId/delete
```

Backend:

```txt
DELETE /api/v1/vouchers/{voucher_id}
```

---

# 15. Voucher Factory Screens

Use these screens for simplified accounting entry flows.

## Voucher Factory Home

Route:

```txt
/voucher-factory
```

Options:

- Payment
- Receipt
- Journal
- Contra

---

## Payment List

Route:

```txt
/payments
```

Backend:

```txt
GET /api/v1/payments
```

Filters:

- page
- page_size
- company_id
- fiscal_year_id
- status
- from_date
- to_date

---

## Create Payment

Route:

```txt
/payments/create
```

Backend:

```txt
POST /api/v1/payments
```

Payload:

```txt
VoucherFactoryCreate
```

Fields:

- company_id
- fiscal_year_id
- voucher_date
- reference_no
- party_id
- project_id
- narration
- lines

---

## Receipt List

Route:

```txt
/receipts
```

Backend:

```txt
GET /api/v1/receipts
```

---

## Create Receipt

Route:

```txt
/receipts/create
```

Backend:

```txt
POST /api/v1/receipts
```

Payload:

```txt
VoucherFactoryCreate
```

---

## Journal List

Route:

```txt
/journals
```

Backend:

```txt
GET /api/v1/journals
```

---

## Create Journal

Route:

```txt
/journals/create
```

Backend:

```txt
POST /api/v1/journals
```

Payload:

```txt
VoucherFactoryCreate
```

Validation:

- Debit total must equal credit total.
- Frontend may display totals.
- Backend remains source of truth.

---

## Contra List

Route:

```txt
/contras
```

Backend:

```txt
GET /api/v1/contras
```

---

## Create Contra

Route:

```txt
/contras/create
```

Backend:

```txt
POST /api/v1/contras
```

Payload:

```txt
VoucherFactoryCreate
```

---

# 16. Report Screens

## Reports Home

Route:

```txt
/reports
```

Sections:

- Ledger Statement
- Cash Book
- Bank Book
- Trial Balance
- Project Ledger
- Project Cost Summary
- Project Profit/Loss

---

## Ledger Statement

Route:

```txt
/reports/ledger/:ledgerId
```

Backend:

```txt
GET /api/v1/reports/ledger/{ledger_id}
```

Filters:

- company_id
- fiscal_year_id
- from_date
- to_date

---

## Cash Book

Route:

```txt
/reports/cash-book
```

Backend:

```txt
GET /api/v1/reports/cash-book
```

Filters:

- company_id
- fiscal_year_id
- from_date
- to_date

---

## Bank Book

Route:

```txt
/reports/bank-book
```

Backend:

```txt
GET /api/v1/reports/bank-book
```

Filters:

- company_id
- fiscal_year_id
- from_date
- to_date

---

## Trial Balance

Route:

```txt
/reports/trial-balance
```

Backend:

```txt
GET /api/v1/reports/trial-balance
```

Filters:

- company_id
- fiscal_year_id
- from_date
- to_date

---

## Project Ledger

Route:

```txt
/reports/projects/:projectId/ledger
```

Backend:

```txt
GET /api/v1/reports/projects/{project_id}/ledger
```

---

## Project Cost Summary

Route:

```txt
/reports/projects/:projectId/cost-summary
```

Backend:

```txt
GET /api/v1/reports/projects/{project_id}/cost-summary
```

---

## Project Profit/Loss

Route:

```txt
/reports/projects/:projectId/profit-loss
```

Backend:

```txt
GET /api/v1/reports/projects/{project_id}/profit-loss
```

---

# 17. Settings Screens

## Settings Home

Route:

```txt
/settings
```

Sections:

- Current Company
- Fiscal Year
- Users
- App Preferences
- Logout

---

## Active Fiscal Year Selector

Route:

```txt
/settings/fiscal-year
```

Backend:

```txt
GET /api/v1/fiscal-years
POST /api/v1/fiscal-years/{fiscal_year_id}/activate
```

---

# 18. Recommended Bottom Tabs

```txt
Dashboard
Projects
Parties
Vouchers
Reports
```

Secondary screens should be accessible through:

```txt
Settings
Masters
Ledgers
Account Groups
Cost Categories
Users
```

---

# 19. Screen Priority for Development

Build in this order:

```txt
1. Auth
2. Company
3. Fiscal Years
4. Masters
5. Parties
6. Projects
7. Account Groups
8. Ledgers
9. Cost Categories
10. Voucher Types
11. Voucher Factory
12. Generic Vouchers
13. Reports
14. Users
15. Settings
```

---

# 20. Codex Rules for This Mapping

Codex must not invent endpoints.

Use only endpoints listed in OpenAPI.

If a screen requires missing backend support, mark it as:

```txt
Frontend placeholder - backend pending
```

Do not create fake APIs.

Do not generate voucher numbers in frontend.

Do not generate ledger balances in frontend.

Reports must come from backend report APIs.

Use `VoucherFactoryCreate` for:

- payments
- receipts
- journals
- contras

Use `VoucherCreate` only for generic voucher creation.
