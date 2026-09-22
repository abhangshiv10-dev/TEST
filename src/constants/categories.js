export const DEFAULT_CATEGORIES = [
  // Materials
  { id: 'cat-cement', name: 'Cement', type: 'Material', icon: 'Package', color: '#0284c7', subcategories: ['OPC 53 Grade', 'PPC Grade', 'White Cement'] },
  { id: 'cat-steel', name: 'Steel & TMT Bars', type: 'Material', icon: 'Shield', color: '#475569', subcategories: ['8mm Bar', '10mm Bar', '12mm Bar', '16mm Bar', 'Binding Wire'] },
  { id: 'cat-sand', name: 'Sand & Aggregates', type: 'Material', icon: 'Mountain', color: '#d97706', subcategories: ['River Sand', 'M-Sand', 'P-Sand', '10mm Aggregate', '20mm Aggregate', '40mm Aggregate'] },
  { id: 'cat-bricks', name: 'Bricks & Blocks', type: 'Material', icon: 'Boxes', color: '#dc2626', subcategories: ['Red Clay Bricks', 'Fly Ash Bricks', 'AAC Lightweight Blocks', 'Solid Concrete Blocks'] },
  { id: 'cat-tiles', name: 'Flooring & Tiles', type: 'Material', icon: 'Grid', color: '#059669', subcategories: ['Vitrified Tiles', 'Ceramic Wall Tiles', 'Granite Slabs', 'Marble', 'Kota Stone', 'Tile Adhesive / Grout'] },
  { id: 'cat-plumbing-mat', name: 'Plumbing Material', type: 'Material', icon: 'Wrench', color: '#2563eb', subcategories: ['CPVC Pipes & Fittings', 'UPVC Pipes', 'SWR Drainage Pipes', 'Water Tanks', 'Valves & Taps', 'Sanitaryware (WC/Basin)'] },
  { id: 'cat-electrical-mat', name: 'Electrical Material', type: 'Material', icon: 'Zap', color: '#eab308', subcategories: ['Copper Wires', 'Conduit PVC Pipes', 'Modular Switches & Plates', 'Distribution Boards & MCB', 'Light Fixtures & Fans', 'Earthing Wire & Rod'] },
  { id: 'cat-paint', name: 'Paint & Finishes', type: 'Material', icon: 'Palette', color: '#9333ea', subcategories: ['Wall Putty', 'Exterior Primer', 'Interior Emulsion', 'Exterior Weatherproof Paint', 'Enamel Paint', 'Wood Polish'] },
  { id: 'cat-wood', name: 'Wood, Doors & Windows', type: 'Material', icon: 'DoorOpen', color: '#78350f', subcategories: ['Teak Wood / Sal Wood', 'Plywood Sheets (Marine/BWP)', 'Flush Doors', 'UPVC / Aluminum Windows', 'Safety Iron Grills'] },
  { id: 'cat-hardware', name: 'Hardware & Fasteners', type: 'Material', icon: 'Tool', color: '#64748b', subcategories: ['Hinges & Handles', 'Tower Bolts & Locks', 'Nails & Screws', 'Curtain Rods & Brackets'] },
  { id: 'cat-other-mat', name: 'Other Material', type: 'Material', icon: 'Layers', color: '#475569', subcategories: ['Waterproofing Chemical', 'Anti-termite Chemical', 'Glass Panes', 'Ready Mix Concrete (RMC)'] },

  // Labour
  { id: 'cat-mason-labour', name: 'Mason Labour', type: 'Labour', icon: 'Users', color: '#0891b2', subcategories: ['Head Mason (Mistri)', 'Bricklaying Mason', 'Plastering Mason', 'Tile Layer'] },
  { id: 'cat-helper-labour', name: 'Helper / Coolie', type: 'Labour', icon: 'UserCheck', color: '#0d9488', subcategories: ['Male Helper', 'Female Helper', 'Concrete Pouring Crew'] },
  { id: 'cat-carpenter-labour', name: 'Carpenter Labour', type: 'Labour', icon: 'Hammer', color: '#b45309', subcategories: ['Shuttering / Formwork Carpenter', 'Furniture / Woodwork Carpenter'] },
  { id: 'cat-electrician-labour', name: 'Electrician Labour', type: 'Labour', icon: 'Zap', color: '#ca8a04', subcategories: ['Wall Chasing & Piping', 'Wiring & DB Connection', 'Switch & Fixture Fitting'] },
  { id: 'cat-plumber-labour', name: 'Plumber Labour', type: 'Labour', icon: 'Droplet', color: '#1d4ed8', subcategories: ['Concealed Piping Work', 'Drainage & Sewer Line', 'Fixture & Sanitary Installation'] },
  { id: 'cat-painter-labour', name: 'Painter Labour', type: 'Labour', icon: 'Brush', color: '#7e22ce', subcategories: ['Putty & Sanding Labour', 'Primer & Paint Application', 'Wood Polishing Labour'] },

  // Services & Fees
  { id: 'cat-contractor', name: 'Contractor Payment', type: 'Contractor', icon: 'Briefcase', color: '#334155', subcategories: ['Turnkey Civil Contract', 'Labour-only Contract', 'Centering/Shuttering Contract'] },
  { id: 'cat-arch-fees', name: 'Architect & Engineer Fees', type: 'Service', icon: 'Compass', color: '#0284c7', subcategories: ['Architect Architectural Drawings', 'Structural Engineer Design & Stamp', 'Site Supervision Fees', '3D Elevation Design'] },
  { id: 'cat-govt-fees', name: 'Government Fees & Approvals', type: 'Other', icon: 'FileText', color: '#4b5563', subcategories: ['Municipal Building Sanction', 'Gram Panchayat NOC', 'Electricity Temporary/Permanent Meter', 'Water & Drainage Connection', 'Property Tax / Mutation'] },
  { id: 'cat-transport', name: 'Machinery & Transport', type: 'Other', icon: 'Truck', color: '#d97706', subcategories: ['JCB / Excavator Rental', 'Tractor / Dumper Transport', 'Concrete Mixer Machine', 'Water Tanker Supply', 'Crane / Hoist Rental'] },
  { id: 'cat-misc', name: 'Miscellaneous', type: 'Other', icon: 'MoreHorizontal', color: '#64748b', subcategories: ['Bhoomi Pujan / Rituals', 'Site Security & Watchman', 'Temporary Shed & Toilet', 'Tea / Snacks for Labour', 'Site Cleaning & Debris Removal'] },
];

export const PAYMENT_METHODS = ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Credit', 'Other'];
export const PAYMENT_STATUSES = ['Paid', 'Partially Paid', 'Pending'];
export const WORKER_TYPES = ['Mason', 'Helper', 'Carpenter', 'Electrician', 'Plumber', 'Painter', 'Centering Worker', 'Welder', 'Other'];
export const FUNDING_SOURCES = ['Personal Savings', 'Home Loan', 'Family Contribution', 'Sale of Asset', 'Other'];
export const DOCUMENT_CATEGORIES = [
  'House Plan & Blueprints',
  'Government Approvals & Sanctions',
  'Contractor Agreement',
  'Engineer Structural Drawings',
  'Cost Estimate & BOQ',
  'Loan Documents & Sanction Letter',
  'Property & Land Title Documents',
  'Electricity & Water Connection Receipts',
  'Material Test Certificates',
  'Other Documents'
];
