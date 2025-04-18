import { Box, Card, Heading } from '@radix-ui/themes'
import s from './HomeCard.module.css'

const HomeCard = ({ title, children }: { title: string; children: React.ReactNode }) => {
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
