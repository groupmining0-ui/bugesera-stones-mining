// Content taken from the BUGESERA STONEWORKS LTD business plan.
export const company = {
  name: "Bugesera Stoneworks Ltd",
  slogan: "From Natural Stone to Quality Construction",
  location: "Bugesera District, Eastern Province, Rwanda",
  vision:
    "To be one of the strongest stone industries in Rwanda and East Africa, from quarrying to finished construction materials.",
  mission:
    "To supply quality construction materials at competitive prices, using modern technology and adding value to natural resources.",
  phone: "+250 796 893 372",
  email: "new.antomix@gmail.com",
  whatsapp: "250796893372",
  whatsappAlternate: "+971 52 387 0096",
};

export type Category = {
  key: "BUILDING_STONE" | "MACHINE_CUT" | "AGGREGATE" | "MANUFACTURED_SAND" | "SPECIALTY" | "CONCRETE_PRODUCT";
  label: string;
  blurb: string;
  items: string[];
  phase: 1 | 2 | 3;
  gallery?: string[];
};

export const categories: Category[] = [
  {
    key: "BUILDING_STONE",
    label: "Building stones",
    blurb: "Undressed and hand- or machine-dressed stone for walls, foundations and decorative facing.",
    items: ["Undressed building stone", "Dressed building stone", "Wall stone in mixed sizes", "Large foundation stone", "Decorative stone"],
    phase: 1,
    gallery: ["/hero/stone-1.webp", "/hero/stone-2.jpg", "/hero/stone-3.jpg"],
  },
  {
    key: "MACHINE_CUT",
    label: "Machine-cut stones",
    blurb: "Cut to your size: standard building sizes, facing stones and custom orders.",
    items: ["Standard building sizes", "Facing stones", "Wall-section stones", "Custom-cut to order"],
    phase: 2,
    gallery: ["/hero/stone-3.jpg", "/hero/stone-4.webp", "/hero/stone-5.jpg"],
  },
  {
    key: "AGGREGATE",
    label: "Aggregates",
    blurb: "Crushed and screened material for concrete, roads and slope protection. Final grades follow lab tests and RSB standards.",
    items: ["Stone dust", "Fine aggregates", "5–10 mm gravel", "10–20 mm gravel", "20–40 mm gravel", "Gabion stones", "Road base material"],
    phase: 1,
    gallery: ["/hero/stone-5.jpg", "/hero/stone-1.webp", "/hero/stone-2.jpg"],
  },
  {
    key: "MANUFACTURED_SAND",
    label: "Manufactured sand",
    blurb: "Washed M-sand made at the crusher for concrete, masonry, paving blocks and finishing work.",
    items: ["Concrete sand", "Masonry sand", "Paving-block sand", "Finishing sand"],
    phase: 2,
    gallery: ["/hero/stone-2.jpg", "/hero/stone-4.webp", "/hero/stone-3.jpg"],
  },
  {
    key: "SPECIALTY",
    label: "Finished stone products",
    blurb: "Higher-value products for roads, landscaping and building exteriors.",
    items: ["Stone tiles", "Kerbstones", "Cobblestones", "Wall cladding", "Stone slabs", "Stone steps", "Window sills", "Stone paving", "Gabion filling stones"],
    phase: 3,
    gallery: ["/hero/stone-4.webp", "/hero/stone-5.jpg", "/hero/stone-1.webp"],
  },
  {
    key: "CONCRETE_PRODUCT",
    label: "Concrete products",
    blurb: "A later expansion that adds concrete machinery to the quarry.",
    items: ["Concrete blocks", "Paving blocks", "Concrete kerbs", "Precast products", "Drainage channels"],
    phase: 3,
    gallery: ["/hero/stone-1.webp", "/hero/stone-3.jpg", "/hero/stone-5.jpg"],
  },
];

export const aggregates = [
  { name: "Stone dust", use: "Concrete, paving and building works", size: "0–6 mm" },
  { name: "Fine aggregates", use: "Concrete and general works", size: "to be set by lab" },
  { name: "5–10 mm gravel", use: "Concrete and specialist works", size: "5–10 mm" },
  { name: "10–20 mm gravel", use: "Concrete and construction", size: "10–20 mm" },
  { name: "20–40 mm gravel", use: "Roads and foundation works", size: "20–40 mm" },
  { name: "Gabion stones", use: "Slope protection and retaining walls", size: "on request" },
  { name: "Road base material", use: "Road construction and maintenance", size: "on request" },
];

export const equipment = [
  { name: "Excavator", job: "Digs and loads stone", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80" },
  { name: "Wheel loader", job: "Loads stone into trucks", image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=900&q=80" },
  { name: "Jaw crusher", job: "Breaks large stone", image: "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=900&q=80" },
  { name: "Cone / impact crusher", job: "Reduces stone to graded sizes", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80" },
  { name: "Vibrating screen", job: "Separates stone by size", image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80" },
  { name: "Conveyor belts", job: "Moves stone through the plant", image: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=900&q=80" },
  { name: "Stone cutting machine", job: "Cuts and dresses building stone", image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=900&q=80" },
  { name: "Stone polishing machine", job: "Finishes and smooths stone", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80" },
  { name: "Sand washing machine", job: "Cleans manufactured sand", image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=900&q=80" },
  { name: "Water pump", job: "Supplies plant water", image: "https://images.unsplash.com/photo-1581092160607-ee22731cc3e1?auto=format&fit=crop&w=900&q=80" },
  { name: "Weighbridge", job: "Weighs trucks and products", image: "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=900&q=80" },
  { name: "Dump trucks", job: "Deliver to customers", image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80" },
];

export const process = [
  { title: "Geological survey", text: "Test the rock to confirm type and quality at the site." },
  { title: "Extraction", text: "Quarry the stone to an approved plan." },
  { title: "Primary crushing", text: "Break large stone down." },
  { title: "Screening", text: "Separate stone by size." },
  { title: "Stone cutting", text: "Cut building stone to size." },
  { title: "Sand production", text: "Wash and grade manufactured sand." },
  { title: "Quality control", text: "Test every product." },
  { title: "Stocking", text: "Prepare and store product." },
  { title: "Sales and delivery", text: "Weigh, load and deliver to the customer." },
];

export const phases = [
  {
    title: "Phase 1: Quarry establishment",
    points: ["Geological survey", "Feasibility study", "Secure licences", "Start quarrying and selling undressed stone", "Install crusher and screening plant"],
  },
  {
    title: "Phase 2: Industrial processing",
    points: ["Install stone-cutting machines", "Produce cut stone", "Produce gravel and sand", "Add sand washing and grading", "Grow customers and capacity"],
  },
  {
    title: "Phase 3: Advanced stone manufacturing",
    points: ["Make stone tiles", "Make cobblestones and kerbstones", "Make decorative stones", "Make paving blocks and concrete products", "Expand across Rwanda and the region"],
  },
];

export const customers = [
  "House-building companies",
  "Road contractors",
  "General contractors",
  "Private home builders",
  "Building-material dealers",
  "Concrete producers",
  "Paving-block makers",
  "Housing developers",
  "Public and private infrastructure bodies",
];

export const edge = [
  "Measured, quality-checked products",
  "Clear prices for every product",
  "Delivery to your site",
  "Large and small orders",
  "Long-term contracts for construction firms",
  "Orders by WhatsApp, website and social media",
];

export const risks = [
  { risk: "Stone below required quality", fix: "Geological survey and laboratory testing" },
  { risk: "Machine breakdowns", fix: "Maintenance plan and spare parts" },
  { risk: "Losing customers", fix: "Contracts with construction firms" },
  { risk: "Rising fuel prices", fix: "Close control of production costs" },
  { risk: "Dust and noise", fix: "Dust suppression and noise management" },
  { risk: "Accidents", fix: "PPE, training and safety procedures" },
  { risk: "Rain flooding the pit", fix: "Drainage system" },
  { risk: "Unsold surplus", fix: "Quarry and process to match demand" },
];

export const staffing = [
  ["Managing Director", 1],
  ["Operations Manager", 1],
  ["Mining / Quarry Engineer", 1],
  ["Geologist", 1],
  ["Accountant / Finance Officer", 1],
  ["Sales & Marketing Officers", 2],
  ["Machine Operators", 4],
  ["Drivers", 3],
  ["Maintenance Technicians", 2],
  ["Safety & Environmental Officer", 1],
  ["General Workers", 8],
  ["Security Personnel", 2],
] as const;

export const licensing = [
  "Register the company with RDB",
  "Confirm the quarry licence type needed",
  "Complete geological survey and feasibility study",
  "Prepare and get approval for the Environmental and Social Impact Assessment (ESIA)",
  "Write the quarry development plan",
  "Plan environmental protection and land rehabilitation",
  "Plan worker safety",
  "Meet insurance, tax and legal requirements",
  "Set up record-keeping and reporting",
];

export const careerRoles = [
  {
    title: "Quarry and mining operators",
    text: "Operate extraction, loading and dump workflows safely while keeping production moving on schedule.",
  },
  {
    title: "Crusher and screening technicians",
    text: "Maintain plant outputs, monitor grades, and keep every batch aligned with customer specifications.",
  },
  {
    title: "Stone cutting and finishing team",
    text: "Prepare machine-cut stone, wall blocks and finishing products with precision and quality checks.",
  },
  {
    title: "Health, safety and environment",
    text: "Support safe working methods, dust control, inspections and site compliance for every shift.",
  },
  {
    title: "Sales and logistics",
    text: "Manage supplier and customer relationships, deliveries, order planning and after-sales coordination.",
  },
];

export const useOfFunds = [
  ["Land & site preparation", "Land, site preparation and access roads"],
  ["Geological studies", "Rock surveys and testing"],
  ["Licensing & compliance", "Permits and statutory requirements"],
  ["Quarry development", "Preparing the quarry"],
  ["Crushing plant", "Stone crushing equipment"],
  ["Stone cutting plant", "Stone cutting equipment"],
  ["Transport equipment", "Trucks and loaders"],
  ["Utilities", "Water, power and infrastructure"],
  ["Buildings & offices", "Offices, stores and workshops"],
  ["Working capital", "Wages, fuel and spare parts"],
  ["Contingency", "Reserve funds"],
] as const;
