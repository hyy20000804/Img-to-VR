import React from 'react'
import { Form, Input, Button, Card, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

function Login () {
  const navigate = useNavigate()

  const onFinish = values => {
    // In a real app, you would validate credentials with your backend
    if (values.username === 'admin' && values.password === '123456') {
      message.success('Login successful!')
      navigate('/dashboard')
    } else {
      message.error('Invalid credentials!')
    }
  }

  return (
    <div className='min-h-screen bg-gray-100 flex items-center justify-center p-4'>
      <Card className='w-full max-w-md'>
        <div className='text-center mb-8'>
          <h1 className='text-2xl font-bold text-gray-800'>Admin Dashboard</h1>
          <p className='text-gray-600'>Please login to continue</p>
        </div>
        <Form
          name='login'
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout='vertical'
          size='large'
        >
          <Form.Item
            name='username'
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder='Username (admin)' />
          </Form.Item>
          <Form.Item
            name='password'
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder='Password (admin)'
            />
          </Form.Item>
          <Form.Item>
            <Button type='primary' htmlType='submit' className='w-full'>
              Log in
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default Login
