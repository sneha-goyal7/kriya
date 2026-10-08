import Course from "../models/course.js";

class CourseRepository {
  async find(query = {}) {
    return Course.find(query).populate("instructor", "name email");
  }

  async findById(id) {
    return Course.findById(id).populate("instructor", "name email");
  }

  async create(courseData) {
    return Course.create(courseData);
  }

  async updateById(id, updateData) {
    return Course.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  }

  async deleteById(id) {
    return Course.findByIdAndDelete(id);
  }
}

export default new CourseRepository();
