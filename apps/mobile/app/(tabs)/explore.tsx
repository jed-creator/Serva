/**
 * Explore tab — the mobile super-app hub. Mirrors the web app's
 * `/explore` page. Delegates layout to `<ExploreGrid />` so the
 * component is reusable if we ever want to embed it elsewhere (e.g.,
 * the Home screen's "Browse" shelf).
 */
import { ExploreGrid } from '@/components/super-app/explore-grid';

export default function ExploreTab() {
  return <ExploreGrid />;
}
