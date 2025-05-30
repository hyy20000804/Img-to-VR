import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import Login from './pages/Login'
import Single from './pages/Single'
import SingleTwo from './pages/SingleTwo' //AFrame
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
            path='/single'
            element={
              <Layout>
                <Single />
              </Layout>
            }
          />

          <Route
            path='/singleTwo'
            element={
              <Layout>
                <SingleTwo />
              </Layout>
            }
          />
          <Route
            path='/mulitOne'
            element={
              <Layout>
                <MultiOne />
              </Layout>
            }
          />
          <Route
            path='/mulitTwo'
            element={
              <Layout>
                <MultiTwo />
              </Layout>
            }
          />
          <Route path='/' element={<Navigate to='/single\' replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default App
