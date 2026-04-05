import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { User, Lock, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import authApi from '../api/authApi';
import useAuthStore from '../store/useAuthStore';
import { cn } from '../lib/utils';
import { BRANDING } from '../config/branding';
import logoImg from '../assets/logo.jpg';

export default function LoginPage({ isDarkMode }) {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await authApi.login(values);
      login(res);
      message.success('登入成功！');
      navigate('/');
    } catch (err) {
      message.error(err.response?.data || '登入失敗，請確認帳號與密碼');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = () => {
    form.setFieldsValue({
      LoginAccount: 'admin',
      Password: 'admin1234'
    });
    message.info('已預填測試帳號：admin');
  };

  return (
    <div className={cn(
      "min-h-screen flex flex-col md:flex-row transition-colors duration-700 font-sans",
      isDarkMode ? "bg-slate-950" : "bg-slate-50"
    )}>
      {/* 左側：品牌視覺區域 (電腦端顯示) */}
      <div className={cn(
        "hidden md:flex md:w-1/2 relative items-center justify-center overflow-hidden",
        isDarkMode 
          ? "bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 to-slate-950 border-r border-slate-800/50" 
          : "bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-600 to-blue-800 shadow-2xl shadow-blue-500/10"
      )}>
        {/* 高階氛圍背景裝飾 */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] rounded-full bg-white/5 blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-blue-400/10 blur-[100px]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] contrast-150" />
        </div>

        {/* Logo 展示區 - 精細物理質感 */}
        <div className="relative z-10 text-center p-12 max-w-lg">
          <div className="mb-10 inline-block relative group">
            {/* 強調 Logo 本身的擴散陰影，而非背景底座 */}
            <div className="absolute -inset-8 bg-blue-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="relative">
              <img 
                src={logoImg} 
                alt="Company Logo" 
                className="w-56 h-56 object-cover rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] ring-1 ring-white/5 transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>
          
          <h2 className="text-5xl font-black text-white tracking-tighter mb-6 leading-tight drop-shadow-2xl">
            {BRANDING.loginTitle}
          </h2>
          <p className="text-white/60 text-xl font-medium tracking-wide">
            為高效率團隊打造的<br/>
            <span className="text-white font-bold inline-flex items-center gap-2 mt-2">
              <span className="w-8 h-[2px] bg-blue-400/50" /> 
              專業看板管理系統
              <span className="w-8 h-[2px] bg-blue-400/50" />
            </span>
          </p>
        </div>
        
        {/* 底部邊緣裝飾 */}
        <div className="absolute bottom-12 left-12 flex gap-3 opacity-30">
          <div className="w-3 h-3 rounded-full bg-white" />
          <div className="w-3 h-3 rounded-full bg-white/50" />
          <div className="w-3 h-3 rounded-full bg-white/20" />
        </div>
      </div>

      {/* 右側：登入表單區域 */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 lg:px-24 xl:px-44 2xl:px-56">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-right-8 duration-700">
          <div className="mb-16">
            {/* 行動端小 Logo */}
            <div className="md:hidden mb-8 flex justify-center">
              <div className="p-3 bg-white/5 backdrop-blur-xl rounded-2xl border border-slate-200/20 shadow-xl">
                <img src={logoImg} alt="Logo" className="w-14 h-14 rounded-xl object-cover" />
              </div>
            </div>
            
            <h1 className={cn(
              "text-5xl font-black tracking-tight mb-5",
              isDarkMode ? "text-white" : "text-slate-900"
            )}>
              歡迎回來
            </h1>
            <p className="text-slate-500 text-xl font-medium tracking-tight">請開始規劃您的待辦事項</p>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            requiredMark={false}
            className="space-y-8"
          >
            <Form.Item
              label={<span className={cn("text-sm uppercase tracking-[0.2em] mb-2 block", isDarkMode ? "text-slate-500 font-black" : "text-slate-400 font-black")}>帳號</span>}
              name="LoginAccount"
              rules={[{ required: true, message: '請輸入帳號' }]}
            >
              <Input 
                prefix={<User size={22} className="text-slate-400 mr-3" />} 
                placeholder="輸入用戶帳號"
                className={cn(
                  "h-16 rounded-2xl bg-transparent border-2 transition-all font-semibold text-lg",
                  isDarkMode 
                    ? "border-slate-800 text-white hover:border-blue-500/50 hover:bg-white/5" 
                    : "border-slate-200 text-slate-900 hover:border-blue-500/50"
                )}
              />
            </Form.Item>

            <Form.Item
              label={<span className={cn("text-sm uppercase tracking-[0.2em] mb-2 block", isDarkMode ? "text-slate-500 font-black" : "text-slate-400 font-black")}>密碼</span>}
              name="Password"
              rules={[{ required: true, message: '請輸入密碼' }]}
            >
              <Input.Password 
                prefix={<Lock size={22} className="text-slate-400 mr-3" />} 
                placeholder="••••••••"
                className={cn(
                  "h-16 rounded-2xl bg-transparent border-2 transition-all text-lg",
                  isDarkMode 
                    ? "border-slate-800 text-white hover:border-blue-500/50 hover:bg-white/5" 
                    : "border-slate-200 text-slate-900 hover:border-blue-500/50"
                )}
              />
            </Form.Item>

            <Form.Item className="pt-6">
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                className="w-full h-16 bg-blue-600 hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-500/40 active:scale-[0.97] transition-all rounded-[20px] text-xl font-black border-none shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3"
              >
                登入 <ArrowRight size={24} strokeWidth={3} className="ml-1" />
              </Button>
            </Form.Item>

            <div className="space-y-6 pt-10 border-t border-slate-500/10">
              <div className="text-center">
                <span className="text-slate-500 font-semibold tracking-tight">尚未加入我們？</span>
                <Link to="/register" className="text-blue-500 font-black hover:text-blue-600 transition-colors ml-3 text-lg underline-offset-4 hover:underline">
                  立即申請
                </Link>
              </div>

              {/* 快速登入功能 */}
              <div 
                onClick={handleQuickLogin}
                className={cn(
                  "p-4 rounded-2xl border border-dashed transition-all cursor-pointer group flex items-center justify-between",
                  isDarkMode 
                    ? "border-slate-800 bg-white/5 hover:bg-white/10 hover:border-blue-500/50" 
                    : "border-slate-200 bg-slate-100/50 hover:bg-blue-50 hover:border-blue-500/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/20 p-2 rounded-lg text-blue-500 group-hover:scale-110 transition-transform">
                    <User size={18} />
                  </div>
                  <div>
                    <p className={cn("text-sm font-black uppercase tracking-widest", isDarkMode ? "text-slate-400" : "text-slate-500")}>快速登入</p>
                    <p className={cn("text-xs font-bold", isDarkMode ? "text-slate-600" : "text-slate-400")}>測試帳號: admin</p>
                  </div>
                </div>
                <div className={cn(
                  "text-xs font-bold px-3 py-1 rounded-full",
                  isDarkMode ? "bg-slate-800 text-slate-400" : "bg-white text-blue-500"
                )}>
                  點擊填寫
                </div>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
