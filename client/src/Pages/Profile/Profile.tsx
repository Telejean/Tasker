import { useState, useEffect } from 'react';
import { Box, Flex, Heading, Button, TextField, Text, Tabs, Card, Avatar } from '@radix-ui/themes';
import { UserProfile } from '@/types';
import ProfileIconSelector from '@/Components/ProfileIconSelector/ProfileIconSelector';
import ColorPicker from '@/Components/ColorPicker/ColorPicker';
import * as Icons from 'react-icons/lu';
import { userAtom } from '@/App';
import { useAtom } from 'jotai';

// Mock user data - would be fetched from API in a real app
const mockUserProfile: UserProfile = {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Project Manager',
    iconName: 'LuUser',
    iconBgColor: '#6E56CF', // Radix violet
    phone: '+1 (555) 123-4567',
    department: 'Engineering',
    bio: 'Project manager with 5+ years of experience in agile development and team leadership.'
};

const Profile = () => {
    const [profile, setProfile] = useAtom(userAtom);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedIcon, setSelectedIcon] = useState(profile.iconName);
    const [selectedColor, setSelectedColor] = useState(profile.iconBgColor);

    // This would actually save to the backend in a real application
    const handleSaveProfile = () => {
        setProfile(prev => ({
            ...prev,
            iconName: selectedIcon,
            iconBgColor: selectedColor
        }));
        setIsEditing(false);
    };

    // Get the actual icon component based on the icon name
    const IconComponent = Icons[profile.iconName as keyof typeof Icons] || Icons.LuUser;

    return (
        <Box width="100%" p="6">
            <Heading as="h1" size="8" mb="6">My Profile</Heading>

            <Flex gap="6" direction={{ initial: 'column', md: 'row' }}>
                {/* Left column: Profile Image & Details */}
                <Card size="3" style={{ flex: 1 }}>
                    <Flex direction="column" align="center" gap="4" p="4">
                        <Avatar
                            size="8"
                            radius="full"
                            fallback={<IconComponent size={40} />}
                            style={{
                                backgroundColor: profile.iconBgColor,
                                width: '120px',
                                height: '120px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        />

                        <Heading as="h2" size="6">{profile.name}</Heading>
                        <Text size="2" color="gray">{profile.role}</Text>

                        {!isEditing ? (
                            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                        ) : (
                            <Flex gap="2">
                                <Button color="gray" variant="soft" onClick={() => setIsEditing(false)}>Cancel</Button>
                                <Button onClick={handleSaveProfile}>Save Changes</Button>
                            </Flex>
                        )}
                    </Flex>
                </Card>

                {/* Right column: Profile Details/Editor */}
                <Card size="3" style={{ flex: 2 }}>
                    <Tabs.Root defaultValue="details">
                        <Tabs.List>
                            <Tabs.Trigger value="details">Profile Details</Tabs.Trigger>
                            {isEditing && <Tabs.Trigger value="appearance">Appearance</Tabs.Trigger>}
                        </Tabs.List>

                        <Box py="4">
                            <Tabs.Content value="details">
                                <Flex direction="column" gap="4">
                                    <Box>
                                        <Text as="div" size="2" weight="bold" mb="1">Name</Text>
                                        {isEditing ? (
                                            <TextField.Root
                                                defaultValue={profile.name}
                                                onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                                            />
                                        ) : (
                                            <Text>{profile.name}</Text>
                                        )}
                                    </Box>

                                    <Box>
                                        <Text as="div" size="2" weight="bold" mb="1">Email</Text>
                                        {isEditing ? (
                                            <TextField.Root
                                                defaultValue={profile.email}
                                                onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                                            />
                                        ) : (
                                            <Text>{profile.email}</Text>
                                        )}
                                    </Box>

                                    <Box>
                                        <Text as="div" size="2" weight="bold" mb="1">Phone</Text>
                                        {isEditing ? (
                                            <TextField.Root
                                                defaultValue={profile.phone || ''}
                                                onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                                            />
                                        ) : (
                                            <Text>{profile.phone || 'Not provided'}</Text>
                                        )}
                                    </Box>

                                    <Box>
                                        <Text as="div" size="2" weight="bold" mb="1">Department</Text>
                                        {isEditing ? (
                                            <TextField.Root
                                                defaultValue={profile.department || ''}
                                                onChange={(e) => setProfile(prev => ({ ...prev, department: e.target.value }))}
                                            />
                                        ) : (
                                            <Text>{profile.department || 'Not provided'}</Text>
                                        )}
                                    </Box>

                                    <Box>
                                        <Text as="div" size="2" weight="bold" mb="1">Bio</Text>
                                        {isEditing ? (
                                            <TextField.Root
                                                defaultValue={profile.bio || ''}
                                                onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                                            />
                                        ) : (
                                            <Text>{profile.bio || 'No bio provided'}</Text>
                                        )}
                                    </Box>
                                </Flex>
                            </Tabs.Content>

                            <Tabs.Content value="appearance">
                                <Flex direction="column" gap="4">
                                    <Box>
                                        <Text as="div" size="2" weight="bold" mb="2">Profile Icon</Text>
                                        <ProfileIconSelector
                                            selectedIcon={selectedIcon}
                                            onSelectIcon={setSelectedIcon}
                                        />
                                    </Box>

                                    <Box>
                                        <Text as="div" size="2" weight="bold" mb="2">Background Color</Text>
                                        <ColorPicker
                                            selectedColor={selectedColor}
                                            onSelectColor={setSelectedColor}
                                        />
                                    </Box>
                                </Flex>
                            </Tabs.Content>
                        </Box>
                    </Tabs.Root>
                </Card>
            </Flex>
        </Box>
    );
};

export default Profile;