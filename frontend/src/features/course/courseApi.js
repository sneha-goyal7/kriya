import { apiSlice } from "@/services/apiSlice";

export const courseApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET ALL COURSES

    getCourses: builder.query({
      query: () => "/courses",
      providesTags: ["Course"],
    }),

    // GET COURSE

    getCourseById: builder.query({
      query: (id) => `/courses/${id}`,
      providesTags: (result, error, id) => [{ type: "Course", id }],
    }),

    // CREATE COURSE

    createCourse: builder.mutation({
      query: (data) => ({
        url: "/courses",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Course"],
    }),

    // ENROLL

    enrollCourse: builder.mutation({
      query: ({ courseId, userId }) => ({
        url: "/enrollments",
        method: "POST",
        body: {
          courseId,
          userId,
        },
      }),
      invalidatesTags: ["Enrollment", "Course"],
    }),
  }),
});

export const {
  useGetCoursesQuery,
  useGetCourseByIdQuery,
  useCreateCourseMutation,
  useEnrollCourseMutation,
} = courseApi;
