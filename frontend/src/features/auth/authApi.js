import { apiSlice } from "@/services/apiSlice";
import { setCredentials, updateUser } from "./authSlice";

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: "/auth/login",
        method: "POST",
        body: data,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),
    register: builder.mutation({
      query: (data) => ({
        url: "/auth/register",
        method: "POST",
        body: data,
      }),
    }),
    forgotPassword: builder.mutation({
      query: (data) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: data,
      }),
    }),
    resetPassword: builder.mutation({
      query: ({ token, password }) => ({
        url: `/auth/reset-password/${token}`,
        method: "PUT",
        body: { password },
      }),
    }),
    verifyAuth: builder.query({
      query: () => ({
        url: "/auth/refresh",
        method: "GET",
        headers: localStorage.getItem("refreshToken") ? { "x-refresh-token": localStorage.getItem("refreshToken") } : {},
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data && data.success) {
            if (data.data.refreshToken) {
              localStorage.setItem("refreshToken", data.data.refreshToken);
            }
            dispatch(setCredentials({ token: data.data.token, user: data.data.user }));
          }
        } catch (error) {
          // Do nothing on verify fail (user just not logged in)
        }
      }
    }),
    updateUserProfile: builder.mutation({
      query: (data) => ({
        url: "/users/profile",
        method: "PUT",
        body: data,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data && data.success) {
            dispatch(updateUser(data.data.profile));
          }
        } catch (error) {
          // fallback
        }
      }
    }),
  }),
});

export const { 
  useLoginMutation, 
  useLogoutMutation,
  useRegisterMutation, 
  useForgotPasswordMutation, 
  useResetPasswordMutation,
  useVerifyAuthQuery,
  useUpdateUserProfileMutation
} = authApi;
