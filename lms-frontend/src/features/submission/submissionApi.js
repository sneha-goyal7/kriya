import { apiSlice } from "../../services/apiSlice";

export const submissionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    submitAssignment: builder.mutation({
      query: ({ assignmentId, ...data }) => ({
        url: `/submissions/${assignmentId}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Submissions"],
    }),
    getMySubmissions: builder.query({
      query: (assignmentId) => `/submissions/my-history/${assignmentId}`,
      providesTags: ["Submissions"],
    }),
    getInstructorQueue: builder.query({
      query: () => `/submissions/queue/instructor`,
      providesTags: ["InstructorQueue"],
    }),
    overrideVerdict: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/submissions/${id}/override`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["InstructorQueue"],
    }),
  }),
});

export const {
  useSubmitAssignmentMutation,
  useGetMySubmissionsQuery,
  useGetInstructorQueueQuery,
  useOverrideVerdictMutation,
} = submissionApi;
