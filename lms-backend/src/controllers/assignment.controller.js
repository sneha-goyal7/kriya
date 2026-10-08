import Assignment from "../models/assignment.js";

// Get course assignments
export const getCourseAssignments = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const assignments = await Assignment.find({ course: courseId });
    
    res.status(200).json({ assignments });
  } catch (error) {
    console.error("Error fetching course assignments:", error);
    res.status(500).json({ message: "Failed to fetch assignments" });
  }
};

// Create assignment
export const createAssignment = async (req, res) => {
  try {
    const { courseId } = req.params;
    const {
      title,
      moduleName,
      skillTag,
      brief,
      timeEstimateMinutes,
      acceptedFormat,
      acceptanceCriteria,
      commonMistakes,
      exampleOutputUrl
    } = req.body;

    if (!title || !moduleName || !skillTag || !brief || !timeEstimateMinutes || !acceptedFormat || !acceptanceCriteria) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const assignment = await Assignment.create({
      title,
      moduleName,
      skillTag,
      brief,
      timeEstimateMinutes,
      acceptedFormat,
      acceptanceCriteria,
      commonMistakes: commonMistakes || [],
      exampleOutputUrl,
      course: courseId
    });

    res.status(201).json({
      message: "Assignment created successfully",
      assignment
    });
  } catch (error) {
    console.error("Error creating assignment:", error);
    res.status(500).json({ message: "Failed to create assignment" });
  }
};
