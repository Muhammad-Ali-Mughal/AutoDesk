import mongoose from "mongoose";
import dotenv from "dotenv";
import Role from "../models/Role.model.js";

dotenv.config();

const roles = [
  {
    name: "Owner",
    permissions: [
      { module: "all", access: true },
    ],
  },
  {
    name: "Admin",
    permissions: [
      { module: "users", access: true },
      { module: "workflows", access: true },
      { module: "billing", access: true },
    ],
  },
  {
    name: "Member",
    permissions: [
      { module: "workflows", access: true },
    ],
  },
];

export const seedRoles = async () => {
  
    // for (const role of roles) {
    //   const existing = await Role.findOne({ name: role.name });
    //   if (!existing) {
    //     await Role.create(role);
    //     console.log(`✅ Role created: ${role.name}`);
    //   } else {
    //     console.log(`ℹ️ Role already exists: ${role.name}`);
    //   }
    // }

    // console.log("Role seeding completed.");
    // process.exit(0);
  
};

seedRoles();
