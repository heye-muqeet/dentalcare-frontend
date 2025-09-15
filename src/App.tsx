import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { store } from './lib/store/store'
import { router } from './routes'
import SessionInitializer from './components/SessionInitializer'
import { LoadingProvider } from './lib/contexts/LoadingContext'
import { GlobalLoadingOverlay } from './components/Loader'

function App() {
  return (
    <Provider store={store}>
      <LoadingProvider>
        <SessionInitializer>
          <RouterProvider router={router} />
          <Toaster position="bottom-right" />
          <GlobalLoadingOverlay />
        </SessionInitializer>
      </LoadingProvider>
    </Provider>
  )
}

export default App
