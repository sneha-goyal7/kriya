import { apiSlice } from "@/services/apiSlice";

export const assignmentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET COURSE ASSIGNMENTS
    getCourseAssignments: builder.query({
      query: (courseId) => `/assignments/course/${courseId}`,
      providesTags: (result, error, id) => [{ type: "Assignment", id }],
    }),

    // CREATE ASSIGNMENT
    createAssignment: builder.mutation({
      query: ({ courseId, ...data }) => ({
        url: `/assignments/course/${courseId}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, arg) => [{ type: "Assignment", id: arg.courseId }],
    }),
  }),
});

export const {
  useGetCourseAssignmentsQuery,
  useCreateAssignmentMutation,
} = assignmentApi;
