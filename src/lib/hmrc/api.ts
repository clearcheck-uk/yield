const BASE = process.env.HMRC_BASE_URL!

type HMRCHeaders = Record<string, string>

async function hmrcFetch(
  path: string,
  accessToken: string,
  fraudHeaders: HMRCHeaders,
  options: RequestInit = {}
) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.hmrc.2.0+json',
      'Content-Type': 'application/json',
      ...fraudHeaders,
      ...(options.headers as Record<string, string> || {}),
    },
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`HMRC ${path} failed ${res.status}: ${text}`)
  return text ? JSON.parse(text) : null
}

// Get all business income sources (property businesses) for a taxpayer
export async function getBusinesses(nino: string, accessToken: string, fraudHeaders: HMRCHeaders) {
  return hmrcFetch(
    `/individuals/business/details/${nino}/list`,
    accessToken,
    fraudHeaders
  )
}

// Get quarterly obligations for a property business
export async function getObligations(
  nino: string,
  businessId: string,
  fromDate: string,
  toDate: string,
  accessToken: string,
  fraudHeaders: HMRCHeaders
) {
  const params = new URLSearchParams({ fromDate, toDate })
  return hmrcFetch(
    `/obligations/details/${nino}/income-and-expenditure?typeOfBusiness=uk-property&businessId=${businessId}&${params}`,
    accessToken,
    fraudHeaders
  )
}

// Submit a quarterly update (periodic income/expense summary)
export async function submitPeriodSummary(
  nino: string,
  businessId: string,
  taxYear: string,
  body: {
    fromDate: string
    toDate: string
    income: {
      rentIncome: number
      premiumsOfLeaseGrant?: number
      otherPropertyIncome?: number
    }
    expenses: {
      premisesRunningCosts?: number
      repairsAndMaintenance?: number
      financialCosts?: number
      professionalFees?: number
      costOfServices?: number
      other?: number
    }
  },
  accessToken: string,
  fraudHeaders: HMRCHeaders
) {
  return hmrcFetch(
    `/individuals/business/property/uk/${nino}/${businessId}/period/${taxYear}`,
    accessToken,
    fraudHeaders,
    { method: 'POST', body: JSON.stringify(body) }
  )
}

// Get tax calculation for a given tax year
export async function triggerCalculation(
  nino: string,
  taxYear: string,
  accessToken: string,
  fraudHeaders: HMRCHeaders
) {
  return hmrcFetch(
    `/individuals/calculations/${nino}/self-assessment/${taxYear}`,
    accessToken,
    fraudHeaders,
    { method: 'POST', body: JSON.stringify({ finalDeclaration: false }) }
  )
}

// Get calculation result
export async function getCalculation(
  nino: string,
  taxYear: string,
  calculationId: string,
  accessToken: string,
  fraudHeaders: HMRCHeaders
) {
  return hmrcFetch(
    `/individuals/calculations/${nino}/self-assessment/${taxYear}/${calculationId}`,
    accessToken,
    fraudHeaders
  )
}
