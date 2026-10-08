import { apiSlice } from "../../services/apiSlice";

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardMetrics: builder.query({
      query: () => "/admin/dashboard/metrics",
      providesTags: ["AdminDashboard"],
    }),
    getHiringPartners: builder.query({
      query: () => "/admin/employers",
      providesTags: ["AdminEmployers"],
    }),
    togglePartnerVerification: builder.mutation({
      query: (id) => ({
        url: `/admin/employers/${id}/verify`,
        method: "PUT",
      }),
      invalidatesTags: ["AdminEmployers"],
      // Optimistic update for blazing fast UI
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          adminApi.util.updateQueryData("getHiringPartners", undefined, (draft) => {
            const partner = draft?.data?.employers?.find((p) => p._id === id);
            if (partner) {
              partner.verified = !partner.verified;
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    getContentQueue: builder.query({
      query: () => "/admin/content-review",
      providesTags: ["ContentReview"],
    }),
    approveContent: builder.mutation({
      query: (id) => ({
        url: `/admin/content-review/${id}/approve`,
        method: "PUT",
      }),
      invalidatesTags: ["ContentReview", "AdminDashboard"],
    }),
    rejectContent: builder.mutation({
      query: ({ id, feedback }) => ({
        url: `/admin/content-review/${id}/reject`,
        method: "PUT",
        body: { feedback },
      }),
      invalidatesTags: ["ContentReview", "AdminDashboard"],
    }),
    getStudents: builder.query({
      query: () => "/admin/students",
      providesTags: ["AdminStudents"],
    }),
    getInstructors: builder.query({
      query: () => "/admin/instructors",
      providesTags: ["AdminInstructors"],
    }),
    suspendInstructor: builder.mutation({
      query: (id) => ({
        url: `/admin/instructors/${id}/suspend`,
        method: "PUT",
      }),
      invalidatesTags: ["AdminInstructors"],
    }),
    revokePublishing: builder.mutation({
      query: (id) => ({
        url: `/admin/instructors/${id}/revoke`,
        method: "PUT",
      }),
      invalidatesTags: ["AdminInstructors"],
    }),
    getCohorts: builder.query({
      query: () => "/admin/cohorts",
      providesTags: ["AdminCohorts"],
    }),
    createCohort: builder.mutation({
      query: (cohortData) => ({
        url: "/admin/cohorts",
        method: "POST",
        body: cohortData,
      }),
      invalidatesTags: ["AdminCohorts"],
    }),
    getAnalytics: builder.query({
      query: () => "/admin/analytics",
      providesTags: ["AdminAnalytics"],
    }),
    getFeedbacks: builder.query({
      query: () => "/admin/feedbacks",
      providesTags: ["Feedback"],
    }),
  }),
});

export const {
  useGetDashboardMetricsQuery,
  useGetHiringPartnersQuery,
  useTogglePartnerVerificationMutation,
  useGetContentQueueQuery,
  useApproveContentMutation,
  useRejectContentMutation,
  useGetStudentsQuery,
  useGetInstructorsQuery,
  useSuspendInstructorMutation,
  useRevokePublishingMutation,
  useGetCohortsQuery,
  useCreateCohortMutation,
  useGetAnalyticsQuery,
  useGetFeedbacksQuery,
} = adminApi;
