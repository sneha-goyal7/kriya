import { apiSlice } from "@/services/apiSlice";

export const careerApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSkillTracks: builder.query({
      query: () => "/career/tracks",
      providesTags: ["Career"],
    }),
    
    getProfile: builder.query({
      query: () => "/career/profile",
      providesTags: ["CareerProfile"],
    }),
    
    updateProfile: builder.mutation({
      query: (data) => ({
        url: "/career/profile",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["CareerProfile"],
    }),

    getRoadmap: builder.query({
      query: () => "/career/roadmap",
      providesTags: ["Roadmap"],
    }),

    generateRoadmap: builder.mutation({
      query: () => ({
        url: "/career/roadmap/generate",
        method: "POST",
      }),
      invalidatesTags: ["Roadmap", "CareerProfile"],
    }),

    completeRoadmapNode: builder.mutation({
      query: (nodeId) => ({
        url: `/career/roadmap/node/${nodeId}/complete`,
        method: "PUT",
      }),
      invalidatesTags: ["Roadmap"],
    }),

    testOutRoadmapNode: builder.mutation({
      query: ({ nodeId, url }) => ({
        url: `/career/roadmap/node/${nodeId}/test-out`,
        method: "POST",
        body: { url },
      }),
      invalidatesTags: ["Roadmap"],
    }),

    getEmployerProfile: builder.query({
      query: () => "/career/employer/profile",
      providesTags: ["EmployerProfile"],
    }),

    createEmployerProfile: builder.mutation({
      query: (data) => ({
        url: "/career/employer/profile",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["EmployerProfile"],
    }),

    getResourcesByTag: builder.query({
      query: ({ skillTag, nodeTitle, nodeDescription }) => `/career/resources?skillTag=${encodeURIComponent(skillTag || 'General')}&nodeTitle=${encodeURIComponent(nodeTitle || '')}&nodeDescription=${encodeURIComponent(nodeDescription || '')}`,
      providesTags: (result, error, arg) => [{ type: "Resource", id: arg.skillTag || 'General' }],
    }),

    getAssignmentForNode: builder.query({
      query: (nodeId) => `/career/roadmap/node/${nodeId}/assignment`,
      providesTags: (result, error, arg) => [{ type: "Assignment", id: arg }],
    }),

    sendCompanionMessage: builder.mutation({
      query: (data) => ({
        url: "/career/chat",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useGetSkillTracksQuery,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetRoadmapQuery,
  useGenerateRoadmapMutation,
  useCompleteRoadmapNodeMutation,
  useTestOutRoadmapNodeMutation,
  useGetEmployerProfileQuery,
  useCreateEmployerProfileMutation,
  useGetResourcesByTagQuery,
  useGetAssignmentForNodeQuery,
  useSendCompanionMessageMutation,
} = careerApi;
