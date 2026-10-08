import { apiSlice } from "@/services/apiSlice";

export const instructorApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET INSTRUCTOR COURSES

    getInstructorCourses: builder.query({
      query: (instructorId) => `/courses/instructor/${instructorId}`,
      providesTags: ["Course"],
    }),
  }),
});

export const { useGetInstructorCoursesQuery } = instructorApi;
