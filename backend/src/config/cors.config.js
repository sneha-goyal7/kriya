/**
 * CORS Configuration
 * Locks API access to authorized frontend origins only.
 * The old config allowed ANY origin — this fixes that security gap.
 */

const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
const allowedOrigins = [
  frontendUrl,
  frontendUrl.replace("https://", "https://www."),
  frontendUrl.replace("https://www.", "https://"),
  frontendUrl.replace("http://", "https://"),
  "http://localhost:5173",
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true, // Required for HttpOnly cookies (refresh tokens)
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400, // Cache preflight for 24 hours
};

export default corsOptions;
