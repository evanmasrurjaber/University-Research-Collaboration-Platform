import React, {useState} from 'react'
import {NavbarLogo } from '../ui/resizable-navbar'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Navigationbar from '../shared/Navigationbar'
import { USER_API_END_POINT } from '../../utils/constant'
import { useNavigate } from 'react-router-dom'
import { toast } from "sonner"
import axios from 'axios'

function Signup() {
  const [input, setInput] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    department: ""
  });

  const navigate = useNavigate();

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const submitHandler = async (e) => {
    e.preventDefault()
    try {
      if (input.password !== input.passwordConfirm) {
        toast.error("Passwords do not match");
        return;
      }
      const { passwordConfirm, ...userData } = input;
      const emailDomain = input.email.split('@')[1];
      
      if (emailDomain === 'g.bracu.ac.bd') {
        userData.role = 'student';
      } else if (emailDomain === 'bracu.ac.bd') {
        userData.role = 'faculty';
      } else {
        toast.error("Use a valid BracU g-suit Email address");
        return;
      }
      
      const res = await axios.post(`${USER_API_END_POINT}/register`, userData, {
        headers:{
          "Content-Type": "application/json"
        },
        withCredentials: true
      });
      if (res.data.success) {
        navigate('/login');
        toast.success(res.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response.data.message)
    }
  }

  return (
    <div className='h-screen flex flex-col gap-35 justify-center items-center'>
      <Navigationbar />
      <div className='m-2'>
        <div className="mx-auto w-full flex flex-col gap-2 max-w-md rounded-none bg-white md:rounded-2xl md:py-8 md:px-3 dark:bg-black" style={{ boxShadow: "0 0 20px rgba(34, 42, 53, 0.08), 0 2px 4px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(34, 42, 53, 0.05), 0 0 6px rgba(34, 42, 53, 0.08), 0 12px 40px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.08) inset" }}>
          <NavbarLogo />
          <h2 className="px-3 text-xl font-bold text-neutral-800 dark:text-neutral-200">
            Sign up
          </h2>
        </div>
        <div className='m-2 flex items-center justify-center max-w-md mx-auto w-full rounded-none bg-white px-4 md:rounded-2xl md:p-8 dark:bg-black' style={{ boxShadow: "0 0 20px rgba(34, 42, 53, 0.08), 0 2px 4px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(34, 42, 53, 0.05), 0 0 6px rgba(34, 42, 53, 0.08), 0 12px 40px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.08) inset" }}>
          <form className="flex flex-col items-center" onSubmit={submitHandler}>
            <div className="flex w-md flex-col space-y-2 px-7">
              <Label htmlFor="name" className="px-4 text-sm font-medium text-gray-700">Name</Label>
              <Input id="name" placeholder="Enter your name" type="text" value={input.name} name="name" onChange={changeEventHandler} />
              <Label htmlFor="email" className="px-4 text-sm font-medium text-gray-700">Email Address</Label>
              <Input id="email" placeholder="Enter your email" type="email" value={input.email} name="email" onChange={changeEventHandler} />
              <Label htmlFor="password" className="px-4 text-sm font-medium text-gray-700">Set Password</Label>
              <Input id="password" placeholder="Enter your password" type="password" value={input.password} name="password" onChange={changeEventHandler} />
              <Label htmlFor="retype-password" className="px-4 text-sm font-medium text-gray-700">Confirm Password</Label>
              <Input id="retype-password" placeholder="Retype your password" type="password" value={input.passwordConfirm} name="passwordConfirm" onChange={changeEventHandler} />
              <div className='py-3'>
                <Label htmlFor="department" className="px-4 text-sm font-medium text-gray-700">Select your Department</Label>
                <div className='px-1 py-3'>
                  <Select value={input.department} onValueChange={(value) => setInput({...input, department: value})}>
                    <SelectTrigger className="max-w-md px-4 dark:text-gray-300">
                      <SelectValue placeholder="Schools and Departments" className="dark: text-white" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-black">
                      <SelectGroup>
                        <SelectLabel>Schools and Departments</SelectLabel>
                        <SelectItem value="BRAC Business School">BRAC Business School</SelectItem>
                        <SelectItem value="School of Data and Sciences">School of Data and Sciences</SelectItem>
                        <SelectItem value="BSRM School of Engineering">BSRM School of Engineering</SelectItem>
                        <SelectItem value="School of Law">School of Law</SelectItem>
                        <SelectItem value="School of Pharmacy">School of Pharmacy</SelectItem>
                        <SelectItem value="School of Architecture and Design">School of Architecture and Design</SelectItem>
                        <SelectItem value="School of Humanities and Social Sciences">School of Humanities and Social Sciences</SelectItem>
                        <SelectItem value="School of General Education">School of General Education</SelectItem>
                        <SelectItem value="James P Grant School of Public Health">James P Grant School of Public Health</SelectItem>
                        <SelectItem value="Others">Others</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <button
                type="submit"
                className="group/btn relative block w-full rounded-lg bg-gradient-to-l from-blue-500 to-blue-700 px-4 py-2 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset] transition-all duration-300 hover:scale-103 hover:shadow-lg hover:from-blue-400 hover:to-blue-600 dark:hover:from-zinc-700 dark:hover:to-zinc-700 hover:shadow-white/10"
              >
                <span>
                  Sign up &rarr;
                </span>
                <BottomGradient />
              </button>
            </div>
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
export default Signup