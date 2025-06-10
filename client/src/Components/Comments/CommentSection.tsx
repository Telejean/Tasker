import React, { useState, useEffect } from 'react';
import { Box, Heading, Button, Flex, Text } from '@radix-ui/themes';
import { LuMessageSquare, LuPlus } from 'react-icons/lu';
import { Comment } from '@my-types/types';
import { commentService } from '../../services/comment.service';
import { CommentItem } from './CommentItem';
import { CommentForm } from './CommentForm';

interface CommentSectionProps {
    taskId: number;
    isExpanded?: boolean;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
    taskId,
    isExpanded = true
}) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddComment, setShowAddComment] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                setLoading(true);
                setError(null);
                const fetchedComments = await commentService.getCommentsByTask(taskId);

                const commentTree = commentService.buildCommentTree(fetchedComments);
                setComments(commentTree);
            } catch (err) {
                console.error('Error fetching comments:', err);
                setError('Failed to load comments');
            } finally {
                setLoading(false);
            }
        };

        if (taskId) {
            fetchComments();
        }
    }, [taskId, refreshTrigger]);

    const handleCommentAdded = () => {
        setRefreshTrigger(prev => prev + 1);
        setShowAddComment(false);
    };

    const handleCommentUpdated = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const handleCommentDeleted = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const totalCommentsCount = comments.reduce((count, comment) => {
        return count + 1 + (comment.replies?.length || 0);
    }, 0);

    if (loading) {
        return (
            <Box p="4">
                <Text>Loading comments...</Text>
            </Box>
        );
    }

    if (error) {
        return (
            <Box p="4">
                <Text color="red">{error}</Text>
                <Button
                    variant="soft"
                    size="1"
                    mt="2"
                    onClick={() => setRefreshTrigger(prev => prev + 1)}
                >
                    Retry
                </Button>
            </Box>
        );
    }

    return (
        <Box>
            <Flex justify="between" align="center" mb="4">
                <Flex align="center" gap="2">
                    <LuMessageSquare size={20} />
                    <Heading size="4">
                        Comments ({totalCommentsCount})
                    </Heading>
                </Flex>

                <Button
                    size="2"
                    variant="soft"
                    onClick={() => setShowAddComment(!showAddComment)}
                >
                    <LuPlus size={16} />
                    Add Comment
                </Button>
            </Flex>

            {showAddComment && (
                <Box mb="4">
                    <CommentForm
                        taskId={taskId}
                        onCommentAdded={handleCommentAdded}
                        onCancel={() => setShowAddComment(false)}
                        placeholder="Write a comment..."
                    />
                </Box>
            )}

            <Box>
                {comments.length === 0 ? (
                    <Box
                        p="6"
                        style={{
                            textAlign: 'center',
                            border: '2px dashed var(--gray-6)',
                            borderRadius: '8px'
                        }}
                    >
                        <LuMessageSquare size={32} style={{ color: 'var(--gray-8)' }} />
                        <Text size="3" color="gray" mt="2" style={{ display: 'block' }}>
                            No comments yet
                        </Text>
                        <Text size="2" color="gray">
                            Be the first to share your thoughts on this task
                        </Text>
                        <Button
                            variant="soft"
                            size="2"
                            mt="3"
                            onClick={() => setShowAddComment(true)}
                        >
                            <LuPlus size={16} />
                            Add the first comment
                        </Button>
                    </Box>
                ) : (
                    <Flex direction="column" gap="3">
                        {comments.map((comment) => (
                            <CommentItem
                                key={comment.id}
                                comment={comment}
                                taskId={taskId}
                                onCommentUpdated={handleCommentUpdated}
                                onCommentDeleted={handleCommentDeleted}
                                level={0}
                            />
                        ))}
                    </Flex>
                )}
            </Box>
        </Box>
    );
};
