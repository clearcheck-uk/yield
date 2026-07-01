export type User = {
  id: string
  email: string
  full_name: string
  role: 'landlord' | 'accountant'
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  subscription_status: 'active' | 'trialing' | 'inactive'
  created_at: string
}

export type Property = {
  id: string
  user_id: string
  name: string
  address: string
  property_type: 'uk_property' | 'furnished_holiday_let' | 'foreign_property'
  ownership_percentage: number
  created_at: string
}

export type Transaction = {
  id: string
  property_id: string
  user_id: string
  xero_transaction_id: string | null
  date: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category: TransactionCategory
  is_mortgage_interest: boolean
  created_at: string
}

export type TransactionCategory =
  | 'rental_income'
  | 'repairs_maintenance'
  | 'insurance'
  | 'agent_fees'
  | 'mortgage_interest'
  | 'council_tax'
  | 'utilities'
  | 'legal_professional'
  | 'other_allowable'
  | 'non_allowable'

export type Obligation = {
  id: string
  user_id: string
  property_id: string
  period_start: string
  period_end: string
  due_date: string
  status: 'open' | 'fulfilled' | 'overdue'
  hmrc_obligation_id: string
}

export type Submission = {
  id: string
  user_id: string
  property_id: string
  obligation_id: string
  period_start: string
  period_end: string
  total_income: number
  total_expenses: number
  net_profit: number
  mortgage_interest: number
  section24_relief: number
  submitted_at: string | null
  hmrc_submission_id: string | null
  status: 'draft' | 'submitted' | 'accepted' | 'rejected'
}

export type XeroConnection = {
  id: string
  user_id: string
  tenant_id: string
  tenant_name: string
  access_token: string
  refresh_token: string
  expires_at: string
}

export type HMRCConnection = {
  id: string
  user_id: string
  nino: string
  access_token: string
  refresh_token: string
  expires_at: string
}
