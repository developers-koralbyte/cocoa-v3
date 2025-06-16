// src/utils/canadianTax.ts

export interface CanadianTaxConfig {
  province: string
  gstRate: number // GST (federal) - 5% across Canada
  pstRate?: number // PST (provincial) - varies by province
  hstRate?: number // HST (harmonized) - combines GST+PST in some provinces
  isHstProvince: boolean
}

// Tax rates by province/territory (2024)
export const CANADIAN_TAX_RATES: Record<string, CanadianTaxConfig> = {
  'AB': { province: 'Alberta', gstRate: 5, isHstProvince: false },
  'BC': { province: 'British Columbia', gstRate: 5, pstRate: 7, isHstProvince: false },
  'MB': { province: 'Manitoba', gstRate: 5, pstRate: 7, isHstProvince: false },
  'NB': { province: 'New Brunswick', hstRate: 15, gstRate: 0, isHstProvince: true },
  'NL': { province: 'Newfoundland and Labrador', hstRate: 15, gstRate: 0, isHstProvince: true },
  'NT': { province: 'Northwest Territories', gstRate: 5, isHstProvince: false },
  'NS': { province: 'Nova Scotia', hstRate: 15, gstRate: 0, isHstProvince: true },
  'NU': { province: 'Nunavut', gstRate: 5, isHstProvince: false },
  'ON': { province: 'Ontario', hstRate: 13, gstRate: 0, isHstProvince: true },
  'PE': { province: 'Prince Edward Island', hstRate: 15, gstRate: 0, isHstProvince: true },
  'QC': { province: 'Quebec', gstRate: 5, pstRate: 9.975, isHstProvince: false },
  'SK': { province: 'Saskatchewan', gstRate: 5, pstRate: 6, isHstProvince: false },
  'YT': { province: 'Yukon', gstRate: 5, isHstProvince: false }
}

export interface TaxCalculationResult {
  gst: number
  pst: number
  hst: number
  totalTax: number
  total: number
  province: string
  taxNote: string
  breakdown: string[] // For display purposes
}

// Calculate Canadian taxes
export function calculateCanadianTaxes(
  subtotal: number, 
  province: string,
  isGstRegistered: boolean = false
): TaxCalculationResult {
  const config = CANADIAN_TAX_RATES[province.toUpperCase()]
  if (!config) {
    throw new Error('Invalid Canadian province/territory')
  }
  
  if (!isGstRegistered) {
    return {
      gst: 0,
      pst: 0,
      hst: 0,
      totalTax: 0,
      total: subtotal,
      province: config.province,
      taxNote: 'No tax applied - not registered for GST/HST',
      breakdown: ['No tax applied - not registered for GST/HST']
    }
  }
  
  let gst = 0, pst = 0, hst = 0
  const breakdown: string[] = []
  
  if (config.isHstProvince && config.hstRate) {
    hst = subtotal * (config.hstRate / 100)
    breakdown.push(`HST (${config.hstRate}%): $${hst.toFixed(2)} CAD`)
  } else {
    gst = subtotal * (config.gstRate / 100)
    breakdown.push(`GST (${config.gstRate}%): $${gst.toFixed(2)} CAD`)
    
    if (config.pstRate) {
      pst = subtotal * (config.pstRate / 100)
      breakdown.push(`PST (${config.pstRate}%): $${pst.toFixed(2)} CAD`)
    }
  }
  
  const totalTax = gst + pst + hst
  
  return {
    gst,
    pst,
    hst,
    totalTax,
    total: subtotal + totalTax,
    province: config.province,
    taxNote: '',
    breakdown
  }
}

// Get province options for dropdown
export function getProvinceOptions() {
  return Object.entries(CANADIAN_TAX_RATES).map(([code, config]) => ({
    value: code,
    label: `${config.province} (${code})`,
    taxInfo: config.isHstProvince 
      ? `HST ${config.hstRate}%` 
      : `GST ${config.gstRate}%${config.pstRate ? ` + PST ${config.pstRate}%` : ''}`
  }))
}

// Validate GST number format
export function validateGstNumber(gstNumber: string): boolean {
  // GST number format: 9 digits + RT + 4 digits (e.g., 123456789RT0001)
  const gstRegex = /^\d{9}RT\d{4}$/
  return gstRegex.test(gstNumber.replace(/\s/g, ''))
}

// Format GST number for display
export function formatGstNumber(gstNumber: string): string {
  const cleaned = gstNumber.replace(/\s/g, '')
  if (cleaned.length === 15) {
    return `${cleaned.substring(0, 9)} RT ${cleaned.substring(11)}`
  }
  return gstNumber
}