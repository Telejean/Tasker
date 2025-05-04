import { useState } from 'react';
import { Grid, Box, Tooltip } from '@radix-ui/themes';
import * as Icons from 'react-icons/lu';

interface ProfileIconSelectorProps {
    selectedIcon: string;
    onSelectIcon: (iconName: string) => void;
}

const POPULAR_ICONS = [
    'LuUser', 'LuUserCircle', 'LuUserCog', 'LuBriefcase',
    'LuCode', 'LuCodepen', 'LuCpu', 'LuDatabase',
    'LuGitBranch', 'LuGlobe', 'LuLaptop', 'LuLayout',
    'LuPencil', 'LuSettings', 'LuShield', 'LuSmile'
];

const ProfileIconSelector = ({ selectedIcon, onSelectIcon }: ProfileIconSelectorProps) => {
    return (
        <Box>
            <Grid columns="4" gap="2" width="100%">
                {POPULAR_ICONS.map((iconName) => {
                    const IconComponent = Icons[iconName as keyof typeof Icons];
                    return (
                        <Tooltip key={iconName} content={iconName.replace('Lu', '')}>
                            <Box
                                p="3"
                                style={{
                                    cursor: 'pointer',
                                    border: selectedIcon === iconName ? '2px solid var(--accent-9)' : '2px solid transparent',
                                    borderRadius: 'var(--radius-3)',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    backgroundColor: selectedIcon === iconName ? 'var(--accent-3)' : 'var(--gray-3)'
                                }}
                                onClick={() => onSelectIcon(iconName)}
                            >
                                <IconComponent size={24} />
                            </Box>
                        </Tooltip>
                    );
                })}
            </Grid>
        </Box>
    );
};

export default ProfileIconSelector;