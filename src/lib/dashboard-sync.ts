/** Fired after checkout / order changes so dashboard views refetch from API */
export const DASHBOARD_DATA_CHANGED = 'carely:dashboard-data-changed'

export function notifyDashboardDataChanged(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(DASHBOARD_DATA_CHANGED))
}

export function subscribeDashboardDataChanged(handler: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener(DASHBOARD_DATA_CHANGED, handler)
  return () => window.removeEventListener(DASHBOARD_DATA_CHANGED, handler)
}
