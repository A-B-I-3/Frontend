// Carried over from the original flat registration forms in App.tsx. Still placeholder
// data (English-only, not localized) — replace with your real taxonomy, ideally served
// from the backend, once available.

export const educationLevels = ['Primary', 'Secondary', 'Certificate', 'Diploma', "Bachelor's", "Master's", 'PhD']

export const experienceRanges = ['0-1', '1-3', '3-5', '5-10', '10+']

export const sectorProfessionMap: Record<string, string[]> = {
  technology: ['Software Engineer', 'Product Designer', 'Data Analyst', 'Cybersecurity Analyst', 'QA Engineer'],
  healthcare: ['Nurse', 'Clinical Officer', 'Pharmacist', 'Lab Technician', 'Public Health Specialist'],
  finance: ['Accountant', 'Financial Analyst', 'Banking Officer', 'Auditor', 'Operations Manager'],
  education: ['Teacher', 'Academic Advisor', 'Curriculum Developer', 'School Administrator', 'Research Assistant'],
  construction: ['Civil Engineer', 'Site Supervisor', 'Architect', 'Quantity Surveyor', 'Project Engineer'],
  agriculture: ['Agronomist', 'Farm Manager', 'Agricultural Extension Officer', 'Food Safety Officer', 'Irrigation Technician'],
}

export const skillMap: Record<string, string[]> = {
  technology: ['JavaScript', 'Python', 'SQL', 'UI/UX', 'Project Management'],
  healthcare: ['Patient Care', 'Clinical Support', 'Data Entry', 'Health Records', 'Communication'],
  finance: ['Excel', 'Budgeting', 'Risk Analysis', 'Auditing', 'Financial Reporting'],
  education: ['Curriculum Design', 'Teaching', 'Assessment', 'Mentorship', 'Research'],
  construction: ['AutoCAD', 'Site Planning', 'Safety Compliance', 'Project Coordination', 'Quantity Estimation'],
  agriculture: ['Crop Management', 'Agribusiness', 'Soil Testing', 'Farm Planning', 'Extension Support'],
}

export const subscriptionPlans = [
  { id: 'monthly', labelKey: 'wizard.subscription.monthly' },
  { id: 'quarterly', labelKey: 'wizard.subscription.quarterly' },
  { id: 'annual', labelKey: 'wizard.subscription.annual' },
]
