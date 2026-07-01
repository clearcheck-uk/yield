export type Section24Result = {
  totalIncome: number
  allowableExpenses: number
  taxableProfit: number
  mortgageInterest: number
  section24TaxCredit: number
  effectiveTaxableProfit: number
  estimatedTax: {
    basicRate: number
    higherRate: number
    total: number
  }
}

// Section 24 finance cost relief (fully in force from 2020-21)
// Mortgage interest is NOT deductible from rental income
// Instead a 20% basic rate tax credit applies
export function calculateSection24(params: {
  totalIncome: number
  allowableExpenses: number  // excludes mortgage interest
  mortgageInterest: number
  ownershipPercentage?: number  // default 100%
}): Section24Result {
  const ownership = (params.ownershipPercentage ?? 100) / 100

  const totalIncome = params.totalIncome * ownership
  const allowableExpenses = params.allowableExpenses * ownership
  const mortgageInterest = params.mortgageInterest * ownership

  // Taxable profit = income - allowable expenses (mortgage interest excluded)
  const taxableProfit = Math.max(0, totalIncome - allowableExpenses)

  // Section 24 tax credit = 20% of finance costs (basic rate relief only)
  const section24TaxCredit = mortgageInterest * 0.20

  // Estimate tax on profit (simplified — actual depends on personal allowance & other income)
  const BASIC_RATE_LIMIT = 37700  // 2025-26
  const basicRateTax = Math.min(taxableProfit, BASIC_RATE_LIMIT) * 0.20
  const higherRateTax = Math.max(0, taxableProfit - BASIC_RATE_LIMIT) * 0.40
  const grossTax = basicRateTax + higherRateTax
  const netTax = Math.max(0, grossTax - section24TaxCredit)

  return {
    totalIncome,
    allowableExpenses,
    taxableProfit,
    mortgageInterest,
    section24TaxCredit,
    effectiveTaxableProfit: taxableProfit,
    estimatedTax: {
      basicRate: basicRateTax,
      higherRate: higherRateTax,
      total: netTax,
    },
  }
}

// Map Yield transaction categories to HMRC expense buckets
export function mapToHMRCExpenses(transactions: Array<{
  category: string
  amount: number
  type: 'income' | 'expense'
}>) {
  const income = { rentIncome: 0, premiumsOfLeaseGrant: 0, otherPropertyIncome: 0 }
  const expenses = {
    premisesRunningCosts: 0,
    repairsAndMaintenance: 0,
    financialCosts: 0,
    professionalFees: 0,
    costOfServices: 0,
    other: 0,
  }
  let mortgageInterest = 0

  for (const t of transactions) {
    if (t.type === 'income') {
      income.rentIncome += t.amount
    } else {
      switch (t.category) {
        case 'mortgage_interest':
          expenses.financialCosts += t.amount
          mortgageInterest += t.amount
          break
        case 'repairs_maintenance':
          expenses.repairsAndMaintenance += t.amount
          break
        case 'insurance':
        case 'council_tax':
        case 'utilities':
          expenses.premisesRunningCosts += t.amount
          break
        case 'legal_professional':
        case 'agent_fees':
          expenses.professionalFees += t.amount
          break
        case 'other_allowable':
          expenses.other += t.amount
          break
      }
    }
  }

  return { income, expenses, mortgageInterest }
}
