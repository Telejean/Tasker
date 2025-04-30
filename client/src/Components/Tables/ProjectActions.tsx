import { IconButton, Tooltip } from '@radix-ui/themes'
import { LuCopy, LuArchive, LuTrash2 } from 'react-icons/lu'

interface ProjectActionsProps {
    projectId: number;
    onCopyLink: (id: number) => void;
    onArchive: (id: number) => void;
    onDelete: (id: number) => void;
}

const ProjectActions = ({ projectId, onCopyLink, onArchive, onDelete }: ProjectActionsProps) => {
    return (
        <div style={{ display: 'flex', gap: '8px' }}>
            <Tooltip content="Copy project link">
                <IconButton
                    size="2"
                    variant="ghost"
                    onClick={() => onCopyLink(projectId)}
                >
                    <LuCopy size={20} />
                </IconButton>
            </Tooltip>

            <Tooltip content="Archive project">
                <IconButton
                    size="2"
                    variant="ghost"
                    onClick={() => onArchive(projectId)}
                >
                    <LuArchive size={20} />
                </IconButton>
            </Tooltip>

            <Tooltip content="Delete project">
                <IconButton
                    size="2"
                    variant="ghost"
                    color="red"
                    onClick={() => onDelete(projectId)}
                >
                    <LuTrash2 size={20}/>
                </IconButton>
            </Tooltip>
        </div>
    )
}

export default ProjectActions