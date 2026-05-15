const BASE = 'https://immizy.in'

// ─── Reusable schema fragments ─────────────────────────────────────────────

export const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Immizy',
    url: BASE,
    logo: `${BASE}/favicon.svg`,
    sameAs: [],
    contactPoint: {
        '@type': 'ContactPoint',
        email: 'support@immizy.in',
        contactType: 'customer support',
    },
}

export const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Immizy',
    url: BASE,
    potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${BASE}/find-professionals?q={search_term_string}` },
        'query-input': 'required name=search_term_string',
    },
}

// ─── Page-level SEO configs ────────────────────────────────────────────────

export const SEO = {
    home: {
        title: 'Best Immigration Consultant in India | Verified Experts — Immizy',
        description: 'Find India\'s top verified immigration consultants for Canada PR, Australia PR, UK, Germany & more. Compare reviews, book consultations and track your case — all on Immizy.',
        schema: {
            '@context': 'https://schema.org',
            '@graph': [orgSchema, websiteSchema],
        },
    },

    findProfessionals: {
        title: 'Find Verified Immigration Consultant Near Me | Immizy',
        description: 'Search 500+ verified immigration consultants and agencies across India. Filter by visa type, city, language and reviews. Trusted immigration help — Canada PR, Australia, UK & more.',
    },

    about: {
        title: 'About Immizy | Trusted Immigration Consultant Platform India',
        description: 'Immizy is India\'s verified immigration consultant marketplace. Learn how we vet every professional and make quality immigration guidance accessible to everyone.',
    },

    pricing: {
        title: 'Immigration CRM & Agency Software Pricing | Immizy',
        description: 'Flexible plans for individual immigration consultants and agencies. Get case management, client CRM, invoicing, and lead tools — built for immigration professionals in India.',
        schema: {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: 'Immizy Professional Platform',
            description: 'Immigration CRM and case management software for consultants and agencies in India.',
            brand: { '@type': 'Brand', name: 'Immizy' },
            offers: [
                { '@type': 'Offer', name: 'Starter', price: '0', priceCurrency: 'INR', availability: 'https://schema.org/InStock' },
                { '@type': 'Offer', name: 'Pro', priceCurrency: 'INR', availability: 'https://schema.org/InStock' },
                { '@type': 'Offer', name: 'Agency', priceCurrency: 'INR', availability: 'https://schema.org/InStock' },
            ],
        },
    },

    support: {
        title: 'Immigration Help Center & Support | Immizy',
        description: 'Get answers to common immigration questions. Contact Immizy support for help with finding verified consultants, case tracking, appointments, and more.',
        schema: {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
                {
                    '@type': 'Question',
                    name: 'How do I find a verified immigration consultant in India?',
                    acceptedAnswer: { '@type': 'Answer', text: 'Use Immizy\'s search to filter by city, visa type, language, and reviews. All listed consultants are verified with credentials checked.' },
                },
                {
                    '@type': 'Question',
                    name: 'How do I check if an immigration consultant is verified?',
                    acceptedAnswer: { '@type': 'Answer', text: 'Every consultant on Immizy displays their registration number, credentials, and a verified badge after our manual vetting process.' },
                },
                {
                    '@type': 'Question',
                    name: 'What is the difference between an immigration consultant and an immigration lawyer?',
                    acceptedAnswer: { '@type': 'Answer', text: 'Immigration consultants are licensed practitioners who help with visa applications and paperwork. Immigration lawyers (advocates) can also represent you in legal proceedings. Both are available on Immizy.' },
                },
                {
                    '@type': 'Question',
                    name: 'How much does an immigration consultant charge in India?',
                    acceptedAnswer: { '@type': 'Answer', text: 'Fees vary by consultant, visa type, and complexity. Use Immizy to compare transparent pricing from multiple verified consultants before booking.' },
                },
            ],
        },
    },

    privacy: {
        title: 'Privacy Policy | Immizy',
        description: 'How Immizy collects, uses, and protects your personal data. Your privacy is fundamental to how we build our platform.',
    },

    terms: {
        title: 'Terms of Service | Immizy',
        description: 'Immizy Terms of Service governing your use of the platform, consultant relationships, payments, and intellectual property.',
    },

    login: {
        title: 'Sign In to Your Immizy Account',
        description: 'Log in to Immizy to manage your immigration cases, appointments, documents, and consultations.',
    },

    register: {
        title: 'Create Your Immizy Account | Start Your Immigration Journey',
        description: 'Sign up to connect with verified immigration consultants, track your case progress, and manage all your immigration documents in one place.',
    },

    professionalWelcome: {
        title: 'List Your Immigration Consultancy Online | Get Visa Clients | Immizy',
        description: 'Join 500+ verified immigration consultants on Immizy. Get leads, manage cases, and grow your practice with the #1 immigration consultant platform in India.',
    },

    services: {
        title: 'Immigration Services Directory India | Visa Types & Consultants',
        description: 'Browse all immigration services on Immizy — Canada PR, Australia PR, UK skilled worker, Germany job seeker visa, student visas, and more. Find expert help for every visa type.',
    },
}

// ─── City SEO configs ──────────────────────────────────────────────────────

export const CITIES = {
    delhi: {
        slug: 'delhi',
        name: 'Delhi',
        fullName: 'New Delhi',
        title: 'Immigration Consultant in Delhi | Best Verified Experts — Immizy',
        description: 'Find the best verified immigration consultants in Delhi. Compare ratings, specializations and fees for Canada PR, Australia PR, UK, USA and more. Book a consultation today.',
        h1: 'Immigration Consultants in Delhi',
        intro: 'Delhi is India\'s top hub for immigration services, with thousands applying for Canada PR, Australian skilled migration, and UK visas every year. Immizy lists only verified, credential-checked consultants across New Delhi, Dwarka, Rohini, and surrounding NCR areas.',
        topVisas: ['Canada PR', 'Australia PR', 'UK Skilled Worker', 'USA H-1B', 'Student Visa'],
    },
    mumbai: {
        slug: 'mumbai',
        name: 'Mumbai',
        fullName: 'Mumbai',
        title: 'Immigration Consultant in Mumbai | Verified Experts — Immizy',
        description: 'Top-rated verified immigration consultants in Mumbai for Canada PR, Australia, UK and more. Compare profiles, read reviews and book a consultation on Immizy.',
        h1: 'Immigration Consultants in Mumbai',
        intro: 'Mumbai is one of India\'s largest sources of skilled immigration applicants. From Bandra to Andheri and Navi Mumbai, Immizy connects you with MARA-aware, ICCRC-familiar consultants who specialise in your visa category.',
        topVisas: ['Canada PR', 'Australia PR', 'UK Skilled Worker', 'Portugal D7', 'Student Visa'],
    },
    bangalore: {
        slug: 'bangalore',
        name: 'Bangalore',
        fullName: 'Bengaluru',
        title: 'Immigration Consultant in Bangalore | Canada & Australia PR Experts',
        description: 'Verified immigration consultants in Bangalore specialising in Canada Express Entry, Australia skilled migration, and Germany job seeker visas. Compare and book on Immizy.',
        h1: 'Immigration Consultants in Bangalore',
        intro: 'Bangalore\'s large IT professional base makes it India\'s fastest-growing source of Canada Express Entry and Australia skilled migration applicants. Immizy lists only verified immigration consultants serving Koramangala, Whitefield, HSR Layout and all of Bengaluru.',
        topVisas: ['Canada Express Entry', 'Australia PR', 'Germany Job Seeker', 'UK Skilled Worker', 'USA H-1B'],
    },
    hyderabad: {
        slug: 'hyderabad',
        name: 'Hyderabad',
        fullName: 'Hyderabad',
        title: 'Immigration Consultant in Hyderabad | Verified — Immizy',
        description: 'Find verified immigration consultants in Hyderabad for Canada PR, Australia PR, USA, UK and Germany visas. Read reviews and book on Immizy.',
        h1: 'Immigration Consultants in Hyderabad',
        intro: 'Hyderabad\'s booming tech sector is driving rapid growth in immigration applications. Immizy helps applicants in HITEC City, Gachibowli, and across the city connect with credential-verified consultants.',
        topVisas: ['Canada PR', 'Australia PR', 'USA H-1B', 'Germany Job Seeker', 'Student Visa'],
    },
    chennai: {
        slug: 'chennai',
        name: 'Chennai',
        fullName: 'Chennai',
        title: 'Immigration Consultant in Chennai | Australia & Canada Experts',
        description: 'Verified immigration consultants in Chennai specialising in Australia skilled migration, Canada PR, and UK visas. Compare profiles and book on Immizy.',
        h1: 'Immigration Consultants in Chennai',
        intro: 'Chennai has one of India\'s highest rates of Australia-bound skilled migration applicants. Immizy lists verified consultants across Anna Nagar, T. Nagar, and OMR who specialise in Australian subclass visas and Canada Express Entry.',
        topVisas: ['Australia PR', 'Canada PR', 'UK Skilled Worker', 'Student Visa', 'Germany Job Seeker'],
    },
    pune: {
        slug: 'pune',
        name: 'Pune',
        fullName: 'Pune',
        title: 'Immigration Consultant in Pune | Verified Experts — Immizy',
        description: 'Top immigration consultants in Pune for Canada Express Entry, Australia PR, and Germany job seeker visas. Find verified experts and book on Immizy.',
        h1: 'Immigration Consultants in Pune',
        intro: 'Pune\'s IT and engineering talent pool is increasingly looking at Canada, Germany, and Australia for skilled migration pathways. Immizy helps Punekars find verified, reviewed immigration consultants without the guesswork.',
        topVisas: ['Canada PR', 'Germany Job Seeker', 'Australia PR', 'UK Skilled Worker', 'Student Visa'],
    },
    ahmedabad: {
        slug: 'ahmedabad',
        name: 'Ahmedabad',
        fullName: 'Ahmedabad',
        title: 'Immigration Consultant in Ahmedabad | Trusted Experts — Immizy',
        description: 'Find trusted immigration consultants in Ahmedabad for Canada PR, UK, USA, and Australia visas. Verified professionals, real reviews — book on Immizy.',
        h1: 'Immigration Consultants in Ahmedabad',
        intro: 'Ahmedabad has a strong tradition of immigration to Canada, the UK, and the USA. Immizy connects applicants in Satellite, Navrangpura, and SG Highway with ICCRC-familiar, verified immigration consultants.',
        topVisas: ['Canada PR', 'UK Skilled Worker', 'USA Visa', 'Australia PR', 'Student Visa'],
    },
}

// ─── Destination country SEO configs ──────────────────────────────────────

export const DESTINATIONS = {
    'canada-pr': {
        slug: 'canada-pr',
        country: 'Canada',
        title: 'Canada PR Consultant India | Express Entry & PNP Experts — Immizy',
        description: 'Find verified Canada PR consultants in India specialising in Express Entry, PNP, and family sponsorship. Compare experts, read reviews and book on Immizy.',
        h1: 'Canada PR Consultants in India',
        subtitle: 'Express Entry · Provincial Nominee Program · Family Sponsorship',
        intro: 'Canada Permanent Residency is the most sought-after immigration pathway from India. Immizy lists ICCRC-familiar verified consultants who specialise in Express Entry CRS score optimisation, Provincial Nominee Programs (Ontario, BC, Alberta), and family class sponsorship.',
        programs: ['Express Entry (FSW, CEC, FST)', 'Provincial Nominee Program (PNP)', 'Family Sponsorship', 'Start-Up Visa', 'Atlantic Immigration Program'],
        faqs: [
            { q: 'What is the minimum CRS score for Canada Express Entry in 2026?', a: 'CRS cutoffs fluctuate with each draw. Recent draws have ranged from 470–530. A verified consultant can help you improve your CRS score through PNP nominations, additional language scores, and job offers.' },
            { q: 'How long does Canada PR processing take from India?', a: 'Express Entry typically takes 6 months after ITA. PNP streams vary from 12–18 months. A consultant helps you prepare a complete application to avoid delays.' },
            { q: 'Do I need a consultant for Canada Express Entry?', a: 'You can self-apply, but a verified consultant significantly improves your CRS score strategy and reduces errors that cause refusals.' },
        ],
    },
    'australia-pr': {
        slug: 'australia-pr',
        country: 'Australia',
        title: 'Australia PR Consultant India | Skilled Migration Experts — Immizy',
        description: 'Verified Australia PR consultants in India for Subclass 189, 190, 491 and employer-sponsored visas. Compare MARA-registered consultants on Immizy.',
        h1: 'Australia PR Consultants in India',
        subtitle: 'Subclass 189 · 190 · 491 · Employer Sponsored',
        intro: 'Australia\'s skills-based migration system offers multiple pathways for Indian professionals — from the independent Skilled Independent visa (Subclass 189) to state-nominated and employer-sponsored routes. Immizy connects you with MARA-registered or MARA-aware verified consultants who know Australia\'s occupation lists and state nomination requirements inside out.',
        programs: ['Subclass 189 — Skilled Independent', 'Subclass 190 — State Nominated', 'Subclass 491 — Regional Sponsored', 'Employer Nomination Scheme (ENS)', 'Temporary Skill Shortage (TSS) Visa'],
        faqs: [
            { q: 'Which Australian visa is easiest for Indian IT professionals?', a: 'Most Indian IT professionals target Subclass 189 or 190 via SkillSelect. Software engineers, developers, and IT managers are typically on the MLTSSL. A consultant reviews your occupation, points score, and skills assessment.' },
            { q: 'What is the points required for Australia PR from India?', a: 'You need a minimum of 65 points, but competitive invitations in major occupations often require 85–95+ points. Consultants help maximise your points through language tests, skilled employment, and partner skills.' },
        ],
    },
    'germany-job-seeker': {
        slug: 'germany-job-seeker',
        country: 'Germany',
        title: 'Germany Job Seeker Visa Consultant India | 2025–26 Guide — Immizy',
        description: 'Find verified Germany Job Seeker Visa consultants in India. Expert help with the Chancenkarte, job seeker visa eligibility, document checklist and job search in Germany.',
        h1: 'Germany Job Seeker Visa Consultants in India',
        subtitle: 'Job Seeker Visa · Chancenkarte · Blue Card',
        intro: 'Germany\'s Job Seeker Visa and the new Chancenkarte (Opportunity Card) are among the fastest-growing immigration pathways for Indian professionals in 2025–26. Immizy lists verified consultants who specialise in German immigration law, credential recognition (Anerkennung), and job search strategy.',
        programs: ['Job Seeker Visa (6 months)', 'Chancenkarte / Opportunity Card', 'EU Blue Card', 'Skilled Immigration Act (Fachkräfteeinwanderungsgesetz)', 'Recognition of Indian Qualifications'],
        faqs: [
            { q: 'Who is eligible for Germany Job Seeker Visa from India?', a: 'You need a recognised degree (or equivalent), 5 years of relevant work experience, and sufficient funds (approx. €12,000). A consultant helps assess your qualification recognition and prepares your application.' },
            { q: 'What is the Germany Chancenkarte and how is it different from a Job Seeker Visa?', a: 'The Chancenkarte is a points-based visa introduced in 2024 for job seekers who may not meet all job seeker visa criteria. It allows 1 year of stay for job search. Consultants help calculate your points score.' },
        ],
    },
    'uk-skilled-worker': {
        slug: 'uk-skilled-worker',
        country: 'United Kingdom',
        title: 'UK Skilled Worker Visa Consultant India | Post-Brexit Guide — Immizy',
        description: 'Find verified UK Skilled Worker Visa consultants in India. Expert help with sponsor licence, points-based system, salary thresholds and ILR from India.',
        h1: 'UK Skilled Worker Visa Consultants in India',
        subtitle: 'Skilled Worker · Health & Care · Global Talent',
        intro: 'The UK\'s points-based immigration system post-Brexit has created significant demand for qualified immigration consultants helping Indian professionals navigate sponsor requirements, salary thresholds, and the path to Indefinite Leave to Remain (ILR). Immizy lists verified OISC-regulated consultants and solicitors.',
        programs: ['Skilled Worker Visa', 'Health and Care Worker Visa', 'Global Talent Visa', 'Graduate Visa', 'Indefinite Leave to Remain (ILR)'],
        faqs: [
            { q: 'What is the minimum salary for UK Skilled Worker Visa in 2026?', a: 'From April 2024, the general threshold is £38,700/year (or the going rate for the occupation if higher). The Health & Care route has a separate threshold. A consultant confirms your occupation code and salary eligibility.' },
            { q: 'Can I get UK PR from the Skilled Worker Visa?', a: 'Yes — after 5 years on a Skilled Worker Visa you can apply for ILR (Indefinite Leave to Remain), which is the UK\'s equivalent of permanent residency. Continuous residence and salary thresholds must be maintained.' },
        ],
    },
    'portugal-d7': {
        slug: 'portugal-d7',
        country: 'Portugal',
        title: 'Portugal D7 Visa Consultant India | Passive Income Visa Guide — Immizy',
        description: 'Verified Portugal D7 Visa consultants in India. Expert guidance on passive income requirements, NHR tax regime, and Portugal Golden Visa alternatives.',
        h1: 'Portugal D7 Visa Consultants in India',
        subtitle: 'D7 Passive Income Visa · Digital Nomad · Portugal PR',
        intro: 'Portugal\'s D7 Visa (Passive Income Visa) is one of the most accessible EU residency routes for Indian professionals, remote workers, and retirees — with relatively low income requirements and a clear path to EU citizenship. Immizy lists consultants who specialise in the D7 visa and Portugal\'s NHR tax programme.',
        programs: ['D7 Passive Income Visa', 'Digital Nomad Visa (D8)', 'Portugal Residency → EU PR', 'NHR Tax Status', 'Portugal Citizenship (5 years)'],
        faqs: [
            { q: 'What is the minimum income for Portugal D7 Visa from India?', a: 'Approximately €760/month (Portuguese minimum wage) for the primary applicant. Family members add ~50% per adult. Income can be from salary, rental income, freelance earnings, or pension.' },
            { q: 'Is Portugal D7 a path to EU citizenship?', a: 'Yes — after 5 years of legal residence in Portugal you can apply for Portuguese citizenship, which grants EU freedom of movement. D7 holders can apply for Portugal PR after 5 years.' },
        ],
    },
}
