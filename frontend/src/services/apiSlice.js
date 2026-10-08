import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { env } from "@/config/env";
import { setCredentials, logout } from "@/features/auth/authSlice";

const baseQuery = fetchBaseQuery({
  baseUrl: env.apiBaseUrl,
  credentials: "include", // Required to receive Set-Cookie on login and send it on refresh
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // Do not try to refresh if the 401 came from the login or refresh endpoints themselves
  const isAuthEndpoint = args.url === "/auth/login" || args.url === "/auth/refresh";

  if (result.error && result.error.status === 401 && !isAuthEndpoint) {
    // Try to get a new token via refresh endpoint
    const localRefreshToken = localStorage.getItem("refreshToken");
    const refreshResult = await baseQuery(
      {
        url: "/auth/refresh",
        method: "GET",
        headers: localRefreshToken ? { "x-refresh-token": localRefreshToken } : {},
        credentials: "include", // Only send cookies here
      },
      api,
      extraOptions
    );

    if (refreshResult.data && refreshResult.data.success) {
      if (refreshResult.data.data.refreshToken) {
        localStorage.setItem("refreshToken", refreshResult.data.data.refreshToken);
      }
      // Store the new token and user
      const newToken = refreshResult.data.data.token;
      const newUser = refreshResult.data.data.user || api.getState().auth.user;
      api.dispatch(
        setCredentials({
          token: newToken,
          user: newUser,
        })
      );
      // Retry the initial query
      result = await baseQuery(args, api, extraOptions);
    } else {
      // Refresh failed, force logout
      api.dispatch(logout());
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Auth", "Course", "Lecture", "Enrollment", "Progress"],
  endpoints: () => ({}),
});
