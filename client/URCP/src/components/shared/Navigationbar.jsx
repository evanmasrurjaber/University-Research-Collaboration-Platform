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

export const Navigationbar = () => {
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
    <div className='dark'>
      <Navbar>
        <NavBody className="">
          <NavbarLogo />
          <NavItems items={navItems} />
          <div className="flex items-center gap-2">
            <NavbarButton variant="secondary">Login</NavbarButton>
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
                <div className='dark'>
                  <div className="px-3 py-3 text-small font-bold dark:text-blue-50">Evan Masrur Jaber</div>
                    <NavbarButton variant="secondary" className="gap-2 flex dark:text-white"><User2 className='dark:text-blue-50' />Profile</NavbarButton>
                    <NavbarButton variant="secondary" className="gap-2 flex dark:text-white"><LucideNewspaper className='dark:text-blue-50' />Projects</NavbarButton>
                    <NavbarButton variant="secondary" className="gap-2 flex text-red-500 dark:text-red-500"><LogOut className='text-red-500' />Logout</NavbarButton>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </NavBody>
      </Navbar>
    </div>
  )
}

export default Navigationbar
