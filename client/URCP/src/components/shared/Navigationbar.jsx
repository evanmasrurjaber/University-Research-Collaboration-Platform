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
import { Link } from 'react-router-dom'
import { useTheme } from '@/context/ThemeContext.jsx'
import { BsMoonFill } from "react-icons/bs";
import { IoIosSunny } from "react-icons/io";

export const Navigationbar = () => {
  const user = false
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

  const handleProfileClick = () => {
    console.log("Profile clicked");
  };


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
                <NavbarButton variant="primary" href='/signup'>Sign in</NavbarButton>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <NavbarButton as="button" variant="dark" className="" onClick={toggleTheme}>
                  {theme === 'dark' ? <IoIosSunny className="text-yellow-500" /> : <BsMoonFill className="text-yellow-500" />}
                </NavbarButton>
                <NavbarButton variant="primary">Initiate Project</NavbarButton>
                <Popover placement="bottom" showArrow={true} backdrop='blur' trigger>
                  <PopoverTrigger>
                    <ProfileImage
                      src=""
                      alt="User Profile"
                      size={40}
                      onClick={handleProfileClick}
                      className="ml-2"
                    />
                  </PopoverTrigger>
                  <PopoverContent>
                    <div>
                      <div className="px-3 py-3 text-small font-bold">Evan Masrur Jaber</div>
                      <NavbarButton variant="secondary" className="gap-2 flex"><User2 />Profile</NavbarButton>
                      <NavbarButton variant="secondary" className="gap-2 flex"><LucideNewspaper />Projects</NavbarButton>
                      <NavbarButton variant="secondary" className="gap-2 flex text-red-500"><LogOut className='text-red-500' />Logout</NavbarButton>
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
