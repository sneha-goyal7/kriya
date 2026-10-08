import { apiSlice } from "@/services/apiSlice";

export const lectureApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET LECTURES

    getLectures: builder.query({
      query: (courseId) => `/lectures/${courseId}`,
      providesTags: (result, error, id) => [{ type: "Lecture", id }],
    }),

    // CREATE LECTURE
    createLecture: builder.mutation({
      query: (data) => ({
        url: `/lectures/${data.course}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, arg) => [{ type: "Lecture", id: arg.course }],
    }),

    // MARK COMPLETE

    markComplete: builder.mutation({
      query: ({ lectureId, userId }) => ({
        url: "/progress",
        method: "POST",
        body: { userId, lectureId },
      }),
      invalidatesTags: ["Progress"],
    }),

    // GET PROGRESS

    getCourseProgress: builder.query({
      query: ({ courseId, userId }) => `/progress/${userId}/${courseId}`,
      providesTags: ["Progress"],
    }),
  }),
});

export const {
  useGetLecturesQuery,
  useCreateLectureMutation,
  useMarkCompleteMutation,
  useGetCourseProgressQuery,
} = lectureApi;
