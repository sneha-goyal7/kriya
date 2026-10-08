import asyncHandler from "../utils/asyncHandler.js";
import ResourceCache from "../models/resourceCache.js";
import { sendSuccess } from "../utils/response.js";
import aiRouterService from "../services/aiRouter.service.js";

// GET /api/career/resources or /api/career/resources/:skillTag
export const getResourcesBySkillTag = asyncHandler(async (req, res) => {
  const skillTag = req.query.skillTag || req.params.skillTag;
  const { nodeTitle, nodeDescription } = req.query;

  // 1. Check cache
  const cached = await ResourceCache.findOne({ skillTag });
  
  if (cached) {
    console.log(`[Cache Hit] Resources for ${skillTag}`);
    return sendSuccess(res, { resources: cached.resources });
  }

  // 2. Cache miss -> Generate via AI Router
  console.log(`[Cache Miss] Generating resources for ${skillTag}`);
  const aiResponse = await aiRouterService.runAI('RESOURCE_CURATION', { skillTag, nodeTitle, nodeDescription }, req.user ? req.user._id : null, req.user ? req.user.tier : 'free');
  const resources = aiResponse.result;

  // 3. Save to cache
  const newCacheEntry = await ResourceCache.create({
    skillTag,
    resources,
  });

  return sendSuccess(res, { resources: newCacheEntry.resources }, 201);
});
