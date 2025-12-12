import mongoose from "mongoose";
import dotenv from "dotenv";
import Role from "../models/Role.model.js";
import User from "../models/User.model.js";

// FINAL ROLES LIST
const rolesToCreate = [
  {
    name: "Superadmin",
    permissions: [
      { module: "organizations", access: true },
      { module: "teams", access: true },
      { module: "roles", access: true },
      { module: "users", access: true },
      { module: "workflows", access: true },
    ],
  },
  {
    name: "Admin",
    permissions: [
      { module: "organizations", access: true },
      { module: "teams", access: true },
      { module: "roles", access: true },
      { module: "users", access: true },
      { module: "workflows", access: true },
    ],
  },
  {
    name: "Member",
    permissions: [
      { module: "organizations", access: false },
      { module: "teams", access: false },
      { module: "roles", access: false },
      { module: "users", access: false },
      { module: "workflows", access: true },
    ],
  },
  {
    name: "Guest",
    permissions: [
      { module: "organizations", access: false },
      { module: "teams", access: false },
      { module: "roles", access: false },
      { module: "users", access: false },
      { module: "workflows", access: false },
    ],
  },
];

async function seed() {
  try {
    // if (!MONGO) throw new Error("MONGO_URI / DATABASE_URL not set in env");

    // await mongoose.connect(MONGO, {
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true,
    // });

    // console.log("Connected to Mongo");

    // DELETE existing roles and recreate fresh
    for (const roleData of rolesToCreate) {
      const existing = await Role.findOne({ name: roleData.name });

      if (existing) {
        console.log(`Role '${roleData.name}' exists → deleting...`);
        await Role.deleteOne({ _id: existing._id });
      }

      const created = await Role.create(roleData);
      console.log(`Created role: ${created.name}`);
    }

    // Superadmin credentials from env
    const superEmail = process.env.SUPERADMIN_EMAIL?.toLowerCase();
    const superPass = process.env.SUPERADMIN_PASSWORD;
    const superName = process.env.SUPERADMIN_NAME || "Super Admin";

    if (superEmail && superPass) {
      const existingSuper = await User.findOne({ email: superEmail });

      const superRole = await Role.findOne({ name: "Superadmin" });
      if (!superRole) throw new Error("Superadmin role was not created.");

      if (existingSuper) {
        console.log("Superadmin already exists → resetting role");

        existingSuper.roleId = superRole._id;
        await existingSuper.save();

        console.log("Superadmin role reassigned");
      } else {
        const newSuper = await User.create({
          name: superName,
          email: superEmail,
          password: superPass,
          roleId: superRole._id,
        });

        console.log("Superadmin user created:", newSuper.email);
      }
    } else {
      console.log(
        "SUPERADMIN_EMAIL or SUPERADMIN_PASSWORD missing → skipping superadmin creation."
      );
    }

    console.log("Seeding complete.");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

export default seed();
