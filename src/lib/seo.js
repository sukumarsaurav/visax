// ============================================================
// SEO library — single source of truth for page-level meta + schema.
//
// What lives here:
//   • SEO         — static page configs (home, pricing, about, etc.)
//   • CITIES      — per-city configs for /immigration-consultant-:city
//   • DESTINATIONS — per-destination configs for /immigration/:destination
//   • OCCUPATIONS — occupation-targeted long-tail pages
//   • COMPARISONS — country-vs-country comparison pages
//   • Schema builders for BreadcrumbList, FAQPage, ProfessionalService,
//     LocalBusiness, AggregateRating, Review, ItemList
//
// Why so much in one file:
//   Keyword work is global to the product. Splitting by file means a
//   keyword change for "Canada PR" has to be made in two places (the
//   destination page + the city page that references it). Keeping it
//   here keeps the keyword surface searchable and consistent.
//
// Indian audience focus:
//   Every title/description is written for an Indian searcher targeting
//   abroad. We default to en-IN locale and INR currency where relevant.
// ============================================================

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
        areaServed: 'IN',
        availableLanguage: ['en', 'hi'],
    },
}

export const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Immizy',
    url: BASE,
    inLanguage: 'en-IN',
    potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${BASE}/find-professionals?q={search_term_string}` },
        'query-input': 'required name=search_term_string',
    },
}

// ─── Schema builders (call these from pages) ───────────────────────────────

/**
 * BreadcrumbList — improves Google's sitelink presentation. Pass items
 * as `[{ name, url }]` ordered from root → current page.
 */
export function buildBreadcrumb(items) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((it, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: it.name,
            item: it.url.startsWith('http') ? it.url : `${BASE}${it.url}`,
        })),
    }
}

/**
 * FAQPage — eligible for FAQ rich snippets. Pass `[{ q, a }]`.
 */
export function buildFAQ(faqs) {
    if (!faqs?.length) return null
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(f => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
    }
}

/**
 * ProfessionalService schema for an individual immigration consultant.
 * Includes optional AggregateRating + reviewer list for star eligibility.
 *
 * @param {object} c
 * @param {string} c.id          consultant profile UUID
 * @param {string} c.name        full name
 * @param {string} [c.image]     avatar URL
 * @param {string} [c.bio]       short bio
 * @param {string} [c.city]
 * @param {string} [c.country]   default 'India'
 * @param {string[]} [c.languages]
 * @param {string[]} [c.specializations]
 * @param {number} [c.yearsExperience]
 * @param {number} [c.avgRating] 0–5
 * @param {number} [c.reviewCount]
 * @param {number} [c.priceMin]  minimum service price (INR)
 * @param {Array<{author:string, rating:number, text:string, date:string}>} [c.reviews]
 */
export function buildConsultantSchema(c) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'ProfessionalService',
        '@id': `${BASE}/consultant/${c.id}#service`,
        name: `${c.name} — Immigration Consultant`,
        url: `${BASE}/consultant/${c.id}`,
        image: c.image,
        description: c.bio,
        priceRange: c.priceMin ? `₹${c.priceMin}+` : '₹₹',
        areaServed: { '@type': 'Country', name: 'India' },
        address: {
            '@type': 'PostalAddress',
            addressCountry: c.country || 'IN',
            addressLocality: c.city,
        },
        knowsLanguage: c.languages,
        knowsAbout: c.specializations,
        serviceType: 'Immigration Consulting',
    }

    if (c.avgRating && c.reviewCount > 0) {
        schema.aggregateRating = {
            '@type': 'AggregateRating',
            ratingValue: Number(c.avgRating).toFixed(1),
            reviewCount: c.reviewCount,
            bestRating: 5,
            worstRating: 1,
        }
    }

    if (c.reviews?.length) {
        schema.review = c.reviews.slice(0, 5).map(r => ({
            '@type': 'Review',
            author: { '@type': 'Person', name: r.author || 'Anonymous' },
            reviewRating: {
                '@type': 'Rating',
                ratingValue: r.rating,
                bestRating: 5,
                worstRating: 1,
            },
            reviewBody: r.text,
            datePublished: r.date,
        }))
    }

    return schema
}

/**
 * Agency schema — same shape as ProfessionalService but typed as
 * LegalService (immigration agencies usually offer legal advisory).
 */
export function buildAgencySchema(a) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'LegalService',
        '@id': `${BASE}/agency/${a.id}#agency`,
        name: a.name,
        url: `${BASE}/agency/${a.id}`,
        image: a.logo,
        description: a.description,
        priceRange: '₹₹',
        areaServed: { '@type': 'Country', name: 'India' },
        address: {
            '@type': 'PostalAddress',
            addressCountry: 'IN',
            addressLocality: a.city,
            streetAddress: a.address,
        },
        numberOfEmployees: a.memberCount,
        serviceType: 'Immigration Consulting',
    }
    if (a.avgRating && a.reviewCount > 0) {
        schema.aggregateRating = {
            '@type': 'AggregateRating',
            ratingValue: Number(a.avgRating).toFixed(1),
            reviewCount: a.reviewCount,
            bestRating: 5,
        }
    }
    return schema
}

/**
 * ItemList — emitted on directory pages (find-professionals, services)
 * so Google can present the list as a carousel.
 */
export function buildItemList(items, type = 'ProfessionalService') {
    return {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        numberOfItems: items.length,
        itemListElement: items.slice(0, 25).map((it, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: it.url.startsWith('http') ? it.url : `${BASE}${it.url}`,
            name: it.name,
        })),
    }
}

// ─── Page-level SEO configs ────────────────────────────────────────────────

export const SEO = {
    home: {
        title: 'Best Immigration Consultant in India | Verified Experts — Immizy',
        description: 'Find India\'s top verified immigration consultants for Canada PR, Australia PR, UK, USA, Germany, Japan & 12+ countries. Compare reviews, book consultations and track your case — all on Immizy.',
        keywords: 'immigration consultant india, canada pr from india, australia pr from india, us visa from india, uk skilled worker, germany job seeker visa, immigration consultant near me, best visa consultant india',
        schema: {
            '@context': 'https://schema.org',
            '@graph': [orgSchema, websiteSchema],
        },
    },

    findProfessionals: {
        title: 'Find Verified Immigration Consultant Near Me | India\'s Largest Directory — Immizy',
        description: 'Search 500+ verified immigration consultants and agencies across India. Filter by visa type (Canada PR, Australia, USA, UK, Germany), city, language and reviews. ICCRC, MARA & OISC-aware experts.',
        keywords: 'immigration consultant near me, visa consultant india, iccrc consultant india, mara agent india, oisc consultant india, canada pr consultant, australia pr consultant',
    },

    about: {
        title: 'About Immizy | Trusted Immigration Consultant Platform India',
        description: 'Immizy is India\'s verified immigration consultant marketplace. Learn how we vet every professional and make quality immigration guidance accessible to everyone.',
    },

    pricing: {
        title: 'Immigration CRM Software Pricing in India ₹4,999/mo — Immizy',
        description: 'Affordable INR pricing for India\'s leading immigration CRM. Starter ₹4,999/mo, Growth ₹8,999/mo, Enterprise ₹14,999/mo. Secure payments via Razorpay (cards, UPI, netbanking). GST invoice.',
        keywords: 'immigration crm india price, visa management software india, immigration consultant software pricing inr, razorpay subscription',
        schema: {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: 'Immizy Professional Platform',
            description: 'Immigration CRM and case management software for consultants and agencies in India.',
            brand: { '@type': 'Brand', name: 'Immizy' },
            offers: [
                { '@type': 'Offer', name: 'Starter',    price: '4999',  priceCurrency: 'INR', priceValidUntil: '2027-12-31', availability: 'https://schema.org/InStock', url: 'https://immizy.in/pricing' },
                { '@type': 'Offer', name: 'Growth',     price: '8999',  priceCurrency: 'INR', priceValidUntil: '2027-12-31', availability: 'https://schema.org/InStock', url: 'https://immizy.in/pricing' },
                { '@type': 'Offer', name: 'Enterprise', price: '14999', priceCurrency: 'INR', priceValidUntil: '2027-12-31', availability: 'https://schema.org/InStock', url: 'https://immizy.in/pricing' },
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
                {
                    '@type': 'Question',
                    name: 'Which is the easiest country to migrate to from India?',
                    acceptedAnswer: { '@type': 'Answer', text: 'For skilled professionals, Canada (Express Entry), Australia (Skilled Migration), and Germany (Job Seeker Visa / Chancenkarte) are the most accessible PR pathways from India. The right choice depends on your occupation, age, language scores, and budget.' },
                },
                {
                    '@type': 'Question',
                    name: 'Which is the cheapest country to get PR from India?',
                    acceptedAnswer: { '@type': 'Answer', text: 'Portugal D7 (passive income visa) and Germany Job Seeker Visa typically have the lowest application + funds proof requirements. Canada Express Entry has higher proof-of-funds but no government fee for skilled migration applicants beyond standard CIC fees.' },
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
        description: 'Browse all immigration services on Immizy — Canada PR, Australia PR, US H-1B, UK Skilled Worker, Germany Job Seeker, Japan SSW, student visas, family sponsorship and more. Find expert help for every visa type.',
    },
}

// ─── City SEO configs ──────────────────────────────────────────────────────
// All Indian cities follow the pattern: title, description, h1, intro, topVisas.
// Tier 1: metros. Tier 1.5: Punjab/Kerala/Gujarat/NCR (immigration density >
// metros per capita). Tier 2: large state capitals.

export const CITIES = {
    // ── Tier 1 ─────────────────────────────────────────────────────────────
    delhi: {
        slug: 'delhi', name: 'Delhi', fullName: 'New Delhi',
        title: 'Immigration Consultant in Delhi | Best Verified Experts — Immizy',
        description: 'Find the best verified immigration consultants in Delhi. Compare ratings, specializations and fees for Canada PR, Australia PR, UK, USA and more. Book a consultation today.',
        h1: 'Immigration Consultants in Delhi',
        intro: 'Delhi is India\'s top hub for immigration services, with thousands applying for Canada PR, Australian skilled migration, and UK visas every year. Immizy lists only verified, credential-checked consultants across New Delhi, Dwarka, Rohini, and surrounding NCR areas.',
        topVisas: ['Canada PR', 'Australia PR', 'UK Skilled Worker', 'USA H-1B', 'Student Visa'],
    },
    mumbai: {
        slug: 'mumbai', name: 'Mumbai', fullName: 'Mumbai',
        title: 'Immigration Consultant in Mumbai | Verified Experts — Immizy',
        description: 'Top-rated verified immigration consultants in Mumbai for Canada PR, Australia, UK and more. Compare profiles, read reviews and book a consultation on Immizy.',
        h1: 'Immigration Consultants in Mumbai',
        intro: 'Mumbai is one of India\'s largest sources of skilled immigration applicants. From Bandra to Andheri and Navi Mumbai, Immizy connects you with MARA-aware, ICCRC-familiar consultants who specialise in your visa category.',
        topVisas: ['Canada PR', 'Australia PR', 'UK Skilled Worker', 'Portugal D7', 'Student Visa'],
    },
    bangalore: {
        slug: 'bangalore', name: 'Bangalore', fullName: 'Bengaluru',
        title: 'Immigration Consultant in Bangalore | Canada & Australia PR Experts',
        description: 'Verified immigration consultants in Bangalore specialising in Canada Express Entry, Australia skilled migration, and Germany job seeker visas. Compare and book on Immizy.',
        h1: 'Immigration Consultants in Bangalore',
        intro: 'Bangalore\'s large IT professional base makes it India\'s fastest-growing source of Canada Express Entry and Australia skilled migration applicants. Immizy lists only verified immigration consultants serving Koramangala, Whitefield, HSR Layout and all of Bengaluru.',
        topVisas: ['Canada Express Entry', 'Australia PR', 'Germany Job Seeker', 'UK Skilled Worker', 'USA H-1B'],
    },
    hyderabad: {
        slug: 'hyderabad', name: 'Hyderabad', fullName: 'Hyderabad',
        title: 'Immigration Consultant in Hyderabad | Verified — Immizy',
        description: 'Find verified immigration consultants in Hyderabad for Canada PR, Australia PR, USA, UK and Germany visas. Read reviews and book on Immizy.',
        h1: 'Immigration Consultants in Hyderabad',
        intro: 'Hyderabad\'s booming tech sector is driving rapid growth in immigration applications. Immizy helps applicants in HITEC City, Gachibowli, and across the city connect with credential-verified consultants.',
        topVisas: ['Canada PR', 'Australia PR', 'USA H-1B', 'Germany Job Seeker', 'Student Visa'],
    },
    chennai: {
        slug: 'chennai', name: 'Chennai', fullName: 'Chennai',
        title: 'Immigration Consultant in Chennai | Australia & Canada Experts',
        description: 'Verified immigration consultants in Chennai specialising in Australia skilled migration, Canada PR, and UK visas. Compare profiles and book on Immizy.',
        h1: 'Immigration Consultants in Chennai',
        intro: 'Chennai has one of India\'s highest rates of Australia-bound skilled migration applicants. Immizy lists verified consultants across Anna Nagar, T. Nagar, and OMR who specialise in Australian subclass visas and Canada Express Entry.',
        topVisas: ['Australia PR', 'Canada PR', 'UK Skilled Worker', 'Student Visa', 'Germany Job Seeker'],
    },
    pune: {
        slug: 'pune', name: 'Pune', fullName: 'Pune',
        title: 'Immigration Consultant in Pune | Verified Experts — Immizy',
        description: 'Top immigration consultants in Pune for Canada Express Entry, Australia PR, and Germany job seeker visas. Find verified experts and book on Immizy.',
        h1: 'Immigration Consultants in Pune',
        intro: 'Pune\'s IT and engineering talent pool is increasingly looking at Canada, Germany, and Australia for skilled migration pathways. Immizy helps Punekars find verified, reviewed immigration consultants without the guesswork.',
        topVisas: ['Canada PR', 'Germany Job Seeker', 'Australia PR', 'UK Skilled Worker', 'Student Visa'],
    },
    ahmedabad: {
        slug: 'ahmedabad', name: 'Ahmedabad', fullName: 'Ahmedabad',
        title: 'Immigration Consultant in Ahmedabad | Trusted Experts — Immizy',
        description: 'Find trusted immigration consultants in Ahmedabad for Canada PR, UK, USA, and Australia visas. Verified professionals, real reviews — book on Immizy.',
        h1: 'Immigration Consultants in Ahmedabad',
        intro: 'Ahmedabad has a strong tradition of immigration to Canada, the UK, and the USA. Immizy connects applicants in Satellite, Navrangpura, and SG Highway with ICCRC-familiar, verified immigration consultants.',
        topVisas: ['Canada PR', 'UK Skilled Worker', 'USA Visa', 'Australia PR', 'Student Visa'],
    },

    // ── Tier 1.5 — Punjab / Kerala / Gujarat / NCR (highest emigration density) ──
    chandigarh: {
        slug: 'chandigarh', name: 'Chandigarh', fullName: 'Chandigarh',
        title: 'Immigration Consultant in Chandigarh | Canada PR Experts — Immizy',
        description: 'Top verified immigration consultants in Chandigarh & Mohali for Canada PR, study visa, UK and Australia. Punjab\'s most trusted immigration directory — book on Immizy.',
        h1: 'Immigration Consultants in Chandigarh',
        intro: 'Chandigarh and Mohali are the Punjab-region capital of immigration services — particularly Canada PR, study visas, and family sponsorship. Immizy lists ICCRC-familiar verified consultants across Sectors 17, 22, 35, and Mohali Industrial Area.',
        topVisas: ['Canada PR', 'Canada Study Visa', 'UK Student Visa', 'Australia PR', 'Family Sponsorship'],
    },
    jalandhar: {
        slug: 'jalandhar', name: 'Jalandhar', fullName: 'Jalandhar',
        title: 'Immigration Consultant in Jalandhar | Punjab\'s #1 Visa Directory — Immizy',
        description: 'Find verified Canada PR, study visa, and PNP consultants in Jalandhar. Punjab\'s highest emigration city — compare ratings, fees, and book a consultation on Immizy.',
        h1: 'Immigration Consultants in Jalandhar',
        intro: 'Jalandhar is one of India\'s highest per-capita immigration cities, especially for Canada study permits, Canada PR, and Australia work visas. Immizy lists only verified consultants — no exorbitant fees, no fake credentials.',
        topVisas: ['Canada Study Visa', 'Canada PR', 'Australia PR', 'UK Student Visa', 'Family Sponsorship'],
    },
    ludhiana: {
        slug: 'ludhiana', name: 'Ludhiana', fullName: 'Ludhiana',
        title: 'Immigration Consultant in Ludhiana | Canada & Australia Experts — Immizy',
        description: 'Verified immigration consultants in Ludhiana for Canada PR, study visa, Australia skilled migration, and UK visas. Compare consultants on Immizy.',
        h1: 'Immigration Consultants in Ludhiana',
        intro: 'Ludhiana families have strong Canada and UK connections through decades of immigration. Immizy lists verified ICCRC-familiar consultants across Model Town, BRS Nagar, and the Ferozepur Road belt.',
        topVisas: ['Canada PR', 'Canada Study Visa', 'UK Skilled Worker', 'Australia PR', 'Family Sponsorship'],
    },
    amritsar: {
        slug: 'amritsar', name: 'Amritsar', fullName: 'Amritsar',
        title: 'Immigration Consultant in Amritsar | Verified Visa Experts — Immizy',
        description: 'Top verified immigration consultants in Amritsar for Canada, UK, Australia and NZ visas. Family sponsorship + skilled migration experts on Immizy.',
        h1: 'Immigration Consultants in Amritsar',
        intro: 'Amritsar\'s strong NRI corridor with Canada, UK, and Australia keeps immigration demand high. Immizy lists verified, credential-checked consultants serving the Amritsar district.',
        topVisas: ['Canada PR', 'Canada Study Visa', 'UK Skilled Worker', 'Australia PR', 'NZ Work Visa'],
    },
    kochi: {
        slug: 'kochi', name: 'Kochi', fullName: 'Kochi / Ernakulam',
        title: 'Immigration Consultant in Kochi | UK Nurse & Germany Visa Experts — Immizy',
        description: 'Find verified Kerala immigration consultants in Kochi specialising in UK Health & Care visa for nurses, Germany Blue Card, Australia AHPRA, and Gulf jobs.',
        h1: 'Immigration Consultants in Kochi',
        intro: 'Kerala\'s registered nurses and skilled professionals are in demand worldwide — UK NHS, German hospitals, Australian aged care, and Gulf healthcare systems. Immizy lists verified consultants in Kochi & Ernakulam who handle nursing credential recognition and skilled migration paperwork end-to-end.',
        topVisas: ['UK Health & Care Visa', 'Germany Blue Card', 'Australia AHPRA Nursing', 'Gulf Jobs', 'Ireland Critical Skills'],
    },
    trivandrum: {
        slug: 'trivandrum', name: 'Trivandrum', fullName: 'Thiruvananthapuram',
        title: 'Immigration Consultant in Trivandrum | Verified Visa Experts — Immizy',
        description: 'Top verified immigration consultants in Trivandrum for nursing visas (UK, Germany), Canada PR, Australia skilled migration, and Gulf opportunities.',
        h1: 'Immigration Consultants in Trivandrum',
        intro: 'Kerala\'s capital has a long history of skilled professional emigration — particularly nurses, IT engineers, and medical specialists. Immizy lists verified consultants who understand AHPRA, Anerkennung (Germany), and NMC (UK) registration pathways.',
        topVisas: ['UK Health & Care Visa', 'Germany Blue Card', 'Canada PR', 'Australia PR', 'Gulf Jobs'],
    },
    surat: {
        slug: 'surat', name: 'Surat', fullName: 'Surat',
        title: 'Immigration Consultant in Surat | USA, UK & Canada Experts — Immizy',
        description: 'Verified immigration consultants in Surat for USA, UK, Canada, and Australia visas. Trusted by Gujarat\'s diamond and textile industry families.',
        h1: 'Immigration Consultants in Surat',
        intro: 'Surat\'s diamond, textile, and trade communities have established immigration corridors to the USA, UK, and Canada. Immizy lists verified consultants across Adajan, Vesu, and City Light.',
        topVisas: ['USA Visa', 'UK Skilled Worker', 'Canada PR', 'Australia PR', 'EB-5 Investor'],
    },
    vadodara: {
        slug: 'vadodara', name: 'Vadodara', fullName: 'Vadodara (Baroda)',
        title: 'Immigration Consultant in Vadodara | Verified Experts — Immizy',
        description: 'Top verified immigration consultants in Vadodara (Baroda) for USA, UK, Canada and Australia visas. Read reviews and book on Immizy.',
        h1: 'Immigration Consultants in Vadodara',
        intro: 'Vadodara families have one of Gujarat\'s strongest USA and UK migration corridors. Immizy lists ICCRC-familiar, OISC-familiar verified consultants across Alkapuri, Fatehgunj, and Akota.',
        topVisas: ['USA Visa', 'UK Skilled Worker', 'Canada PR', 'Australia PR', 'Student Visa'],
    },
    gurgaon: {
        slug: 'gurgaon', name: 'Gurgaon', fullName: 'Gurugram',
        title: 'Immigration Consultant in Gurgaon | NCR\'s Verified Experts — Immizy',
        description: 'Find verified immigration consultants in Gurgaon (Gurugram) for Canada PR, USA, UK, Australia and Germany visas. Top corporate consultants serving Cyber City & DLF.',
        h1: 'Immigration Consultants in Gurgaon',
        intro: 'Gurgaon\'s corporate professionals — bankers, consultants, IT leaders — are increasingly exploring Canada Express Entry, US EB-1/EB-2, and UK Global Talent visas. Immizy lists verified consultants serving Cyber City, DLF Phase 1–5, and Sohna Road.',
        topVisas: ['Canada Express Entry', 'USA H-1B', 'UK Global Talent', 'Germany Blue Card', 'Australia 189'],
    },
    noida: {
        slug: 'noida', name: 'Noida', fullName: 'Noida',
        title: 'Immigration Consultant in Noida | Canada & USA Visa Experts — Immizy',
        description: 'Verified immigration consultants in Noida for Canada PR, USA, UK, Australia and Germany visas. Compare ratings and book on Immizy.',
        h1: 'Immigration Consultants in Noida',
        intro: 'Noida\'s IT services and BPO professionals form a steady stream of skilled migration applicants. Immizy lists verified consultants serving Sector 18, 62, and Noida Expressway corridor.',
        topVisas: ['Canada PR', 'USA H-1B', 'UK Skilled Worker', 'Germany Blue Card', 'Australia PR'],
    },

    // ── Tier 2 — large state capitals ──────────────────────────────────────
    kolkata: {
        slug: 'kolkata', name: 'Kolkata', fullName: 'Kolkata',
        title: 'Immigration Consultant in Kolkata | Verified Visa Experts — Immizy',
        description: 'Top verified immigration consultants in Kolkata for Canada PR, Australia, UK, USA and Germany visas. Compare profiles and book on Immizy.',
        h1: 'Immigration Consultants in Kolkata',
        intro: 'Kolkata\'s academic and IT communities have strong migration interest in Canada, the UK, and Australia. Immizy lists verified consultants serving Salt Lake, Park Street, and the New Town tech corridor.',
        topVisas: ['Canada PR', 'UK Skilled Worker', 'Australia PR', 'USA Visa', 'Germany Job Seeker'],
    },
    jaipur: {
        slug: 'jaipur', name: 'Jaipur', fullName: 'Jaipur',
        title: 'Immigration Consultant in Jaipur | Canada & Australia Experts — Immizy',
        description: 'Verified immigration consultants in Jaipur for Canada PR, Australia, UK and USA visas. Find trusted experts and book on Immizy.',
        h1: 'Immigration Consultants in Jaipur',
        intro: 'Jaipur\'s growing IT and tourism sectors are driving steady migration applications, particularly for Canada PR, UK student visas, and Australia skilled migration. Immizy lists verified consultants across Malviya Nagar, Vaishali Nagar, and C-Scheme.',
        topVisas: ['Canada PR', 'Canada Study Visa', 'Australia PR', 'UK Skilled Worker', 'USA Visa'],
    },
    lucknow: {
        slug: 'lucknow', name: 'Lucknow', fullName: 'Lucknow',
        title: 'Immigration Consultant in Lucknow | Verified Experts — Immizy',
        description: 'Find verified immigration consultants in Lucknow for Canada PR, UK, USA, Australia and Germany visas. Compare ratings on Immizy.',
        h1: 'Immigration Consultants in Lucknow',
        intro: 'Lucknow\'s medical, academic, and government-service professionals form a steady source of skilled migration. Immizy lists verified consultants across Hazratganj, Gomti Nagar, and Aliganj.',
        topVisas: ['Canada PR', 'UK Health & Care', 'Australia PR', 'USA Visa', 'Germany Blue Card'],
    },
    coimbatore: {
        slug: 'coimbatore', name: 'Coimbatore', fullName: 'Coimbatore',
        title: 'Immigration Consultant in Coimbatore | Canada & Australia Experts — Immizy',
        description: 'Verified immigration consultants in Coimbatore for Canada PR, Australia, UK and USA. Tamil Nadu\'s textile and IT hub trusts Immizy for visa help.',
        h1: 'Immigration Consultants in Coimbatore',
        intro: 'Coimbatore\'s textile, engineering, and IT sectors generate consistent skilled migration demand. Immizy lists verified consultants across RS Puram, Saibaba Colony, and Peelamedu.',
        topVisas: ['Canada PR', 'Australia PR', 'UK Skilled Worker', 'USA Visa', 'Germany Job Seeker'],
    },
    indore: {
        slug: 'indore', name: 'Indore', fullName: 'Indore',
        title: 'Immigration Consultant in Indore | Verified Visa Experts — Immizy',
        description: 'Top verified immigration consultants in Indore for Canada PR, USA, UK, Australia and Germany visas. Madhya Pradesh\'s commercial capital trusts Immizy.',
        h1: 'Immigration Consultants in Indore',
        intro: 'Indore\'s entrepreneur and IT communities have strong outbound migration interest. Immizy lists verified consultants across Vijay Nagar, Palasia, and AB Road.',
        topVisas: ['Canada PR', 'Australia PR', 'USA Visa', 'UK Skilled Worker', 'Germany Job Seeker'],
    },
    bhopal: {
        slug: 'bhopal', name: 'Bhopal', fullName: 'Bhopal',
        title: 'Immigration Consultant in Bhopal | Verified Experts — Immizy',
        description: 'Verified immigration consultants in Bhopal for Canada PR, UK, USA, Australia and Germany visas. Compare and book on Immizy.',
        h1: 'Immigration Consultants in Bhopal',
        intro: 'Bhopal\'s academic and government-services professionals form a small but steady stream of skilled migration. Immizy lists verified consultants across MP Nagar, Arera Colony, and Hoshangabad Road.',
        topVisas: ['Canada PR', 'UK Skilled Worker', 'Australia PR', 'USA Visa', 'Germany Blue Card'],
    },
    visakhapatnam: {
        slug: 'visakhapatnam', name: 'Visakhapatnam', fullName: 'Visakhapatnam (Vizag)',
        title: 'Immigration Consultant in Visakhapatnam | Verified Experts — Immizy',
        description: 'Find verified immigration consultants in Visakhapatnam (Vizag) for Canada, USA, UK, Australia and Gulf visas. Compare on Immizy.',
        h1: 'Immigration Consultants in Visakhapatnam',
        intro: 'Vizag\'s port, defence, and IT services workforce drives steady migration demand to Australia, Canada, and the Gulf. Immizy lists verified consultants across Dwaraka Nagar, Beach Road, and Madhurawada.',
        topVisas: ['Australia PR', 'Canada PR', 'Gulf Jobs', 'USA Visa', 'UK Skilled Worker'],
    },
}

// ─── Destination country SEO configs ──────────────────────────────────────
// Each destination targets the head term for that country from Indian search
// intent — e.g. "canada pr from india" → /immigration/canada-pr.

export const DESTINATIONS = {
    'canada-pr': {
        slug: 'canada-pr',
        country: 'Canada',
        flag: '🇨🇦',
        title: 'Canada PR from India 2026 | Express Entry & PNP Consultants — Immizy',
        description: 'Apply for Canada PR from India with verified ICCRC-familiar consultants. Express Entry, PNP, family sponsorship and study-to-PR pathways. Compare experts and book on Immizy.',
        h1: 'Canada PR Consultants in India',
        subtitle: 'Express Entry · Provincial Nominee Program · Family Sponsorship',
        intro: 'Canada Permanent Residency is the most sought-after immigration pathway from India. Immizy lists ICCRC-familiar verified consultants who specialise in Express Entry CRS score optimisation, Provincial Nominee Programs (Ontario, BC, Alberta, Saskatchewan, Manitoba), and family class sponsorship.',
        programs: ['Express Entry (FSW, CEC, FST)', 'Provincial Nominee Program (PNP)', 'Family Sponsorship', 'Start-Up Visa', 'Atlantic Immigration Program', 'Rural and Northern Immigration Pilot'],
        faqs: [
            { q: 'What is the minimum CRS score for Canada Express Entry in 2026?', a: 'CRS cutoffs fluctuate with each draw. Recent draws have ranged from 470–530. A verified consultant can help you improve your CRS score through PNP nominations, additional language scores, and job offers.' },
            { q: 'How long does Canada PR processing take from India?', a: 'Express Entry typically takes 6 months after ITA. PNP streams vary from 12–18 months. A consultant helps you prepare a complete application to avoid delays.' },
            { q: 'Do I need a consultant for Canada Express Entry?', a: 'You can self-apply, but a verified consultant significantly improves your CRS score strategy and reduces errors that cause refusals.' },
            { q: 'What is the total cost of Canada PR from India?', a: 'Government fees are approximately CAD 1,365 per adult + CAD 230 per child. Add IELTS (₹15,000+), ECA (₹25,000+), medicals (₹7,000), police clearance, and consultant fees (₹50,000–2L typical). Total: ₹3–6 lakh INR for a single applicant.' },
            { q: 'Can I get Canada PR without IELTS?', a: 'No — language proof is mandatory for Express Entry. Accepted tests: IELTS General, CELPIP General (English), or TEF/TCF Canada (French). Higher scores significantly improve your CRS.' },
        ],
    },
    'australia-pr': {
        slug: 'australia-pr',
        country: 'Australia',
        flag: '🇦🇺',
        title: 'Australia PR from India | MARA-Registered Consultants — Immizy',
        description: 'Verified Australia PR consultants in India for Subclass 189, 190, 491, ENS and TSS visas. Find MARA-registered agents and compare experts on Immizy.',
        h1: 'Australia PR Consultants in India',
        subtitle: 'Subclass 189 · 190 · 491 · Employer Sponsored',
        intro: 'Australia\'s skills-based migration system offers multiple pathways for Indian professionals — from the independent Skilled Independent visa (Subclass 189) to state-nominated and employer-sponsored routes. Immizy connects you with MARA-registered or MARA-aware verified consultants who know Australia\'s occupation lists and state nomination requirements inside out.',
        programs: ['Subclass 189 — Skilled Independent', 'Subclass 190 — State Nominated', 'Subclass 491 — Regional Sponsored', 'Employer Nomination Scheme (ENS)', 'Temporary Skill Shortage (TSS) Visa', 'Global Talent Visa', 'Partner Visa (820/801)'],
        faqs: [
            { q: 'Which Australian visa is easiest for Indian IT professionals?', a: 'Most Indian IT professionals target Subclass 189 or 190 via SkillSelect. Software engineers, developers, and IT managers are typically on the MLTSSL. A consultant reviews your occupation, points score, and skills assessment.' },
            { q: 'What is the points required for Australia PR from India?', a: 'You need a minimum of 65 points, but competitive invitations in major occupations often require 85–95+ points. Consultants help maximise your points through language tests, skilled employment, and partner skills.' },
            { q: 'Do I need a MARA agent for Australia PR?', a: 'Not legally required — but for complex cases (skills assessment, state nomination, employer sponsorship) a MARA-registered agent significantly improves approval odds.' },
            { q: 'What is the total cost of Australia PR from India?', a: 'Visa fees: AUD 4,640 (Subclass 189). Add skills assessment (~AUD 500–1500 depending on assessing authority), IELTS/PTE, medicals, PCC, and agent fees. Budget ₹4–8 lakh INR total.' },
        ],
    },
    'usa-visa': {
        slug: 'usa-visa',
        country: 'United States',
        flag: '🇺🇸',
        title: 'USA Visa Consultant India | H-1B, EB-5, F1 & Green Card — Immizy',
        description: 'Find verified USA immigration consultants and attorneys in India. Expert help with H-1B, L-1, O-1, EB-1/2/3/5, F-1 student visa, and green card processes from India.',
        h1: 'USA Visa Consultants in India',
        subtitle: 'H-1B · L-1 · O-1 · EB-1/2/3/5 · F-1 Student · Green Card',
        intro: 'The United States remains the highest-aspiration destination for Indian professionals despite tight lottery odds and processing backlogs. Immizy lists verified US immigration consultants and India-based attorneys who handle the full spectrum — from F-1 student visas to H-1B sponsorship, the EB-5 investor pathway, and EB-1/2/3 employment-based green cards.',
        programs: ['H-1B Specialty Occupation', 'L-1 Intracompany Transfer', 'O-1 Extraordinary Ability', 'EB-1 Priority Worker', 'EB-2 NIW (National Interest Waiver)', 'EB-3 Skilled Worker', 'EB-5 Investor Visa', 'F-1 Student Visa', 'B-1/B-2 Visitor', 'Family-based green card'],
        faqs: [
            { q: 'What are H-1B 2026 lottery odds for Indians?', a: 'Recent H-1B lottery selection rates have been ~25–30% across all entrants. The cap is 85,000 (65k regular + 20k US master\'s). Indians receive ~70% of all H-1Bs but face the longest green card backlogs.' },
            { q: 'How long is the EB-2 / EB-3 green card backlog for India?', a: 'As of 2025–26, India EB-2 / EB-3 priority dates are backlogged 10–15+ years due to per-country quotas. EB-1 backlogs are shorter (~2–4 years). A consultant can advise on cross-chargeability options.' },
            { q: 'Is the EB-5 investor visa worth it for Indians?', a: 'EB-5 requires USD 800,000+ investment in a TEA (Targeted Employment Area) or USD 1.05M elsewhere. India has shorter EB-5 backlogs than EB-2/3, making it attractive for high-net-worth Indian families seeking faster green cards.' },
            { q: 'Can I move to USA from India without H-1B?', a: 'Yes — alternatives include L-1 (if your employer transfers you), O-1 (extraordinary ability), EB-5 (investor), F-1 (study + OPT), J-1 (research/exchange), or marrying a US citizen. A consultant maps your eligibility.' },
        ],
    },
    'uk-skilled-worker': {
        slug: 'uk-skilled-worker',
        country: 'United Kingdom',
        flag: '🇬🇧',
        title: 'UK Skilled Worker Visa from India 2026 | OISC Consultants — Immizy',
        description: 'Apply for UK Skilled Worker, Health & Care, Global Talent, and Graduate visas from India. Verified OISC-regulated consultants — compare on Immizy.',
        h1: 'UK Skilled Worker Visa Consultants in India',
        subtitle: 'Skilled Worker · Health & Care · Global Talent · Student',
        intro: 'The UK\'s points-based immigration system post-Brexit has created significant demand for qualified immigration consultants helping Indian professionals navigate sponsor requirements, salary thresholds, and the path to Indefinite Leave to Remain (ILR). Immizy lists verified OISC-regulated consultants and solicitors.',
        programs: ['Skilled Worker Visa', 'Health and Care Worker Visa', 'Global Talent Visa', 'Graduate Visa (post-study)', 'Indefinite Leave to Remain (ILR)', 'Innovator Founder Visa', 'High Potential Individual Visa'],
        faqs: [
            { q: 'What is the minimum salary for UK Skilled Worker Visa in 2026?', a: 'From April 2024, the general threshold is £38,700/year (or the going rate for the occupation if higher). The Health & Care route has a separate threshold (£29,000). A consultant confirms your occupation code (SOC) and salary eligibility.' },
            { q: 'Can I get UK PR (ILR) from the Skilled Worker Visa?', a: 'Yes — after 5 years on a Skilled Worker Visa you can apply for ILR (Indefinite Leave to Remain), which is the UK\'s equivalent of permanent residency. Continuous residence, salary thresholds, and absence rules must be maintained.' },
            { q: 'Is UK Health & Care visa still open for Indian nurses?', a: 'Yes — the Health & Care visa remains open for eligible care worker and senior care worker roles, plus nurses and doctors. NMC registration is required for nurses. A consultant assists with both visa filing and NMC OSCE preparation.' },
            { q: 'What is the UK High Potential Individual visa for Indians?', a: 'The HPI visa allows graduates of top 50 global universities to work in the UK without a sponsor. Several Indian-origin graduates from IITs and IIMs qualify if their degree is recent.' },
        ],
    },
    'germany-job-seeker': {
        slug: 'germany-job-seeker',
        country: 'Germany',
        flag: '🇩🇪',
        title: 'Germany Job Seeker Visa from India | Chancenkarte 2026 — Immizy',
        description: 'Apply for Germany Job Seeker Visa, Chancenkarte (Opportunity Card), and EU Blue Card from India. Verified consultants with credential recognition (Anerkennung) expertise.',
        h1: 'Germany Job Seeker Visa Consultants in India',
        subtitle: 'Job Seeker Visa · Chancenkarte · EU Blue Card',
        intro: 'Germany\'s Job Seeker Visa and the new Chancenkarte (Opportunity Card) are among the fastest-growing immigration pathways for Indian professionals in 2025–26. Immizy lists verified consultants who specialise in German immigration law, credential recognition (Anerkennung), and job search strategy.',
        programs: ['Job Seeker Visa (6 months)', 'Chancenkarte / Opportunity Card', 'EU Blue Card', 'Skilled Immigration Act (Fachkräfteeinwanderungsgesetz)', 'Recognition of Indian Qualifications (Anerkennung)', 'Family Reunion Visa', 'Ausbildung Visa'],
        faqs: [
            { q: 'Who is eligible for Germany Job Seeker Visa from India?', a: 'You need a recognised degree (or equivalent), 5 years of relevant work experience, and sufficient funds (approx. €12,000). A consultant helps assess your qualification recognition and prepares your application.' },
            { q: 'What is the Germany Chancenkarte and how is it different from a Job Seeker Visa?', a: 'The Chancenkarte is a points-based visa introduced in 2024 for job seekers who may not meet all job seeker visa criteria. It allows 1 year of stay for job search. Consultants help calculate your points score.' },
            { q: 'What is the EU Blue Card salary threshold in 2026?', a: 'The general Blue Card threshold is approximately €45,300/year (€41,041 for shortage occupations). IT and STEM roles often qualify under shortage rates. A consultant advises on offer-letter sufficiency.' },
            { q: 'How do I get my Indian degree recognised in Germany (Anerkennung)?', a: 'Use the anabin database to check if your university is H+ (fully recognised), H- (not recognised), or requires individual assessment. Indian B.Tech / M.Tech from recognised universities are typically H+. A consultant handles formal Zeugnisbewertung.' },
        ],
    },
    'japan-work-visa': {
        slug: 'japan-work-visa',
        country: 'Japan',
        flag: '🇯🇵',
        title: 'Japan Work Visa from India | SSW & Engineer Visa Consultants — Immizy',
        description: 'Find verified Japan work visa consultants in India for Specified Skilled Worker (SSW), Engineer/Humanities, Highly Skilled Professional, and Startup visas.',
        h1: 'Japan Work Visa Consultants in India',
        subtitle: 'SSW · Engineer/Humanities · Highly Skilled Professional · Startup',
        intro: 'Japan\'s ageing workforce has opened multiple visa pathways for Indian professionals — particularly in IT engineering, nursing care, hospitality, and manufacturing trades. Immizy lists consultants who specialise in Japanese visa categories, JLPT preparation tie-ups, and partner-employer connections.',
        programs: ['Specified Skilled Worker (SSW i & ii)', 'Engineer / Specialist in Humanities / International Services', 'Highly Skilled Professional Visa', 'Intra-Company Transferee', 'Startup Visa (Tokyo, Fukuoka, etc.)', 'Permanent Residency (after 5–10 years)'],
        faqs: [
            { q: 'What is the easiest Japan visa for an Indian IT engineer?', a: 'The Engineer / Specialist in Humanities visa is most common. You need a recognised degree + a Japanese employer offer. The Highly Skilled Professional visa (points-based) offers faster PR if you score 70+.' },
            { q: 'Do I need to know Japanese for SSW visa?', a: 'Yes — JLPT N4 minimum (some sectors require N3) plus the sector-specific skills exam. Construction, agriculture, hospitality, nursing care, and aviation are the largest SSW intake sectors for Indians.' },
            { q: 'How long does Japan PR take from India?', a: 'Standard route is 10 years of legal residence. Highly Skilled Professional visa holders can apply for PR after 1–3 years depending on points. A consultant maps your fastest route.' },
        ],
    },
    'new-zealand-skilled': {
        slug: 'new-zealand-skilled',
        country: 'New Zealand',
        flag: '🇳🇿',
        title: 'New Zealand Skilled Migrant Visa from India | Consultants — Immizy',
        description: 'Find verified New Zealand immigration consultants in India for Skilled Migrant Category, Accredited Employer Work Visa (AEWV), and Green List pathways.',
        h1: 'New Zealand Immigration Consultants in India',
        subtitle: 'Skilled Migrant · Accredited Employer · Green List',
        intro: 'New Zealand\'s 6-point Skilled Migrant Category and the Accredited Employer Work Visa (AEWV) offer clear pathways for Indian professionals in healthcare, engineering, IT, trades, and construction. Immizy lists verified consultants who track New Zealand\'s Green List occupations and processing timelines.',
        programs: ['Skilled Migrant Category (6-point)', 'Accredited Employer Work Visa (AEWV)', 'Green List Straight-to-Residence', 'Specific Purpose Work Visa', 'Partner / Family Visa'],
        faqs: [
            { q: 'What is the New Zealand 6-point system?', a: 'You need 6 points to qualify for Skilled Migrant residence. Points come from qualifications (3 for Bachelor\'s, 4 for Master\'s, 5 for PhD), income, occupational registration, and NZ work experience. A consultant maps your fastest 6-point combination.' },
            { q: 'Which occupations are on the New Zealand Green List?', a: 'Green List Tier 1 (straight-to-residence) includes doctors, nurses, civil engineers, ICT roles, secondary teachers, and construction project managers. Tier 2 requires 2 years of NZ work first. A consultant checks your occupation against the current list.' },
        ],
    },
    'singapore-employment-pass': {
        slug: 'singapore-employment-pass',
        country: 'Singapore',
        flag: '🇸🇬',
        title: 'Singapore Employment Pass from India | EP & Tech.Pass — Immizy',
        description: 'Apply for Singapore Employment Pass (EP), Tech.Pass, and ONE Pass from India. Verified consultants for highly-skilled Indian professionals.',
        h1: 'Singapore Work Visa Consultants in India',
        subtitle: 'Employment Pass · Tech.Pass · ONE Pass · S Pass',
        intro: 'Singapore remains a top regional destination for Indian professionals in finance, technology, and consulting. Immizy lists verified consultants who handle Employment Pass (EP), the high-bar ONE Pass for top talent, Tech.Pass for entrepreneurs, and S Pass for mid-skill workers.',
        programs: ['Employment Pass (EP)', 'Overseas Networks & Expertise Pass (ONE Pass)', 'Tech.Pass', 'S Pass', 'EntrePass (entrepreneur)', 'Permanent Resident (PR) Application'],
        faqs: [
            { q: 'What is the minimum salary for Singapore Employment Pass in 2026?', a: 'The EP minimum is SGD 5,600/month (SGD 6,200 for financial services). The COMPASS framework also evaluates qualifications, employer diversity, and skills bonuses.' },
            { q: 'How do I get Singapore PR from India?', a: 'Most applicants get PR after 2–3 years on an EP with a strong employer endorsement. The ICA evaluates economic contribution, family ties, and length of stay. A consultant prepares your PR application portfolio.' },
        ],
    },
    'ireland-critical-skills': {
        slug: 'ireland-critical-skills',
        country: 'Ireland',
        flag: '🇮🇪',
        title: 'Ireland Critical Skills Visa from India | Consultants — Immizy',
        description: 'Apply for Ireland Critical Skills Employment Permit, General Employment Permit, and Stamp 4 from India. Verified consultants on Immizy.',
        h1: 'Ireland Work Visa Consultants in India',
        subtitle: 'Critical Skills · General Employment · Stamp 4 · ICT',
        intro: 'Ireland\'s Critical Skills Employment Permit offers one of Europe\'s fastest paths to PR (Stamp 4 after 2 years). Tech, pharma, healthcare, and engineering roles dominate the Critical Skills list. Immizy lists verified Ireland-focused consultants.',
        programs: ['Critical Skills Employment Permit', 'General Employment Permit', 'Stamp 4 (long-term residence)', 'Intra-Company Transfer', 'Working Holiday Authorisation (limited quota)'],
        faqs: [
            { q: 'What occupations are on Ireland Critical Skills list?', a: 'IT roles (software engineers, data scientists, cybersecurity), engineering (electrical, mechanical), healthcare (doctors, nurses, radiographers), and pharma scientists are typically on the list. Annual salary must be €38,000+ for occupations on the list and €64,000+ for others.' },
            { q: 'How fast can I get Ireland PR (Stamp 4)?', a: 'Critical Skills Permit holders can apply for Stamp 4 (long-term residence) after 2 years. After 5 years on Stamp 4 you can apply for naturalisation.' },
        ],
    },
    'uae-golden-visa': {
        slug: 'uae-golden-visa',
        country: 'United Arab Emirates',
        flag: '🇦🇪',
        title: 'UAE Golden Visa from India | 10-Year Residency Consultants — Immizy',
        description: 'Apply for UAE Golden Visa, Green Visa, freelance visa and standard work visa from India. Verified consultants for Dubai, Abu Dhabi, and Sharjah.',
        h1: 'UAE & Dubai Visa Consultants in India',
        subtitle: 'Golden Visa · Green Visa · Freelance Visa · Work Visa',
        intro: 'The UAE remains the most accessible international destination for Indian professionals — no language test, no PR backlog, and the new Golden Visa offers 10-year renewable residency for skilled workers, investors, and exceptional talent. Immizy lists verified consultants serving Dubai, Abu Dhabi, and Sharjah.',
        programs: ['Golden Visa (10-year)', 'Green Visa (5-year)', 'Freelance / Self-Employment Visa', 'Standard Employment Visa', 'Investor Visa', 'Dependant Visa'],
        faqs: [
            { q: 'Who qualifies for UAE Golden Visa from India?', a: 'Categories include: skilled professionals earning AED 30,000+/month with a recognised degree, investors (AED 2M+ real estate or business), exceptional talent (PhD researchers, artists), students with top GPAs, and humanitarian pioneers. A consultant matches your profile to the right category.' },
            { q: 'How long does UAE work visa processing take from India?', a: 'Standard employment visas: 2–4 weeks after employer\'s entry permit. Golden Visa: 4–8 weeks depending on category. Freelance/Green Visa: similar timelines once documents are submitted.' },
        ],
    },
    'netherlands-highly-skilled': {
        slug: 'netherlands-highly-skilled',
        country: 'Netherlands',
        flag: '🇳🇱',
        title: 'Netherlands Highly Skilled Migrant Visa from India | Consultants — Immizy',
        description: 'Apply for Netherlands Highly Skilled Migrant (Kennismigrant) visa, EU Blue Card, and Orientation Year from India. Verified consultants on Immizy.',
        h1: 'Netherlands Work Visa Consultants in India',
        subtitle: 'Kennismigrant · EU Blue Card · Orientation Year · 30% Ruling',
        intro: 'The Netherlands\' Highly Skilled Migrant (Kennismigrant) programme is one of Europe\'s most accessible work-permit routes for Indian professionals, with a salary-only threshold (no labour market test) and the famous 30% ruling tax benefit. Immizy lists verified consultants familiar with IND procedures.',
        programs: ['Highly Skilled Migrant (Kennismigrant)', 'EU Blue Card', 'Intra Corporate Transfer', 'Orientation Year (zoekjaar)', 'Startup Visa', '30% Ruling (tax)'],
        faqs: [
            { q: 'What is the Netherlands Kennismigrant salary threshold in 2026?', a: 'Approximately €5,331/month gross for applicants 30+ and €3,909/month for under-30 (figures index annually). Recent graduates under Orientation Year have a lower threshold of €2,801. A consultant confirms current numbers and your sector applicability.' },
            { q: 'What is the 30% ruling in Netherlands?', a: 'A tax benefit that lets eligible expats receive 30% of their salary tax-free for up to 5 years (recently shortened from 8). Indian Kennismigrants typically qualify if hired from abroad. A consultant or tax advisor handles the application.' },
        ],
    },
    'france-talent-passport': {
        slug: 'france-talent-passport',
        country: 'France',
        flag: '🇫🇷',
        title: 'France Talent Passport Visa from India | Consultants — Immizy',
        description: 'Apply for France Talent Passport (Passeport Talent), tech visa, and student visa from India. Verified consultants for skilled professionals.',
        h1: 'France Work Visa Consultants in India',
        subtitle: 'Talent Passport · Tech Visa · Student · ICT',
        intro: 'France\'s Talent Passport (Passeport Talent) offers a 4-year renewable residence permit for skilled professionals, researchers, investors, and tech entrepreneurs from India. Immizy lists verified consultants familiar with French consular and OFII procedures.',
        programs: ['Passeport Talent — Salarié Qualifié', 'Passeport Talent — Carte Bleue Européenne', 'French Tech Visa (startup)', 'Researcher Visa', 'Student Visa (long-stay)'],
        faqs: [
            { q: 'What is the salary threshold for France Talent Passport?', a: 'For the Salarié Qualifié category, approximately €43,243/year (1.8× French minimum wage). EU Blue Card via France requires €53,836/year. Researchers and tech entrepreneurs have separate criteria.' },
            { q: 'Do I need French language for France Talent Passport?', a: 'No language requirement at application — but A1 / A2 French is highly recommended for daily life and renewal applications. Long-term PR requires A2.' },
        ],
    },
    'china-z-visa': {
        slug: 'china-z-visa',
        country: 'China',
        flag: '🇨🇳',
        title: 'China Work Visa (Z Visa) from India | Consultants — Immizy',
        description: 'Apply for China Z Visa (work permit), R Visa, and PR from India. Verified consultants for skilled professionals and corporate transferees.',
        h1: 'China Work Visa Consultants in India',
        subtitle: 'Z Visa · R Visa · Foreign Talent · PR',
        intro: 'China\'s Z Visa is the standard work visa for foreign professionals. The newer R Visa attracts high-end foreign talent in priority sectors. Immizy lists verified consultants who handle Chinese consular procedures, employment permits, and apostille requirements.',
        programs: ['Z Visa (work)', 'R Visa (foreign talent)', 'Foreigner\'s Work Permit (Categories A, B, C)', 'Family Reunion Visa', 'Permanent Residency (limited)'],
        faqs: [
            { q: 'How do I get a Chinese work visa from India?', a: 'Your Chinese employer must first apply for a Foreigner\'s Work Permit Notice. With that, you apply for a Z Visa at the Chinese consulate in India. After arriving in China, convert to a Work Permit + Residence Permit within 30 days.' },
            { q: 'Is Chinese PR possible for Indians?', a: 'Yes but rare — Chinese PR (D Visa) is granted to high-skill professionals, large investors, and family of Chinese citizens. Approval rates are low. R Visa holders have stronger PR prospects.' },
        ],
    },
    'portugal-d7': {
        slug: 'portugal-d7',
        country: 'Portugal',
        flag: '🇵🇹',
        title: 'Portugal D7 Visa from India | Passive Income & NHR Consultants — Immizy',
        description: 'Apply for Portugal D7 Passive Income Visa, Digital Nomad Visa (D8), and PR from India. Verified consultants with NHR tax expertise.',
        h1: 'Portugal D7 Visa Consultants in India',
        subtitle: 'D7 Passive Income Visa · Digital Nomad · Portugal PR',
        intro: 'Portugal\'s D7 Visa (Passive Income Visa) is one of the most accessible EU residency routes for Indian professionals, remote workers, and retirees — with relatively low income requirements and a clear path to EU citizenship. Immizy lists consultants who specialise in the D7 visa and Portugal\'s NHR tax programme.',
        programs: ['D7 Passive Income Visa', 'Digital Nomad Visa (D8)', 'Portugal Residency → EU PR', 'NHR Tax Status', 'Portugal Citizenship (5 years)'],
        faqs: [
            { q: 'What is the minimum income for Portugal D7 Visa from India?', a: 'Approximately €820/month (Portuguese minimum wage). Family members add ~50% per adult. Income can be from salary, rental income, freelance earnings, or pension.' },
            { q: 'Is Portugal D7 a path to EU citizenship?', a: 'Yes — after 5 years of legal residence in Portugal you can apply for Portuguese citizenship, which grants EU freedom of movement. D7 holders can apply for Portugal PR after 5 years.' },
        ],
    },
}

// ─── Occupation × destination landing pages ───────────────────────────────
// URL pattern: /immigration/:destination-for-:occupation
// These are long-tail goldmines — low competition, high intent.

export const OCCUPATIONS = {
    'canada-pr-for-software-engineer': {
        slug: 'canada-pr-for-software-engineer',
        destination: 'canada-pr',
        occupation: 'Software Engineer',
        title: 'Canada PR for Software Engineers from India | CRS Tips 2026 — Immizy',
        description: 'Canada PR pathway for Indian software engineers — NOC 21231/21232 Express Entry profile, CRS strategy, PNP tech draws. Find verified consultants on Immizy.',
        h1: 'Canada PR for Indian Software Engineers',
        intro: 'Software engineers are the largest occupational group of Indian Canada PR applicants. Most fall under NOC 21231 (Software Engineers and Designers) or NOC 21232 (Software Developers and Programmers) — both Category 1 in Express Entry tech draws.',
        faqs: [
            { q: 'What NOC code applies to Indian software engineers for Canada?', a: 'NOC 21231 (Software Engineers and Designers) or NOC 21232 (Software Developers and Programmers). Senior software engineers may also qualify under NOC 20012 (Computer and Information Systems Managers).' },
            { q: 'Is there a Canada PNP tech draw for software engineers?', a: 'Yes — Ontario\'s OINP Tech Draw, BC\'s Tech Pilot, and Saskatchewan\'s SINP Express Entry sub-category all target software engineers. A consultant identifies the fastest PNP for your profile.' },
        ],
    },
    'australia-pr-for-software-engineer': {
        slug: 'australia-pr-for-software-engineer',
        destination: 'australia-pr',
        occupation: 'Software Engineer',
        title: 'Australia PR for Software Engineers from India | 189/190/491 — Immizy',
        description: 'Australia PR for Indian software engineers — ANZSCO 261313/261312, ACS skills assessment, MLTSSL eligibility. Verified MARA-aware consultants on Immizy.',
        h1: 'Australia PR for Indian Software Engineers',
        intro: 'Software Engineer (ANZSCO 261313) and Developer Programmer (261312) are both on Australia\'s MLTSSL — meaning eligible for Subclass 189 (independent), 190 (state-nominated), and 491 (regional). ACS skills assessment is mandatory.',
        faqs: [
            { q: 'How does ACS assess Indian software engineers?', a: 'ACS reviews your degree against ANZSCO 261313 ICT major requirements. Non-ICT degrees lose 2 years of experience to "RPL". A consultant + ACS-experienced agent improves your assessment outcome.' },
        ],
    },
    'uk-skilled-worker-for-nurse': {
        slug: 'uk-skilled-worker-for-nurse',
        destination: 'uk-skilled-worker',
        occupation: 'Nurse',
        title: 'UK Health & Care Visa for Indian Nurses 2026 | NMC & OSCE — Immizy',
        description: 'UK Health & Care Worker visa for Indian nurses — NMC registration, OSCE exam, NHS sponsorship. Verified Kerala-focused consultants on Immizy.',
        h1: 'UK Health & Care Visa for Indian Nurses',
        intro: 'Indian nurses (especially from Kerala, Punjab, and Tamil Nadu) are in high demand by the UK NHS and private care providers. The Health & Care Worker visa has a lower salary threshold (£29,000) and faster ILR (5 years).',
        faqs: [
            { q: 'What is the NMC OSCE exam and do I need it?', a: 'OSCE (Objective Structured Clinical Examination) is the practical part of NMC registration for non-UK nurses. After IELTS/OET + CBT, you sit OSCE in the UK (or specific overseas centres). A consultant arranges sponsor + exam booking.' },
            { q: 'Which NHS trusts sponsor Indian nurses directly?', a: 'Several NHS trusts (and private operators like Care UK, Bupa, BMI) run direct overseas recruitment campaigns in Kerala and Tamil Nadu. A consultant connects you to active sponsors.' },
        ],
    },
    'germany-blue-card-for-software-engineer': {
        slug: 'germany-blue-card-for-software-engineer',
        destination: 'germany-job-seeker',
        occupation: 'Software Engineer',
        title: 'Germany Blue Card for Indian Software Engineers 2026 — Immizy',
        description: 'Germany EU Blue Card for Indian software engineers — salary threshold, shortage occupation rate, Anerkennung. Verified consultants on Immizy.',
        h1: 'Germany Blue Card for Indian Software Engineers',
        intro: 'Software engineers and IT specialists are on Germany\'s shortage occupations list — meaning you qualify for the EU Blue Card at the lower salary threshold (~€41,041/year vs general €45,300). Indian B.Tech / M.Tech CS graduates from recognised universities typically qualify for fast-track approval.',
        faqs: [
            { q: 'Do Indian software engineers need Anerkennung for Germany Blue Card?', a: 'Most Indian CS/IT degrees from recognised universities are listed as H+ in anabin and do NOT require formal Anerkennung. A consultant verifies your specific university\'s status.' },
            { q: 'How fast can I get German PR with the Blue Card?', a: '21 months with B1 German language proof; 33 months with A1. Holding a Blue Card lets you bring family without language tests for spouse.' },
        ],
    },
    'canada-pr-for-nurse': {
        slug: 'canada-pr-for-nurse',
        destination: 'canada-pr',
        occupation: 'Nurse',
        title: 'Canada PR for Indian Nurses 2026 | NNAS, Atlantic Pilot — Immizy',
        description: 'Canada PR for Indian nurses — NNAS credential evaluation, provincial nursing registration, Atlantic Immigration Program. Verified consultants on Immizy.',
        h1: 'Canada PR for Indian Nurses',
        intro: 'Canada actively recruits Indian nurses (NOC 31301) through Express Entry, Atlantic Immigration Program (AIP), and several provincial PNPs targeting healthcare. NNAS evaluation + provincial registration are the gateways.',
        faqs: [
            { q: 'What is NNAS and how long does it take for Indian nurses?', a: 'National Nursing Assessment Service evaluates international nursing credentials before provincial registration. Indian nurses typically need 6–12 months for full NNAS report. A consultant helps gather and submit documents in the right order.' },
        ],
    },
    'australia-pr-for-nurse': {
        slug: 'australia-pr-for-nurse',
        destination: 'australia-pr',
        occupation: 'Nurse',
        title: 'Australia PR for Indian Nurses | AHPRA & 482/189 Visa — Immizy',
        description: 'Australia PR for Indian registered nurses — AHPRA registration, ANMAC skills assessment, Subclass 189/190/482. Verified consultants on Immizy.',
        h1: 'Australia PR for Indian Nurses',
        intro: 'Registered Nurses (ANZSCO 254418) are on Australia\'s priority MLTSSL — fast-track for Subclass 189/190/491. AHPRA registration is the critical first step, followed by ANMAC skills assessment.',
        faqs: [
            { q: 'What is the AHPRA registration process for Indian nurses?', a: 'AHPRA (Nursing and Midwifery Board) assesses your qualifications, supervised practice (if required), and English. You then sit OBA (Outcomes-Based Assessment) — multiple choice + OSCE. A consultant prepares your application + connects you to OBA prep providers.' },
        ],
    },
    'us-eb5-for-investors': {
        slug: 'us-eb5-for-investors',
        destination: 'usa-visa',
        occupation: 'Investor',
        title: 'US EB-5 Investor Visa from India 2026 | Direct Investment & Regional Center — Immizy',
        description: 'US EB-5 investor green card from India — $800k TEA / $1.05M standard, regional center vs direct, India backlog timelines. Verified consultants on Immizy.',
        h1: 'US EB-5 Investor Visa for Indians',
        intro: 'EB-5 remains one of the fastest green-card pathways for high-net-worth Indians, with significantly shorter India backlogs than EB-2/EB-3. Minimum investment is USD 800,000 in a Targeted Employment Area (TEA) or USD 1,050,000 elsewhere, creating 10 full-time US jobs.',
        faqs: [
            { q: 'Is EB-5 worth it for an Indian family in 2026?', a: 'For families seeking faster green cards than EB-2/EB-3 backlogs (10–15+ years) and who can deploy ~USD 1M with moderate risk, EB-5 is the most efficient route. RUTSA reforms made TEAs more selective. A consultant matches you to a vetted regional center.' },
        ],
    },

    // ── Doctors / MBBS ─────────────────────────────────────────────────────
    'uk-skilled-worker-for-doctor': {
        slug: 'uk-skilled-worker-for-doctor',
        destination: 'uk-skilled-worker',
        occupation: 'Doctor',
        title: 'UK NHS Doctor Visa from India 2026 | PLAB & GMC Registration — Immizy',
        description: 'Move to UK as a doctor from India — PLAB 1 & 2 exam, GMC registration, NHS Tier 2 / Skilled Worker visa. Verified consultants on Immizy.',
        h1: 'UK Skilled Worker Visa for Indian Doctors',
        intro: 'Indian MBBS doctors can practise in the UK via the PLAB route (Professional and Linguistic Assessment Board) followed by GMC registration and an NHS-sponsored Skilled Worker visa. The Health & Care Worker visa applies for most NHS hospital roles, with a lower salary threshold and faster ILR pathway.',
        faqs: [
            { q: 'What is the PLAB exam and is it required for Indian doctors?', a: 'PLAB (Parts 1 and 2) is the standard UK medical licensing route for international medical graduates. Part 1 is a written exam (held in India), Part 2 is a clinical OSCE in Manchester. After passing both, you apply for full GMC registration.' },
            { q: 'Can Indian doctors skip PLAB through MRCP/MRCS?', a: 'Yes — Royal College postgraduate qualifications (MRCP, MRCS, MRCOG, FRCR, etc.) are recognised as PLAB-exempt routes to GMC registration. Many Indian doctors pursue this if planning UK specialty training.' },
            { q: 'How much does an NHS junior doctor earn from India?', a: 'NHS Foundation Year 1 (FY1) basic pay is ~£32,300/yr, FY2 ~£37,000. Specialty Registrars (CT/ST) earn £43k–£63k. The Health & Care visa salary threshold (£29k) is easily exceeded for doctors.' },
        ],
    },
    'germany-blue-card-for-doctor': {
        slug: 'germany-blue-card-for-doctor',
        destination: 'germany-job-seeker',
        occupation: 'Doctor',
        title: 'Germany Approbation for Indian Doctors 2026 | Blue Card Route — Immizy',
        description: 'Practise medicine in Germany as an Indian doctor — Approbation (medical licence), Fachsprachprüfung, EU Blue Card. Verified consultants on Immizy.',
        h1: 'Germany Approbation + Blue Card for Indian Doctors',
        intro: 'Germany faces a chronic shortage of doctors and actively recruits from India. The pathway is: B2 German → Fachsprachprüfung (medical German exam) → state-by-state Approbation (medical licence) → EU Blue Card or Skilled Worker visa with a hospital offer. Total timeline 12–24 months.',
        faqs: [
            { q: 'How long does Approbation take from India?', a: 'B2 German typically takes 8–12 months, plus 3–6 months for Fachsprachprüfung prep, plus 3–6 months for the state Approbation review. Many consultants partner with German hospitals that offer Anpassungslehrgang (adaptation training) which can fast-track the timeline.' },
        ],
    },
    'australia-pr-for-doctor': {
        slug: 'australia-pr-for-doctor',
        destination: 'australia-pr',
        occupation: 'Doctor',
        title: 'Australia AMC for Indian Doctors | Subclass 482 & 189 Visa — Immizy',
        description: 'Indian doctors to Australia — AMC exam, AHPRA registration, Specialist pathway, Subclass 482 employer-sponsored visa. Verified consultants on Immizy.',
        h1: 'Australia Medical Pathway for Indian Doctors',
        intro: 'Indian doctors enter Australia primarily via the AMC (Australian Medical Council) Standard Pathway — AMC MCQ + AMC Clinical exam, or the Workplace Based Assessment (WBA) route through a sponsoring hospital. Specialist doctors (MD/DM holders) use the Specialist Pathway through the relevant College (RACP, RACS, RACGP, etc.).',
        faqs: [
            { q: 'What is the difference between AMC Standard Pathway and Specialist Pathway?', a: 'Standard Pathway is for general practitioners / non-specialists — AMC MCQ + Clinical. Specialist Pathway is for Indian specialists (cardiologists, surgeons, etc.) and goes through the relevant Australian Specialist College for substantial equivalence assessment.' },
        ],
    },

    // ── Accountant / CA / CPA ──────────────────────────────────────────────
    'canada-pr-for-accountant': {
        slug: 'canada-pr-for-accountant',
        destination: 'canada-pr',
        occupation: 'Accountant',
        title: 'Canada PR for Indian Chartered Accountants 2026 | CPA Bridge — Immizy',
        description: 'Canada PR for Indian CAs — NOC 11100/11101 Express Entry, CPA Canada bridge programme, PNP nominations. Verified consultants on Immizy.',
        h1: 'Canada PR for Indian Chartered Accountants',
        intro: 'Indian Chartered Accountants (ICAI members) are in high demand in Canada — financial auditors and accountants (NOC 11100) and accounting technicians (NOC 12200) are eligible for Express Entry. CPA Canada has a Memorandum of Understanding with ICAI that allows Indian CAs to qualify for the Canadian CPA designation via a shortened bridge pathway.',
        faqs: [
            { q: 'Are Indian CAs eligible for Canada PR?', a: 'Yes — under NOC 11100 (Financial auditors and accountants) for Express Entry. The MOU between ICAI and CPA Canada lets Indian CAs convert their qualification to CPA Canada faster than non-MoU professionals.' },
            { q: 'Which Canadian provinces have PNP streams for accountants?', a: 'Ontario (OINP Human Capital Priorities), British Columbia (Skills Immigration), Alberta (AAIP Alberta Opportunity Stream), and Saskatchewan (SINP International Skilled Worker) all regularly include accountants in their target occupation lists.' },
        ],
    },
    'australia-pr-for-accountant': {
        slug: 'australia-pr-for-accountant',
        destination: 'australia-pr',
        occupation: 'Accountant',
        title: 'Australia PR for Indian Accountants | CPA Australia & 189/190 — Immizy',
        description: 'Australia PR for Indian CAs — ANZSCO 221111/221112, CPA Australia / IPA / CA ANZ skills assessment, Subclass 189/190 visa. Verified consultants on Immizy.',
        h1: 'Australia PR for Indian Accountants',
        intro: 'General Accountant (ANZSCO 221111), Management Accountant (221112), and Taxation Accountant (221113) are all on Australia\'s MLTSSL — eligible for Subclass 189 (independent), 190 (state-nominated), and 491 (regional). Skills assessment is via CPA Australia, IPA, or CA ANZ.',
        faqs: [
            { q: 'Which body assesses Indian accountants for Australia PR?', a: 'CPA Australia, Institute of Public Accountants (IPA), and Chartered Accountants Australia & New Zealand (CA ANZ) are the three assessing authorities. Indian CAs commonly choose CPA Australia or CA ANZ given the postgraduate-level recognition.' },
        ],
    },

    // ── Teacher ─────────────────────────────────────────────────────────────
    'uk-skilled-worker-for-teacher': {
        slug: 'uk-skilled-worker-for-teacher',
        destination: 'uk-skilled-worker',
        occupation: 'Teacher',
        title: 'UK Teacher Visa from India | QTS & Skilled Worker Route — Immizy',
        description: 'Move to UK as a teacher from India — Qualified Teacher Status (QTS), iQTS, Skilled Worker visa, shortage subject bonuses. Verified consultants on Immizy.',
        h1: 'UK Skilled Worker Visa for Indian Teachers',
        intro: 'Indian teachers can move to UK schools via the Skilled Worker visa, sponsored by a state, academy, or independent school. Qualified Teacher Status (QTS) is required for state schools — accessible to Indian B.Ed holders via the international iQTS route, the Assessment Only route, or through a school-led PGCE.',
        faqs: [
            { q: 'What is iQTS and how can Indian teachers obtain it?', a: 'International Qualified Teacher Status (iQTS) is a UK government route for non-UK trained teachers. Indian teachers with a B.Ed and 2+ years of classroom experience can apply through Department for Education-approved iQTS providers, often delivered remotely.' },
            { q: 'Which UK teaching subjects are in shortage for Indian teachers?', a: 'Maths, Physics, Chemistry, Computing, and Modern Foreign Languages (Mandarin in particular) are official shortage subjects — they receive bursaries and faster Skilled Worker visa endorsement.' },
        ],
    },
    'uae-work-visa-for-teacher': {
        slug: 'uae-work-visa-for-teacher',
        destination: 'uae-golden-visa',
        occupation: 'Teacher',
        title: 'UAE Teacher Visa from India | Dubai & Abu Dhabi Schools — Immizy',
        description: 'Teach in Dubai or Abu Dhabi from India — KHDA / ADEK requirements, work visa cost, salary expectations. Verified UAE consultants on Immizy.',
        h1: 'UAE Teaching Jobs for Indian Teachers',
        intro: 'UAE schools (CBSE, IB, British, American, IGCSE curricula) actively recruit Indian teachers — particularly for Maths, Science, English, and Early Years. Salaries range AED 8,000–18,000/month tax-free, with school-paid housing or housing allowance. Work visa is sponsored by the school via MOHRE.',
        faqs: [
            { q: 'What qualifications do UAE schools require from Indian teachers?', a: 'B.Ed + relevant subject degree is the baseline. KHDA (Dubai) and ADEK (Abu Dhabi) require attested degree certificates. 2+ years of teaching experience is preferred, particularly in the curriculum the school follows (CBSE for Indian schools, IB / British for international schools).' },
        ],
    },

    // ── Civil Engineer ──────────────────────────────────────────────────────
    'canada-pr-for-civil-engineer': {
        slug: 'canada-pr-for-civil-engineer',
        destination: 'canada-pr',
        occupation: 'Civil Engineer',
        title: 'Canada PR for Indian Civil Engineers 2026 | NOC 21300 — Immizy',
        description: 'Canada PR for Indian civil engineers — NOC 21300 Express Entry, P.Eng licensure (PEO, EGBC, APEGA), PNP infrastructure draws. Verified consultants on Immizy.',
        h1: 'Canada PR for Indian Civil Engineers',
        intro: 'Civil Engineers (NOC 21300) are a perennial in-demand occupation in Canada — eligible for Express Entry and most provincial PNPs. To work as a P.Eng (Professional Engineer) in Canada, you need provincial licensure (PEO in Ontario, EGBC in British Columbia, APEGA in Alberta, OIQ in Quebec), which Indian B.E./B.Tech holders typically obtain via degree assessment + 1–4 years of supervised Canadian experience.',
        faqs: [
            { q: 'Do I need P.Eng licensure to immigrate to Canada as a civil engineer?', a: 'No — Express Entry only checks your NOC eligibility, not provincial licensure. But to work as a "Professional Engineer" (P.Eng) and sign drawings, you need licensure with the provincial engineering body where you settle. Many Indians work as Engineer-in-Training (EIT) initially.' },
        ],
    },
    'australia-pr-for-civil-engineer': {
        slug: 'australia-pr-for-civil-engineer',
        destination: 'australia-pr',
        occupation: 'Civil Engineer',
        title: 'Australia PR for Indian Civil Engineers | ANZSCO 233211 — Immizy',
        description: 'Australia PR for Indian civil engineers — ANZSCO 233211, Engineers Australia skills assessment, Subclass 189/190/491. Verified consultants on Immizy.',
        h1: 'Australia PR for Indian Civil Engineers',
        intro: 'Civil Engineer (ANZSCO 233211) is on Australia\'s priority MLTSSL — eligible for Subclass 189 (independent), 190 (state-nominated), and 491 (regional). Skills assessment is via Engineers Australia (EA), which recognises Indian B.E./B.Tech via the Washington Accord pathway for accredited NBA institutions.',
        faqs: [
            { q: 'What is the Engineers Australia (EA) skills assessment for Indian engineers?', a: 'EA assesses your engineering qualifications via one of three pathways: (1) Washington Accord — automatic recognition for NBA-accredited 4-year B.Tech/B.E.; (2) Sydney Accord — for engineering technologists; (3) CDR (Competency Demonstration Report) — for non-accredited Indian universities (requires 3 detailed career episodes).' },
        ],
    },

    // ── Mechanical Engineer ────────────────────────────────────────────────
    'canada-pr-for-mechanical-engineer': {
        slug: 'canada-pr-for-mechanical-engineer',
        destination: 'canada-pr',
        occupation: 'Mechanical Engineer',
        title: 'Canada PR for Indian Mechanical Engineers | NOC 21301 — Immizy',
        description: 'Canada PR for Indian mechanical engineers — NOC 21301 Express Entry, automotive/aerospace/manufacturing demand, PNP options. Verified consultants on Immizy.',
        h1: 'Canada PR for Indian Mechanical Engineers',
        intro: 'Mechanical Engineers (NOC 21301) are in demand across Canada\'s automotive (Ontario), aerospace (Quebec, Manitoba), and oil & gas (Alberta) sectors. Eligible for Express Entry under FSW or CEC, and several PNPs actively target mechanical engineers — especially Saskatchewan, Manitoba, and the Atlantic provinces.',
        faqs: [
            { q: 'Which Canadian provinces target mechanical engineers in PNP?', a: 'Saskatchewan SINP, Manitoba MPNP, and the Atlantic Immigration Program (Nova Scotia, New Brunswick, PEI, Newfoundland) all regularly list mechanical engineer roles in their in-demand occupations. Ontario\'s OINP also issues regular Express Entry Tech draws that include some engineering roles.' },
        ],
    },
    'germany-blue-card-for-mechanical-engineer': {
        slug: 'germany-blue-card-for-mechanical-engineer',
        destination: 'germany-job-seeker',
        occupation: 'Mechanical Engineer',
        title: 'Germany Blue Card for Indian Mechanical Engineers — Immizy',
        description: 'Germany EU Blue Card for Indian mechanical engineers — automotive, manufacturing, and Mittelstand demand. Shortage occupation rate. Verified consultants on Immizy.',
        h1: 'Germany Blue Card for Indian Mechanical Engineers',
        intro: 'Mechanical Engineering (Maschinenbau) is the backbone of the German Mittelstand and a chronic shortage occupation — Indian mechanical engineers qualify for the EU Blue Card at the lower shortage-occupation salary threshold (~€41,041/year vs general €45,300). B.Tech/M.Tech from NBA-accredited institutions are typically listed as H+ in anabin.',
        faqs: [
            { q: 'Which German companies hire Indian mechanical engineers most actively?', a: 'Automotive OEMs (BMW, Mercedes-Benz, Volkswagen, Audi, Porsche), Tier-1 suppliers (Bosch, Continental, ZF), and Mittelstand machine-tool makers (Siemens, Trumpf, KUKA, Festo) all run direct India recruitment. Engineering services firms (Capgemini Engineering, ALTEN, Bertrandt) are common entry points.' },
        ],
    },

    // ── Chef / Hospitality ─────────────────────────────────────────────────
    'canada-pr-for-chef': {
        slug: 'canada-pr-for-chef',
        destination: 'canada-pr',
        occupation: 'Chef',
        title: 'Canada PR for Indian Chefs 2026 | NOC 62200 & Atlantic Pilot — Immizy',
        description: 'Canada PR for Indian chefs and cooks — NOC 62200/63200, Atlantic Immigration Program (AIP), employer sponsorship. Verified consultants on Immizy.',
        h1: 'Canada PR for Indian Chefs and Cooks',
        intro: 'Chefs (NOC 62200) and cooks (NOC 63200) are both eligible occupations under Canada Express Entry and the Atlantic Immigration Program (AIP). The AIP pathway is particularly popular among Indian hospitality professionals — Atlantic Canada (Nova Scotia, NB, PEI, NL) has restaurant labour shortages and offers faster PR with an employer endorsement.',
        faqs: [
            { q: 'How does the Atlantic Immigration Program work for chefs?', a: 'You secure a job offer from an Atlantic-designated employer, complete a settlement plan with a designated service provider, and the employer endorses your PR application. Total processing is typically 6–12 months — much faster than standard Express Entry for chefs.' },
        ],
    },

    // ── Truck Driver / Trades ──────────────────────────────────────────────
    'canada-pr-for-truck-driver': {
        slug: 'canada-pr-for-truck-driver',
        destination: 'canada-pr',
        occupation: 'Truck Driver',
        title: 'Canada PR for Indian Truck Drivers | NOC 73300 & PNP — Immizy',
        description: 'Canada PR for Indian truck drivers — NOC 73300, Saskatchewan SINP Long-Haul Truck Driver, Manitoba MPNP, employer LMIA. Verified consultants on Immizy.',
        h1: 'Canada PR for Indian Truck Drivers',
        intro: 'Long-haul truck drivers (NOC 73300) are in critical shortage across Canada — Saskatchewan SINP, Manitoba MPNP, and Alberta AAIP all run dedicated streams. The typical pathway is: secure an LMIA-backed job offer from a Canadian trucking company → apply for the relevant PNP → PR. Express Entry alone is harder because NOC 73300 is TEER 3.',
        faqs: [
            { q: 'What licence do Indian truck drivers need in Canada?', a: 'You\'ll need a Class 1 (or Class A in Ontario) commercial driver licence. Most Indian truck drivers obtain this in Canada after arrival via 1–3 months of training. Some Canadian employers also offer LMIA + paid training for selected international drivers.' },
            { q: 'Which Canadian provinces have PNP streams for truck drivers?', a: 'Saskatchewan SINP (Long-Haul Truck Driver Project), Manitoba MPNP (Skilled Worker in Manitoba), and Alberta AAIP (Alberta Opportunity Stream) all regularly nominate truck drivers. Atlantic provinces also accept truck drivers via AIP.' },
        ],
    },
    'australia-pr-for-truck-driver': {
        slug: 'australia-pr-for-truck-driver',
        destination: 'australia-pr',
        occupation: 'Truck Driver',
        title: 'Australia Truck Driver Visa from India | Regional 491 — Immizy',
        description: 'Move to Australia as a truck driver from India — Heavy Vehicle Driver (ANZSCO 733111) on regional 491 visa, employer sponsorship. Verified consultants on Immizy.',
        h1: 'Australia PR for Indian Truck Drivers',
        intro: 'Heavy Truck Driver (ANZSCO 733111) was added to Australia\'s Core Skills Occupation List in 2024 — making Indian truck drivers eligible for the Subclass 482 employer-sponsored visa and Subclass 494 / 491 regional skilled visas. Regional Australia (NT, WA, SA, regional NSW/QLD) has the largest demand.',
        faqs: [
            { q: 'Which Australian states sponsor Indian truck drivers?', a: 'Northern Territory, Western Australia (regional), South Australia, and regional NSW/QLD are the most active. The 491 Regional Skilled Visa offers a pathway to PR after 3 years of regional living + working.' },
        ],
    },
}

// ─── Comparison pages ──────────────────────────────────────────────────────
// URL pattern: /compare/:slug
// High top-of-funnel intent — Indian families researching options.

export const COMPARISONS = {
    'canada-vs-australia': {
        slug: 'canada-vs-australia',
        title: 'Canada vs Australia for Indians 2026 | PR Comparison — Immizy',
        description: 'Canada vs Australia PR comparison for Indian applicants — cost, processing time, points, salary, lifestyle. Find verified consultants for both.',
        h1: 'Canada vs Australia: Which PR Is Better for Indians?',
        intro: 'The two most-applied destinations for Indian skilled migrants — but which suits you better? We compare cost, processing time, points system, eligible occupations, salary expectations, weather, lifestyle, and PR-to-citizenship timelines.',
        countries: ['canada-pr', 'australia-pr'],
    },
    'canada-vs-usa': {
        slug: 'canada-vs-usa',
        title: 'Canada PR vs USA Green Card for Indians | Which Is Faster? — Immizy',
        description: 'Canada PR vs USA green card timeline + cost for Indian applicants. Why thousands of Indian H-1B holders are switching to Canada Express Entry.',
        h1: 'Canada PR vs USA Green Card for Indians',
        intro: 'India\'s 10–15 year EB-2/EB-3 backlog has driven a mass shift toward Canada Express Entry (typical 6–12 months). We compare both paths\' realistic timelines, cost, family settlement, and post-PR opportunities for Indian software engineers and skilled professionals.',
        countries: ['canada-pr', 'usa-visa'],
    },
    'germany-vs-canada': {
        slug: 'germany-vs-canada',
        title: 'Germany vs Canada for Indian Engineers 2026 — Immizy',
        description: 'Germany Blue Card vs Canada PR for Indian engineers — salary, taxes, family settlement, PR timeline. Verified consultants for both on Immizy.',
        h1: 'Germany vs Canada for Indian Engineers',
        intro: 'Germany\'s Blue Card delivers PR in as little as 21 months for engineers with B1 German, while Canada Express Entry offers ~12 months to PR but requires higher cost and CRS-score optimization. We compare both honestly for Indian software, mechanical, and civil engineers.',
        countries: ['germany-job-seeker', 'canada-pr'],
    },
    'uk-vs-canada': {
        slug: 'uk-vs-canada',
        title: 'UK Skilled Worker vs Canada PR for Indians | Comparison — Immizy',
        description: 'UK Skilled Worker visa vs Canada PR for Indian applicants — salary thresholds, ILR vs PR timelines, family settlement, cost. Find consultants on Immizy.',
        h1: 'UK Skilled Worker vs Canada PR for Indians',
        intro: 'UK\'s Skilled Worker route requires an employer sponsor with £38,700+ salary (lower for Health & Care). Canada PR is points-based with no sponsor required. We compare both for Indian software engineers, healthcare professionals, and finance roles.',
        countries: ['uk-skilled-worker', 'canada-pr'],
    },
    'h1b-vs-canada-pr': {
        slug: 'h1b-vs-canada-pr',
        title: 'H-1B vs Canada PR | Best Pathway for Indians in 2026 — Immizy',
        description: 'H-1B lottery vs Canada Express Entry for Indian software engineers — odds, costs, family, green card vs PR timelines. Honest comparison on Immizy.',
        h1: 'H-1B vs Canada PR for Indian Software Engineers',
        intro: 'With H-1B lottery odds at ~25% and EB-2 India backlog at 10–15+ years, Canada Express Entry has become the de-facto Plan B (or A) for Indian software engineers. We compare cost, family, timeline, and long-term wealth honestly.',
        countries: ['usa-visa', 'canada-pr'],
    },
}
