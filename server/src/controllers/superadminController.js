import User from "../models/User.model.js";
import Team from "../models/Team.model.js";
import Organization from "../models/Organization.model.js";
import Workflow from "../models/Workflow.model.js";

// ------------------------
// USER MANAGEMENT
// ------------------------

export const getAllUsers = async (req, res) => {
  const users = await User.find().populate("roleId organizationId");
  res.json(users);
};

export const createUser = async (req, res) => {
  const { name, email, password, roleId, organizationId } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    roleId,
    organizationId,
  });

  await Organization.findByIdAndUpdate(organizationId, {
    $addToSet: { users: user._id },
  });

  res.status(201).json(user);
};

export const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { roleId } = req.body;

  const user = await User.findByIdAndUpdate(id, { roleId }, { new: true });

  res.json(user);
};

export const moveUserToOrganization = async (req, res) => {
  const { id } = req.params;
  const { newOrgId } = req.body;

  const user = await User.findById(id);
  const oldOrgId = user.organizationId;

  await Organization.findByIdAndUpdate(oldOrgId, {
    $pull: { users: id },
  });

  await Organization.findByIdAndUpdate(newOrgId, {
    $addToSet: { users: id },
  });

  user.organizationId = newOrgId;
  await user.save();

  res.json({ message: "User moved successfully" });
};

export const deactivateUser = async (req, res) => {
  const { id } = req.params;

  const user = await User.findByIdAndUpdate(id, {
    "subscription.status": "inactive",
  });

  res.json({ message: "User deactivated" });
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  await Team.updateMany({}, { $pull: { members: id } });

  await User.findByIdAndDelete(id);

  res.json({ message: "User deleted successfully" });
};

// ------------------------
// TEAM MANAGEMENT
// ------------------------

export const getAllTeams = async (req, res) => {
  const teams = await Team.find().populate("organizationId users");
  res.json(teams);
};

export const deleteTeam = async (req, res) => {
  await Team.findByIdAndDelete(req.params.id);
  res.json({ message: "Team deleted" });
};

export const moveTeamToOrganization = async (req, res) => {
  const { id } = req.params;
  const { newOrgId } = req.body;

  await Team.findByIdAndUpdate(id, { organizationId: newOrgId });

  res.json({ message: "Team moved successfully" });
};

// ------------------------
// PLATFORM STATS
// ------------------------

export const platformStats = async (req, res) => {
  const orgCount = await Organization.countDocuments();
  const userCount = await User.countDocuments();
  const teamCount = await Team.countDocuments();
  const workflowCount = await Workflow.countDocuments();

  res.json({
    orgCount,
    userCount,
    teamCount,
    workflowCount,
  });
};
