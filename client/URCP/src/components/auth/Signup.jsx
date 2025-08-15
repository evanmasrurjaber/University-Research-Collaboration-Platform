import React from 'react'
import { NavbarButton, NavbarLogo } from '../ui/resizable-navbar'
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

function Signup() {
  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission
  }

  return (
    <div className='dark bg-black h-screen flex flex-col justify-center items-center'>
      <div className='m-2'>
        <div className="shadow-input mx-auto w-full max-w-md rounded-none bg-white p-4 md:rounded-2xl md:p-8 dark:bg-black">
          <NavbarLogo />
          <h2 className="px-3 text-xl font-bold text-neutral-800 dark:text-neutral-200">
            Sign up to continue
          </h2>
        </div>
        <div className='m-2 flex items-center justify-center max-w-md mx-auto shadow-input w-full rounded-none bg-white px-4 md:rounded-2xl md:p-8 dark:bg-black'>
          <form className="flex flex-col items-center" onSubmit={handleSubmit}>
            <div className="flex w-md flex-col space-y-2 px-4">
              <Label htmlFor="name" className="px-4 text-sm font-medium text-gray-700">Name</Label>
              <Input id="name" placeholder="Enter your name" type="text" />
              <Label htmlFor="email" className="px-4 text-sm font-medium text-gray-700">Email Address</Label>
              <Input id="email" placeholder="Enter your email" type="email" />
              <Label htmlFor="password" className="px-4 text-sm font-medium text-gray-700">Set Password</Label>
              <Input id="password" placeholder="Enter your password" type="password" />
              <Label htmlFor="retype-password" className="px-4 text-sm font-medium text-gray-700">Confirm Password</Label>
              <Input id="retype-password" placeholder="Retype your password" type="password" />
              <div className='py-3'>
                <Label htmlFor="department" className="px-4 text-sm font-medium text-gray-700">Select your Department</Label>
                <div className='px-1 py-3'>
                  <Select>
                    <SelectTrigger className="max-w-md px-4 dark:text-gray-300">
                      <SelectValue placeholder="Schools and Departments" className="dark: text-white" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-black">
                      <SelectGroup>
                        <SelectLabel>Schools and Departments</SelectLabel>
                        <SelectItem value="BRAC Business School">BRAC Business School</SelectItem>
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
              <NavbarButton
                variant='gradient'
                type="submit"
                className="group/btn relative block dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900"
              >
                Sign up &rarr;
                <BottomGradient />
              </NavbarButton>
            </div>
            <span className="pt-4 text-sm text-gray-500 dark:text-gray-400">
              Already have an account? <a href="/login" className="font-medium text-blue-600 hover:underline dark:text-blue-500">Log in</a>
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
export default Signup