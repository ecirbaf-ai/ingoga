import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCropProfitability,
  calculateBatchEconomics,
  calculateMarketCommission,
  calculatePlatformFinancials,
  canApproveBatchForSale,
  validateStockAvailability,
} from './calculations';

test('crop profitability calculation handles standard harvest and expenses', () => {
  const result = calculateCropProfitability({
    expenses: [
      { amountRwf: 120000 }, // Seeds
      { amountRwf: 80000 },  // BioSoil Compost
      { amountRwf: 50000 },  // Labor
    ],
    harvests: [
      { totalHarvestKg: 2000, quantitySoldKg: 1800, averageSellingPriceRwf: 350 }, // 1800 * 350 = 630,000
    ],
  });

  // Total expenses: 250,000
  assert.equal(result.totalProductionCostRwf, 250000);
  // Revenue: 630,000
  assert.equal(result.grossSalesRevenueRwf, 630000);
  // Profit: 630,000 - 250,000 = 380,000
  assert.equal(result.estimatedCropProfitRwf, 380000);
  // Profit Margin: (380000 / 630000) * 100 = 60.3%
  assert.equal(result.profitMarginPercent, 60.3);
  // Cost per Unit: 250,000 / 2,000 = 125 RWF/kg
  assert.equal(result.costPerUnitRwf, 125);
  assert.equal(result.totalHarvestKg, 2000);
  assert.equal(result.totalSoldKg, 1800);
});

test('crop profitability handles zero sales without division by zero', () => {
  const result = calculateCropProfitability({
    expenses: [{ amountRwf: 50000 }],
    harvests: [],
  });

  assert.equal(result.totalProductionCostRwf, 50000);
  assert.equal(result.grossSalesRevenueRwf, 0);
  assert.equal(result.estimatedCropProfitRwf, -50000);
  assert.equal(result.profitMarginPercent, 0);
  assert.equal(result.costPerUnitRwf, 0);
});

test('biosoil batch economics calculates total cost and cost per kilogram', () => {
  const batch = calculateBatchEconomics({
    materialCollectionCostRwf: 30000,
    transportCostRwf: 20000,
    processingCostRwf: 45000,
    laborCostRwf: 25000,
    testingCostRwf: 15000,
    packagingCostRwf: 15000,
    finalOutputWeightKg: 1000,
  });

  // 30k + 20k + 45k + 25k + 15k + 15k = 150,000 RWF
  assert.equal(batch.totalBatchCostRwf, 150000);
  // 150,000 / 1,000 kg = 150 RWF/kg
  assert.equal(batch.costPerKgRwf, 150);
});

test('marketplace commission calculates accurately at configured rate', () => {
  const commission = calculateMarketCommission(2500000, 4.0);
  // 2,500,000 * 4% = 100,000 RWF
  assert.equal(commission, 100000);

  const zeroCommission = calculateMarketCommission(0, 4.0);
  assert.equal(zeroCommission, 0);
});

test('platform revenue clearly separates third-party GMV from actual platform revenue', () => {
  const fin = calculatePlatformFinancials({
    grossMarketplaceProduceVolumeRwf: 10000000, // 10 million RWF sold by farmers
    recognizedCommissionsRwf: 400000,           // 4% commission = 400,000 RWF
    recognizedBioSoilSalesRwf: 1200000,          // 1.2M BioSoil sales
    recognizedSubscriptionsRwf: 300000,          // 300k co-op subs
    recognizedBuyerServicesRwf: 150000,          // 150k sourcing fee
    costOfBioSoilGoodsSoldRwf: 450000,          // Direct compost COGS
    operatingExpensesRwf: 600000,               // Transport, ops, cloud
  });

  // Total platform revenue = 400k + 1.2M + 300k + 150k = 2,050,000 RWF (NOT 12M!)
  assert.equal(fin.totalPlatformRevenueRwf, 2050000);
  // Gross profit = 2,050,000 - 450,000 = 1,600,000 RWF
  assert.equal(fin.grossProfitRwf, 1600000);
  // Operating profit = 1,600,000 - 600,000 = 1,000,000 RWF
  assert.equal(fin.operatingProfitRwf, 1000000);
  assert.equal(fin.grossMarketplaceVolumeRwf, 10000000);
});

test('quality gate strictly blocks sale approval when criteria are incomplete', () => {
  const incompleteCheck = canApproveBatchForSale({
    moistureSatisfactory: true,
    temperatureCurveVerified: false, // failed thermophilic test
    curingMaturityPassed: true,
    weedPathogenFree: true,
    authorizedSignoff: true,
  });

  assert.equal(incompleteCheck.approved, false);
  assert.match(incompleteCheck.reasons[0], /temperature/i);

  const approvedCheck = canApproveBatchForSale({
    moistureSatisfactory: true,
    temperatureCurveVerified: true,
    curingMaturityPassed: true,
    weedPathogenFree: true,
    authorizedSignoff: true,
  });

  assert.equal(approvedCheck.approved, true);
  assert.equal(approvedCheck.reasons.length, 0);
});

test('stock availability validator prevents overselling and negative stock', () => {
  const valid = validateStockAvailability(100, 40);
  assert.equal(valid.canFulfill, true);
  assert.equal(valid.remainingStock, 60);

  const oversell = validateStockAvailability(50, 60);
  assert.equal(oversell.canFulfill, false);
  assert.equal(oversell.remainingStock, 50);
});
