'use client'
import Image from 'next/image';
import React, { useState } from 'react';
import logo from "@/public/logo.svg"
import { useRouter } from "next/navigation";
const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

   const router = useRouter();

  const handleSubmit=async(e: React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    router.push("/serviceprovider/auth/welcomeserviceprovider");
  }

  return (
    <div className="relative  bg-gradient-to-tl from-[#3A0101] via-[#C94B4B] via-[#8D1414] via-[#C94B4B] to-[#461b1b] min-h-screen w-full flex items-center justify-center px-[24px] py-[17px]  md:px-[47px] md:py-[17px] ">
      <div className="w-full  flex flex-col  lg:flex-row items-center justify-between px-[24px] py-[48px] md:px-[33px] md:py-[60px]">
        
        {/* Left Side - Stats Section */}
        <div className="w-full  flex flex-col gap-6 text-white lg:py-[42px] lg:pr-[169px]">
          <div className="">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              Turn Your Service Into
            </h1>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-[#C94B4B]">
              Bookings
            </h1>
            <p className="text-base md:text-lg text-white/90">
              Get more clients. Manage jobs. Grow your business.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 md:pr-[55px] pb-[32px] md:py-[32px] ">
            {/* Stat 1 */}
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm p-4 md:p-5 rounded-2xl border border-white/20 hover:bg-white/15 transition-all">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-[#4ADE80] rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 md:w-7 md:h-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#14532D" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold">5,000+</p>
                <p className="text-sm md:text-base text-white/80">Service Providers</p>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm p-4 md:p-5 rounded-2xl border border-white/20 hover:bg-white/15 transition-all">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-[#60A5FA] rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 md:w-7 md:h-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#1E3A8A" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold">100%</p>
                <p className="text-sm md:text-base text-white/80">Secure Payments</p>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm p-4 md:p-5 rounded-2xl border border-white/20 hover:bg-white/15 transition-all">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-[#FACC15] rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 md:w-7 md:h-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#713F12" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold">10,000+</p>
                <p className="text-sm md:text-base text-white/80">Events Booked</p>
              </div>
            </div>

            {/* Stat 4 */}
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm p-4 md:p-5 rounded-2xl border border-white/20 hover:bg-white/15 transition-all">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-[#C084FC] rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 md:w-7 md:h-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#581C87" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold">2,500+</p>
                <p className="text-sm md:text-base text-white/80">Venues Listed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-auto lg:min-w-[420px] xl:min-w-[480px]  p-[16px] md:p-[24px]">
          <div className="  ">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="text-center">
                <Image src={logo} alt="logo" width={174} height={128} priority>

                </Image>
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-center text-white mb-2">
              Login as a Service Provider
            </h2>
            <p className="text-base md:text-lg text-white/80 text-center mb-8">
              Access your business dashboard
            </p>

            <form className="" onSubmit={handleSubmit}>
              {/* Email Input */}
              <div className='bg-[#00000080] px-[4px] py-[6px] rounded-lg mb-[22px]'>
                <label htmlFor="email" className="block text-white font-semibold mb-2 text-sm md:text-base">
                  Email
                </label>
                <input 
                  type="email" 
                  id="email" 
                  className="w-full px-4 py-3 md:py-3.5 bg-white text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-400 text-sm md:text-base" 
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>

              {/* Password Input */}
              <div className='bg-[#00000080] px-[4px] py-[6px] rounded-lg  mb-[22px]'>
                <label htmlFor="password" className="block text-white font-semibold mb-2 text-sm md:text-base">
                  Password
                </label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    id="password" 
                    className="w-full px-4 py-3 md:py-3.5 bg-white text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-400 text-sm md:text-base pr-12" 
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm md:text-base mb-[22px]">
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="remember-me" 
                    checked={rememberMe} 
                    onChange={() => setRememberMe(!rememberMe)} 
                    className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer" 
                  />
                  <label htmlFor="remember-me" className="ml-2 text-white cursor-pointer">
                    Remember me
                  </label>
                </div>
                <a href="/serviceprovider/auth/forgetpassword" className="text-white hover:text-white/80 transition-colors">
                  Forgot Password?
                </a>
              </div>

              {/* Sign In Button */}
              <button 
                type="submit" 
                className="w-full py-3 md:py-3.5 hover:bg-[#660202] bg-[#8a0808]  text-white rounded-xl font-semibold text-base md:text-lg transition-all duration-300 hover:shadow-xl"
              >
                Sign In
              </button>
            </form>

            {/* Create Account Link */}
            <div className="mt-6 text-center text-white text-sm md:text-base">
              <span>Dont have an account? </span>
              <a href="/serviceprovider/auth/signup" className="font-semibold hover:underline">
                Create New Account
              </a>
            </div>

            {/* Footer Links */}
            <div className="mt-6 pt-6 border-t border-white/20 flex justify-center gap-6 text-xs md:text-sm text-white/70">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;