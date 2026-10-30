import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DemoBanner } from './components/DemoBanner';
import { Footer } from './components/Footer';
import { LandingPage } from './components/PublicWebsite/LandingPage';
import { BioSoilView } from './components/BioSoil/BioSoilView';
import { FarmGrowView } from './components/FarmGrow/FarmGrowView';
import { MarketView } from './components/IngogaMarket/MarketView';
import { FinanceView } from './components/Finance/FinanceView';
import { AdminPortal } from './components/Admin/AdminPortal';
import { PublicBatchVerify } from './components/PublicWebsite/PublicBatchVerify';
import { TermsPrivacyModal } from './components/PublicWebsite/TermsPrivacyModal';
import { apiClient } from './api/client';
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
} from './types';
import { Language } from './utils/translations';

export default function App() {
  // QR codes link to /verify-batch/<batchId>; open the public verification view for them.
  const [qrBatchId] = useState<string | undefined>(() => {
    const match = window.location.pathname.match(/^\/verify-batch\/([^/]+)/);
    return match ? decodeURIComponent(match[1]) : undefined;
  });
  const [activeTab, setActiveTab] = useState<string>(qrBatchId ? 'verify_qr' : 'home');
  const [language, setLanguage] = useState<Language>('en');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [demoUsers, setDemoUsers] = useState<UserProfile[]>([]);
  const [collections, setCollections] = useState<WasteCollection[]>([]);
  const [batches, setBatches] = useState<ProductionBatch[]>([]);
  const [products, setProducts] = useState<BioSoilProduct[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [cropCycles, setCropCycles] = useState<CropCycle[]>([]);
  const [expenses, setExpenses] = useState<FarmExpense[]>([]);
  const [harvests, setHarvests] = useState<HarvestRecord[]>([]);
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [orders, setOrders] = useState<MarketplaceOrder[]>([]);
  const [financials, setFinancials] = useState<PlatformFinancials | null>(null);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initial Data Load
  const loadAllData = async () => {
    try {
      const [
        userRes,
        demoUsersRes,
        wasteRes,
        batchesRes,
        productsRes,
        farmsRes,
        cropsRes,
        expRes,
        harvRes,
        listingsRes,
        ordersRes,
        finRes,
        plansRes,
        notifsRes,
      ] = await Promise.all([
        apiClient.getCurrentUser(),
        apiClient.getDemoUsers(),
        apiClient.getWasteCollections(),
        apiClient.getBatches(),
        apiClient.getBioSoilProducts(),
        apiClient.getFarms(),
        apiClient.getCropCycles(),
        apiClient.getExpenses(),
        apiClient.getHarvests(),
        apiClient.getMarketListings(),
        apiClient.getOrders(),
        apiClient.getFinancialOverview(),
        apiClient.getSubscriptionPlans(),
        apiClient.getNotifications(),
      ]);

      setCurrentUser(userRes);
      setDemoUsers(demoUsersRes);
      setCollections(wasteRes);
      setBatches(batchesRes);
      setProducts(productsRes);
      setFarms(farmsRes);
      setCropCycles(cropsRes);
      setExpenses(expRes);
      setHarvests(harvRes);
      setListings(listingsRes);
      setOrders(ordersRes);
      setFinancials(finRes);
      setSubscriptionPlans(plansRes);
      setNotifications(notifsRes);
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Handlers
  const handleSwitchRole = async (userId: string) => {
    try {
      const res = await apiClient.switchRole(userId);
      if (res.success) {
        setCurrentUser(res.user);
        // refresh data for role view
        loadAllData();
      }
    } catch (err) {
      console.error('Failed to switch role:', err);
    }
  };

  const handleResetDemo = async () => {
    setLoading(true);
    await apiClient.resetDemoData();
    await loadAllData();
  };

  const handleAddWasteCollection = async (data: any) => {
    await apiClient.createWasteCollection(data);
    const updated = await apiClient.getWasteCollections();
    setCollections(updated);
  };

  const handleCreateBatch = async (data: any) => {
    await apiClient.createBatch(data);
    const updated = await apiClient.getBatches();
    setBatches(updated);
  };

  const handleSubmitQualityReview = async (batchId: string, review: any) => {
    await apiClient.submitQualityReview(batchId, review);
    const [batchesUpdated, productsUpdated] = await Promise.all([
      apiClient.getBatches(),
      apiClient.getBioSoilProducts(),
    ]);
    setBatches(batchesUpdated);
    setProducts(productsUpdated);
  };

  const handleAddExpense = async (data: any) => {
    await apiClient.createExpense(data);
    const updated = await apiClient.getExpenses();
    setExpenses(updated);
  };

  const handleAddHarvest = async (data: any) => {
    await apiClient.createHarvest(data);
    const updated = await apiClient.getHarvests();
    setHarvests(updated);
  };

  const handleAddCropCycle = async (data: any) => {
    await apiClient.createCropCycle(data);
    const updated = await apiClient.getCropCycles();
    setCropCycles(updated);
  };

  const handlePlaceOrder = async (data: any) => {
    await apiClient.createOrder(data);
    const [ordersUpdated, listingsUpdated, finUpdated] = await Promise.all([
      apiClient.getOrders(),
      apiClient.getMarketListings(),
      apiClient.getFinancialOverview(),
    ]);
    setOrders(ordersUpdated);
    setListings(listingsUpdated);
    setFinancials(finUpdated);
  };

  const handleCreateListing = async (data: any) => {
    await apiClient.createListing(data);
    const updated = await apiClient.getMarketListings();
    setListings(updated);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string, notes?: string) => {
    await apiClient.updateOrderStatus(orderId, newStatus, notes);
    const [ordersUpdated, finUpdated] = await Promise.all([
      apiClient.getOrders(),
      apiClient.getFinancialOverview(),
    ]);
    setOrders(ordersUpdated);
    setFinancials(finUpdated);
  };

  const handleSimulatePayment = async (orderId: string, method: string) => {
    await apiClient.simulatePayment(orderId, method);
    const [ordersUpdated, finUpdated] = await Promise.all([
      apiClient.getOrders(),
      apiClient.getFinancialOverview(),
    ]);
    setOrders(ordersUpdated);
    setFinancials(finUpdated);
  };

  if (loading || !currentUser || !financials) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-emerald-800 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-base font-bold text-emerald-950">Loading IngogaBridge Agritech Platform...</h2>
        <p className="text-xs text-stone-500 mt-1">Initializing database & circular engine for Rwanda</p>
      </div>
    );
  }

  // Handle direct QR batch verification view
  if (activeTab === 'verify_qr') {
    return (
      <PublicBatchVerify
        initialBatchId={qrBatchId}
        onBack={() => setActiveTab('biosoil')}
        onOrderProduct={() => setActiveTab('market')}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfa] text-stone-900 font-sans antialiased selection:bg-emerald-800 selection:text-white">
      {/* Competition Demo Mode Banner */}
      <DemoBanner
        currentUser={currentUser}
        demoUsers={demoUsers}
        onSwitchRole={handleSwitchRole}
        onResetDemo={handleResetDemo}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        language={language}
      />

      {/* Main Header / Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        language={language}
        setLanguage={setLanguage}
        notifications={notifications}
        onOpenVerifyModal={() => setActiveTab('verify_qr')}
      />

      {/* Main App Content View Switcher */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <LandingPage onNavigate={setActiveTab} language={language} />
        )}

        {activeTab === 'biosoil' && (
          <BioSoilView
            currentUser={currentUser}
            collections={collections}
            batches={batches}
            products={products}
            onAddCollection={handleAddWasteCollection}
            onCreateBatch={handleCreateBatch}
            onSubmitQualityReview={handleSubmitQualityReview}
            language={language}
          />
        )}

        {activeTab === 'farmgrow' && (
          <FarmGrowView
            currentUser={currentUser}
            farms={farms}
            cropCycles={cropCycles}
            expenses={expenses}
            harvests={harvests}
            bioSoilProducts={products}
            onAddExpense={handleAddExpense}
            onAddHarvest={handleAddHarvest}
            onAddCropCycle={handleAddCropCycle}
            language={language}
          />
        )}

        {activeTab === 'market' && (
          <MarketView
            currentUser={currentUser}
            listings={listings}
            orders={orders}
            onPlaceOrder={handlePlaceOrder}
            onCreateListing={handleCreateListing}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onSimulatePayment={handleSimulatePayment}
            language={language}
          />
        )}

        {activeTab === 'finance' && (
          <FinanceView
            financials={financials}
            subscriptionPlans={subscriptionPlans}
            language={language}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPortal
            currentUser={currentUser}
            allUsers={demoUsers}
            financials={financials}
            onResetDemo={handleResetDemo}
            language={language}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenPrivacyTerms={() => setIsPrivacyModalOpen(true)}
        language={language}
      />

      {/* Terms and Privacy Modal */}
      <TermsPrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
    </div>
  );
}
