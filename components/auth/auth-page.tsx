'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

interface FormData {
  email: string;
  password: string;
  fullName: string;
  confirmPassword: string;
}

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showVerificationMessage, setShowVerificationMessage] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: '',
  });
  const router = useRouter();
  const supabase = createClient();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleResendVerification = async (): Promise<void> => {
    try {
      setError(null);
      setIsLoading(true);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email,
      });
      if (error) throw error;
      setSuccess('Verification email sent successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send verification email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }

        // Sign up with Supabase
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (signUpError) throw signUpError;

        if (data?.user) {
          setShowVerificationMessage(true);
          setSuccess('Please check your email to verify your account.');
        }
      } else {
        // Sign in with Supabase
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (signInError) {
          if (signInError.message.includes('Email not confirmed')) {
            setShowVerificationMessage(true);
            throw new Error('Please verify your email before signing in.');
          }
          throw signInError;
        }

        if (data?.user) {
          router.push('/dashboard');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center w-full h-screen bg-white overflow-hidden">
      <div className="flex w-full max-w-6xl h-[80vh] rounded-2xl shadow-xl">
        {/* Left side: Form */}
        <div className="w-full lg:w-1/2 p-8 md:p-10 flex flex-col justify-center relative">
          {/* Add curved decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-10" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-50 rounded-tr-full -z-10" />
          
          <div className="max-w-md mx-auto w-full relative">
            {/* Logo with curved background */}
            <div className="mb-8">
              <div className="flex items-center gap-2">
                <div className="bg-black rounded-2xl p-1.5">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 5.5V3C14 1.89543 13.1046 1 12 1H4C2.89543 1 2 1.89543 2 3V13C2 14.1046 2.89543 15 4 15H12C13.1046 15 14 14.1046 14 13V10.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M6 8H13M13 8L10.5 5.5M13 8L10.5 10.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="font-semibold text-lg">FindMyGuy</span>
              </div>
            </div>
            
            {/* Title and subtitle */}
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-gray-500 mb-6">
              {isSignUp 
                ? 'Sign up to leverage our AI-powered CV processing and analysis tools'
                : 'Sign in to access our intelligent CV processing and talent matching platform'}
            </p>
            
            {/* Form with curved buttons */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium mb-1.5">
                    Full Name
                  </label>
                  <Input 
                    id="fullName" 
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="w-full rounded-xl"
                    required
                  />
                </div>
              )}
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                  Email
                </label>
                <Input 
                  id="email" 
                  name="email"
                  type="email" 
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="w-full rounded-xl"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1.5">
                  Password
                </label>
                <Input 
                  id="password" 
                  name="password"
                  type="password" 
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={isSignUp ? "Create a password" : "Enter your password"}
                  className="w-full rounded-xl"
                  required
                />
              </div>
              
              {isSignUp && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1.5">
                    Confirm Password
                  </label>
                  <Input 
                    id="confirmPassword" 
                    name="confirmPassword"
                    type="password" 
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    className="w-full rounded-xl"
                    required
                  />
                </div>
              )}
              
              {!isSignUp && (
                <div className="text-right">
                  <a href="#" className="text-sm text-indigo-600 hover:text-indigo-500">
                    Forgot password?
                  </a>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full bg-black hover:bg-black/80 text-white py-3 rounded-xl transition-all duration-200 hover:shadow-lg" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isSignUp ? 'Creating Account...' : 'Signing In...'}
                  </>
                ) : (
                  isSignUp ? 'Create Account' : 'Sign In'
                )}
              </Button>
            </form>
            
            {/* Messages with curved borders */}
            {error && (
              <div className="mt-4 p-3 bg-red-50/20 border border-red-100 backdrop-blur-sm text-red-600 rounded-xl text-sm">
                <p className="font-medium">{error}</p>
              </div>
            )}

            {success && (
              <div className="mt-4 p-3 bg-green-50/20 border border-green-100 backdrop-blur-sm text-green-600 rounded-xl text-sm">
                <p className="font-medium">{success}</p>
              </div>
            )}

            {showVerificationMessage && (
              <div className="mt-4 p-4 bg-blue-50/20 border border-blue-100 backdrop-blur-sm text-blue-600 rounded-xl text-sm">
                <p className="mb-2 font-medium">Please check your email to verify your account.</p>
                <p className="text-blue-500">
                  Didn't receive the email?{' '}
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200 hover:underline"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending...' : 'Resend verification email'}
                  </button>
                </p>
              </div>
            )}
            
            {/* Switch between login and signup */}
            <p className="mt-6 text-center text-sm text-gray-500">
              {isSignUp 
                ? 'Already have an account? ' 
                : 'Don\'t have an account? '}
              <button 
                type="button"
                className="text-indigo-600 hover:text-indigo-500 font-medium"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setShowVerificationMessage(false);
                  setError(null);
                  setSuccess(null);
                }}
              >
                {isSignUp ? 'Log in' : 'Sign up'}
              </button>
            </p>
          </div>
        </div>
        
        {/* Right side: Visual with enhanced curves */}
        <div className="hidden lg:block w-1/2 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 p-8 relative overflow-hidden rounded-r-2xl">
          {/* Add curved decorative elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-br-full" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-tl-full" />
          
          <div className="relative z-10 h-full flex flex-col justify-between">
            {/* Decorative elements with enhanced curves */}
            <div className="flex justify-end">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 w-64 hover:shadow-xl transition-all duration-300">
                <div className="flex space-x-2 mb-2">
                  <div className="h-3 w-24 bg-white/20 rounded-full"></div>
                  <div className="h-3 w-16 bg-white/20 rounded-full"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-3 w-16 bg-white/20 rounded-full"></div>
                  <div className="h-3 w-12 bg-white/20 rounded-full"></div>
                  <div className="h-3 w-20 bg-white/20 rounded-full"></div>
                </div>
              </div>
            </div>
            
            {/* Mission Statement with enhanced curves */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 max-w-md hover:shadow-xl transition-all duration-300">
              <h3 className="text-white text-lg font-medium mb-3">Our Mission</h3>
              <p className="text-white text-2xl font-light mb-6">
                "We transform CV management through AI-powered analysis, helping companies find the right talent faster and more accurately than ever before."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 5.5V3C14 1.89543 13.1046 1 12 1H4C2.89543 1 2 1.89543 2 3V13C2 14.1046 2.89543 15 4 15H12C13.1046 15 14 14.1046 14 13V10.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M6 8H13M13 8L10.5 5.5M13 8L10.5 10.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <div className="text-white font-medium">FindMyGuy</div>
                  <div className="text-white/80 text-sm">Est. 2023</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 w-64 self-end hover:shadow-xl transition-all duration-300">
              <div className="text-white/80 text-sm mb-1">CV PROCESSING EFFICIENCY</div>
              <div className="text-white text-2xl font-semibold mb-1">30x Faster</div>
              <div className="text-white/60 text-xs">AI-powered data extraction & analysis</div>
            </div>
          </div>
          
          <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full bg-pink-300/40 filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 left-1/3 w-80 h-80 rounded-full bg-indigo-400/40 filter blur-3xl animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;