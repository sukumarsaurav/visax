-- ============================================
-- VISAX Immigration Marketplace - Seed Data
-- Version: 1.0.0
-- ============================================

-- ============================================
-- COUNTRIES
-- ============================================

INSERT INTO countries (code, name, flag_emoji, phone_code, is_origin, is_destination) VALUES
-- Major destination countries
('US', 'United States', '🇺🇸', '+1', false, true),
('CA', 'Canada', '🇨🇦', '+1', false, true),
('UK', 'United Kingdom', '🇬🇧', '+44', false, true),
('AU', 'Australia', '🇦🇺', '+61', false, true),
('DE', 'Germany', '🇩🇪', '+49', false, true),
('FR', 'France', '🇫🇷', '+33', false, true),
('NZ', 'New Zealand', '🇳🇿', '+64', false, true),
('IE', 'Ireland', '🇮🇪', '+353', false, true),
('NL', 'Netherlands', '🇳🇱', '+31', false, true),
('SG', 'Singapore', '🇸🇬', '+65', false, true),
('AE', 'United Arab Emirates', '🇦🇪', '+971', false, true),

-- Major origin countries
('IN', 'India', '🇮🇳', '+91', true, false),
('CN', 'China', '🇨🇳', '+86', true, false),
('MX', 'Mexico', '🇲🇽', '+52', true, true),
('BR', 'Brazil', '🇧🇷', '+55', true, false),
('PH', 'Philippines', '🇵🇭', '+63', true, false),
('NG', 'Nigeria', '🇳🇬', '+234', true, false),
('PK', 'Pakistan', '🇵🇰', '+92', true, false),
('BD', 'Bangladesh', '🇧🇩', '+880', true, false),
('VN', 'Vietnam', '🇻🇳', '+84', true, false),
('EG', 'Egypt', '🇪🇬', '+20', true, false),
('CO', 'Colombia', '🇨🇴', '+57', true, false),
('KR', 'South Korea', '🇰🇷', '+82', true, true),
('JP', 'Japan', '🇯🇵', '+81', true, true),
('TR', 'Turkey', '🇹🇷', '+90', true, false),
('IR', 'Iran', '🇮🇷', '+98', true, false),
('SA', 'Saudi Arabia', '🇸🇦', '+966', true, false),
('VE', 'Venezuela', '🇻🇪', '+58', true, false);

-- ============================================
-- VISA TYPES - USA
-- ============================================

INSERT INTO visa_types (country_id, code, name, category, description) VALUES
((SELECT id FROM countries WHERE code = 'US'), 'H1B', 'H-1B Specialty Occupation', 'Work', 'For workers in specialty occupations requiring a bachelor''s degree or higher'),
((SELECT id FROM countries WHERE code = 'US'), 'H1B1', 'H-1B1 Free Trade Agreement', 'Work', 'For nationals of Chile and Singapore'),
((SELECT id FROM countries WHERE code = 'US'), 'L1A', 'L-1A Intracompany Transfer (Manager)', 'Work', 'For managers and executives transferred within a company'),
((SELECT id FROM countries WHERE code = 'US'), 'L1B', 'L-1B Intracompany Transfer (Specialized)', 'Work', 'For employees with specialized knowledge'),
((SELECT id FROM countries WHERE code = 'US'), 'O1', 'O-1 Extraordinary Ability', 'Work', 'For individuals with extraordinary ability in sciences, arts, education, business, or athletics'),
((SELECT id FROM countries WHERE code = 'US'), 'EB1', 'EB-1 Priority Worker', 'Work', 'Employment-based first preference for priority workers'),
((SELECT id FROM countries WHERE code = 'US'), 'EB2', 'EB-2 Advanced Degree', 'Work', 'Employment-based second preference for advanced degree professionals'),
((SELECT id FROM countries WHERE code = 'US'), 'EB3', 'EB-3 Skilled Workers', 'Work', 'Employment-based third preference for skilled workers'),
((SELECT id FROM countries WHERE code = 'US'), 'F1', 'F-1 Student Visa', 'Student', 'For academic studies at an accredited institution'),
((SELECT id FROM countries WHERE code = 'US'), 'J1', 'J-1 Exchange Visitor', 'Student', 'For approved exchange programs'),
((SELECT id FROM countries WHERE code = 'US'), 'M1', 'M-1 Vocational Student', 'Student', 'For vocational or non-academic studies'),
((SELECT id FROM countries WHERE code = 'US'), 'K1', 'K-1 Fiancé(e) Visa', 'Family', 'For fiancé(e)s of U.S. citizens'),
((SELECT id FROM countries WHERE code = 'US'), 'K3', 'K-3 Spouse Visa', 'Family', 'For spouses of U.S. citizens awaiting immigrant visa'),
((SELECT id FROM countries WHERE code = 'US'), 'IR1', 'IR-1 Immediate Relative Spouse', 'Family', 'For spouses of U.S. citizens'),
((SELECT id FROM countries WHERE code = 'US'), 'CR1', 'CR-1 Conditional Resident Spouse', 'Family', 'For spouses married less than 2 years'),
((SELECT id FROM countries WHERE code = 'US'), 'B1', 'B-1 Business Visitor', 'Tourist', 'For business-related activities'),
((SELECT id FROM countries WHERE code = 'US'), 'B2', 'B-2 Tourist Visa', 'Tourist', 'For tourism, pleasure, or medical treatment'),
((SELECT id FROM countries WHERE code = 'US'), 'EB5', 'EB-5 Investor Visa', 'Investment', 'For investors creating U.S. jobs');

-- ============================================
-- VISA TYPES - CANADA
-- ============================================

INSERT INTO visa_types (country_id, code, name, category, description) VALUES
((SELECT id FROM countries WHERE code = 'CA'), 'EE-FSW', 'Express Entry - Federal Skilled Worker', 'Work', 'For skilled workers with foreign work experience'),
((SELECT id FROM countries WHERE code = 'CA'), 'EE-FST', 'Express Entry - Federal Skilled Trades', 'Work', 'For qualified tradespeople'),
((SELECT id FROM countries WHERE code = 'CA'), 'EE-CEC', 'Express Entry - Canadian Experience Class', 'Work', 'For individuals with Canadian work experience'),
((SELECT id FROM countries WHERE code = 'CA'), 'PNP', 'Provincial Nominee Program', 'Work', 'Nomination by a Canadian province or territory'),
((SELECT id FROM countries WHERE code = 'CA'), 'LMIA', 'LMIA Work Permit', 'Work', 'Work permit requiring Labour Market Impact Assessment'),
((SELECT id FROM countries WHERE code = 'CA'), 'IEC', 'International Experience Canada', 'Work', 'Working holiday, internship, or young professional programs'),
((SELECT id FROM countries WHERE code = 'CA'), 'STUDY', 'Study Permit', 'Student', 'For studying at designated learning institutions'),
((SELECT id FROM countries WHERE code = 'CA'), 'PGWP', 'Post-Graduation Work Permit', 'Work', 'For international graduates of Canadian institutions'),
((SELECT id FROM countries WHERE code = 'CA'), 'SPOUSE', 'Spousal Sponsorship', 'Family', 'For sponsoring spouse or common-law partner'),
((SELECT id FROM countries WHERE code = 'CA'), 'PARENT', 'Parent/Grandparent Sponsorship', 'Family', 'For sponsoring parents and grandparents'),
((SELECT id FROM countries WHERE code = 'CA'), 'VISITOR', 'Visitor Visa', 'Tourist', 'For temporary visits to Canada'),
((SELECT id FROM countries WHERE code = 'CA'), 'SUV', 'Start-up Visa', 'Investment', 'For entrepreneurs with a qualifying business');

-- ============================================
-- VISA TYPES - UK
-- ============================================

INSERT INTO visa_types (country_id, code, name, category, description) VALUES
((SELECT id FROM countries WHERE code = 'UK'), 'SWV', 'Skilled Worker Visa', 'Work', 'For workers with a job offer from a licensed sponsor'),
((SELECT id FROM countries WHERE code = 'UK'), 'GTV', 'Global Talent Visa', 'Work', 'For leaders or potential leaders in academia, arts, or tech'),
((SELECT id FROM countries WHERE code = 'UK'), 'ICT', 'Intra-company Transfer', 'Work', 'For multinational company transfers'),
((SELECT id FROM countries WHERE code = 'UK'), 'STUDENT', 'Student Visa', 'Student', 'For studying at a licensed institution'),
((SELECT id FROM countries WHERE code = 'UK'), 'FAMILY', 'Family Visa', 'Family', 'For joining family members in the UK'),
((SELECT id FROM countries WHERE code = 'UK'), 'SVV', 'Standard Visitor Visa', 'Tourist', 'For tourism, business, or short-term studies'),
((SELECT id FROM countries WHERE code = 'UK'), 'INNOVATOR', 'Innovator Founder Visa', 'Investment', 'For experienced businesspeople with an innovative idea');

-- ============================================
-- VISA TYPES - AUSTRALIA
-- ============================================

INSERT INTO visa_types (country_id, code, name, category, description) VALUES
((SELECT id FROM countries WHERE code = 'AU'), '189', 'Skilled Independent Visa (189)', 'Work', 'Points-tested permanent residence without sponsorship'),
((SELECT id FROM countries WHERE code = 'AU'), '190', 'Skilled Nominated Visa (190)', 'Work', 'Points-tested visa with state/territory nomination'),
((SELECT id FROM countries WHERE code = 'AU'), '491', 'Skilled Work Regional (491)', 'Work', 'For living and working in regional Australia'),
((SELECT id FROM countries WHERE code = 'AU'), '482', 'Temporary Skill Shortage (482)', 'Work', 'Employer-sponsored temporary work visa'),
((SELECT id FROM countries WHERE code = 'AU'), '500', 'Student Visa (500)', 'Student', 'For full-time study in Australia'),
((SELECT id FROM countries WHERE code = 'AU'), '485', 'Graduate Visa (485)', 'Work', 'Post-study work rights for graduates'),
((SELECT id FROM countries WHERE code = 'AU'), '820', 'Partner Visa (820/801)', 'Family', 'For partners of Australian citizens/residents'),
((SELECT id FROM countries WHERE code = 'AU'), '600', 'Visitor Visa (600)', 'Tourist', 'For tourism or business visits'),
((SELECT id FROM countries WHERE code = 'AU'), '188', 'Business Innovation (188)', 'Investment', 'For business owners and investors');

-- ============================================
-- EXPERTISE AREAS
-- ============================================

INSERT INTO expertise_areas (name, category, icon) VALUES
-- Work visas
('Skilled Worker Visa', 'Work', 'work'),
('H-1B Visa', 'Work', 'badge'),
('L-1 Transfer', 'Work', 'swap_horiz'),
('O-1 Extraordinary Ability', 'Work', 'stars'),
('EB-1/EB-2/EB-3 Green Card', 'Work', 'card_membership'),
('Express Entry', 'Work', 'flight_takeoff'),
('Provincial Nominee Program', 'Work', 'location_on'),
('Work Permits', 'Work', 'assignment_ind'),

-- Family immigration
('Family Sponsorship', 'Family', 'family_restroom'),
('Spousal Sponsorship', 'Family', 'favorite'),
('Fiancé Visa (K-1)', 'Family', 'favorite_border'),
('Parent Sponsorship', 'Family', 'elderly'),
('Child Immigration', 'Family', 'child_care'),

-- Student visas
('Student Visa', 'Student', 'school'),
('F-1/OPT/CPT', 'Student', 'menu_book'),
('Post-Graduate Work Permit', 'Student', 'graduation_cap'),
('Exchange Programs', 'Student', 'sync_alt'),

-- Business & Investment
('Investment Immigration', 'Investment', 'account_balance'),
('EB-5 Investor Visa', 'Investment', 'attach_money'),
('Start-up Visa', 'Investment', 'rocket_launch'),
('Business Visa', 'Investment', 'business_center'),

-- Citizenship & Other
('Citizenship & Naturalization', 'Citizenship', 'flag'),
('Asylum & Refugee Protection', 'Humanitarian', 'shield'),
('DACA/Dreamers', 'Humanitarian', 'brightness_5'),
('Deportation Defense', 'Legal', 'gavel'),
('Appeals & Waivers', 'Legal', 'article'),
('Document Preparation', 'Services', 'description');

-- ============================================
-- SERVICE TYPES
-- ============================================

INSERT INTO service_types (name, icon, description) VALUES
('Visa Application', 'badge', 'Complete visa application assistance from start to finish'),
('Consultation', 'chat', 'Professional advice and case assessment'),
('Document Review', 'fact_check', 'Review and verification of immigration documents'),
('Application Preparation', 'edit_document', 'Preparation and filing of immigration applications'),
('Full Representation', 'support_agent', 'Complete legal representation throughout the process'),
('Citizenship Application', 'flag', 'Naturalization and citizenship applications'),
('Asylum Services', 'shield', 'Asylum applications and refugee protection'),
('Family Immigration', 'family_restroom', 'Family-based immigration services'),
('Work Authorization', 'work', 'Work permit and employment authorization'),
('Appeal Services', 'gavel', 'Immigration appeals and motion services'),
('Translation Services', 'translate', 'Certified document translation'),
('Interview Preparation', 'record_voice_over', 'Preparation for visa interviews');

-- ============================================
-- SUBSCRIPTION PLANS
-- ============================================

-- Individual Plans
INSERT INTO subscription_plans (name, plan_type, price, billing_period, features, max_cases_per_month, max_team_members, sort_order) VALUES
('Free', 'individual', 0, 'monthly', 
 '["Up to 5 active cases", "Basic client messaging", "Standard support", "Basic analytics"]',
 5, 0, 1),
('Professional', 'individual', 49, 'monthly',
 '["Up to 25 active cases", "Priority messaging", "Advanced analytics", "Document templates", "Calendar sync", "Priority support"]',
 25, 0, 2),
('Expert', 'individual', 99, 'monthly',
 '["Unlimited cases", "Premium analytics", "Custom branding", "API access", "Dedicated support", "Featured listing"]',
 -1, 0, 3);

-- Agency Plans
INSERT INTO subscription_plans (name, plan_type, price, billing_period, features, max_cases_per_month, max_team_members, sort_order) VALUES
('Starter Agency', 'agency', 199, 'monthly',
 '["Up to 3 team members", "50 cases per month", "Team dashboard", "Basic analytics", "Email support"]',
 50, 3, 4),
('Growth Agency', 'agency', 399, 'monthly',
 '["Up to 10 team members", "150 cases per month", "Advanced team management", "Custom workflows", "Priority support", "White-label options"]',
 150, 10, 5),
('Enterprise Agency', 'agency', 799, 'monthly',
 '["Unlimited team members", "Unlimited cases", "Enterprise SSO", "Dedicated account manager", "Custom integrations", "SLA guarantee", "On-site training"]',
 -1, -1, 6);

-- ============================================
-- PLATFORM SETTINGS
-- ============================================

INSERT INTO platform_settings (key, value, description) VALUES
('platform_name', '"Visax"', 'Platform name'),
('platform_tagline', '"Your Immigration Journey, Simplified"', 'Platform tagline'),
('support_email', '"support@visax.com"', 'Support email address'),
('free_consultation_minutes', '15', 'Free consultation time for new clients'),
('platform_fee_percent', '10', 'Platform fee percentage on transactions'),
('min_hourly_rate', '50', 'Minimum hourly rate for consultants'),
('max_hourly_rate', '500', 'Maximum hourly rate for consultants'),
('appointment_buffer_minutes', '15', 'Buffer time between appointments'),
('cancellation_hours', '24', 'Hours before appointment for free cancellation'),
('default_currency', '"USD"', 'Default currency for pricing'),
('stripe_enabled', 'true', 'Whether Stripe payments are enabled'),
('maintenance_mode', 'false', 'Platform maintenance mode');
