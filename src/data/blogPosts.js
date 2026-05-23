// ============================================================
// Blog content hub — seed posts.
//
// These ten posts target the highest-volume informational queries
// for the Indian → abroad immigration journey (see docs/SEO_KEYWORDS.md
// section 9). Each post:
//
//   • lives at /blog/:slug
//   • has its own <title>, <meta description>, OG image, Article schema
//   • links to the matching /immigration/:destination page (link equity)
//
// `body` is markdown-flavoured but rendered as paragraphs + h2s in
// BlogPostPage. Long-form (1200-2000 word) posts are recommended for
// real SEO ranking — these seeds are a starting framework you can
// expand with full article content.
// ============================================================

export const BLOG_POSTS = [
    {
        slug: 'canada-pr-from-india-complete-guide-2026',
        title: 'Canada PR from India — Complete 2026 Guide (Cost, Timeline, Documents)',
        excerpt: 'Everything Indian applicants need to know about Canada PR in 2026 — Express Entry vs PNP, cost in INR, document checklist, processing times, and which consultants actually help.',
        author: 'Immizy Editorial',
        date: '2026-05-23',
        readMins: 12,
        category: 'Canada',
        relatedDestination: 'canada-pr',
        keywords: 'canada pr from india 2026, canada pr cost india, canada pr timeline, canada express entry guide india, canada pr checklist',
        body: [
            { h: null, p: 'Canada remains the #1 immigration destination for Indian skilled professionals — over 118,000 Indians received Canadian PR in 2024 alone. This guide walks through every step of the 2026 process, from CRS score optimisation to landing in Canada.' },
            { h: 'Express Entry vs Provincial Nominee Program (PNP)', p: 'Express Entry is the federal points-based system. PNP lets a province nominate you for an additional 600 CRS points — guaranteeing an invitation. For Indians with 460-490 CRS, PNP is usually the right call.' },
            { h: 'Total cost of Canada PR from India (2026)', p: 'Government fees: CAD 1,365 per adult + CAD 230 per child. IELTS: ₹15,000+. WES ECA: ₹25,000+. Medicals: ₹7,000. Police clearance: ₹500+. Consultant fees: ₹50,000–2L. Total per single applicant: ₹3–6 lakh INR. Family of 4: ₹6–10 lakh INR.' },
            { h: 'Document checklist', p: 'Passport, IELTS / CELPIP / TEF, ECA report (WES / IQAS / ICAS / CES / PEBC), reference letters with NOC code on company letterhead, ITR for proof-of-funds, marriage certificate (if applicable), birth certificates of children, PCC from every country lived 6+ months.' },
            { h: 'Processing time', p: 'Express Entry: ~6 months from ITA. PNP: 12–18 months. Family sponsorship: 12–24 months. Add 2–4 weeks for PR confirmation document (COPR / eCOPR).' },
            { h: 'Common reasons applications get rejected', p: 'Missing reference letters with NOC details, mismatched IELTS scores, insufficient proof-of-funds (must be liquid for 6 months), undisclosed visa refusals, and incorrect NOC code selection. A verified consultant catches these before submission.' },
        ],
    },
    {
        slug: 'australia-189-vs-190-vs-491-which-should-indians-apply',
        title: 'Australia 189 vs 190 vs 491 — Which Should an Indian Apply For?',
        excerpt: 'Comparing Australia\'s three skilled migration visas for Indian applicants — points required, processing time, post-visa flexibility, and which gives the fastest pathway to PR.',
        author: 'Immizy Editorial',
        date: '2026-05-23',
        readMins: 10,
        category: 'Australia',
        relatedDestination: 'australia-pr',
        keywords: 'australia 189 vs 190 vs 491, australia skilled visa comparison india, subclass 189 india, subclass 190 state nomination',
        body: [
            { h: null, p: 'Australia\'s three primary skilled migration visas — Subclass 189, 190, and 491 — all lead to PR but differ significantly in points required, geographic restrictions, and processing speed. Here\'s how to pick.' },
            { h: 'Subclass 189 — Skilled Independent (PR direct)', p: 'No sponsor required. Highest points cutoff (typically 90+ for IT occupations). Live and work anywhere in Australia. Best for high-scoring applicants who want full flexibility.' },
            { h: 'Subclass 190 — State Nominated (PR direct)', p: 'A state nominates you for +5 points. Commit to living in the state for 2 years. Lower competition than 189 but tied to state occupation lists. Common for accountants, mechanical engineers, civil engineers.' },
            { h: 'Subclass 491 — Regional Sponsored (Provisional PR)', p: 'A regional area nominates you for +15 points. Must live and work in regional Australia for 3 years before PR. Lowest points cutoff. Often the only realistic option for mid-range applicants.' },
        ],
    },
    {
        slug: 'germany-chancenkarte-for-indians-points-calculator',
        title: 'Germany Chancenkarte for Indians — Points Calculator + Eligibility',
        excerpt: 'Germany\'s new Opportunity Card lets Indians enter to search for jobs without a prior offer. Here\'s the points system, eligibility criteria, and step-by-step application process.',
        author: 'Immizy Editorial',
        date: '2026-05-23',
        readMins: 8,
        category: 'Germany',
        relatedDestination: 'germany-job-seeker',
        keywords: 'germany chancenkarte india, germany opportunity card points, germany job seeker visa 2026, chancenkarte eligibility',
        body: [
            { h: null, p: 'The Chancenkarte (Opportunity Card) launched in June 2024 to address Germany\'s skilled-worker shortage. Unlike the older Job Seeker Visa, it uses a points system — making it accessible to applicants who don\'t meet every traditional criterion.' },
            { h: 'Eligibility (one of these required)', p: '(1) Recognised foreign degree or vocational qualification; OR (2) Equivalent qualification PLUS at least 6 points in the new points system. Plus: A1 German or B2 English, sufficient funds (€12,324+ or part-time work agreement), valid passport.' },
            { h: 'Points calculator', p: 'Qualifications: 4 points (recognised) / 1-3 (partial). Work experience: up to 3 points. Age: up to 2 points (under 35). Language: B1 German = 3 points, B2 = 2 extra. Connection to Germany: 1 point (previous stay). Spouse/partner with own application: 1 point.' },
            { h: 'How to apply from India', p: 'Online via German consulate (Mumbai, Chennai, Bengaluru, Kolkata, New Delhi). Documents: passport, degree certificates, anabin assessment, language proof, funds proof, CV in German format. Processing 4-12 weeks.' },
        ],
    },
    {
        slug: 'uk-skilled-worker-salary-threshold-2026-changes',
        title: 'UK Skilled Worker Visa Salary Threshold 2026 — What Changed',
        excerpt: 'The April 2024 threshold jump to £38,700 caught many Indians off guard. Here\'s the current threshold for every occupation, the Health & Care exemption, and which routes still work.',
        author: 'Immizy Editorial',
        date: '2026-05-23',
        readMins: 7,
        category: 'United Kingdom',
        relatedDestination: 'uk-skilled-worker',
        keywords: 'uk skilled worker salary threshold 2026, uk skilled worker visa india, uk 38700 threshold, uk health and care visa salary',
        body: [
            { h: null, p: 'The UK\'s April 2024 reforms raised the Skilled Worker minimum salary to £38,700 — up from £26,200. For Indian applicants, this changed the eligible-occupation landscape overnight. Here\'s what still works in 2026.' },
            { h: 'General Skilled Worker threshold: £38,700', p: 'Or the "going rate" for the SOC code, whichever is higher. Most senior IT, finance, and management roles in London-based companies meet this comfortably.' },
            { h: 'Health & Care Worker visa: £29,000', p: 'Nurses, doctors, care workers, and allied health professionals on the eligible list use this lower threshold. The Health & Care visa is exempt from the 38,700 increase and remains the highest-volume route for Indians.' },
        ],
    },
    {
        slug: 'best-country-to-migrate-from-india-2026',
        title: 'Best Country to Migrate to from India in 2026 (Engineer / Nurse / Doctor)',
        excerpt: 'Cutting through the noise — for Indian software engineers, nurses, and doctors, here\'s the country that gives the fastest, cheapest, most reliable pathway to PR in 2026.',
        author: 'Immizy Editorial',
        date: '2026-05-23',
        readMins: 14,
        category: 'Strategy',
        keywords: 'best country to migrate from india 2026, best country for indian engineer, best country for indian nurse, easiest country to migrate india',
        body: [
            { h: null, p: 'There is no universal "best" — your occupation, age, language scores, and family situation all matter. Here are our 2026 recommendations by profile.' },
            { h: 'Indian Software Engineer (5+ years exp)', p: 'Canada Express Entry (12 months) or Germany Blue Card (21 months to PR). Australia 189 if you can score 95+ points. UK only if employer-sponsored at £45k+.' },
            { h: 'Indian Registered Nurse', p: 'UK Health & Care visa (5 years to ILR) or Germany Anerkennung route (3 years to PR with B2 German). Australia AHPRA pathway is excellent but takes 12-24 months to register.' },
            { h: 'Indian Doctor (MBBS)', p: 'UK PLAB route is fastest and cheapest. Germany Approbation pathway gives the best long-term lifestyle. Australia AMC for specialists. USA USMLE only if you\'re committed to 5+ years of training.' },
        ],
    },
    {
        slug: 'canada-pr-without-ielts-is-it-possible',
        title: 'Canada PR Without IELTS — Is It Possible?',
        excerpt: 'Short answer: no, but you can replace IELTS with CELPIP or TEF Canada (for French). Here\'s how each alternative works and which is fastest for Indians.',
        author: 'Immizy Editorial',
        date: '2026-05-23',
        readMins: 6,
        category: 'Canada',
        relatedDestination: 'canada-pr',
        keywords: 'canada pr without ielts, celpip vs ielts india, tef canada india, canada pr language test',
        body: [
            { h: null, p: 'IRCC requires a language test for all Express Entry profiles — there is no "no test" exemption. But you have three valid alternatives.' },
            { h: 'CELPIP (English alternative)', p: 'Canadian Experience Class Language Index Program. Computer-based, faster results than IELTS, conducted in India at Pearson centres. Many Indians find CELPIP\'s Indian-English accent neutrality easier than IELTS.' },
            { h: 'TEF Canada or TCF Canada (French)', p: 'If you have B1-B2 French, this can dramatically boost your CRS — Francophone Mobility programs and Quebec streams open up. Worth investing 12-18 months of French study if your CRS is borderline.' },
        ],
    },
    {
        slug: 'h1b-2026-lottery-what-indians-should-plan',
        title: 'H-1B 2026 Lottery — What Indians Should Plan For',
        excerpt: 'With H-1B selection rates at ~25%, India\'s applicants need a Plan B. Here\'s how to play the H-1B lottery and the four other US visa routes worth pursuing.',
        author: 'Immizy Editorial',
        date: '2026-05-23',
        readMins: 9,
        category: 'United States',
        relatedDestination: 'usa-visa',
        keywords: 'h1b 2026 lottery, h1b india chances, h1b alternatives india, us visa india h1b plan b',
        body: [
            { h: null, p: 'The FY2026 H-1B cap is 85,000 (65k regular + 20k US master\'s). With ~470,000 registrations, selection odds are ~18% — and Indians receive ~70% of all H-1Bs. Plan accordingly.' },
            { h: 'Maximise your H-1B chances', p: 'Multiple registrations from different employers (legal as long as each is a bona-fide job offer). US Master\'s degree (US-cap exemption gives a 2nd lottery shot). Stay on OPT/STEM-OPT to remain eligible across years.' },
            { h: 'Plan B options', p: 'L-1 intra-company transfer (no lottery), O-1 extraordinary ability, F-1 → STEM OPT, Canada Express Entry as backup (many Indian H-1B holders are now dual-applying).' },
        ],
    },
    {
        slug: 'top-10-mistakes-canada-pr-rejection',
        title: 'Top 10 Mistakes That Get Canada PR Applications Rejected',
        excerpt: 'IRCC refuses ~10% of Canada PR applications. These ten mistakes — most preventable — account for the majority. Avoid them.',
        author: 'Immizy Editorial',
        date: '2026-05-23',
        readMins: 11,
        category: 'Canada',
        relatedDestination: 'canada-pr',
        keywords: 'canada pr rejection reasons, why canada pr gets refused, canada pr mistakes india, ircc refusal reasons',
        body: [
            { h: null, p: 'Most Canada PR refusals are avoidable. Here are the ten most common reasons IRCC issues a refusal letter — and how to prevent each.' },
            { h: '1. Insufficient proof of funds', p: 'Funds must be liquid (savings, mutual funds, FDs) — not property, gold, or PF/EPF. Held for 6+ months. Statement must show daily balance, not just end-of-month.' },
            { h: '2. NOC code mismatch', p: 'Your job duties on the reference letter must align with the NOC code\'s lead statement and main duties. "Software Engineer" alone is not enough — describe specific NOC 21231 duties.' },
            { h: '3. Reference letter missing required elements', p: 'Must be on company letterhead, signed, dated, list start/end dates, hours per week, salary, exact job title, and detailed duties. Email-only or unsigned letters are auto-rejected.' },
            { h: '4. Undisclosed previous refusals', p: 'Question 17 on the forms. If you\'ve been refused any visa to any country, declare it. Non-disclosure = misrepresentation = 5-year ban.' },
        ],
    },
    {
        slug: 'cheapest-country-to-migrate-from-india-for-pr',
        title: 'Cheapest Country to Migrate to from India for Permanent Residency',
        excerpt: 'If budget is your primary constraint, which country gives you PR for the least upfront cost? Honest cost comparison across Canada, Germany, Portugal, and UAE.',
        author: 'Immizy Editorial',
        date: '2026-05-23',
        readMins: 8,
        category: 'Strategy',
        keywords: 'cheapest country pr from india, low cost immigration india, affordable pr india, cheap migration india',
        body: [
            { h: null, p: 'Total cost = visa fees + tests + documentation + consultant + proof of funds + relocation. Here\'s the honest ranking, INR per single applicant.' },
            { h: 'Portugal D7 — ₹4–6 lakh', p: 'Lowest barrier. €820/month proof-of-income is the smallest financial bar of any EU PR pathway. PR in 5 years, EU citizenship at year 5.' },
            { h: 'Germany Job Seeker Visa / Chancenkarte — ₹5–7 lakh', p: 'Visa fee only €75. Proof of funds ~€12,000. Major cost is German language learning (~₹1L for B1). Blue Card to PR in 21 months with B1.' },
            { h: 'Canada Express Entry — ₹6–10 lakh', p: 'Higher proof-of-funds (CAD 14,690 for single applicant), but no language-learning cost since IELTS is your existing English. Government fees + ECA + medicals + landing.' },
            { h: 'UAE Golden Visa — ₹2–5 lakh', p: 'Lowest if you qualify on salary alone (AED 30,000+/month, no proof-of-funds, no language). Catch: UAE Golden Visa is renewable residency, not permanent PR or citizenship pathway.' },
        ],
    },
    {
        slug: 'family-sponsorship-canada-bringing-spouse-parents',
        title: 'Family Sponsorship Canada — Bringing Spouse and Parents from India',
        excerpt: 'How Canadian PRs and citizens sponsor spouses, parents, and grandparents from India. Processing times, financial requirements, and avoiding common refusals.',
        author: 'Immizy Editorial',
        date: '2026-05-23',
        readMins: 9,
        category: 'Canada',
        relatedDestination: 'canada-pr',
        keywords: 'canada family sponsorship india, canada spouse visa india, canada parents sponsorship pgp, super visa india',
        body: [
            { h: null, p: 'Once you become a Canadian PR or citizen, you can sponsor your spouse / common-law partner, dependent children, parents, and grandparents to immigrate as PRs.' },
            { h: 'Spouse sponsorship', p: 'No income requirement for spouse / dependent children. Inland (spouse already in Canada) takes ~12 months. Outland (sponsor in Canada, spouse in India) takes 12-18 months. Genuineness of relationship is the #1 scrutiny area.' },
            { h: 'Parents and Grandparents Program (PGP)', p: 'Annual lottery, ~20,000 invitations per year. Sponsor must meet 3-year MNI (Minimum Necessary Income) threshold. Approval rate ~95% once invited. Processing 20-24 months.' },
            { h: 'Super Visa alternative', p: 'For parents who don\'t want PR but want extended visits. 10-year multi-entry visa, 5 years per stay. Requires LICO income + medical insurance. Much faster (8-12 weeks).' },
        ],
    },
]

export function getPostBySlug(slug) {
    return BLOG_POSTS.find(p => p.slug === slug)
}

export function getRelatedPosts(slug, limit = 3) {
    const current = getPostBySlug(slug)
    if (!current) return []
    return BLOG_POSTS
        .filter(p => p.slug !== slug && (p.category === current.category || p.relatedDestination === current.relatedDestination))
        .slice(0, limit)
}
