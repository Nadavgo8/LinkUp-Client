import { observer } from 'mobx-react-lite'
import { ui } from '../stores/uiStore.js'

export const ErrorBanner = observer(() => (
  <div className="fixed right-4 top-4 z-50 space-y-2">
    {ui.errors.map(e => (
      <div key={e.id} className="rounded-lg border bg-red-50 px-4 py-2 shadow">
        <div className="flex items-start gap-3">
          <span className="font-semibold text-red-700">Error</span>
          <span className="text-sm">{e.message}</span>
          <button className="ml-auto text-sm underline" onClick={() => ui.dismiss(e.id)}>Close</button>
        </div>
      </div>
    ))}
  </div>
))
