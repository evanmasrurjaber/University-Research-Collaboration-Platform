import React, { useState, useEffect } from 'react'
import {
  Navbar,
  NavBody,
  NavItems,
  NavbarLogo,
  NavbarButton,
  ProfileImage
} from "../ui/resizable-navbar";
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";
import 'lucide-react';
import { LogOut, LucideNewspaper, User2 } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext.jsx'
import { useAuth } from '@/context/AuthContext.jsx'
import { BsMoonFill } from "react-icons/bs";
import { IoIosSunny } from "react-icons/io";
import { useNavigate } from 'react-router-dom';

export const Navigationbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const handleLogout = async () => {
    try{
      await logout();
    } finally{
      navigate('/')
    }
  };
  const { theme, toggleTheme } = useTheme()
  const navItems = [
    {
      name: "Browse 📰",
      link: "#features",
    },
    {
      name: "People 👤",
      link: "#pricing",
    },
    {
      name: "Search 🔍",
      link: "#contact",
    },
  ];



  return (
    <div>
      <Navbar>
        <NavBody className="">
          <NavbarLogo />
          <NavItems items={navItems} />
          {
            !user ? (
              <div className="flex items-center gap-1">
                <NavbarButton as="button" variant="dark" className="bg-neutral-300 dark:bg-black" onClick={toggleTheme}>
                  {theme === 'dark' ? <IoIosSunny className="text-yellow-500" /> : <BsMoonFill className="text-yellow-500" />}
                </NavbarButton>
                <NavbarButton variant='secondary' href='/login'>Log in</NavbarButton>
                <NavbarButton variant="primary" href='/signup'>Sign up</NavbarButton>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <NavbarButton as="button" variant="dark" className="bg-neutral-300 dark:bg-black" onClick={toggleTheme}>
                  {theme === 'dark' ? <IoIosSunny className="text-yellow-500" /> : <BsMoonFill className="text-yellow-500" />}
                </NavbarButton>
                <NavbarButton variant="primary" href="/profile">Initiate Project</NavbarButton>
                <Popover placement="bottom" showArrow={true} backdrop='blur' trigger>
                  <PopoverTrigger>
                    <ProfileImage
                      src={user?.profile?.profilePhotoUrl}
                      alt={`${user?.name || "User"}'s profile photo`}
                      size={40}
                      className="ml-2"
                    />
                  </PopoverTrigger>
                  <PopoverContent>
                    <div>
                      <div className="px-3 py-3 text-small font-bold">{user?.name}</div>
                      <NavbarButton variant="secondary" className="gap-2 flex" href="/profile"><User2 />Profile</NavbarButton>
                      <NavbarButton variant="secondary" className="gap-2 flex"><LucideNewspaper />Projects</NavbarButton>
                      <NavbarButton as="button" onClick={handleLogout} variant="secondary" className="gap-2 flex text-red-500 dark:text-red-500"><LogOut className='text-red-500' />Logout</NavbarButton>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            )
          }
        </NavBody>
      </Navbar>
    </div>
  )
}

export default Navigationbar
