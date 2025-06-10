import React, { useState } from 'react';
import { Box, Flex, Text, Button, Avatar, Badge, Separator } from '@radix-ui/themes';
import { LuThumbsUp, LuThumbsDown, LuReply, LuPen, LuTrash2, LuEllipsis } from 'react-icons/lu';
import { Comment } from '@my-types/types';
import { commentService } from '../../services/comment.service';
import { CommentForm } from './CommentForm';
import { useAtom } from 'jotai';
import { userAtom } from '@/App';

interface CommentItemProps {
    comment: Comment;
    taskId: number;
    onCommentUpdated: () => void;
    onCommentDeleted: () => void;
    level?: number;
    maxLevel?: number;
}

export const CommentItem: React.FC<CommentItemProps> = ({
    comment,
    taskId,
    onCommentUpdated,
    onCommentDeleted,
    level = 0,
    maxLevel = 3
}) => {
    const [currentUser] = useAtom(userAtom);
    const [isEditing, setIsEditing] = useState(false);
    const [isReplying, setIsReplying] = useState(false);
    const [showActions, setShowActions] = useState(false);
    const [likeLoading, setLikeLoading] = useState(false);
    const [userReaction, setUserReaction] = useState<'like' | 'dislike' | null>(
        comment.userReaction || null
    );
    const [likesCount, setLikesCount] = useState(comment.likesCount);
    const [dislikesCount, setDislikesCount] = useState(comment.dislikesCount);

    const isAuthor = currentUser?.id === comment.authorId;
    const canReply = level < maxLevel;

    const handleLikeToggle = async (type: 'like' | 'dislike') => {
        if (likeLoading) return;

        try {
            setLikeLoading(true);
            await commentService.toggleCommentLike(comment.id, type);

            if (userReaction === type) {
                setUserReaction(null);
                if (type === 'like') {
                    setLikesCount(prev => prev - 1);
                } else {
                    setDislikesCount(prev => prev - 1);
                }
            } else if (userReaction && userReaction !== type) {
                setUserReaction(type);
                if (type === 'like') {
                    setLikesCount(prev => prev + 1);
                    setDislikesCount(prev => prev - 1);
                } else {
                    setLikesCount(prev => prev - 1);
                    setDislikesCount(prev => prev + 1);
                }
            } else {
                setUserReaction(type);
                if (type === 'like') {
                    setLikesCount(prev => prev + 1);
                } else {
                    setDislikesCount(prev => prev + 1);
                }
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        } finally {
            setLikeLoading(false);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
        setShowActions(false);
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this comment?')) {
            try {
                await commentService.deleteComment(comment.id);
                onCommentDeleted();
            } catch (error) {
                console.error('Error deleting comment:', error);
            }
        }
        setShowActions(false);
    };

    const handleEditComplete = () => {
        setIsEditing(false);
        onCommentUpdated();
    };

    const handleReplyComplete = () => {
        setIsReplying(false);
        onCommentUpdated();
    };

    const leftPadding = level * 20;

    return (
        <Box style={{ marginLeft: `${leftPadding}px` }}>
            <Flex gap="3" style={{ position: 'relative' }}>
                <Avatar
                    size="2"
                    fallback={comment.author.name.charAt(0).toUpperCase()}
                    style={{ flexShrink: 0 }}
                />

                <Box style={{ flex: 1, minWidth: 0 }}>
                    <Flex justify="between" align="center" mb="1">
                        <Flex align="center" gap="2">
                            <Text size="2" weight="bold">
                                {comment.author.name} {comment.author.surname}
                            </Text>
                            <Text size="1" color="gray">
                                {commentService.formatRelativeTime(comment.createdAt)}
                            </Text>
                            {comment.isEdited && (
                                <Badge variant="soft" size="1">
                                    edited
                                </Badge>
                            )}
                        </Flex>

                        {(isAuthor || currentUser?.isAdmin) && (
                            <Box style={{ position: 'relative' }}>
                                <Button
                                    variant="ghost"
                                    size="1"
                                    onClick={() => setShowActions(!showActions)}
                                >
                                    <LuEllipsis size={14} />
                                </Button>

                                {showActions && (
                                    <Box
                                        style={{
                                            position: 'absolute',
                                            top: '100%',
                                            right: 0,
                                            background: 'var(--color-panel-solid)',
                                            border: '1px solid var(--gray-6)',
                                            borderRadius: '6px',
                                            padding: '4px',
                                            zIndex: 10,
                                            minWidth: '80px'
                                        }}
                                    >
                                        <Button
                                            variant="ghost"
                                            size="1"
                                            onClick={handleEdit}
                                            style={{ width: '100%', justifyContent: 'flex-start' }}
                                        >
                                            <LuPen size={12} />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="1"
                                            color="red"
                                            onClick={handleDelete}
                                            style={{ width: '100%', justifyContent: 'flex-start' }}
                                        >
                                            <LuTrash2 size={12} />
                                            Delete
                                        </Button>
                                    </Box>
                                )}
                            </Box>
                        )}
                    </Flex>

                    {isEditing ? (
                        <CommentForm
                            taskId={taskId}
                            initialContent={comment.content}
                            commentId={comment.id}
                            onCommentAdded={handleEditComplete}
                            onCancel={() => setIsEditing(false)}
                            placeholder="Edit your comment..."
                        />
                    ) : (
                        <Text size="2" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                            {comment.content}
                        </Text>
                    )}

                    {!isEditing && (
                        <Flex align="center" gap="3" mt="2">
                            <Flex align="center" gap="1">
                                <Button
                                    variant="ghost"
                                    size="1"
                                    onClick={() => handleLikeToggle('like')}
                                    disabled={likeLoading}
                                    color={userReaction === 'like' ? 'green' : 'gray'}
                                >
                                    <LuThumbsUp size={12} />
                                    {likesCount > 0 && likesCount}
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="1"
                                    onClick={() => handleLikeToggle('dislike')}
                                    disabled={likeLoading}
                                    color={userReaction === 'dislike' ? 'red' : 'gray'}
                                >
                                    <LuThumbsDown size={12} />
                                    {dislikesCount > 0 && dislikesCount}
                                </Button>
                            </Flex>

                            {canReply && (
                                <Button
                                    variant="ghost"
                                    size="1"
                                    onClick={() => setIsReplying(!isReplying)}
                                >
                                    <LuReply size={12} />
                                    Reply
                                </Button>
                            )}
                        </Flex>
                    )}

                    {isReplying && (
                        <Box mt="3">
                            <CommentForm
                                taskId={taskId}
                                parentCommentId={comment.id}
                                onCommentAdded={handleReplyComplete}
                                onCancel={() => setIsReplying(false)}
                                placeholder="Write a reply..."
                            />
                        </Box>
                    )}

                    {comment.replies && comment.replies.length > 0 && (
                        <Box mt="3">
                            <Flex direction="column" gap="3">
                                {comment.replies.map((reply) => (
                                    <CommentItem
                                        key={reply.id}
                                        comment={reply}
                                        taskId={taskId}
                                        onCommentUpdated={onCommentUpdated}
                                        onCommentDeleted={onCommentDeleted}
                                        level={level + 1}
                                        maxLevel={maxLevel}
                                    />
                                ))}
                            </Flex>
                        </Box>
                    )}
                </Box>
            </Flex>

            {level === 0 && <Separator my="4" />}
        </Box>
    );
};
