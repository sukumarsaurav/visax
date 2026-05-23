import { useParams } from 'react-router-dom'
import { DESTINATIONS, OCCUPATIONS } from '../../lib/seo'
import DestinationPage from './DestinationPage'
import OccupationPage from './OccupationPage'

/**
 * Dispatcher for `/immigration/:slug`.
 *
 * `:slug` can be either:
 *   - a destination key, e.g. 'canada-pr'              → DestinationPage
 *   - an occupation key, e.g. 'canada-pr-for-software-engineer' → OccupationPage
 *
 * Sharing the namespace keeps the URL clean (`/immigration/...`) and means
 * we don't need a separate `/occupation/` URL family — which would dilute
 * the SEO weight of the parent slug.
 *
 * If the slug matches neither, both pages internally Navigate to
 * /find-professionals. We dispatch by checking OCCUPATIONS first because
 * occupation slugs contain the destination slug as a prefix
 * (`canada-pr-for-software-engineer` starts with `canada-pr`), so an
 * order-of-check matters.
 */
export default function ImmigrationRouter() {
    const { destination } = useParams()
    if (OCCUPATIONS[destination]) return <OccupationPage />
    if (DESTINATIONS[destination]) return <DestinationPage />
    // Fall through to DestinationPage which redirects to /find-professionals.
    return <DestinationPage />
}
