import { useState, useEffect } from 'react';
import { Box, Flex, Heading, Button, TextField, Text, Tabs, Card, Avatar } from '@radix-ui/themes';
import ProfileIconSelector from '@/Components/ProfileIconSelector/ProfileIconSelector';
import ColorPicker from '@/Components/ColorPicker/ColorPicker';
import * as Icons from 'react-icons/lu';
import { userAtom } from '@/App';
import { useAtom } from 'jotai';
import { useParams } from 'react-router-dom';
import { userService } from '@/services/user.service';
import axios from 'axios';
import { API_URL, axiosConfig } from '@/config/api';

const Profile = () => {
    const [currentUser] = useAtom(userAtom);
    const { userId } = useParams();
    const [profile, setProfile] = useState(currentUser);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedIcon, setSelectedIcon] = useState(profile?.iconName);
    const [selectedColor, setSelectedColor] = useState(profile?.iconBgColor);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    console.log(userId)
    // Determine if this is the current user's profile
    const isOwnProfile = currentUser && userId && String(currentUser.id) === String(userId);

    // Fetch user data by ID
    useEffect(() => {
        const fetchProfile = async () => {
            if (!userId) return;
            try {
                const user = await userService.getUserById(Number(userId));
                setProfile(user);
                setSelectedIcon(user.iconName);
                setSelectedColor(user.iconBgColor);
            } catch (err) {
                setError('Failed to load profile');
            }
        };
        fetchProfile();
    }, [userId]);

    // Update profile on the backend
    const handleSaveProfile = async () => {
        setIsLoading(true);
        setError('');

        try {
            const updatedProfile = {
                ...profile,
                iconName: selectedIcon,
                iconBgColor: selectedColor
            };

            const { data } = await axios.put(
                `${API_URL}/users/${profile.id}`,
                updatedProfile,
                axiosConfig
            );

            setProfile(data);
            setIsEditing(false);
        } catch (err) {
            console.error('Error updating profile:', err);
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || 'Failed to update profile');
            } else {
                setError('Failed to update profile');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Get the actual icon component based on the icon name
    const IconComponent = Icons[profile?.iconName as keyof typeof Icons] || Icons.LuUser;

    if (!profile) {
        return (
            <Box p="6">
                <Text size="5" color="gray">Loading profile...</Text>
            </Box>
        );
    }

    return (
        <Box width="100%" p="6">
            <Heading as="h1" size="8" mb="6">
                {isOwnProfile ? "My Profile" : `${profile.name}'s Profile`}
            </Heading>

            {error && (
                <Card size="2" color="red" mb="4">
                    <Text color="red">{error}</Text>
                </Card>
            )}

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

                        {isOwnProfile && !isEditing ? (
                            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                        ) : null}
                        {isOwnProfile && isEditing && (
                            <Flex gap="2">
                                <Button color="gray" variant="soft" onClick={() => setIsEditing(false)}>Cancel</Button>
                                <Button onClick={handleSaveProfile} disabled={isLoading}>
                                    {isLoading ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </Flex>
                        )}
                    </Flex>
                </Card>

                {/* Right column: Profile Details/Editor */}
                <Card size="3" style={{ flex: 2 }}>
                    <Tabs.Root defaultValue="details">
                        <Tabs.List>
                            <Tabs.Trigger value="details">Profile Details</Tabs.Trigger>
                            {isOwnProfile && isEditing && <Tabs.Trigger value="appearance">Appearance</Tabs.Trigger>}
                        </Tabs.List>

                        <Box py="4">
                            <Tabs.Content value="details">
                                <Flex direction="column" gap="4">
                                    <Box>
                                        <Text as="div" size="2" weight="bold" mb="1">Name</Text>
                                        {isOwnProfile && isEditing ? (
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
                                        {isOwnProfile && isEditing ? (
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
                                        {isOwnProfile && isEditing ? (
                                            <TextField.Root
                                                defaultValue={profile.phoneNumber || ''}
                                                onChange={(e) => setProfile(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                            />
                                        ) : (
                                            <Text>{profile.phoneNumber || 'Not provided'}</Text>
                                        )}
                                    </Box>

                                    <Box>
                                        <Text as="div" size="2" weight="bold" mb="1">Department</Text>
                                        {isOwnProfile && isEditing ? (
                                            <TextField.Root
                                                defaultValue={profile.department?.departmentName || ''}
                                                onChange={(e) => setProfile(prev => ({ ...prev, department: e.target.value }))}
                                            />
                                        ) : (
                                            <Text>{profile.department?.departmentName || 'Not provided'}</Text>
                                        )}
                                    </Box>

                                    <Box>
                                        <Text as="div" size="2" weight="bold" mb="1">Bio</Text>
                                        {isOwnProfile && isEditing ? (
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
                                {isOwnProfile && (
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
                                )}
                            </Tabs.Content>
                        </Box>
                    </Tabs.Root>
                </Card>
            </Flex>
        </Box>
    );
};

export default Profile;