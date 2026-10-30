/**
 * Pure calculation logic for IngogaBridge
 * Segregates platform revenue from marketplace transaction volume,
 * calculates crop profitability, batch economics, and validates quality gates.
 */

export interface ProfitabilityInput {
  expenses: { amountRwf: number }[];
  harvests: { quantitySoldKg: number; averageSellingPriceRwf: number; totalHarvestKg: number }[];
}

export interface ProfitabilityOutput {
  totalProductionCostRwf: number;
  grossSalesRevenueRwf: number;
  estimatedCropProfitRwf: number;
  profitMarginPercent: number;
  costPerUnitRwf: number;
  totalHarvestKg: number;
  totalSoldKg: number;
}

export function calculateCropProfitability(input: ProfitabilityInput): ProfitabilityOutput {
  const totalProductionCostRwf = input.expenses.reduce((sum, e) => sum + (Number(e.amountRwf) || 0), 0);

  let grossSalesRevenueRwf = 0;
  let totalHarvestKg = 0;
  let totalSoldKg = 0;

  for (const h of input.harvests) {
    const sold = Number(h.quantitySoldKg) || 0;
    const price = Number(h.averageSellingPriceRwf) || 0;
    const harvested = Number(h.totalHarvestKg) || 0;
    grossSalesRevenueRwf += sold * price;
    totalSoldKg += sold;
    totalHarvestKg += harvested;
  }

  const estimatedCropProfitRwf = grossSalesRevenueRwf - totalProductionCostRwf;
  const profitMarginPercent =
    grossSalesRevenueRwf > 0 ? (estimatedCropProfitRwf / grossSalesRevenueRwf) * 100 : 0;
  const costPerUnitRwf =
    totalHarvestKg > 0 ? totalProductionCostRwf / totalHarvestKg : 0;

  return {
    totalProductionCostRwf: Math.round(totalProductionCostRwf),
    grossSalesRevenueRwf: Math.round(grossSalesRevenueRwf),
    estimatedCropProfitRwf: Math.round(estimatedCropProfitRwf),
    profitMarginPercent: Number(profitMarginPercent.toFixed(1)),
    costPerUnitRwf: Math.round(costPerUnitRwf),
    totalHarvestKg,
    totalSoldKg,
  };
}

export interface BatchCostInput {
  materialCollectionCostRwf: number;
  transportCostRwf: number;
  processingCostRwf: number;
  laborCostRwf: number;
  testingCostRwf: number;
  packagingCostRwf?: number;
  finalOutputWeightKg: number;
}

export interface BatchCostOutput {
  totalBatchCostRwf: number;
  costPerKgRwf: number;
}

export function calculateBatchEconomics(input: BatchCostInput): BatchCostOutput {
  const total =
    (Number(input.materialCollectionCostRwf) || 0) +
    (Number(input.transportCostRwf) || 0) +
    (Number(input.processingCostRwf) || 0) +
    (Number(input.laborCostRwf) || 0) +
    (Number(input.testingCostRwf) || 0) +
    (Number(input.packagingCostRwf) || 0);

  const weight = Number(input.finalOutputWeightKg) || 0;
  const costPerKg = weight > 0 ? total / weight : 0;

  return {
    totalBatchCostRwf: Math.round(total),
    costPerKgRwf: Number(costPerKg.toFixed(2)),
  };
}

export function calculateMarketCommission(
  orderProduceValueRwf: number,
  ratePercent: number = 4.0
): number {
  if (orderProduceValueRwf <= 0 || ratePercent <= 0) return 0;
  return Math.round(orderProduceValueRwf * (ratePercent / 100));
}

export interface PlatformRevenueInput {
  recognizedBioSoilSalesRwf: number;
  recognizedSubscriptionsRwf: number;
  recognizedCommissionsRwf: number;
  recognizedBuyerServicesRwf: number;
  costOfBioSoilGoodsSoldRwf: number;
  operatingExpensesRwf: number;
  grossMarketplaceProduceVolumeRwf: number; // GMV of farmers produce
}

export interface PlatformRevenueOutput {
  grossMarketplaceVolumeRwf: number;
  totalPlatformRevenueRwf: number;
  bioSoilProductSalesRwf: number;
  commissionRevenueRwf: number;
  subscriptionRevenueRwf: number;
  buyerServicesRevenueRwf: number;
  costOfBioSoilGoodsSoldRwf: number;
  operatingExpensesRwf: number;
  grossProfitRwf: number;
  operatingProfitRwf: number;
  operatingMarginPercent: number;
}

export function calculatePlatformFinancials(
  input: PlatformRevenueInput
): PlatformRevenueOutput {
  // CRITICAL: Gross Marketplace Volume is NOT platform revenue.
  // Platform revenue is ONLY the fee/commission earned plus direct BioSoil sales & subscriptions.
  const totalPlatformRevenueRwf =
    input.recognizedBioSoilSalesRwf +
    input.recognizedSubscriptionsRwf +
    input.recognizedCommissionsRwf +
    input.recognizedBuyerServicesRwf;

  const grossProfitRwf =
    totalPlatformRevenueRwf - input.costOfBioSoilGoodsSoldRwf;
  const operatingProfitRwf = grossProfitRwf - input.operatingExpensesRwf;
  const operatingMarginPercent =
    totalPlatformRevenueRwf > 0
      ? (operatingProfitRwf / totalPlatformRevenueRwf) * 100
      : 0;

  return {
    grossMarketplaceVolumeRwf: input.grossMarketplaceProduceVolumeRwf,
    totalPlatformRevenueRwf: Math.round(totalPlatformRevenueRwf),
    bioSoilProductSalesRwf: Math.round(input.recognizedBioSoilSalesRwf),
    commissionRevenueRwf: Math.round(input.recognizedCommissionsRwf),
    subscriptionRevenueRwf: Math.round(input.recognizedSubscriptionsRwf),
    buyerServicesRevenueRwf: Math.round(input.recognizedBuyerServicesRwf),
    costOfBioSoilGoodsSoldRwf: Math.round(input.costOfBioSoilGoodsSoldRwf),
    operatingExpensesRwf: Math.round(input.operatingExpensesRwf),
    grossProfitRwf: Math.round(grossProfitRwf),
    operatingProfitRwf: Math.round(operatingProfitRwf),
    operatingMarginPercent: Number(operatingMarginPercent.toFixed(1)),
  };
}

export interface QualityGateParams {
  moistureSatisfactory: boolean;
  temperatureCurveVerified: boolean;
  curingMaturityPassed: boolean;
  weedPathogenFree: boolean;
  authorizedSignoff: boolean;
}

export function canApproveBatchForSale(params: QualityGateParams): {
  approved: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];
  if (!params.moistureSatisfactory) {
    reasons.push('Moisture content is outside acceptable range (40%-60%).');
  }
  if (!params.temperatureCurveVerified) {
    reasons.push('Thermophilic temperature curve (>=55°C for pathogen elimination) not documented.');
  }
  if (!params.curingMaturityPassed) {
    reasons.push('Batch has not completed sufficient curing and stabilization.');
  }
  if (!params.weedPathogenFree) {
    reasons.push('Weed seed germination or pathogen test failed.');
  }
  if (!params.authorizedSignoff) {
    reasons.push('Authorized BioSoil agronomist or lab signoff required.');
  }

  return {
    approved: reasons.length === 0,
    reasons,
  };
}

export function validateStockAvailability(
  currentStock: number,
  requestedQuantity: number
): { canFulfill: boolean; remainingStock: number } {
  if (requestedQuantity <= 0) {
    return { canFulfill: false, remainingStock: currentStock };
  }
  if (currentStock >= requestedQuantity) {
    return { canFulfill: true, remainingStock: currentStock - requestedQuantity };
  }
  return { canFulfill: false, remainingStock: currentStock };
}

export function formatRwf(amount: number): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return 'RF 0';
  }
  return new Intl.NumberFormat('en-RW', {
    style: 'currency',
    currency: 'RWF',
    maximumFractionDigits: 0,
  }).format(amount);
}
