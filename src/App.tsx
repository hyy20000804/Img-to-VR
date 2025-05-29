import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Echarts from './pages/Echarts'
import Layout from './components/Layout'
import Upload from './pages/Upload'

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
                <Upload />
              </Layout>
            }
          />
          <Route
            path='/dashboard'
            element={
              <Layout>
                <Dashboard />
              </Layout>
            }
          />

          <Route
            path='/echarts'
            element={
              <Layout>
                <Echarts />
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
