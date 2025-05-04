import { Box, Flex, Grid } from '@radix-ui/themes';

interface ColorPickerProps {
    selectedColor: string;
    onSelectColor: (color: string) => void;
}

// Predefined colors that match Radix UI palette
const COLORS = [
    // Primary colors
    '#E93D82', // Red
    '#D6409F', // Pink
    '#AB4ABA', // Plum
    '#8E4EC6', // Purple
    '#6E56CF', // Violet
    '#5B5BD6', // Indigo
    '#4D82D6', // Blue
    '#38A6DB', // Cyan
    '#3DABB3', // Teal
    '#3CAA77', // Green
    '#4BA46C', // Grass
    '#71A151', // Mint
    '#998B55', // Lime
    '#9A8A3B', // Yellow
    '#C78D35', // Amber
    '#C7623A', // Orange

    // Grayscale
    '#262626', // Gray 12
    '#474747', // Gray 11
    '#666666', // Gray 10
    '#878787', // Gray 9
    '#A1A1A1', // Gray 8
    '#B3B3B3', // Gray 7
];

const ColorPicker = ({ selectedColor, onSelectColor }: ColorPickerProps) => {
    return (
        <Grid columns="8" gap="2" width="100%">
            {COLORS.map((color) => (
                <Box
                    key={color}
                    style={{
                        backgroundColor: color,
                        width: '30px',
                        height: '30px',
                        borderRadius: 'var(--radius-2)',
                        cursor: 'pointer',
                        border: selectedColor === color ? '2px solid black' : '2px solid transparent',
                        boxShadow: selectedColor === color ? '0 0 0 2px white, 0 0 0 4px ' + color : 'none'
                    }}
                    onClick={() => onSelectColor(color)}
                />
            ))}
        </Grid>
    );
};

export default ColorPicker;