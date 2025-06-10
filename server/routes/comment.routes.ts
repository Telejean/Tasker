import { Router } from 'express';
import { commentController } from '../controllers/index';
import { jwtAuth } from '../middlewares/authorization.middleware';

const router = Router();

// Get all comments for a specific task
router.get('/task/:taskId', commentController.getCommentsByTask as any);

// Create a new comment (requires authentication)
router.post('/', jwtAuth as any, commentController.createComment as any);

// Update a comment (requires authentication)
router.put('/:id', jwtAuth as any, commentController.updateComment as any);

// Delete a comment (requires authentication)
router.delete('/:id', jwtAuth as any, commentController.deleteComment as any);

// Like/dislike a comment (requires authentication)
router.post('/:id/like', jwtAuth as any, commentController.toggleCommentLike as any);

// Get likes/dislikes for a comment
router.get('/:id/likes', commentController.getCommentLikes as any);

export default router;
