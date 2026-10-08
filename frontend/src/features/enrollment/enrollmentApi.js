import { apiSlice } from "@/services/apiSlice";

export const enrollmentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // USER ENROLLMENTS

    getUserEnrollments: builder.query({
      query: (userId) => `/enrollments/user/${userId}`,
      providesTags: ["Enrollment"],
    }),

    // CHECK ENROLLMENT

    checkEnrollment: builder.query({
      query: ({ userId, courseId }) =>
        `/enrollments/check?userId=${userId}&courseId=${courseId}`,
      providesTags: ["Enrollment"],
    }),
  }),
});

export const { useGetUserEnrollmentsQuery, useCheckEnrollmentQuery } =
  enrollmentApi;
