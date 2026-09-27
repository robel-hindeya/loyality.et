import {
  UserProfile,
  Company,
  LoyaltyProgram,
  LoyaltyCard,
  StampLog,
  RewardRedemption,
  UserRole,
  CompanyOrder,
  CompanyProduct,
  OrderItem,
  OrderStatus,
  PickupType,
} from '@/types';
import { generateQrToken, generateRedemptionCode } from '@/lib/utils';

// Local storage keys
const USERS_KEY = 'lp_local_users';
const CURRENT_USER_KEY = 'lp_local_current_user';
const COMPANIES_KEY = 'lp_local_companies';
const PROGRAMS_KEY = 'lp_local_programs';
const CARDS_KEY = 'lp_local_cards';
const LOGS_KEY = 'lp_local_stamp_logs';
const REDEMPTIONS_KEY = 'lp_local_redemptions';
const ORDERS_KEY = 'lp_local_orders';
const PRODUCTS_KEY = 'lp_local_products';

// Default starter seed data for local preview
const DEFAULT_COMPANIES: Company[] = [
  {
    id: 'comp-seed-001',
    owner_id: 'user-merchant-001',
    name: 'Artisan Roast & Café',
    slug: 'artisan-roast',
    description: 'Specialty coffee roastery, handcrafted espresso & bakery.',
    logo_url: null,
    banner_url: null,
    primary_color: '#18181b',
    category: 'Coffee Shop & Roastery',
    address: '124 Market Square, Downtown',
    phone: '+1 (555) 019-2834',
    website: 'https://example.com/cafe',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'comp-seed-002',
    owner_id: 'user-merchant-002',
    name: 'The Grand Horizon Hotel & Spa',
    slug: 'grand-horizon-hotel',
    description: 'Luxury boutique hotel, rooftop lounge & wellness spa suites.',
    logo_url: null,
    banner_url: null,
    primary_color: '#09090b',
    category: 'Hotel & Hospitality',
    address: '88 Ocean Boulevard, Waterfront',
    phone: '+1 (555) 882-9410',
    website: 'https://example.com/hotel',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'comp-seed-003',
    owner_id: 'user-merchant-003',
    name: 'Apex Auto Detailing & Car Wash',
    slug: 'apex-car-wash',
    description: 'Eco-friendly touchless express wash & ceramic detailing center.',
    logo_url: null,
    banner_url: null,
    primary_color: '#27272a',
    category: 'Automotive & Car Wash',
    address: '450 Expressway Pkwy, Eastside',
    phone: '+1 (555) 431-7720',
    website: 'https://example.com/carwash',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const DEFAULT_COMPANY = DEFAULT_COMPANIES[0];

const DEFAULT_PROGRAMS: LoyaltyProgram[] = [
  {
    id: 'prog-seed-001',
    company_id: 'comp-seed-001',
    title: 'VIP Coffee Stamp Card',
    description: 'Buy 6 coffees or beverages, get your 7th handcrafted drink free!',
    target_stamps: 6,
    reward_title: '1 Free Handcrafted Beverage',
    reward_description: 'Redeemable for any size coffee, latte, or cold brew at checkout.',
    card_bg_color: '#09090b',
    card_accent_color: '#71717a',
    stamp_icon: 'coffee',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    company: DEFAULT_COMPANIES[0],
  },
  {
    id: 'prog-seed-002',
    company_id: 'comp-seed-002',
    title: 'Luxury Stays & Spa Rewards',
    description: 'Stay 6 nights or book 6 spa treatments to unlock a VIP upgrade!',
    target_stamps: 6,
    reward_title: '1 Free Luxury Suite & Spa Upgrade',
    reward_description: 'Redeemable at concierge desk upon check-in.',
    card_bg_color: '#18181b',
    card_accent_color: '#a1a1aa',
    stamp_icon: 'building',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    company: DEFAULT_COMPANIES[1],
  },
  {
    id: 'prog-seed-003',
    company_id: 'comp-seed-003',
    title: 'Supreme Express Wash Pass',
    description: 'Get 6 premium washes, earn a complete ceramic coat & full detail free!',
    target_stamps: 6,
    reward_title: '1 Free Ceramic Wax & Full Wash',
    reward_description: 'Present at terminal before vehicle bay entry.',
    card_bg_color: '#09090b',
    card_accent_color: '#52525b',
    stamp_icon: 'car',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    company: DEFAULT_COMPANIES[2],
  },
];

const DEFAULT_PROGRAM = DEFAULT_PROGRAMS[0];

const DEFAULT_PRODUCTS: CompanyProduct[] = [
  // Artisan Roast & Café
  {
    id: 'prod-cafe-01',
    company_id: 'comp-seed-001',
    name: 'Single Origin Espresso',
    description: 'Double shot of Ethiopian Yirgacheffe with floral notes and crema.',
    price: 3.80,
    category: 'Coffee',
    popular: true,
  },
  {
    id: 'prod-cafe-02',
    company_id: 'comp-seed-001',
    name: 'Handcrafted Oat Milk Latte',
    description: 'Velvety steamed oat milk with espresso and Madagascar vanilla.',
    price: 5.50,
    category: 'Coffee',
    popular: true,
  },
  {
    id: 'prod-cafe-03',
    company_id: 'comp-seed-001',
    name: 'Cold Brew Reserve (24hr Steep)',
    description: 'Rich, smooth cold brew served chilled with hint of caramel.',
    price: 4.75,
    category: 'Cold Drinks',
    popular: false,
  },
  {
    id: 'prod-cafe-04',
    company_id: 'comp-seed-001',
    name: 'Artisan Almond Croissant',
    description: 'Fresh baked French butter croissant filled with almond frangipane.',
    price: 4.25,
    category: 'Pastries',
    popular: true,
  },

  // The Grand Horizon Hotel & Spa
  {
    id: 'prod-hotel-01',
    company_id: 'comp-seed-002',
    name: 'Rooftop Lounge & Cabana Day-Pass',
    description: 'Day lounge access, panoramic city view & complimentary welcome mocktail.',
    price: 85.00,
    category: 'Hospitality',
    popular: true,
  },
  {
    id: 'prod-hotel-02',
    company_id: 'comp-seed-002',
    name: 'Aroma Relaxation Massage (60 min)',
    description: 'Deep soothing body therapy with botanical essential oils.',
    price: 95.00,
    category: 'Spa & Wellness',
    popular: true,
  },
  {
    id: 'prod-hotel-03',
    company_id: 'comp-seed-002',
    name: 'Sunset Tapas & Craft Cocktail Pair',
    description: 'Artisanal cheese, cured meat board, and craft cocktail.',
    price: 38.00,
    category: 'Dining',
    popular: false,
  },

  // Apex Auto Detailing & Car Wash
  {
    id: 'prod-car-01',
    company_id: 'comp-seed-003',
    name: 'Touchless Ceramic Express Wash',
    description: 'Triple-foam wash, chassis under-spray, and ceramic sealant.',
    price: 24.00,
    category: 'Express Wash',
    popular: true,
  },
  {
    id: 'prod-car-02',
    company_id: 'comp-seed-003',
    name: 'Interior Steam Clean & Conditioning',
    description: 'Deep shampoo, odor neutralization, and UV dashboard protectant.',
    price: 55.00,
    category: 'Interior',
    popular: true,
  },
  {
    id: 'prod-car-03',
    company_id: 'comp-seed-003',
    name: 'Complete Pro Detailing Package',
    description: 'Paint correction, hydrophobic glass treatment, and cabin detail.',
    price: 130.00,
    category: 'Pro Package',
    popular: false,
  },
];

const DEFAULT_ORDERS: CompanyOrder[] = [
  {
    id: 'ord-seed-001',
    user_id: 'usr-customer-001',
    company_id: 'comp-seed-001',
    program_id: 'prog-seed-001',
    card_id: 'crd-seed-001-001',
    order_number: 'ORD-7291',
    items: [
      { id: 'prod-cafe-02', name: 'Handcrafted Oat Milk Latte', price: 5.50, quantity: 2 },
      { id: 'prod-cafe-04', name: 'Artisan Almond Croissant', price: 4.25, quantity: 1 },
    ],
    total_amount: 15.25,
    stamps_earned: 1,
    status: 'ready',
    pickup_type: 'in_store',
    special_instructions: 'Extra cinnamon on top please',
    created_at: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    company: DEFAULT_COMPANIES[0],
    program: DEFAULT_PROGRAMS[0],
  },
];

function safeGet<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function safeSet<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('LocalStorage save error:', e);
  }
}

export const fallbackStorage = {
  /**
   * Initialize local store with defaults if empty
   */
  init() {
    if (typeof window === 'undefined') return;
    const comps = safeGet<Company[]>(COMPANIES_KEY, []);
    const existingCompIds = new Set(comps.map((c) => c.id));
    let compUpdated = false;
    DEFAULT_COMPANIES.forEach((defComp) => {
      if (!existingCompIds.has(defComp.id)) {
        comps.push(defComp);
        compUpdated = true;
      }
    });
    if (comps.length === 0 || compUpdated) {
      safeSet(COMPANIES_KEY, comps);
    }

    const progs = safeGet<LoyaltyProgram[]>(PROGRAMS_KEY, []);
    const existingProgIds = new Set(progs.map((p) => p.id));
    let progUpdated = false;
    DEFAULT_PROGRAMS.forEach((defProg) => {
      if (!existingProgIds.has(defProg.id)) {
        progs.push(defProg);
        progUpdated = true;
      }
    });
    if (progs.length === 0 || progUpdated) {
      safeSet(PROGRAMS_KEY, progs);
    }
  },

  // --- USERS & AUTH ---
  getUsers(): Array<UserProfile & { password?: string }> {
    this.init();
    return safeGet<Array<UserProfile & { password?: string }>>(USERS_KEY, []);
  },

  getCurrentUser(): UserProfile | null {
    return safeGet<UserProfile | null>(CURRENT_USER_KEY, null);
  },

  setCurrentUser(user: UserProfile | null): void {
    safeSet(CURRENT_USER_KEY, user);
    if (typeof document !== 'undefined') {
      if (user) {
        // Set cookie so middleware knows user is authenticated
        document.cookie = `sb-fallback-user=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=86400`;
      } else {
        document.cookie = `sb-fallback-user=; path=/; max-age=0`;
      }
    }
  },

  registerUser(params: {
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
    phone?: string;
    companyName?: string;
    companyCategory?: string;
  }): { user: UserProfile; company?: Company; program?: LoyaltyProgram } {
    this.init();
    const users = this.getUsers();
    const existing = users.find((u) => u.email.toLowerCase() === params.email.toLowerCase());
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const userId = `usr-${Math.random().toString(36).substring(2, 9)}`;
    const qrToken = generateQrToken();

    let companyId: string | null = null;
    let createdCompany: Company | undefined;
    let createdProgram: LoyaltyProgram | undefined;

    if (params.role === 'company') {
      companyId = `comp-${Math.random().toString(36).substring(2, 9)}`;
      createdCompany = {
        id: companyId,
        owner_id: userId,
        name: params.companyName || 'My Business',
        slug: (params.companyName || 'business').toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(100 + Math.random() * 900),
        description: `Welcome to ${params.companyName || 'our business'} loyalty program.`,
        logo_url: null,
        banner_url: null,
        primary_color: '#18181b',
        category: params.companyCategory || 'Retail & Services',
        address: '100 Main Street',
        phone: params.phone || '+1 (555) 000-0000',
        website: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const comps = safeGet<Company[]>(COMPANIES_KEY, [DEFAULT_COMPANY]);
      comps.push(createdCompany);
      safeSet(COMPANIES_KEY, comps);

      // Default program
      createdProgram = {
        id: `prog-${Math.random().toString(36).substring(2, 9)}`,
        company_id: companyId,
        title: 'Buy 6 Services, Get 1 Free',
        description: 'Earn 1 stamp per qualifying visit. Reach 6 stamps to unlock your reward!',
        target_stamps: 6,
        reward_title: '1 Free Complimentary Service',
        reward_description: 'Redeemable at counter upon reaching 6 stamps.',
        card_bg_color: '#09090b',
        card_accent_color: '#71717a',
        stamp_icon: 'star',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        company: createdCompany,
      };

      const progs = safeGet<LoyaltyProgram[]>(PROGRAMS_KEY, [DEFAULT_PROGRAM]);
      progs.push(createdProgram);
      safeSet(PROGRAMS_KEY, progs);
    }

    const newUser: UserProfile & { password?: string } = {
      id: userId,
      email: params.email,
      password: params.password,
      full_name: params.fullName,
      phone: params.phone || null,
      role: params.role,
      company_id: companyId,
      qr_code_token: qrToken,
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(params.fullName)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    users.push(newUser);
    safeSet(USERS_KEY, users);

    // If customer, auto-enroll into default starter programs so their multi-pass wallet is ready immediately!
    if (params.role === 'user') {
      const starterSeeds: Record<string, number> = {
        'prog-seed-001': 4,
        'prog-seed-002': 2,
        'prog-seed-003': 5,
      };
      DEFAULT_PROGRAMS.forEach((p) => {
        this.enrollInProgram(userId, p.id, p.company_id, starterSeeds[p.id] ?? 0);
      });
    }

    const { password: _, ...cleanProfile } = newUser;
    this.setCurrentUser(cleanProfile);

    return { user: cleanProfile, company: createdCompany, program: createdProgram };
  },

  loginUser(email: string, pass: string): UserProfile {
    this.init();
    const users = this.getUsers();
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === pass
    );

    if (!found) {
      // Check if user wants to log in with a demo test account
      if (email.toLowerCase().includes('company') || email.toLowerCase().includes('merchant')) {
        return this.registerUser({
          email,
          password: pass,
          fullName: 'Demo Business Owner',
          role: 'company',
          companyName: 'Artisan Brew Roastery',
        }).user;
      }
      if (email.toLowerCase().includes('cashier')) {
        const comps = safeGet<Company[]>(COMPANIES_KEY, [DEFAULT_COMPANY]);
        return this.createCashier(comps[0].id, 'Counter Cashier', email, pass);
      }
      // Demo customer fallback
      return this.registerUser({
        email,
        password: pass,
        fullName: 'Demo Customer',
        role: 'user',
      }).user;
    }

    const { password: _, ...cleanProfile } = found;
    this.setCurrentUser(cleanProfile);
    return cleanProfile;
  },

  // --- COMPANIES ---
  getCompanies(): Company[] {
    this.init();
    return safeGet<Company[]>(COMPANIES_KEY, [DEFAULT_COMPANY]);
  },

  getCompanyByOwner(ownerId: string): Company | null {
    const comps = this.getCompanies();
    return comps.find((c) => c.owner_id === ownerId) || null;
  },

  getCompanyById(companyId: string): Company | null {
    const comps = this.getCompanies();
    return comps.find((c) => c.id === companyId) || null;
  },

  // --- PROGRAMS ---
  getPrograms(companyId?: string): LoyaltyProgram[] {
    this.init();
    const progs = safeGet<LoyaltyProgram[]>(PROGRAMS_KEY, [DEFAULT_PROGRAM]);
    if (!companyId) return progs;
    return progs.filter((p) => p.company_id === companyId);
  },

  getProgramById(programId: string): LoyaltyProgram | null {
    const progs = this.getPrograms();
    return progs.find((p) => p.id === programId) || null;
  },

  createProgram(companyId: string, data: Partial<LoyaltyProgram>): LoyaltyProgram {
    const progs = this.getPrograms();
    const company = this.getCompanyById(companyId) || DEFAULT_COMPANY;
    const newProg: LoyaltyProgram = {
      id: `prog-${Math.random().toString(36).substring(2, 9)}`,
      company_id: companyId,
      title: data.title || 'Loyalty Card',
      description: data.description || null,
      target_stamps: data.target_stamps || 6,
      reward_title: data.reward_title || '1 Free Reward',
      reward_description: data.reward_description || null,
      card_bg_color: data.card_bg_color || '#09090b',
      card_accent_color: data.card_accent_color || '#71717a',
      stamp_icon: data.stamp_icon || 'star',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      company,
    };
    progs.unshift(newProg);
    safeSet(PROGRAMS_KEY, progs);
    return newProg;
  },

  updateProgram(programId: string, updates: Partial<LoyaltyProgram>): LoyaltyProgram {
    const progs = this.getPrograms();
    const idx = progs.findIndex((p) => p.id === programId);
    if (idx === -1) throw new Error('Program not found');
    const updated = { ...progs[idx], ...updates, updated_at: new Date().toISOString() };
    progs[idx] = updated;
    safeSet(PROGRAMS_KEY, progs);
    return updated;
  },

  deleteProgram(programId: string): void {
    const progs = this.getPrograms().filter((p) => p.id !== programId);
    safeSet(PROGRAMS_KEY, progs);
  },

  // --- CARDS ---
  getCards(): LoyaltyCard[] {
    this.init();
    return safeGet<LoyaltyCard[]>(CARDS_KEY, []);
  },

  getUserCards(userId: string): LoyaltyCard[] {
    this.init();
    let cards = this.getCards();
    const progs = this.getPrograms();
    const comps = this.getCompanies();

    let userCards = cards.filter((c) => c.user_id === userId);

    // Auto-enroll customer in starter programs (Cafe, Hotel, Car Wash) if not enrolled yet
    const starterSeeds: Record<string, number> = {
      'prog-seed-001': 4,
      'prog-seed-002': 2,
      'prog-seed-003': 5,
    };

    let newlyAdded = false;
    DEFAULT_PROGRAMS.forEach((defProg) => {
      if (!userCards.some((c) => c.program_id === defProg.id)) {
        const initialStamps = starterSeeds[defProg.id] ?? 0;
        const newCard: LoyaltyCard = {
          id: `crd-${defProg.id.replace('prog-', '')}-${userId.slice(-4)}`,
          user_id: userId,
          program_id: defProg.id,
          company_id: defProg.company_id,
          current_stamps: initialStamps,
          lifetime_stamps: initialStamps,
          rewards_earned: 0,
          rewards_redeemed: 0,
          status: initialStamps >= 6 ? 'reward_ready' : 'active',
          last_visit_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        cards.push(newCard);
        userCards.push(newCard);
        newlyAdded = true;
      }
    });

    if (newlyAdded) {
      safeSet(CARDS_KEY, cards);
    }

    return userCards.map((c) => ({
      ...c,
      program: progs.find((p) => p.id === c.program_id) || DEFAULT_PROGRAMS[0],
      company: comps.find((comp) => comp.id === c.company_id) || DEFAULT_COMPANIES[0],
    }));
  },

  getCardById(cardId: string): LoyaltyCard | null {
    const cards = this.getCards();
    const card = cards.find((c) => c.id === cardId);
    if (!card) return null;
    const progs = this.getPrograms();
    const comps = this.getCompanies();
    return {
      ...card,
      program: progs.find((p) => p.id === card.program_id) || DEFAULT_PROGRAM,
      company: comps.find((comp) => comp.id === card.company_id) || DEFAULT_COMPANY,
    };
  },

  enrollInProgram(
    userId: string,
    programId: string,
    companyId: string,
    initialStamps = 0
  ): LoyaltyCard {
    const cards = this.getCards();
    const existing = cards.find((c) => c.user_id === userId && c.program_id === programId);
    if (existing) return existing;

    const newCard: LoyaltyCard = {
      id: `crd-${Math.random().toString(36).substring(2, 9)}`,
      user_id: userId,
      program_id: programId,
      company_id: companyId,
      current_stamps: initialStamps,
      lifetime_stamps: initialStamps,
      rewards_earned: 0,
      rewards_redeemed: 0,
      status: initialStamps >= 6 ? 'reward_ready' : 'active',
      last_visit_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    cards.unshift(newCard);
    safeSet(CARDS_KEY, cards);

    const progs = this.getPrograms();
    const comps = this.getCompanies();
    return {
      ...newCard,
      program: progs.find((p) => p.id === programId) || DEFAULT_PROGRAM,
      company: comps.find((c) => c.id === companyId) || DEFAULT_COMPANY,
    };
  },

  // --- CASHIER & SCANNING ---
  verifyCustomerByQr(qrToken: string, companyId: string) {
    this.init();
    const users = this.getUsers();
    const cleanToken = qrToken.trim().toUpperCase();

    // Check if pass token specifies a company or category
    let detectedCompanyId = companyId;
    if (cleanToken.includes('CAFE') || cleanToken.includes('001')) {
      detectedCompanyId = 'comp-seed-001';
    } else if (cleanToken.includes('HOTEL') || cleanToken.includes('002')) {
      detectedCompanyId = 'comp-seed-002';
    } else if (cleanToken.includes('WASH') || cleanToken.includes('003')) {
      detectedCompanyId = 'comp-seed-003';
    }

    // Match customer by qr_code_token or sub-string
    let customer = users.find((u) => u.qr_code_token.toUpperCase() === cleanToken);
    if (!customer) {
      customer = users.find(
        (u) =>
          cleanToken.includes(u.qr_code_token.toUpperCase()) ||
          u.qr_code_token.toUpperCase().includes(cleanToken)
      );
    }
    if (!customer) {
      const allCards = this.getCards();
      const matchedCard = allCards.find(
        (c) => c.id.toUpperCase() === cleanToken || cleanToken.includes(c.id.toUpperCase())
      );
      if (matchedCard) {
        customer = users.find((u) => u.id === matchedCard.user_id);
        detectedCompanyId = matchedCard.company_id;
      }
    }
    if (!customer) {
      customer = users.find((u) => u.role === 'user') || users[0];
    }

    if (!customer) {
      throw new Error(`Customer with pass code "${cleanToken}" not found.`);
    }

    const finalCompanyId = detectedCompanyId || companyId || DEFAULT_COMPANY.id;
    // Get company's programs
    const progs = this.getPrograms(finalCompanyId);
    const activeProgram = progs[0] || DEFAULT_PROGRAM;

    // Get or create card
    let cards = this.getCards();
    let card = cards.find((c) => c.user_id === customer.id && c.program_id === activeProgram.id);

    if (!card) {
      card = this.enrollInProgram(customer.id, activeProgram.id, finalCompanyId);
    }

    const target = activeProgram.target_stamps || 6;
    const canRedeem = card.current_stamps >= target || card.status === 'reward_ready';

    const { password: _, ...cleanCustomer } = customer;
    return {
      customer: cleanCustomer,
      card: {
        ...card,
        program: activeProgram,
        company: this.getCompanyById(finalCompanyId) || DEFAULT_COMPANY,
      },
      program: activeProgram,
      canRedeem,
      progressPercentage: Math.min(100, Math.round((card.current_stamps / target) * 100)),
    };
  },

  addVisitStamp(params: {
    cardId: string;
    userId: string;
    companyId: string;
    programId: string;
    cashierId?: string | null;
    notes?: string;
    stampsToAdd?: number;
  }) {
    const cards = this.getCards();
    const idx = cards.findIndex((c) => c.id === params.cardId);
    if (idx === -1) throw new Error('Card not found');

    const card = cards[idx];
    const program = this.getProgramById(params.programId) || DEFAULT_PROGRAM;
    const target = program.target_stamps || 6;
    const add = params.stampsToAdd || 1;

    const newCurrent = card.current_stamps + add;
    const newLifetime = card.lifetime_stamps + add;
    const rewardUnlocked = newCurrent >= target;

    const updatedCard: LoyaltyCard = {
      ...card,
      current_stamps: newCurrent,
      lifetime_stamps: newLifetime,
      rewards_earned: rewardUnlocked ? card.rewards_earned + 1 : card.rewards_earned,
      status: rewardUnlocked ? 'reward_ready' : 'active',
      last_visit_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      program,
      company: this.getCompanyById(params.companyId) || DEFAULT_COMPANY,
    };

    cards[idx] = updatedCard;
    safeSet(CARDS_KEY, cards);

    // Add log
    const logs = safeGet<StampLog[]>(LOGS_KEY, []);
    const newLog: StampLog = {
      id: `log-${Math.random().toString(36).substring(2, 9)}`,
      card_id: params.cardId,
      user_id: params.userId,
      cashier_id: params.cashierId || null,
      company_id: params.companyId,
      program_id: params.programId,
      stamps_added: add,
      notes: params.notes || 'In-store visit stamp',
      created_at: new Date().toISOString(),
      program,
      user: this.getUsers().find((u) => u.id === params.userId) || undefined,
    };
    logs.unshift(newLog);
    safeSet(LOGS_KEY, logs);

    return {
      card: updatedCard,
      rewardUnlocked,
      newStamps: newCurrent,
      targetStamps: target,
    };
  },

  redeemReward(params: {
    cardId: string;
    userId: string;
    companyId: string;
    programId: string;
    cashierId?: string | null;
    rewardTitle: string;
  }) {
    const cards = this.getCards();
    const idx = cards.findIndex((c) => c.id === params.cardId);
    if (idx === -1) throw new Error('Card not found');

    const card = cards[idx];
    const program = this.getProgramById(params.programId) || DEFAULT_PROGRAM;
    const target = program.target_stamps || 6;

    if (card.current_stamps < target && card.status !== 'reward_ready') {
      throw new Error(`Insufficient stamps. Required: ${target}, Current: ${card.current_stamps}`);
    }

    const redemptionCode = generateRedemptionCode();
    const newCurrent = Math.max(0, card.current_stamps - target);

    const updatedCard: LoyaltyCard = {
      ...card,
      current_stamps: newCurrent,
      rewards_redeemed: (card.rewards_redeemed || 0) + 1,
      status: newCurrent >= target ? 'reward_ready' : 'active',
      updated_at: new Date().toISOString(),
      program,
      company: this.getCompanyById(params.companyId) || DEFAULT_COMPANY,
    };

    cards[idx] = updatedCard;
    safeSet(CARDS_KEY, cards);

    // Save redemption
    const redemptions = safeGet<RewardRedemption[]>(REDEMPTIONS_KEY, []);
    const newRedemption: RewardRedemption = {
      id: `red-${Math.random().toString(36).substring(2, 9)}`,
      card_id: params.cardId,
      user_id: params.userId,
      cashier_id: params.cashierId || null,
      company_id: params.companyId,
      program_id: params.programId,
      reward_title: params.rewardTitle,
      redemption_code: redemptionCode,
      stamps_spent: target,
      created_at: new Date().toISOString(),
      program,
      company: this.getCompanyById(params.companyId) || DEFAULT_COMPANY,
    };
    redemptions.unshift(newRedemption);
    safeSet(REDEMPTIONS_KEY, redemptions);

    return {
      card: updatedCard,
      redemption: newRedemption,
      redemptionCode,
    };
  },

  getStampLogs(userId?: string, companyId?: string): StampLog[] {
    let logs = safeGet<StampLog[]>(LOGS_KEY, []);
    if (userId) logs = logs.filter((l) => l.user_id === userId);
    if (companyId) logs = logs.filter((l) => l.company_id === companyId);
    return logs;
  },

  getRedemptions(userId?: string, companyId?: string): RewardRedemption[] {
    let redemptions = safeGet<RewardRedemption[]>(REDEMPTIONS_KEY, []);
    if (userId) redemptions = redemptions.filter((r) => r.user_id === userId);
    if (companyId) redemptions = redemptions.filter((r) => r.company_id === companyId);
    return redemptions;
  },

  createCashier(companyId: string, fullName: string, email: string, pass: string): UserProfile {
    const users = this.getUsers();
    const qrToken = `CSH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const newUser: UserProfile & { password?: string } = {
      id: `usr-${Math.random().toString(36).substring(2, 9)}`,
      email,
      password: pass,
      full_name: fullName,
      phone: null,
      role: 'cashier',
      company_id: companyId,
      qr_code_token: qrToken,
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    users.push(newUser);
    safeSet(USERS_KEY, users);
    const { password: _, ...clean } = newUser;
    return clean;
  },

  getCashiers(companyId: string): UserProfile[] {
    return this.getUsers().filter((u) => u.company_id === companyId && u.role === 'cashier');
  },

  // --- PRODUCTS / SERVICES CATALOG ---
  getProducts(companyId?: string): CompanyProduct[] {
    this.init();
    const products = safeGet<CompanyProduct[]>(PRODUCTS_KEY, DEFAULT_PRODUCTS);
    if (!companyId) return products;
    return products.filter((p) => p.company_id === companyId);
  },

  // --- COMPANY ORDERS & ORDER FLOW ---
  getOrders(): CompanyOrder[] {
    this.init();
    const orders = safeGet<CompanyOrder[]>(ORDERS_KEY, DEFAULT_ORDERS);
    const comps = this.getCompanies();
    const progs = this.getPrograms();

    return orders.map((o) => ({
      ...o,
      company: comps.find((c) => c.id === o.company_id) || o.company,
      program: progs.find((p) => p.id === o.program_id) || o.program,
    }));
  },

  getUserOrders(userId: string): CompanyOrder[] {
    return this.getOrders().filter((o) => o.user_id === userId);
  },

  getCompanyOrders(companyId: string): CompanyOrder[] {
    return this.getOrders().filter((o) => o.company_id === companyId);
  },

  getOrderById(orderId: string): CompanyOrder | null {
    return this.getOrders().find((o) => o.id === orderId) || null;
  },

  createOrder(params: {
    userId: string;
    companyId: string;
    programId?: string;
    cardId?: string;
    items: OrderItem[];
    totalAmount: number;
    pickupType?: PickupType;
    specialInstructions?: string;
    stampsEarned?: number;
  }): CompanyOrder {
    const orders = safeGet<CompanyOrder[]>(ORDERS_KEY, DEFAULT_ORDERS);
    const company = this.getCompanyById(params.companyId) || DEFAULT_COMPANY;
    const program = params.programId ? this.getProgramById(params.programId) : DEFAULT_PROGRAM;
    const stampsEarned = params.stampsEarned ?? 1;

    const orderNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: CompanyOrder = {
      id: `ord-${Math.random().toString(36).substring(2, 9)}`,
      user_id: params.userId,
      company_id: params.companyId,
      program_id: params.programId || program?.id || null,
      card_id: params.cardId || null,
      order_number: orderNumber,
      items: params.items,
      total_amount: params.totalAmount,
      stamps_earned: stampsEarned,
      status: 'pending',
      pickup_type: params.pickupType || 'in_store',
      special_instructions: params.specialInstructions || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      company,
      program: program || undefined,
    };

    orders.unshift(newOrder);
    safeSet(ORDERS_KEY, orders);

    // Automatically award loyalty stamps to user's card for this company
    try {
      const cards = this.getCards();
      const card = cards.find(
        (c) => c.user_id === params.userId && c.company_id === params.companyId
      );

      if (card && program) {
        const newStamps = card.current_stamps + stampsEarned;
        card.current_stamps = newStamps;
        card.lifetime_stamps = (card.lifetime_stamps || 0) + stampsEarned;
        card.last_visit_at = new Date().toISOString();
        card.updated_at = new Date().toISOString();
        if (newStamps >= program.target_stamps) {
          card.status = 'reward_ready';
          card.rewards_earned = (card.rewards_earned || 0) + 1;
        }
        safeSet(CARDS_KEY, cards);

        // Add to stamp logs
        const logs = safeGet<StampLog[]>(LOGS_KEY, []);
        logs.unshift({
          id: `log-${Math.random().toString(36).substring(2, 9)}`,
          card_id: card.id,
          user_id: params.userId,
          cashier_id: null,
          company_id: params.companyId,
          program_id: program.id,
          stamps_added: stampsEarned,
          notes: `Earned via Order #${orderNumber}`,
          created_at: new Date().toISOString(),
        });
        safeSet(LOGS_KEY, logs);
      }
    } catch (e) {
      console.warn('Loyalty stamp award note:', e);
    }

    return newOrder;
  },

  updateOrderStatus(orderId: string, status: OrderStatus): CompanyOrder {
    const orders = safeGet<CompanyOrder[]>(ORDERS_KEY, DEFAULT_ORDERS);
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx === -1) throw new Error('Order not found');

    orders[idx] = {
      ...orders[idx],
      status,
      updated_at: new Date().toISOString(),
    };

    safeSet(ORDERS_KEY, orders);
    return orders[idx];
  },
};
