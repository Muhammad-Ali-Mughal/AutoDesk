import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

function Footer() {
  const isDarkMode = useSelector((state) => state.darkMode.isDarkMode);

  return (
    <footer className={`${isDarkMode && "dark"}`}>
      <div className="bg-[#642c8f] dark:bg-gray-900">
        <div className="max-w-screen-xl mx-auto pb-10 px-4 sm:px-6  text-gray-200 flex flex-wrap justify-center flex justify-between">
          <div className="p-5 my-5">
            <div className="text-xs uppercase text-gray-200 font-medium">
              Home
            </div>

            <Link
              className="my-3 block text-white dark:text-gray-400"
              to={"/shop"}
            >
              Services <span className="text-teal-600 text-xs p-1"></span>
            </Link>

            <Link
              className="my-3 block text-white dark:text-gray-400"
              to={"/shop"}
            >
              Shop <span className="text-teal-600 text-xs p-1"></span>
            </Link>
            <Link
              className="my-3 block text-white dark:text-gray-400"
              to={"/about"}
            >
              About Us <span className="text-teal-600 text-xs p-1"></span>
            </Link>
            <Link
              className="my-3 block text-white dark:text-gray-400"
              to={"/contact"}
            >
              Contact <span className="text-teal-600 text-xs p-1"></span>
            </Link>
          </div>
          <div className="p-5 my-5">
            <div className="text-xs uppercase text-gray-200 font-medium">
              Resources
            </div>

            <Link className="my-3 block text-white dark:text-gray-400" to={"/"}>
              Privacy Policy <span className="text-teal-600 text-xs p-1"></span>
            </Link>
            <Link className="my-3 block text-white dark:text-gray-400" to={"/"}>
              Terms & Conditions{" "}
              <span className="text-teal-600 text-xs p-1"></span>
            </Link>
            <Link className="my-3 block text-white dark:text-gray-400" to={"/"}>
              Support <span className="text-teal-600 text-xs p-1"></span>
            </Link>
          </div>
          <div className="p-5 my-5">
            <div className="text-xs uppercase text-gray-200 font-medium">
              Support
            </div>

            <Link className="my-3 block text-white dark:text-gray-400" to={"/"}>
              Help <span className="text-teal-600 text-xs p-1"></span>
            </Link>
            <Link className="my-3 block text-white dark:text-gray-400" to={"/"}>
              Policies <span className="text-teal-600 text-xs p-1"></span>
            </Link>
            <Link className="my-3 block text-white dark:text-gray-400" to={"/"}>
              Conditions <span className="text-teal-600 text-xs p-1"></span>
            </Link>
          </div>
          <div className="p-5 my-5">
            <div className="text-xs uppercase text-gray-200 font-medium">
              Contact us
            </div>

            <Link className="my-3 block text-white dark:text-gray-400" to={"/"}>
              XXX XXXX, Floor 4 San Francisco, CA{" "}
              <span className="text-teal-600 text-xs p-1"></span>
            </Link>

            <Link className="my-3 block text-white dark:text-gray-400" to={"/"}>
              contact@company.com{" "}
              <span className="text-teal-600 text-xs p-1"></span>
            </Link>
          </div>
        </div>
        <div className="max-w-screen-xl text-xs mx-auto py-3 sm:px-6 dark:text-gray-400 text-gray-200 flex flex-wrap justify-center items-center">
          Developed by Muhammad Ali
        </div>
      </div>
    </footer>
  );
}

export default Footer;
