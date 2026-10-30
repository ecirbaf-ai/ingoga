import {
  UserProfile,
  WasteCollection,
  ProductionBatch,
  BioSoilProduct,
  Farm,
  CropCycle,
  FarmExpense,
  HarvestRecord,
  MarketplaceListing,
  MarketplaceOrder,
  SubscriptionPlan,
  PlatformFinancials,
} from '../types';

export const apiClient = {
  // Auth
  async getCurrentUser(): Promise<UserProfile> {
    const res = await fetch('/api/auth/current-user');
    return res.json();
  },

  async getDemoUsers(): Promise<UserProfile[]> {
    const res = await fetch('/api/auth/demo-users');
    return res.json();
  },

  async switchRole(userId: string): Promise<{ success: boolean; user: UserProfile }> {
    const res = await fetch('/api/auth/switch-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    return res.json();
  },

  async registerUser(data: Partial<UserProfile>): Promise<{ success: boolean; user: UserProfile }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // BioSoil
  async getWasteCollections(): Promise<WasteCollection[]> {
    const res = await fetch('/api/biosoil/waste-collections');
    return res.json();
  },

  async createWasteCollection(data: Partial<WasteCollection>): Promise<{ success: boolean; collectionRef: string }> {
    const res = await fetch('/api/biosoil/waste-collections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getBatches(): Promise<ProductionBatch[]> {
    const res = await fetch('/api/biosoil/batches');
    return res.json();
  },

  async createBatch(data: any): Promise<{ success: boolean; batchId: string }> {
    const res = await fetch('/api/biosoil/batches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async submitQualityReview(batchId: string, reviewData: any): Promise<{ success: boolean; status: string; qrUrl: string }> {
    const res = await fetch(`/api/biosoil/batches/${batchId}/quality-review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || err.reasons?.join('. ') || 'Quality review rejected');
    }
    return res.json();
  },

  async getBatchTraceability(batchId: string): Promise<any> {
    const res = await fetch(`/api/biosoil/traceability/${batchId}`);
    if (!res.ok) throw new Error('Traceability record not found');
    return res.json();
  },

  async getBioSoilProducts(): Promise<BioSoilProduct[]> {
    const res = await fetch('/api/biosoil/products');
    return res.json();
  },

  // FarmGrow
  async getFarms(): Promise<Farm[]> {
    const res = await fetch('/api/farmgrow/farms');
    return res.json();
  },

  async getCropCycles(): Promise<CropCycle[]> {
    const res = await fetch('/api/farmgrow/crop-cycles');
    return res.json();
  },

  async createCropCycle(data: any): Promise<{ success: boolean; id: string }> {
    const res = await fetch('/api/farmgrow/crop-cycles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getExpenses(): Promise<FarmExpense[]> {
    const res = await fetch('/api/farmgrow/expenses');
    return res.json();
  },

  async createExpense(data: any): Promise<{ success: boolean; id: string }> {
    const res = await fetch('/api/farmgrow/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getHarvests(): Promise<HarvestRecord[]> {
    const res = await fetch('/api/farmgrow/harvests');
    return res.json();
  },

  async createHarvest(data: any): Promise<{ success: boolean; id: string }> {
    const res = await fetch('/api/farmgrow/harvests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getProfitability(): Promise<any> {
    const res = await fetch('/api/farmgrow/profitability');
    return res.json();
  },

  // IngogaMarket
  async getMarketListings(filters: { crop?: string; district?: string; grade?: string; sellerType?: string } = {}): Promise<MarketplaceListing[]> {
    const params = new URLSearchParams();
    if (filters.crop) params.append('crop', filters.crop);
    if (filters.district) params.append('district', filters.district);
    if (filters.grade) params.append('grade', filters.grade);
    if (filters.sellerType) params.append('sellerType', filters.sellerType);

    const res = await fetch(`/api/market/listings?${params.toString()}`);
    return res.json();
  },

  async createListing(data: any): Promise<{ success: boolean; listingCode: string }> {
    const res = await fetch('/api/market/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getOrders(): Promise<MarketplaceOrder[]> {
    const res = await fetch('/api/market/orders');
    return res.json();
  },

  async createOrder(data: { listingId: string; quantity: number; deliveryArrangements: string; paymentMethod: string }): Promise<{ success: boolean; orderNumber: string }> {
    const res = await fetch('/api/market/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to place order');
    }
    return res.json();
  },

  async updateOrderStatus(orderId: string, newStatus: string, notes?: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/market/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newStatus, notes }),
    });
    return res.json();
  },

  async simulatePayment(orderId: string, paymentMethod: string): Promise<{ success: boolean; paymentRef: string }> {
    const res = await fetch(`/api/market/orders/${orderId}/simulate-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentMethod }),
    });
    return res.json();
  },

  // Financials & Subscriptions
  async getFinancialOverview(): Promise<PlatformFinancials> {
    const res = await fetch('/api/finance/overview');
    return res.json();
  },

  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    const res = await fetch('/api/subscriptions/plans');
    return res.json();
  },

  async getNotifications(): Promise<any[]> {
    const res = await fetch('/api/notifications');
    return res.json();
  },

  async resetDemoData(): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/demo/reset', { method: 'POST' });
    return res.json();
  },
};
