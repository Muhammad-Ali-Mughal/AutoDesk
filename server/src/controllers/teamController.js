import Team from "../models/Team.model.js";
import User from "../models/User.model.js";

// 📌 Create team inside organization
export const createTeam = async (req, res) => {
  try {
    const { name } = req.body;

    const team = await Team.create({
      name,
      organizationId: req.user.organizationId,
      users: [],
    });

    res.status(201).json({ success: true, team });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📌 List teams inside my organization
export const getMyTeams = async (req, res) => {
  try {
    const teams = await Team.find({
      organizationId: req.user.organizationId,
    }).populate("users", "name email roleId");

    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📌 Add user to team
export const addUserToTeam = async (req, res) => {
  try {
    const { userId, teamId } = req.body;

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    if (team.organizationId.toString() !== req.user.organizationId.toString())
      return res.status(403).json({ message: "Not your organization" });

    if (!team.users.includes(userId)) {
      team.users.push(userId);
      await team.save();
    }

    await User.findByIdAndUpdate(userId, {
      teamId,
      organizationId: req.user.organizationId,
    });

    res.json({ success: true, message: "User added to team" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📌 Remove user from team
export const removeUserFromTeam = async (req, res) => {
  try {
    const { userId, teamId } = req.body;

    await Team.findByIdAndUpdate(teamId, {
      $pull: { users: userId },
    });

    res.json({ success: true, message: "User removed from team" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
