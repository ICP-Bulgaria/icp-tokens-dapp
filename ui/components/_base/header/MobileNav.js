// MobileNav.js
import React, { useContext, useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu'; // Icons should be replaced with appropriate imports
import CloseIcon from '@mui/icons-material/Close';
import SocialLinks from '../SocialLinks';
import Link from 'next/link';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { AuthContext } from '../../../../contexts/auth/Auth.Context';
import { Button } from '@mui/material';

const MobileNav = ({ navLinks, isMobileMenuOpen, toggleMobileMenu, path }) => {
  const [dropdownStates, setDropdownStates] = useState({});
  const { isAuthenticated, openLoginModal, logout } = useContext(AuthContext);

  const toggleDropdown = isOpen => {
    setDropdownStates(prevState => ({
      ...prevState,
      [isOpen]: !prevState[isOpen]
    }));
  };

  return (
    <>
      <div id="mobile-toggler" onClick={toggleMobileMenu} className="lg:hidden py-2 pl-2 cursor-pointer">
        {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
      </div>
      <div
        className={`z-[100] ${isMobileMenuOpen ? 'visible animate-fadeInLeft' : 'invisible animate-fadeInRight'} flex flex-col justify-between transition-visible ease-in-out delay-0 duration-300 pb-6 left-0 bg-white w-full top-[52.5px] fixed h-[calc(100%-51px)] shadow-xl`}
      >
        <div>
          <ul className="pb-0 pt-6 overflow-y-scroll hidden-scrollbar">
            {navLinks.map(link =>
              link.isDropdown !== true ? (
                <li
                  key={link.href}
                  className={`${path === link.href && "before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:border-l-4 before:border-solid before:border-primary"} relative mb-4 px-4`}
                >
                  <div className="relative flex items-center">
                    <Link
                      href={link.href}
                      className={`${path === link.href ? 'text-primary' : 'text-mobile-menu'} py-2`}
                    >
                      <span
                        className={`${path === link.href && 'text-primary'} pr-5`}
                      >
                        {link.icon}
                      </span>
                      {link.label}
                    </Link>
                  </div>
                </li>
              ) : (
                <li key={link.id} className="relative mb-4">
                  <div
                    className="flex justify-between py-2"
                    onClick={() => toggleDropdown(link.isOpen)}
                  >
                    <div
                      className={`px-4 ${link.dropdownItems.some(item => path === item.href) && " before:content-[''] before:absolute before:left-0 before:h-[51px] before:border-l-4 before:border-solid before:border-primary"} relative flex items-center`}
                    >
                      <span
                        className={`${link.dropdownItems.some(item => path === item.href) ? 'text-primary' : 'text-mobile-menu'} pr-5`}
                      >
                        {link.icon}
                      </span>
                      <button
                        className={`${link.dropdownItems.some(item => path === item.href) ? 'text-primary' : 'text-mobile-menu'}`}
                      >
                        {link.label}
                      </button>
                    </div>
                    <div id={link.label} className="px-4">
                      {dropdownStates[link.isOpen] ? (
                        <KeyboardArrowUpIcon
                          className="text-mobile-menu cursor-pointer"
                          sx={{ fontSize: 35 }}
                        />
                      ) : (
                        <KeyboardArrowDownIcon
                          className="text-mobile-menu cursor-pointer"
                          sx={{ fontSize: 35 }}
                        />
                      )}
                    </div>
                  </div>
                  {dropdownStates[link.isOpen] && (
                    <div className="m-4 px-4">
                      {link.dropdownItems.map(sublink => (
                        <li
                          key={sublink.id}
                          className="mb-2 py-2 text-mobile-menu"
                        >
                          <Link href={sublink.href}>{sublink.label}</Link>
                        </li>
                      ))}
                    </div>
                  )}
                </li>
              )
            )}
          </ul>
          <div className='pb-16 px-4'>
            {!isAuthenticated ? (
              <Button variant="contained" fullWidth color="primary" onClick={() => openLoginModal()}>
                  Login
              </Button>
            ) : (
              <Button fullWidth variant="containedGray" onClick={() => logout()}>
                  Logout
              </Button>
            )}
          </div>
        </div>
        <div className={`flex justify-center gap-5 items-center`}>
          <SocialLinks />
        </div>
      </div>
    </>
  );
};

export default MobileNav;
