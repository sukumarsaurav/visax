-- ============================================
-- VISAX - Seed Data (matches live DB)
-- Applied via dashboard migration 20260509192614
-- ============================================

-- ============================================
-- PLATFORM SETTINGS
-- ============================================
-- These 5 rows are the only seeded data in the live DB.
-- Tables like countries, visa_types, expertise_areas, and
-- subscription_plans from the design-time schema do NOT
-- exist in the deployed database.

INSERT INTO platform_settings (key, value, description) VALUES
    ('platform_name',    '"Visax"',                              'Platform display name'),
    ('support_email',    '"support@visax.com"',                  'Support contact email'),
    ('platform_fee',     '10',                                   'Platform fee percentage on transactions'),
    ('maintenance_mode', 'false',                                'Toggle maintenance mode'),
    ('stripe_enabled',   'true',                                 'Whether Stripe payments are active')
ON CONFLICT (key) DO NOTHING;
