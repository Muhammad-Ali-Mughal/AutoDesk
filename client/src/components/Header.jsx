import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavLinks from "./shared/NavLinks";
import { useDispatch, useSelector } from "react-redux";
import { toggleDarkMode } from "../store/slices/darkModeSlice";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import toast from "react-hot-toast";

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isDarkMode = useSelector((state) => state.darkMode.isDarkMode);
  const isLoggedIn = true; //useSelector((state) => state.auth.isLoggedIn);

  const handleToggle = () => {
    dispatch(toggleDarkMode());
  };

  const handleLogOut = () => {};

  const [mobileMenu, setMobileMenu] = useState(false);

  const toggleButton = () => {
    setMobileMenu(!mobileMenu);
  };

  return (
    <header className={isDarkMode ? "dark" : "light"}>
      <nav className={`bg-[#642c8f] border-gray-200 py-2.5 dark:bg-gray-900`}>
        <div className=" flex flex-wrap items-center justify-between max-w-screen-xl px-4 mx-auto">
          <Link to={"/"} className="flex items-center">
            <span className="self-center text-xl font-semibold whitespace-nowrap text-white">
              AutoDesk
            </span>
          </Link>
          <div className="flex items-center lg:order-2">
            <button
              onClick={handleToggle}
              className="text-white text-2xl bg-grey-700 hover:bg-grey-800 focus:ring-4 focus:ring-grey-300 font-medium rounded-lg px-4 lg:px-5 py-2 my-2 lg:py-2.5 sm:mr-2 dark:text-white dark:bg-grey-600 dark:hover:bg-grey-700 focus:outline-none dark:focus:ring-grey-800"
            >
              {isDarkMode ? <MdLightMode /> : <MdDarkMode />}
            </button>
            {isLoggedIn ? (
              <button
                onClick={() => (window.location.href = "/dashboard")}
                className="font-medium rounded-lg text-lg px-4 lg:px-5 py-2 lg:py-2.5 
             border-2 border-transparent bg-clip-padding 
             bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 
             text-transparent bg-clip-text 
             hover:from-pink-500 hover:via-red-500 hover:to-yellow-500 hover:bg-purple-900
             cursor-pointer transition-all duration-300"
              >
                Dashboard
              </button>
            ) : (
              <Link
                to={"/login"}
                className="text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 sm:mr-2 lg:mr-0 dark:bg-purple-600 dark:hover:bg-purple-700 focus:outline-none dark:focus:ring-purple-800 ml-[1rem]"
              >
                Login
              </Link>
            )}
            <button
              onClick={toggleButton}
              type="button"
              className="inline-flex items-center p-2 ml-1 text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
              aria-controls="mobile-menu-2"
              aria-expanded={mobileMenu}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenu ? (
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              )}
            </button>
          </div>
          <div
            className={`items-center justify-between w-full lg:flex lg:w-auto lg:order-1 ${
              mobileMenu ? "" : "hidden"
            }`}
            id="mobile-menu-2"
          >
            <ul className="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0">
              <li>
                <NavLinks to={"/"} text={"Home"} />
              </li>
              <li>
                <NavLinks to={"/shop"} text={"Shop"} />
              </li>
              <li>
                <NavLinks to={"/contact"} text={"Contact"} />
              </li>
              <li>
                <NavLinks to={"/about"} text={"About Us"} />
              </li>
              <li>
                <NavLinks to={"/404"} text={"404"} />
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;
