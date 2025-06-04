import React, { useEffect, useState } from 'react'
import { Layout as AntLayout, Menu, Button, theme, Dropdown } from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PictureOutlined,
  FundProjectionScreenOutlined,
  CameraOutlined,
  LogoutOutlined
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'

const { Header, Sider, Content } = AntLayout

function Layout ({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const {
    token: { colorBgContainer, borderRadiusLG }
  } = theme.useToken()

  //  根据路径动态匹配 Menu 选中项
  const pathToKey = {
    '/single': '1',
    '/singleTwo': '2',
    '/mulitOne': '3',
    '/mulitTwo': '4'
  }
  const selectedKey = pathToKey[location.pathname] || '1'

  const handleJump = e => {
    if (e.key === '1') navigate('/single')
    else if (e.key === '2') navigate('/singleTwo')
    else if (e.key === '3') navigate('/mulitOne')
    else navigate('/mulitTwo')
  }

  const handleLogout = () => {
    navigate('/login')
  }

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout
    }
  ]

  return (
    <AntLayout className='min-h-screen'>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint='lg'
        collapsedWidth='0'
        className='h-screen fixed left-0'
      >
        <div className='p-4 text-white text-center font-bold'>仪表盘</div>
        <Menu
          theme='dark'
          mode='inline'
          selectedKeys={[selectedKey]}
          onClick={handleJump}
          items={[
            {
              key: '1',
              icon: <PictureOutlined />,
              label: '多图动态VR'
            },
            {
              key: '2',
              icon: <PictureOutlined />,
              label: '单图VR'
            },
            {
              key: '3',
              icon: <FundProjectionScreenOutlined />,
              label: '多图立体VR'
            },
            {
              key: '4',
              icon: <CameraOutlined />,
              label: '多图动态VR'
            }
          ]}
        />
      </Sider>
      <AntLayout
        style={{ marginLeft: collapsed ? 0 : 200 }}
        className='transition-all duration-300'
      >
        <Header
          style={{ padding: 0, background: colorBgContainer }}
          className='fixed w-full z-10 flex justify-between items-center'
        >
          <Button
            type='text'
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className='text-xl w-16 h-16'
          />
          <Dropdown menu={{ items: userMenuItems }} placement='bottomRight'>
            <Button
              type='text'
              icon={<FundProjectionScreenOutlined />}
              className='mr-4'
            >
              Admin
            </Button>
          </Dropdown>
        </Header>
        <Content className='mt-16 '>
          <div
            style={{
              background: colorBgContainer,
              borderRadius: borderRadiusLG
            }}
            className='p-6 min-h-[calc(100vh)]'
          >
            {children}
          </div>
        </Content>
      </AntLayout>
    </AntLayout>
  )
}

export default Layout
