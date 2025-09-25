import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import { store } from './lib/store/store'
import { router } from './routes'
import SessionInitializer from './components/SessionInitializer'
import { LoadingProvider } from './lib/contexts/LoadingContext'
import { GlobalLoadingOverlay } from './components/Loader'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <LoadingProvider>
          <SessionInitializer>
            <RouterProvider router={router} />
            <Toaster />
            <GlobalLoadingOverlay />
          </SessionInitializer>
        </LoadingProvider>
      </Provider>
    </ErrorBoundary>
  )
}

export default App
