import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { User, Lock, ArrowRight, UserCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import authApi from '../api/authApi';
import { cn } from '../lib/utils';
import { BRANDING } from '../config/branding';

export default function RegisterPage({ isDarkMode }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await authApi.register(values);
      message.success('註冊成功！請直接登入使用');
      navigate('/login');
    } catch (err) {
      message.error(err.response?.data || '註冊失敗，請嘗試其他帳號');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center p-6 transition-colors duration-500",
      isDarkMode ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"
    )}>
      <Card className={cn(
        "w-full max-w-md shadow-2xl rounded-[32px] border-none overflow-hidden",
        isDarkMode ? "bg-slate-900/50 backdrop-blur-xl border-slate-800" : "bg-white text-slate-900"
      )}>
        <div className="p-8 text-center">
          <div className="mb-10">
            <h1 className="text-4xl font-black tracking-tighter mb-2">建立帳號</h1>
            <p className="text-slate-500 font-medium whitespace-nowrap">{BRANDING.registerWelcome}</p>
          </div>

          <Form
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            requiredMark={false}
          >
            <Form.Item
              label={<span className={cn("font-bold", isDarkMode ? "text-slate-400" : "text-slate-600")}>使用者名稱</span>}
              name="Username"
              rules={[{ required: true, message: '請輸入使用者名稱' }]}
            >
              <Input
                prefix={<UserCircle size={18} className="text-slate-400 mr-2" />}
                placeholder="請輸入使用者名稱"
                className="h-14 rounded-2xl bg-transparent"
              />
            </Form.Item>

            <Form.Item
              label={<span className={cn("font-bold", isDarkMode ? "text-slate-400" : "text-slate-600")}>帳號</span>}
              name="LoginAccount"
              rules={[{ required: true, message: '請輸入想要使用的帳號' }]}
            >
              <Input
                prefix={<User size={18} className="text-slate-400 mr-2" />}
                placeholder="建議使用英文與數字組合"
                className="h-14 rounded-2xl bg-transparent"
              />
            </Form.Item>

            <Form.Item
              label={<span className={cn("font-bold", isDarkMode ? "text-slate-400" : "text-slate-600")}>密碼</span>}
              name="Password"
              rules={[{ required: true, message: '請輸入密碼' }]}
            >
              <Input.Password
                prefix={<Lock size={18} className="text-slate-400 mr-2" />}
                placeholder="••••••••"
                className="h-14 rounded-2xl bg-transparent"
              />
            </Form.Item>

            <Form.Item className="mt-8 mb-2">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-2xl text-lg font-black border-none shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                立即加入專案 <ArrowRight size={20} />
              </Button>
            </Form.Item>

            <div className="text-center mt-6">
              <span className="text-slate-500">已經有帳號了嗎？ </span>
              <Link to="/login" className="text-blue-500 font-bold hover:underline ml-1">
                按此登入
              </Link>
            </div>
          </Form>
        </div>
      </Card>
    </div>
  );
}
