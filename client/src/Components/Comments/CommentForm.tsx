import React, { useState } from 'react';
import { Box, TextArea, Button, Flex, Text } from '@radix-ui/themes';
import { LuSend, LuX } from 'react-icons/lu';
import { commentService } from '../../services/comment.service';

interface CommentFormProps {
    taskId: number;
    parentCommentId?: number;
    commentId?: number;
    initialContent?: string;
    onCommentAdded: () => void;
    onCancel: () => void;
    placeholder?: string;
}

export const CommentForm: React.FC<CommentFormProps> = ({
    taskId,
    parentCommentId,
    commentId,
    initialContent = '',
    onCommentAdded,
    onCancel,
    placeholder = 'Write a comment...'
}) => {
    const [content, setContent] = useState(initialContent);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isEditing = !!commentId;
    const isReply = !!parentCommentId;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isSubmitting) return;

        // Validate content
        const validation = commentService.validateComment(content);
        if (!validation.isValid) {
            setError(validation.error || 'Invalid comment');
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            if (isEditing && commentId) {
                await commentService.updateComment(commentId, content);
            } else {
                await commentService.createComment({
                    content,
                    taskId,
                    parentCommentId
                });
            }

            onCommentAdded();
            setContent('');
        } catch (err) {
            console.error('Error submitting comment:', err);
            setError('Failed to submit comment. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setContent(initialContent);
        setError(null);
        onCancel();
    };

    const remainingChars = 2000 - content.length;
    const isNearLimit = remainingChars < 100;

    return (
        <Box>
            <form onSubmit={handleSubmit}>
                <Box mb="2">
                    <TextArea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={placeholder}
                        style={{
                            minHeight: isReply ? '80px' : '100px',
                            resize: 'vertical'
                        }}
                        disabled={isSubmitting}
                    />

                    <Flex justify="between" align="center" mt="1">
                        <Box>
                            {error && (
                                <Text size="1" color="red">
                                    {error}
                                </Text>
                            )}
                        </Box>
                        <Text
                            size="1"
                            color={isNearLimit ? "orange" : "gray"}
                        >
                            {remainingChars} characters remaining
                        </Text>
                    </Flex>
                </Box>

                <Flex gap="2" justify="end">
                    <Button
                        type="button"
                        variant="soft"
                        color="gray"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                        size="2"
                    >
                        <LuX size={14} />
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        disabled={isSubmitting || content.trim().length === 0 || remainingChars < 0}
                        size="2"
                    >
                        <LuSend size={14} />
                        {isSubmitting
                            ? 'Submitting...'
                            : isEditing
                                ? 'Update'
                                : isReply
                                    ? 'Reply'
                                    : 'Comment'
                        }
                    </Button>
                </Flex>
            </form>
        </Box>
    );
};
