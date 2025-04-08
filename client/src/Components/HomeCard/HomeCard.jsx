import { Box, Card, Flex, Heading } from '@radix-ui/themes'
import s from './HomeCard.module.css'

const HomeCard = ({ title, children }) => {
  return (
    <Box width={"40rem"} >
      <Card>
        <Heading align='center' mb='4'>{title}</Heading>
        {children}
      </Card>
    </Box>
  )
}

export default HomeCard
