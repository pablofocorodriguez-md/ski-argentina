import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Resorts from './pages/Resorts'
import Calculator from './pages/Calculator'
import ResortDetail from './pages/ResortDetail'

function LangRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="centros" element={<Resorts />} />
        <Route path="centros/:slug" element={<ResortDetail />} />
        <Route path="resorts" element={<Resorts />} />
        <Route path="resorts/:slug" element={<ResortDetail />} />
        <Route path="calculador" element={<Calculator />} />
        <Route path="calculator" element={<Calculator />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/es/*" element={<LangRoutes />} />
          <Route path="/en/*" element={<LangRoutes />} />
          <Route path="/pt/*" element={<LangRoutes />} />
          <Route path="*" element={<Navigate to="/es" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
