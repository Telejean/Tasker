import { Comment } from '../models/Comment.model';
import { CommentLike } from '../models/CommentLike.model';
import { User } from '../models/User.model';

export const commentService = {
    /**
     * Build a hierarchical comment tree from flat comment data
     */
    buildCommentTree(comments: Comment[]): Comment[] {
        const commentMap = new Map<number, Comment>();
        const rootComments: Comment[] = [];

        // First pass: create a map of all comments
        comments.forEach(comment => {
            commentMap.set(comment.id, comment);
            // Initialize replies array
            (comment as any).replies = [];
        });

        // Second pass: build the tree structure
        comments.forEach(comment => {
            if (comment.parentCommentId) {
                const parent = commentMap.get(comment.parentCommentId);
                if (parent) {
                    (parent as any).replies.push(comment);
                }
            } else {
                rootComments.push(comment);
            }
        });

        return rootComments;
    },

    /**
     * Get user's reaction to a specific comment
     */
    async getUserReaction(commentId: number, userId: number): Promise<'like' | 'dislike' | null> {
        const reaction = await CommentLike.findOne({
            where: {
                commentId,
                userId
            }
        });

        return reaction ? reaction.type : null;
    },

    /**
     * Calculate engagement metrics for a comment
     */
    calculateEngagement(comment: Comment): {
        totalReactions: number;
        likesPercentage: number;
        hasReplies: boolean;
    } {
        const totalReactions = comment.likesCount + comment.dislikesCount;
        const likesPercentage = totalReactions > 0 ? (comment.likesCount / totalReactions) * 100 : 0;
        const hasReplies = (comment as any).replies && (comment as any).replies.length > 0;

        return {
            totalReactions,
            likesPercentage,
            hasReplies
        };
    },

    /**
     * Validate comment content
     */
    validateComment(content: string): { isValid: boolean; error?: string } {
        if (!content || content.trim().length === 0) {
            return { isValid: false, error: 'Comment content cannot be empty' };
        }

        if (content.length > 2000) {
            return { isValid: false, error: 'Comment content cannot exceed 2000 characters' };
        }

        // Check for spam patterns (basic implementation)
        const spamPatterns = [
            /(.)\1{10,}/, // Repeated characters
            /https?:\/\/[^\s]+/gi // URLs (could be optional based on requirements)
        ];

        for (const pattern of spamPatterns) {
            if (pattern.test(content)) {
                return { isValid: false, error: 'Comment content appears to be spam' };
            }
        }

        return { isValid: true };
    },

    /**
     * Check if user can edit/delete a comment
     */
    async canUserModifyComment(commentId: number, userId: number): Promise<boolean> {
        const comment = await Comment.findByPk(commentId);
        return comment ? comment.authorId === userId : false;
    },

    /**
     * Get comment statistics for a task
     */
    async getTaskCommentStats(taskId: number): Promise<{
        totalComments: number;
        totalReplies: number;
        totalLikes: number;
        totalDislikes: number;
        uniqueParticipants: number;
    }> {
        const comments = await Comment.findAll({
            where: { taskId },
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id']
                }
            ]
        });

        const totalComments = comments.length;
        const totalReplies = comments.filter(c => c.parentCommentId).length;
        const totalLikes = comments.reduce((sum, c) => sum + c.likesCount, 0);
        const totalDislikes = comments.reduce((sum, c) => sum + c.dislikesCount, 0);
        const uniqueParticipants = new Set(comments.map(c => c.authorId)).size;

        return {
            totalComments,
            totalReplies,
            totalLikes,
            totalDislikes,
            uniqueParticipants
        };
    }
};
