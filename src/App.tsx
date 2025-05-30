import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import Login from './pages/Login'
import Single from './pages/Single'
import MultiTwo from './pages/Multi-two'
import Layout from './components/Layout'
import MultiOne from './pages/Multi-one'

function App () {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1677ff'
        }
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route
            path='/upload'
            element={
              <Layout>
                <MultiOne />
              </Layout>
            }
          />
          <Route
            path='/dashboard'
            element={
              <Layout>
                <Single />
              </Layout>
            }
          />

          <Route
            path='/echarts'
            element={
              <Layout>
                <MultiTwo />
              </Layout>
            }
          />
          <Route path='/' element={<Navigate to='/dashboard\' replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default App
