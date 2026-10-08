import SkillTrack from "../models/skillTrack.js";
import CareerProfile from "../models/careerProfile.js";
import Roadmap from "../models/roadmap.js";
import SkillAssessment from "../models/skillAssessment.js";
import Skill from "../models/skill.js";
import Employer from "../models/employer.js";

class CareerRepository {
  // --- Skill Tracks ---
  async findAllActiveTracks() {
    return SkillTrack.find({ active: true });
  }

  async findTrackById(id) {
    return SkillTrack.findById(id);
  }

  async createTrack(trackData) {
    return SkillTrack.create(trackData);
  }

  // --- Career Profile ---
  async findProfileByUserId(userId) {
    return CareerProfile.findOne({ user: userId });
  }

  async upsertProfile(userId, profileData) {
    return CareerProfile.findOneAndUpdate(
      { user: userId },
      { ...profileData, user: userId },
      { returnDocument: "after", upsert: true, runValidators: true }
    );
  }

  // --- Roadmap ---
  async findRoadmapByUserId(userId) {
    return Roadmap.findOne({ user: userId }).populate("nodes.linkedCourses");
  }

  async upsertRoadmap(userId, roadmapData) {
    return Roadmap.findOneAndUpdate(
      { user: userId },
      { ...roadmapData, user: userId },
      { returnDocument: "after", upsert: true, runValidators: true }
    ).populate("nodes.linkedCourses");
  }

  async updateRoadmapNodeStatus(userId, nodeId, status) {
    return Roadmap.findOneAndUpdate(
      { user: userId, "nodes._id": nodeId },
      { $set: { "nodes.$.status": status } },
      { returnDocument: "after" }
    );
  }

  // --- Skills ---
  async createSkill(skillData) {
    return Skill.create(skillData);
  }

  async findAllSkills() {
    return Skill.find().sort({ popularity: -1 });
  }

  // --- Employers ---
  async createEmployer(employerData) {
    return Employer.create(employerData);
  }

  async findEmployerByUserId(userId) {
    return Employer.findOne({ user: userId });
  }
}

export default new CareerRepository();
