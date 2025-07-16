import { Router } from 'express';
import {
    getSubscribedChannels,         // Get channels I have subscribed to
    getUserChannelSubscribers,     // Get users who have subscribed to my channel
    toggleSubscription             // Subscribe/Unsubscribe a channel
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);


router.route("/c/:channelId").post(toggleSubscription);
router.route("/c/:channelId").get(getUserChannelSubscribers);
router.route("/u/:subscriberId").get(getSubscribedChannels);

export default router;
