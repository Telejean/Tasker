import axios from 'axios';
import { API_URL, axiosConfig } from '../config/api';
import { Comment } from '@my-types/types';

export const commentService = {
    /**
     * Get all comments for a specific task
     */
    async getCommentsByTask(taskId: number): Promise<Comment[]> {
        try {
            const response = await axios.get(`${API_URL}/comments/task/${taskId}`, axiosConfig);
            return response.data;
        } catch (error) {
            console.error(`Error fetching comments for task ${taskId}:`, error);
            throw error;
        }
    },

    /**
     * Create a new comment
     */
    async createComment(commentData: {
        content: string;
        taskId: number;
        parentCommentId?: number;
    }): Promise<Comment> {
        try {
            const response = await axios.post(`${API_URL}/comments`, commentData, axiosConfig);
            return response.data;
        } catch (error) {
            console.error('Error creating comment:', error);
            throw error;
        }
    },

    /**
     * Update an existing comment
     */
    async updateComment(commentId: number, content: string): Promise<Comment> {
        try {
            const response = await axios.put(`${API_URL}/comments/${commentId}`, { content }, axiosConfig);
            return response.data;
        } catch (error) {
            console.error(`Error updating comment ${commentId}:`, error);
            throw error;
        }
    },

    /**
     * Delete a comment
     */
    async deleteComment(commentId: number): Promise<void> {
        try {
            await axios.delete(`${API_URL}/comments/${commentId}`, axiosConfig);
        } catch (error) {
            console.error(`Error deleting comment ${commentId}:`, error);
            throw error;
        }
    },

    /**
     * Toggle like/dislike on a comment
     */
    async toggleCommentLike(commentId: number, type: 'like' | 'dislike'): Promise<void> {
        try {
            await axios.post(`${API_URL}/comments/${commentId}/like`, { type }, axiosConfig);
        } catch (error) {
            console.error(`Error toggling ${type} on comment ${commentId}:`, error);
            throw error;
        }
    },

    /**
     * Get likes and dislikes for a comment
     */
    async getCommentLikes(commentId: number): Promise<{
        likes: any[];
        dislikes: any[];
    }> {
        try {
            const response = await axios.get(`${API_URL}/comments/${commentId}/likes`, axiosConfig);
            return response.data;
        } catch (error) {
            console.error(`Error fetching likes for comment ${commentId}:`, error);
            throw error;
        }
    },


    buildCommentTree(comments: Comment[]): Comment[] {
        const commentMap = new Map<number, Comment>();
        const rootComments: Comment[] = [];

        comments.forEach(comment => {
            commentMap.set(comment.id, comment);
            comment.replies = [];
        });

        comments.forEach(comment => {
            if (comment.parentCommentId) {
                const parent = commentMap.get(comment.parentCommentId);
                if (parent) {
                    parent.replies = parent.replies || [];
                    parent.replies.push(comment);
                }
            } else {
                rootComments.push(comment);
            }
        });

        return rootComments;
    },


    formatRelativeTime(date: Date): string {
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

        return new Date(date).toLocaleDateString();
    },


    validateComment(content: string): { isValid: boolean; error?: string } {
        if (!content || content.trim().length === 0) {
            return { isValid: false, error: 'Comment cannot be empty' };
        }

        if (content.length > 2000) {
            return { isValid: false, error: 'Comment cannot exceed 2000 characters' };
        }

        return { isValid: true };
    }
};
