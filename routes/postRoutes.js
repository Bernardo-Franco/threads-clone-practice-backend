import express from 'express';
import {
  createPost,
  getPost,
  deletePost,
  likeUnlikePost,
  replyToPost,
  getFeedPosts,
  getUserPosts,
  deleteReply,
} from '../controllers/postController.js';
import protectRoute from '../middleware/protectRoute.js';

const router = express.Router();

router.get('/feed', protectRoute, getFeedPosts);
router.get('/:postId', getPost);
router.get('/user/:username', getUserPosts);
router.post('/create', protectRoute, createPost);
router.delete('/:postId', protectRoute, deletePost);
router.put('/like/:postId', protectRoute, likeUnlikePost);
router.put('/reply/:postId', protectRoute, replyToPost);
router.delete('/reply/:postId', protectRoute, deleteReply);

export default router;
