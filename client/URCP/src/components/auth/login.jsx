import React, { useState } from 'react'
import { NavbarButton, NavbarLogo } from '../ui/resizable-navbar'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import Navigationbar from '../shared/Navigationbar'
import { toast } from "sonner"
import axios from 'axios'
import { USER_API_END_POINT } from '../../utils/constant'
import { useNavigate } from 'react-router-dom'

function Login() {
  const [input, setInput] = useState({
    email: "",
    password: ""
  });

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const navigate = useNavigate();

  const submitHandler = async(e) => {
    e.preventDefault()
    try {
      const res = await axios.post(`${USER_API_END_POINT}/login`, input, {
        headers:{
          "Content-Type": "application/json"
        },
        withCredentials: true
      });
      if (res.data.success) {
        navigate('/');
        toast.success(res.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response.data.message)
    }
  }

  return (
    <div className='h-screen flex flex-col justify-center items-center'>
      <Navigationbar />
      <div className='m-2'>
        <div className="mx-auto w-full flex flex-col gap-2 max-w-md rounded-none bg-white md:rounded-2xl md:py-8 md:px-3 dark:bg-black" style={{ boxShadow: "0 0 20px rgba(34, 42, 53, 0.08), 0 2px 4px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(34, 42, 53, 0.05), 0 0 6px rgba(34, 42, 53, 0.08), 0 12px 40px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.08) inset" }}>
          <NavbarLogo />
          <h2 className="px-3 text-xl font-bold text-neutral-800 dark:text-neutral-200">
            Log in
          </h2>
        </div>
        <div className='m-2 flex items-center justify-center max-w-md mx-auto w-full rounded-none bg-white px-4 md:rounded-2xl md:p-8 dark:bg-black' style={{ boxShadow: "0 0 20px rgba(34, 42, 53, 0.08), 0 2px 4px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(34, 42, 53, 0.05), 0 0 6px rgba(34, 42, 53, 0.08), 0 12px 40px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.08) inset" }}>
          <form className="flex flex-col items-center" onSubmit={submitHandler}>
            <div className="flex w-md flex-col space-y-2 px-7">
              <Label htmlFor="email" className="px-4 text-sm font-medium text-gray-700">Email Address</Label>
              <Input id="email" placeholder="Enter your email" type="email" value={input.email} name="email" onChange={changeEventHandler} />
              <Label htmlFor="password" className="px-4 text-sm font-medium text-gray-700">Password</Label>
              <Input id="password" placeholder="Enter your password" type="password" value={input.password} name="password" onChange={changeEventHandler} />
              <div className='pt-5'>
                <button
                  type="submit"
                  className="group/btn relative block w-full rounded-lg bg-gradient-to-l from-blue-500 to-blue-700 px-4 py-2 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset] transition-all duration-300 hover:scale-103 hover:shadow-lg hover:from-blue-400 hover:to-blue-600 dark:hover:from-zinc-700 dark:hover:to-zinc-700 hover:shadow-white/10"
                >
                  <span>
                    Log in &rarr;
                  </span>
                  <BottomGradient />
                </button>
              </div>
            </div>
            <span className="pt-4 text-sm text-gray-500 dark:text-gray-400">
              Don't have an account? <a href="/signup" className="font-medium text-blue-600 hover:underline dark:text-blue-500">Sign up</a>
            </span>
          </form>
        </div>
      </div>
    </div>
  )
}
const BottomGradient = () => {
  return (
    <>
      <span
        className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span
        className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};
export default Login;