import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Lock, ArrowRight, Sparkles, Hexagon } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('Logged in successfully!');
      navigate('/');
    } catch (err) {
      toast.error('Invalid email or password');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden selection:bg-indigo-500/30">
      {/* Abstract Animated Background Curves */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-indigo-400/40 to-purple-400/40 rounded-full mix-blend-multiply filter blur-[80px] animate-[pulse_8s_ease-in-out_infinite] opacity-70"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-cyan-400/30 to-blue-500/30 rounded-full mix-blend-multiply filter blur-[100px] animate-[pulse_10s_ease-in-out_infinite_reverse] opacity-70"></div>
      <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-gradient-to-tr from-fuchsia-400/20 to-pink-400/20 rounded-full mix-blend-multiply filter blur-[60px] animate-[pulse_6s_ease-in-out_infinite] opacity-60"></div>

      <div className="w-full max-w-5xl grid md:grid-cols-2 bg-white/60 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border border-white overflow-hidden relative z-10 transition-all">
        
        {/* Left Branding Section */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 text-white relative overflow-hidden">
          {/* Internal ambient glows */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-16">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-inner border border-white/30">
                <Hexagon size={24} className="text-white fill-white/20" />
              </div>
              <h1 className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                Wishtree.
              </h1>
            </div>
            
            <h2 className="text-5xl font-bold leading-tight mb-6">
              Elevate your<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-300">creative</span> process.
            </h2>
            <p className="text-lg text-indigo-100/90 font-medium max-w-md leading-relaxed">
              The premium command center for tracking abstract designs, managing client approvals, and accelerating your agency's entire workflow.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-4 bg-white/10 w-fit px-5 py-3 rounded-2xl backdrop-blur-sm border border-white/10">
             <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-2 border-indigo-500 bg-gradient-to-tr from-cyan-400 to-blue-500"></div>
                <div className="w-10 h-10 rounded-full border-2 border-indigo-500 bg-gradient-to-tr from-fuchsia-400 to-pink-500"></div>
                <div className="w-10 h-10 rounded-full border-2 border-indigo-500 bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-xs font-bold text-white shadow-inner">+9</div>
             </div>
             <p className="text-sm font-semibold text-indigo-50">Trusted by creative teams</p>
          </div>
        </div>

        {/* Right Login Form Section */}
        <div className="p-8 md:p-14 lg:p-16 flex flex-col justify-center">
          <div className="mb-10 text-center md:text-left">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto md:mx-0 mb-6 shadow-lg shadow-indigo-500/30 md:hidden">
              <Hexagon size={28} className="text-white fill-white/20" />
            </div>
            <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center justify-center md:justify-start gap-3">
              Welcome back <Sparkles className="text-amber-400" size={24} />
            </h3>
            <p className="text-slate-500 font-medium mt-2 text-lg">Enter your credentials to access your workspace.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-700 ml-1">Email address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="text-slate-400 group-focus-within:text-indigo-600 transition-colors duration-300" size={20} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border-2 border-slate-200/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 focus:bg-white transition-all duration-300 text-slate-800 font-semibold placeholder:text-slate-400 placeholder:font-medium"
                  placeholder="name@wishtree.com"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="block text-sm font-bold text-slate-700">Password</label>
                <a href="#" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors">Forgot password?</a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="text-slate-400 group-focus-within:text-indigo-600 transition-colors duration-300" size={20} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border-2 border-slate-200/60 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 focus:bg-white transition-all duration-300 text-slate-800 font-bold tracking-wider"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full relative group overflow-hidden bg-slate-900 text-white font-bold py-4 rounded-2xl transition-all duration-300 hover:shadow-[0_8px_30px_-8px_rgba(15,23,42,0.5)] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"></div>
              <span className="relative flex items-center justify-center gap-2">
                {isLoading ? 'Authenticating...' : 'Sign into Workspace'}
                {!isLoading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
              </span>
            </button>
          </form>
          
        </div>
      </div>
    </div>
  );
};

export default Login;
