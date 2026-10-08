import careerRepository from "../repositories/career.repository.js";
import { NotFoundError, ConflictError } from "../utils/AppError.js";

class CareerService {
  async getActiveSkillTracks() {
    return careerRepository.findAllActiveTracks();
  }

  async getProfile(userId) {
    let profile = await careerRepository.findProfileByUserId(userId);
    if (!profile) {
      // Return a default empty profile instead of throwing
      profile = {
        user: userId,
        dreamRole: "",
        currentLevel: "beginner",
        currentSkills: [],
        preferredLearningStyle: "mixed",
        isOnboarded: false,
      };
    } else {
      // Log generic daily activity to update streak
      try {
        const { logActivity } = await import("./activity.service.js");
        await logActivity(userId, "Active session", "learning");
      } catch (e) {
        console.error(e);
      }
    }
    return profile;
  }

  async updateProfile(userId, profileData) {
    return careerRepository.upsertProfile(userId, {
      ...profileData,
      isOnboarded: true,
    });
  }

  async getRoadmap(userId) {
    const roadmap = await careerRepository.findRoadmapByUserId(userId);
    if (!roadmap) {
      throw new NotFoundError("Roadmap not generated yet");
    }
    return roadmap;
  }

  async completeNode(userId, nodeId) {
    const roadmap = await careerRepository.findRoadmapByUserId(userId);
    if (!roadmap) {
      throw new NotFoundError("Roadmap not found");
    }

    const nodeIndex = roadmap.nodes.findIndex(n => n._id.toString() === nodeId);
    if (nodeIndex === -1) {
      throw new NotFoundError("Roadmap node not found");
    }

    // Update current node to completed
    roadmap.nodes[nodeIndex].status = "completed";

    // Unlock next node if it exists
    if (nodeIndex + 1 < roadmap.nodes.length) {
      roadmap.nodes[nodeIndex + 1].status = "active";
    }

    // Recalculate progress
    const completedCount = roadmap.nodes.filter(n => n.status === "completed").length;
    roadmap.overallProgress = Math.round((completedCount / roadmap.nodes.length) * 100);

    await roadmap.save();
    
    // Log Activity
    try {
      const { logActivity } = await import("./activity.service.js");
      await logActivity(userId, `Mastered objective: ${roadmap.nodes[nodeIndex].title}`, "achievement");
    } catch (e) {
      console.error(e);
    }

    return roadmap;
  }

  async seedSkillTracks() {
    const tracks = await careerRepository.findAllActiveTracks();
    if (tracks.length > 0) return tracks; // Already seeded

    const starterTracks = [
      {
        title: "Frontend Engineer",
        description: "Master React, modern CSS, and web architecture to build stunning user interfaces.",
        targetRole: "Frontend Developer",
        level: "beginner",
        requiredSkills: ["HTML", "CSS", "JavaScript", "React", "State Management", "Performance"],
        estimatedMonths: 6,
      },
      {
        title: "Backend Engineer",
        description: "Build robust, scalable APIs and services using Node.js and Databases.",
        targetRole: "Backend Developer",
        level: "beginner",
        requiredSkills: ["Node.js", "Express", "MongoDB", "SQL", "System Design"],
        estimatedMonths: 6,
      },
      {
        title: "Full Stack Developer",
        description: "End-to-end web development from database to UI.",
        targetRole: "Full Stack Developer",
        level: "intermediate",
        requiredSkills: ["React", "Node.js", "MongoDB", "DevOps", "Testing"],
        estimatedMonths: 9,
      },
      {
        title: "Data Scientist",
        description: "Extract insights from data using Python and machine learning.",
        targetRole: "Data Scientist",
        level: "intermediate",
        requiredSkills: ["Python", "Pandas", "Machine Learning", "Data Visualization", "SQL"],
        estimatedMonths: 8,
      },
      {
        title: "AI Engineer",
        description: "Build intelligent systems powered by LLMs and deep learning.",
        targetRole: "AI Engineer",
        level: "advanced",
        requiredSkills: ["Python", "Deep Learning", "NLP", "LLMOps", "Vector Databases"],
        estimatedMonths: 8,
      },
    ];

    const createdTracks = [];
    for (const track of starterTracks) {
      const created = await careerRepository.createTrack(track);
      createdTracks.push(created);
    }

    return createdTracks;
  }

  // --- Skills ---
  async createSkill(skillData) {
    return careerRepository.createSkill(skillData);
  }

  async getAllSkills() {
    return careerRepository.findAllSkills();
  }

  // --- Employers ---
  async createEmployerProfile(userId, employerData) {
    const existing = await careerRepository.findEmployerByUserId(userId);
    if (existing) {
      throw new ConflictError("Employer profile already exists");
    }
    return careerRepository.createEmployer({ ...employerData, user: userId });
  }

  async getEmployerProfile(userId) {
    const employer = await careerRepository.findEmployerByUserId(userId);
    if (!employer) {
      throw new NotFoundError("Employer profile not found");
    }
    return employer;
  }
}

export default new CareerService();
