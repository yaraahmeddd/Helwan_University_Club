import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
const HUCLogo = '/assets/HUC_logo.jpeg';
const HUCPictureFull = '/assets/HUC Picture Full.jpg';
const HUCFootball = '/assets/HUC football.jpg';
import { AuthService } from '@/services/authService';
import type { LoginResponse, UserInfo } from '@/types';
import { useAuth } from '@/context/AuthContext';
import {
  PATTERNS,
  formatValidationError,
  validateEmail,
  validateLoginNationalId,
  validatePassword,
} from '@/lib/validation';

const BG_IMAGES = [HUCPictureFull, HUCFootball];

const Login: React.FC = () => {
  const { i18n } = useTranslation();
  const { t: tVal } = useTranslation('validation');
  const { login: authLogin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({ email: '', password: '', api: '' });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loginType, setLoginType] = useState<'email' | 'national_id' | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % BG_IMAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const isRTL = i18n.resolvedLanguage?.startsWith('ar') || i18n.language?.startsWith('ar');
  const tr = (ar: string, en: string) => (isRTL ? ar : en);

  const resolveIdentifierError = (value: string, type: typeof loginType) => {
    if (!value.trim()) return tVal('login.identifierRequired');
    if (type === 'national_id') return formatValidationError(validateLoginNationalId(value), tVal) ?? '';
    if (type === 'email') return formatValidationError(validateEmail(value), tVal) ?? '';
    return '';
  };

  const resolvePasswordError = (value: string) =>
    formatValidationError(validatePassword(value, true, { minLength: 6 }), tVal) ?? '';

  useEffect(() => {
    const value = formData.email;
    if (PATTERNS.NATIONAL_ID_LOGIN.test(value)) setLoginType('national_id');
    else if (value.length > 0) setLoginType('email');
    else setLoginType(null);
  }, [formData.email]);

  const handleChange = (field: 'email' | 'password', value: string) => {
    if (field === 'email' && loginType === 'national_id' && value.length > 0 && !PATTERNS.DIGITS_ONLY.test(value)) {
      return;
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleBlur = (field: 'email' | 'password') => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    if (field === 'email') {
      setErrors((prev) => ({ ...prev, email: resolveIdentifierError(formData.email, loginType) }));
    }

    if (field === 'password' && loginType !== 'national_id') {
      setErrors((prev) => ({ ...prev, password: resolvePasswordError(formData.password) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailError = resolveIdentifierError(formData.email, loginType);
    const passwordError = loginType === 'national_id' ? '' : resolvePasswordError(formData.password);

    setErrors({ email: emailError, password: passwordError, api: '' });
    setTouched({ email: true, password: true });
    if (emailError || passwordError) return;

    setIsLoading(true);

    try {
      const payload =
        loginType === 'national_id'
          ? { national_id: formData.email, password: formData.email, email: '' }
          : { email: formData.email, password: formData.password };

      const response: LoginResponse = await AuthService.login(payload);

      if (response.success) {
        authLogin({ token: response.token, user: response.user });
        if (response.requires_credential_change) {
          localStorage.setItem('huc_requires_credential_change', 'true');
        }
        redirectBasedOnRole(response.user);
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : tr('فشل تسجيل الدخول. تحقق من بيانات الدخول وحاول مرة أخرى.', 'Login failed. Check your credentials and try again.');
      setErrors((prev) => ({ ...prev, api: errorMessage }));
    } finally {
      setIsLoading(false);
    }
  };

  const redirectBasedOnRole = (user: UserInfo) => {
    const role = String(user.role || '').toUpperCase();
    const memberType = String(user.member_type || '').toUpperCase();

    if (role === 'SECURITY') {
      window.location.href = '/security/bookings';
      return;
    }

    if (user.staff_id || role === 'ADMIN' || role === 'STAFF' || role === 'STAFF_MEMBER' || role === 'MEDIA' || role === 'SUPPORT') {
      if (role === 'MEDIA') window.location.href = '/media-gallery-dashboard';
      else window.location.href = '/staff/dashboard';
      return;
    }

    const isTeamMember = role === 'TEAM_MEMBER' || memberType.includes('TEAM');
    if (isTeamMember) {
      window.location.href = '/team-member/dashboard';
      return;
    }

    if (user.member_id) {
      const memberStatus = String(user.status ?? '').trim().toLowerCase();
      window.location.href = memberStatus === 'pending' ? '/member/pending' : '/member/dashboard';
      return;
    }

    window.location.href = '/dashboard';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit(e as any);
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="h-screen w-full flex bg-white font-['Cairo'] overflow-hidden">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden order-1"
      >
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImageIndex}
              src={BG_IMAGES[currentImageIndex]}
              alt={tr('نادي جامعة العاصمة', 'Helwan University Club')}
              className="w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            />
          </AnimatePresence>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-16 bg-white order-2"
      >
        <div className="w-full max-w-md space-y-8">
          <div dir="ltr" className="w-full flex justify-start">
            <button
              onClick={() => (window.location.href = '/')}
              className="flex items-center gap-2 text-slate-600 hover:text-[#2596be] transition-colors font-medium group"
              aria-label={tr('رجوع', 'Back')}
            >
              <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
              <span>{tr('رجوع', 'Back')}</span>
            </button>
          </div>

          <div className="text-center flex flex-col items-center">
            <div className="mb-6">
              <img src={HUCLogo} alt={tr('نادي جامعة العاصمة', 'Helwan University Club')} className="w-20 h-20 object-contain" />
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">{tr('مرحبًا بك من جديد', 'Welcome Back')}</h1>
            <p className="text-gray-600 mb-10 text-sm md:text-base">{tr('سجل دخولك للمتابعة', 'Sign in to continue')}</p>
          </div>

          {errors.api && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">{errors.api}</span>
              </div>
            </div>
          )}

          <div onKeyPress={handleKeyPress}>
            <div className="mb-5">
              <label htmlFor="email" className="block text-base md:text-lg text-gray-700 mb-2 font-medium">
                {tr('البريد الإلكتروني أو الرقم القومي', 'Email or National ID')}
              </label>
              <div className="relative">
                <input
                  id="email"
                  type={loginType === 'national_id' ? 'tel' : 'email'}
                  dir="ltr"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  placeholder={loginType === 'national_id' ? '12345678901234' : 'example@email.com'}
                  autoFocus
                  maxLength={loginType === 'national_id' ? 14 : undefined}
                  inputMode={loginType === 'national_id' ? 'numeric' : 'email'}
                  className={`w-full text-left border ${errors.email && touched.email ? 'border-red-500' : 'border-gray-200'} rounded-2xl py-4 md:py-5 pr-5 pl-12 text-base md:text-lg focus:outline-none focus:ring-2 ${errors.email && touched.email ? 'focus:ring-red-500' : 'focus:ring-[#2596be]'} focus:border-transparent transition-all`}
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>

              {errors.email && touched.email && (
                <div className="flex items-center gap-1 mt-2 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.email}</span>
                </div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="block text-base md:text-lg text-gray-700 mb-2 font-medium">
                {tr('كلمة المرور', 'Password')}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  placeholder="••••••••"
                  className={`w-full border ${errors.password && touched.password ? 'border-red-500' : 'border-gray-200'} rounded-2xl px-5 py-4 md:py-5 pr-12 pl-12 text-base md:text-lg focus:outline-none focus:ring-2 ${errors.password && touched.password ? 'focus:ring-red-500' : 'focus:ring-[#2596be]'} focus:border-transparent transition-all`}
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label={showPassword ? tr('إخفاء كلمة المرور', 'Hide password') : tr('إظهار كلمة المرور', 'Show password')}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && touched.password && (
                <div className="flex items-center gap-1 mt-2 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.password}</span>
                </div>
              )}
            </div>

            <div className="text-left mb-8" dir="ltr">
              <a className="text-sm md:text-base text-[#2596be] hover:underline transition-all" href="/forgot">
                {tr('نسيت كلمة المرور؟', 'Forgot password?')}
              </a>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-[#2596be] hover:bg-[#1e7e9e] disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 md:py-5 rounded-2xl font-bold text-lg mb-4 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {tr('جاري التحميل...', 'Loading...')}
                </span>
              ) : (
                tr('تسجيل الدخول', 'Sign In')
              )}
            </button>
          </div>

          <p className="text-center text-sm md:text-base text-gray-600">
            {tr('ليس لديك حساب؟', "Don't have an account?")}{' '}
            <a href="/re" className="text-[#2596be] font-semibold hover:underline transition-all">
              {tr('سجل الآن', 'Register now')}
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
