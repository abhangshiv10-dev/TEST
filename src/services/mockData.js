import { DEFAULT_CATEGORIES } from '../constants/categories';
import { DEFAULT_STAGES } from '../constants/stages';

export const INITIAL_DEMO_PROJECT = {
  id: 'proj-demo-01',
  user_id: 'user-demo-01',
  name: 'Shree Ganesh Villa',
  address: 'Plot 42, Green Meadows Avenue, Pune, Maharashtra',
  owner_name: 'Suresh & Priya Sharma',
  contractor_name: 'Omkar Constructions (Ramesh Patil)',
  engineer_name: 'Er. Rajesh Kulkarni (Structural)',
  architect_name: 'Ar. Ananya Deshmukh (Studio Vastu)',
  start_date: '2026-01-10',
  expected_end_date: '2026-11-30',
  actual_end_date: null,
  total_budget: 2500000,
  built_up_area: 2450,
  number_of_floors: 2,
  status: 'In Progress',
  description: 'G+1 modern contemporary villa with 3 BHK, double height living room and terrace pergola.',
  notes: 'Centering completed for 1st slab. Electrical piping in progress.',
  created_at: new Date('2026-01-10').toISOString(),
  updated_at: new Date().toISOString()
};

export const INITIAL_SUPPLIERS = [
  {
    id: 'supp-01',
    project_id: 'proj-demo-01',
    name: 'Balaji Building Materials & Cements',
    business_name: 'Balaji Traders',
    mobile: '9822012345',
    email: 'balaji.materials@gmail.com',
    address: 'Shop 14, Highway Ring Road, Pune',
    material_type: 'Cement, Sand, Aggregates & Bricks',
    opening_balance: 0,
    notes: 'Credit term 15 days. Dedicated dumper truck delivery.'
  },
  {
    id: 'supp-02',
    project_id: 'proj-demo-01',
    name: 'Mahalaxmi Steel & TMT Yard',
    business_name: 'Mahalaxmi Ispat Ltd',
    mobile: '9890123456',
    email: 'sales@mahalaxmisteel.in',
    address: 'Plot B-8, Industrial Estate, Pune',
    material_type: 'Tata Tiscon 550D TMT Steel & Binding Wire',
    opening_balance: 0,
    notes: 'Weighbridge slip compulsory with every dispatch.'
  },
  {
    id: 'supp-03',
    project_id: 'proj-demo-01',
    name: 'Vanguard Pipes & Sanitaryware',
    business_name: 'Vanguard Plumbing Mart',
    mobile: '9765432100',
    email: 'vanguard.pune@yahoo.com',
    address: 'Near Market Yard, Pune',
    material_type: 'Astral CPVC Pipes, Finolex Drainage',
    opening_balance: 0,
    notes: 'Provides 20% discount on wholesale pipes.'
  },
  {
    id: 'supp-04',
    project_id: 'proj-demo-01',
    name: 'Havells & Polycab Electric Hub',
    business_name: 'Shree Electricals',
    mobile: '9845098765',
    email: 'shree.electric@gmail.com',
    address: 'Budhwar Peth, Pune',
    material_type: 'Conduit pipes, FR Copper Wires, DB boxes',
    opening_balance: 0,
    notes: 'Authorized distributor.'
  }
];

export const INITIAL_MATERIALS = [
  {
    id: 'mat-01',
    project_id: 'proj-demo-01',
    name: 'UltraTech Cement (53 Grade)',
    category: 'Cement',
    unit: 'Bags',
    minimum_stock: 40,
    current_stock: 85,
    notes: 'Keep protected from rain and ground moisture in site shed.'
  },
  {
    id: 'mat-02',
    project_id: 'proj-demo-01',
    name: 'Tata Tiscon 550D TMT Steel (12mm)',
    category: 'Steel & Iron',
    unit: 'Ton',
    minimum_stock: 1.0,
    current_stock: 2.8,
    notes: 'Used for main column and beam reinforcement.'
  },
  {
    id: 'mat-03',
    project_id: 'proj-demo-01',
    name: 'Tata Tiscon 550D TMT Steel (8mm)',
    category: 'Steel & Iron',
    unit: 'Ton',
    minimum_stock: 0.5,
    current_stock: 0.3, // low stock alert!
    notes: 'Used for stirrups (rings) and slab mesh.'
  },
  {
    id: 'mat-04',
    project_id: 'proj-demo-01',
    name: 'River Sand (Washed)',
    category: 'Sand & Aggregates',
    unit: 'Brass',
    minimum_stock: 2,
    current_stock: 5,
    notes: 'Reserved for internal plastering work.'
  },
  {
    id: 'mat-05',
    project_id: 'proj-demo-01',
    name: 'Crushed M-Sand (Masonry Sand)',
    category: 'Sand & Aggregates',
    unit: 'Brass',
    minimum_stock: 2,
    current_stock: 1, // low stock alert!
    notes: 'Used for brickwork and PCC bed.'
  },
  {
    id: 'mat-06',
    project_id: 'proj-demo-01',
    name: '20mm Black Trap Aggregate',
    category: 'Sand & Aggregates',
    unit: 'Brass',
    minimum_stock: 2,
    current_stock: 4,
    notes: 'High quality basalt rock aggregate.'
  },
  {
    id: 'mat-07',
    project_id: 'proj-demo-01',
    name: 'Red Clay Kiln Bricks',
    category: 'Bricks & Blocks',
    unit: 'Pieces',
    minimum_stock: 1500,
    current_stock: 4200,
    notes: 'First class kiln burnt bricks.'
  },
  {
    id: 'mat-08',
    project_id: 'proj-demo-01',
    name: 'Polycab 2.5 sq.mm FR Wire (Red/Black)',
    category: 'Electrical Material',
    unit: 'Bags',
    minimum_stock: 5,
    current_stock: 12,
    notes: '90m coils.'
  }
];

export const INITIAL_WORKERS = [
  {
    id: 'wrk-01',
    project_id: 'proj-demo-01',
    name: 'Ramu Mistri (Head Mason)',
    mobile: '9822114455',
    worker_type: 'Mason',
    daily_rate: 950,
    joining_date: '2026-01-15',
    status: 'Active',
    notes: '20+ years experience in RCC column casting and brickwork.'
  },
  {
    id: 'wrk-02',
    project_id: 'proj-demo-01',
    name: 'Gopal Kumar (Plaster Mason)',
    mobile: '9822336677',
    worker_type: 'Mason',
    daily_rate: 850,
    joining_date: '2026-02-01',
    status: 'Active',
    notes: 'Skilled line-dori plaster master.'
  },
  {
    id: 'wrk-03',
    project_id: 'proj-demo-01',
    name: 'Babu Shinde (Helper)',
    mobile: '9766445522',
    worker_type: 'Helper',
    daily_rate: 550,
    joining_date: '2026-01-15',
    status: 'Active',
    notes: 'Material handling and water curing.'
  },
  {
    id: 'wrk-04',
    project_id: 'proj-demo-01',
    name: 'Santosh Yadav (Shuttering Carpenter)',
    mobile: '9855221100',
    worker_type: 'Carpenter',
    daily_rate: 900,
    joining_date: '2026-01-20',
    status: 'Active',
    notes: 'Plywood centering and props alignment.'
  },
  {
    id: 'wrk-05',
    project_id: 'proj-demo-01',
    name: 'Kailash Wireman (Electrician)',
    mobile: '9890998877',
    worker_type: 'Electrician',
    daily_rate: 850,
    joining_date: '2026-03-01',
    status: 'Active',
    notes: 'Licensed wireman.'
  }
];

export const INITIAL_CONTRACTORS = [
  {
    id: 'cont-01',
    project_id: 'proj-demo-01',
    name: 'Omkar Civil Contractors',
    company: 'Omkar Infra & Builders',
    mobile: '9822998811',
    work_type: 'Civil Structure & Labour Contract',
    contract_amount: 850000,
    advance_amount: 100000,
    paid_amount: 350000,
    pending_amount: 500000,
    start_date: '2026-01-15',
    end_date: '2026-08-30',
    status: 'Active',
    notes: 'Payment scheduled stage-wise: 15% plinth, 25% slab, 20% brickwork, 20% plaster, 20% handover.'
  },
  {
    id: 'cont-02',
    project_id: 'proj-demo-01',
    name: 'Shree Siddhivinayak Plumbing & Borewell',
    company: 'Siddhivinayak Services',
    mobile: '9860112233',
    work_type: 'Plumbing & Drainage Turnkey',
    contract_amount: 140000,
    advance_amount: 25000,
    paid_amount: 60000,
    pending_amount: 80000,
    start_date: '2026-02-15',
    end_date: '2026-09-15',
    status: 'Active',
    notes: 'Includes concealed lines, rainwater harvesting and dual overhead tanks.'
  }
];

export const INITIAL_BUDGETS = [
  { id: 'bud-01', project_id: 'proj-demo-01', category_id: 'cat-cement', budget_amount: 320000, period: 'Entire Project', notes: 'Estimated 800 bags @ ₹400' },
  { id: 'bud-02', project_id: 'proj-demo-01', category_id: 'cat-steel', budget_amount: 450000, period: 'Entire Project', notes: 'Estimated 7.5 Ton @ ₹60,000/ton' },
  { id: 'bud-03', project_id: 'proj-demo-01', category_id: 'cat-sand', budget_amount: 220000, period: 'Entire Project', notes: 'Sand + aggregates loads' },
  { id: 'bud-04', project_id: 'proj-demo-01', category_id: 'cat-bricks', budget_amount: 180000, period: 'Entire Project', notes: '22,000 bricks @ ₹8' },
  { id: 'bud-05', project_id: 'proj-demo-01', category_id: 'cat-tiles', budget_amount: 250000, period: 'Entire Project', notes: 'Flooring, kitchen counter & toilets' },
  { id: 'bud-06', project_id: 'proj-demo-01', category_id: 'cat-mason-labour', budget_amount: 350000, period: 'Entire Project', notes: 'Mason & helper daily wages' },
  { id: 'bud-07', project_id: 'proj-demo-01', category_id: 'cat-contractor', budget_amount: 500000, period: 'Entire Project', notes: 'Contractor milestones' },
  { id: 'bud-08', project_id: 'proj-demo-01', category_id: 'cat-arch-fees', budget_amount: 80000, period: 'Entire Project', notes: 'Architect + structural engineer' },
  { id: 'bud-09', project_id: 'proj-demo-01', category_id: 'cat-plumbing-mat', budget_amount: 120000, period: 'Entire Project', notes: 'Pipes, fittings & tanks' },
  { id: 'bud-10', project_id: 'proj-demo-01', category_id: 'cat-electrical-mat', budget_amount: 140000, period: 'Entire Project', notes: 'Conduit, wire, switches' },
  { id: 'bud-11', project_id: 'proj-demo-01', category_id: 'cat-paint', budget_amount: 150000, period: 'Entire Project', notes: 'Putty, primer, paints' },
  { id: 'bud-12', project_id: 'proj-demo-01', category_id: 'cat-wood', budget_amount: 200000, period: 'Entire Project', notes: 'Doors & window frames' },
];

export const INITIAL_EXPENSES = [
  {
    id: 'exp-01',
    project_id: 'proj-demo-01',
    category_id: 'cat-arch-fees',
    sub_category_id: null,
    stage_id: 'stage-1',
    supplier_id: null,
    expense_date: '2026-01-12',
    description: 'Architect blueprint, 3D exterior design and structural drawings',
    quantity: 1,
    unit: 'Lump sum',
    rate: 65000,
    amount: 65000,
    paid_to: 'Ar. Ananya Deshmukh (Studio Vastu)',
    payment_method: 'Bank Transfer',
    payment_status: 'Paid',
    paid_amount: 65000,
    reference_number: 'NEFT98223401',
    receipt_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    receipt_file_name: 'Architect_Bill_Receipt.jpg',
    notes: 'Drawings approved by structural engineer.'
  },
  {
    id: 'exp-02',
    project_id: 'proj-demo-01',
    category_id: 'cat-govt-fees',
    sub_category_id: null,
    stage_id: 'stage-2',
    supplier_id: null,
    expense_date: '2026-01-18',
    description: 'Municipal building plan sanction fee & water connection NOC',
    quantity: 1,
    unit: 'Lump sum',
    rate: 32500,
    amount: 32500,
    paid_to: 'Pune Municipal Corporation',
    payment_method: 'Bank Transfer',
    payment_status: 'Paid',
    paid_amount: 32500,
    reference_number: 'PMC-CHALAN-889',
    receipt_url: null,
    notes: 'Official receipt received.'
  },
  {
    id: 'exp-03',
    project_id: 'proj-demo-01',
    category_id: 'cat-transport',
    sub_category_id: null,
    stage_id: 'stage-3',
    supplier_id: null,
    expense_date: '2026-01-22',
    description: 'JCB machine excavation for column footings & boundary leveling',
    quantity: 22,
    unit: 'Hours',
    rate: 1400,
    amount: 30800,
    paid_to: 'Maruti Earthmovers',
    payment_method: 'UPI',
    payment_status: 'Paid',
    paid_amount: 30800,
    reference_number: 'UPI/6022144829',
    notes: 'Excavated 16 footing pits to 6 feet depth as per drawing.'
  },
  {
    id: 'exp-04',
    project_id: 'proj-demo-01',
    category_id: 'cat-steel',
    sub_category_id: null,
    stage_id: 'stage-4',
    supplier_id: 'supp-02',
    expense_date: '2026-01-28',
    description: 'Tata Tiscon 550D TMT Steel 16mm, 12mm and 8mm with binding wire',
    quantity: 3.5,
    unit: 'Ton',
    rate: 61500,
    amount: 215250,
    paid_to: 'Mahalaxmi Steel Yard',
    payment_method: 'Bank Transfer',
    payment_status: 'Paid',
    paid_amount: 215250,
    reference_number: 'RTGS-MAHA-4091',
    receipt_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb180c5f5?auto=format&fit=crop&w=800&q=80',
    receipt_file_name: 'Steel_Tax_Invoice_042.jpg',
    notes: 'Delivered in two bundles. Quality test certificate verified.'
  },
  {
    id: 'exp-05',
    project_id: 'proj-demo-01',
    category_id: 'cat-cement',
    sub_category_id: null,
    stage_id: 'stage-4',
    supplier_id: 'supp-01',
    expense_date: '2026-02-02',
    description: 'UltraTech Cement 53 Grade for footing concrete & column starter',
    quantity: 120,
    unit: 'Bags',
    rate: 395,
    amount: 47400,
    paid_to: 'Balaji Building Materials',
    payment_method: 'UPI',
    payment_status: 'Paid',
    paid_amount: 47400,
    reference_number: 'UPI/6033881290',
    receipt_url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
    receipt_file_name: 'Balaji_Cement_Invoice.jpg',
    notes: 'Stored in lockable site shed.'
  },
  {
    id: 'exp-06',
    project_id: 'proj-demo-01',
    category_id: 'cat-sand',
    sub_category_id: null,
    stage_id: 'stage-5',
    supplier_id: 'supp-01',
    expense_date: '2026-02-10',
    description: '20mm Basalt Aggregate and River Sand for plinth beam casting',
    quantity: 6,
    unit: 'Brass',
    rate: 7800,
    amount: 46800,
    paid_to: 'Balaji Building Materials',
    payment_method: 'Cheque',
    payment_status: 'Paid',
    paid_amount: 46800,
    reference_number: 'CHQ-882014',
    notes: 'Delivered in 2 dumper trips.'
  },
  {
    id: 'exp-07',
    project_id: 'proj-demo-01',
    category_id: 'cat-contractor',
    sub_category_id: null,
    stage_id: 'stage-5',
    supplier_id: null,
    expense_date: '2026-02-18',
    description: 'Omkar Constructions - 1st Milestone: Completion of Foundation & Plinth Beam',
    quantity: 1,
    unit: 'Lump sum',
    rate: 150000,
    amount: 150000,
    paid_to: 'Omkar Constructions',
    payment_method: 'Bank Transfer',
    payment_status: 'Paid',
    paid_amount: 150000,
    reference_number: 'NEFT-OMKAR-102',
    notes: 'Plinth checked and passed by structural engineer.'
  },
  {
    id: 'exp-08',
    project_id: 'proj-demo-01',
    category_id: 'cat-bricks',
    sub_category_id: null,
    stage_id: 'stage-7',
    supplier_id: 'supp-01',
    expense_date: '2026-02-28',
    description: 'Red Clay Kiln Bricks for Ground Floor outer & inner partition walls',
    quantity: 8000,
    unit: 'Pieces',
    rate: 8.5,
    amount: 68000,
    paid_to: 'Balaji Building Materials',
    payment_method: 'UPI',
    payment_status: 'Paid',
    paid_amount: 68000,
    reference_number: 'UPI/6059910023',
    notes: 'Sound, red, well-baked bricks.'
  },
  {
    id: 'exp-09',
    project_id: 'proj-demo-01',
    category_id: 'cat-steel',
    sub_category_id: null,
    stage_id: 'stage-8',
    supplier_id: 'supp-02',
    expense_date: '2026-03-08',
    description: 'Tata Tiscon 550D Steel for Ground Floor Slab casting (10mm & 8mm mesh)',
    quantity: 2.2,
    unit: 'Ton',
    rate: 62000,
    amount: 136400,
    paid_to: 'Mahalaxmi Steel Yard',
    payment_method: 'Bank Transfer',
    payment_status: 'Partially Paid',
    paid_amount: 100000,
    reference_number: 'RTGS-STEEL-99',
    receipt_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb180c5f5?auto=format&fit=crop&w=800&q=80',
    receipt_file_name: 'Steel_Slab_Bill.jpg',
    notes: 'Remaining ₹36,400 payable after slab curing.'
  },
  {
    id: 'exp-10',
    project_id: 'proj-demo-01',
    category_id: 'cat-cement',
    sub_category_id: null,
    stage_id: 'stage-8',
    supplier_id: 'supp-01',
    expense_date: '2026-03-12',
    description: 'UltraTech Cement (110 Bags) for Ground Floor Slab concrete pour',
    quantity: 110,
    unit: 'Bags',
    rate: 395,
    amount: 43450,
    paid_to: 'Balaji Building Materials',
    payment_method: 'Cash',
    payment_status: 'Paid',
    paid_amount: 43450,
    reference_number: 'CASH-REC-112',
    notes: 'Continuous casting completed in 10 hours.'
  },
  {
    id: 'exp-11',
    project_id: 'proj-demo-01',
    category_id: 'cat-electrical-mat',
    sub_category_id: null,
    stage_id: 'stage-11',
    supplier_id: 'supp-04',
    expense_date: '2026-03-18',
    description: 'Precision Heavy PVC Conduit Pipes 25mm, deep junction boxes and solvent cement',
    quantity: 45,
    unit: 'Pieces',
    rate: 220,
    amount: 9900,
    paid_to: 'Shree Electricals',
    payment_method: 'UPI',
    payment_status: 'Paid',
    paid_amount: 9900,
    reference_number: 'UPI/6078129031',
    notes: 'Concealed piping in slab and brickwork.'
  },
  {
    id: 'exp-12',
    project_id: 'proj-demo-01',
    category_id: 'cat-plumbing-mat',
    sub_category_id: null,
    stage_id: 'stage-12',
    supplier_id: 'supp-03',
    expense_date: '2026-03-20',
    description: 'Astral CPVC Pro Pipes (1 inch & 0.75 inch) and Brass fittings for 3 bathrooms',
    quantity: 1,
    unit: 'Lump sum',
    rate: 28500,
    amount: 28500,
    paid_to: 'Vanguard Plumbing Mart',
    payment_method: 'Credit',
    payment_status: 'Pending',
    paid_amount: 0,
    reference_number: 'INV-VAN-5401',
    receipt_url: null,
    notes: 'Bill pending approval after hydraulic pressure test.'
  }
];

export const INITIAL_EXPENSE_PAYMENTS = [
  {
    id: 'pay-01',
    project_id: 'proj-demo-01',
    expense_id: 'exp-09',
    paid_to: 'Mahalaxmi Steel Yard',
    amount: 100000,
    payment_date: '2026-03-08',
    payment_method: 'Bank Transfer',
    reference_number: 'RTGS-STEEL-99',
    notes: 'Part payment against bill of ₹1,36,400'
  }
];

export const INITIAL_LABOUR_ENTRIES = [
  {
    id: 'lab-01',
    project_id: 'proj-demo-01',
    worker_id: 'wrk-01',
    stage_id: 'stage-7',
    entry_date: '2026-03-15',
    attendance: 'Present',
    hours: 8,
    rate: 950,
    overtime_hours: 2,
    overtime_rate: 150,
    total_amount: 1250,
    payment_status: 'Paid',
    notes: 'Lintel level brickwork'
  },
  {
    id: 'lab-02',
    project_id: 'proj-demo-01',
    worker_id: 'wrk-02',
    stage_id: 'stage-7',
    entry_date: '2026-03-15',
    attendance: 'Present',
    hours: 8,
    rate: 850,
    overtime_hours: 0,
    overtime_rate: 0,
    total_amount: 850,
    payment_status: 'Paid',
    notes: 'Corner masonry'
  },
  {
    id: 'lab-03',
    project_id: 'proj-demo-01',
    worker_id: 'wrk-03',
    stage_id: 'stage-7',
    entry_date: '2026-03-15',
    attendance: 'Present',
    hours: 8,
    rate: 550,
    overtime_hours: 2,
    overtime_rate: 80,
    total_amount: 710,
    payment_status: 'Paid',
    notes: 'Mortar mixing & carrying'
  },
  {
    id: 'lab-04',
    project_id: 'proj-demo-01',
    worker_id: 'wrk-04',
    stage_id: 'stage-8',
    entry_date: '2026-03-16',
    attendance: 'Present',
    hours: 8,
    rate: 900,
    overtime_hours: 1.5,
    overtime_rate: 120,
    total_amount: 1080,
    payment_status: 'Pending',
    notes: 'Shuttering props adjustment'
  }
];

export const INITIAL_DAILY_DIARIES = [
  {
    id: 'diary-01',
    project_id: 'proj-demo-01',
    stage_id: 'stage-8',
    entry_date: '2026-03-12',
    title: 'Ground Floor Slab Casting Completed Successfully',
    work_completed: 'Centering inspected in morning. 110 cement bags and 3 brass aggregates mixed. Electric conduit boxes checked before pour. Concrete vibrated and leveled.',
    workers_present: 14,
    materials_used: 'Cement: 110 bags, Steel: 2.2 tons, Aggregate: 3 brass',
    expenses: 43450,
    weather_condition: 'Sunny & clear (31°C)',
    problems_faced: 'Slight delay in water pump starting; resolved in 20 minutes.',
    notes: 'Curing ponding to start from tomorrow morning 6 AM.'
  },
  {
    id: 'diary-02',
    project_id: 'proj-demo-01',
    stage_id: 'stage-11',
    entry_date: '2026-03-18',
    title: 'Concealed Electrical Conduit Laying in Bedroom 1 & Kitchen',
    work_completed: 'Wall groove cutting done by electrician Kailash. Laid 45 PVC conduits and mounted 8-module DB switch boxes at 4.5 ft height.',
    workers_present: 4,
    materials_used: 'PVC Conduit pipes: 45 pcs, Junction boxes: 12 pcs',
    expenses: 9900,
    weather_condition: 'Warm afternoon',
    problems_faced: 'None',
    notes: 'Plumber arriving tomorrow for bathroom drainage core cutting.'
  }
];

export const INITIAL_TASKS = [
  {
    id: 'task-01',
    project_id: 'proj-demo-01',
    title: 'Water curing of Ground Floor roof slab twice daily (morning/evening)',
    description: 'Continuous ponding water curing for 14 days minimum.',
    due_date: '2026-03-26',
    priority: 'High',
    status: 'In Progress',
    assigned_to: 'Babu Shinde (Helper)',
    notes: 'Keep ponding bunds intact.'
  },
  {
    id: 'task-02',
    project_id: 'proj-demo-01',
    title: 'Order 8mm Tata Steel for 1st Floor column rings (0.5 Ton)',
    description: 'Current 8mm stock has dropped to 0.3 ton (below minimum).',
    due_date: '2026-03-24',
    priority: 'High',
    status: 'Pending',
    assigned_to: 'Suresh Sharma (Owner)',
    notes: 'Call Mahalaxmi Steel yard.'
  },
  {
    id: 'task-03',
    project_id: 'proj-demo-01',
    title: 'Finalize bathroom tile design & Granite kitchen platform quote',
    description: 'Visit tile showroom with Ar. Ananya for 4x2 ft vitrified tile selection.',
    due_date: '2026-03-30',
    priority: 'Medium',
    status: 'Pending',
    assigned_to: 'Priya & Suresh',
    notes: 'Budget approx ₹2,50,000.'
  },
  {
    id: 'task-04',
    project_id: 'proj-demo-01',
    title: 'Schedule bank engineer inspection for 2nd loan disbursement tranche',
    description: 'Submit plinth & slab completion photos to HDFC Bank loan manager.',
    due_date: '2026-03-28',
    priority: 'High',
    status: 'Pending',
    assigned_to: 'Suresh Sharma',
    notes: 'Tranche release amount: ₹5,00,000.'
  }
];

export const INITIAL_PHOTOS = [
  {
    id: 'photo-01',
    project_id: 'proj-demo-01',
    stage_id: 'stage-4',
    storage_path: 'user-demo-01/proj-demo-01/photos/foundation_rebar.jpg',
    photo_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb180c5f5?auto=format&fit=crop&w=1000&q=80',
    file_name: 'Foundation_Rebar_Inspection.jpg',
    caption: 'Column footing rebar cage tying and starter layout inspection.',
    taken_at: '2026-01-29'
  },
  {
    id: 'photo-02',
    project_id: 'proj-demo-01',
    stage_id: 'stage-5',
    storage_path: 'user-demo-01/proj-demo-01/photos/plinth_beam.jpg',
    photo_url: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=1000&q=80',
    file_name: 'Plinth_Beam_Casting.jpg',
    caption: 'Plinth beam de-shuttering and compaction check.',
    taken_at: '2026-02-12'
  },
  {
    id: 'photo-03',
    project_id: 'proj-demo-01',
    stage_id: 'stage-8',
    storage_path: 'user-demo-01/proj-demo-01/photos/slab_casting.jpg',
    photo_url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1000&q=80',
    file_name: 'Ground_Floor_Slab_Pour.jpg',
    caption: 'Ground floor slab casting in progress with concrete pump & needle vibrators.',
    taken_at: '2026-03-12'
  }
];

export const INITIAL_DOCUMENTS = [
  {
    id: 'doc-01',
    project_id: 'proj-demo-01',
    name: 'Sanctioned Architectural Floor Plan & Elevation.pdf',
    category: 'House Plan & Blueprints',
    storage_path: 'user-demo-01/proj-demo-01/documents/Sanctioned_Plan.pdf',
    file_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    file_type: 'application/pdf',
    file_size: 4520000,
    uploaded_at: '2026-01-15T10:00:00Z'
  },
  {
    id: 'doc-02',
    project_id: 'proj-demo-01',
    name: 'Municipal Building Permit & Sanction Order.pdf',
    category: 'Government Approvals & Sanctions',
    storage_path: 'user-demo-01/proj-demo-01/documents/Permit_PMC.pdf',
    file_url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
    file_type: 'application/pdf',
    file_size: 2150000,
    uploaded_at: '2026-01-20T14:30:00Z'
  },
  {
    id: 'doc-03',
    project_id: 'proj-demo-01',
    name: 'HDFC Home Loan Sanction Letter ₹20,00,000.pdf',
    category: 'Loan Documents & Sanction Letter',
    storage_path: 'user-demo-01/proj-demo-01/documents/Loan_Sanction_HDFC.pdf',
    file_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    file_type: 'application/pdf',
    file_size: 1840000,
    uploaded_at: '2026-01-05T09:15:00Z'
  },
  {
    id: 'doc-04',
    project_id: 'proj-demo-01',
    name: 'Omkar Constructions Agreement on Stamp Paper.pdf',
    category: 'Contractor Agreement',
    storage_path: 'user-demo-01/proj-demo-01/documents/Contractor_Agreement.pdf',
    file_url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
    file_type: 'application/pdf',
    file_size: 3200000,
    uploaded_at: '2026-01-14T16:00:00Z'
  }
];

export const INITIAL_FUNDINGS = [
  {
    id: 'fund-01',
    project_id: 'proj-demo-01',
    source: 'Personal Savings',
    amount: 500000,
    received_date: '2026-01-05',
    reference: 'SBI Savings Account',
    notes: 'Initial corpus for architecture fees, permissions and excavation'
  },
  {
    id: 'fund-02',
    project_id: 'proj-demo-01',
    source: 'Home Loan',
    amount: 600000,
    received_date: '2026-01-25',
    reference: 'HDFC Loan Tranche 1 (Foundation)',
    notes: 'First disbursement after plinth inspection'
  }
];

export const INITIAL_LOANS = [
  {
    id: 'loan-01',
    project_id: 'proj-demo-01',
    bank_name: 'HDFC Bank Home Loans',
    loan_account_number: 'HDFC-HL-88291033',
    total_sanctioned_amount: 2000000,
    interest_rate: 8.55,
    tenure_months: 240,
    emi_amount: 17420,
    start_date: '2026-01-15',
    disbursed_amount: 600000,
    remaining_amount: 1400000,
    status: 'Active',
    notes: 'Pre-EMI interest during construction period. 4 milestone tranches.'
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-01',
    project_id: 'proj-demo-01',
    type: 'low_stock',
    title: 'Low Material Stock Alert',
    message: 'Tata 8mm TMT Steel is at 0.3 Ton (Minimum required: 0.5 Ton). Re-order soon.',
    is_read: false,
    created_at: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'notif-02',
    project_id: 'proj-demo-01',
    type: 'payment_pending',
    title: 'Pending Supplier Dues',
    message: '₹36,400 pending to Mahalaxmi Steel Yard for Ground Floor Slab steel delivery.',
    is_read: false,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'notif-03',
    project_id: 'proj-demo-01',
    type: 'budget_warning',
    title: 'Budget Alert: Steel & Iron',
    message: 'Steel category has utilized 78% of allocated budget (₹3,51,650 / ₹4,50,000).',
    is_read: true,
    created_at: new Date(Date.now() - 3600000 * 48).toISOString()
  }
];
