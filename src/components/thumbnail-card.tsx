import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Box,
  Icon,
  Image,
  VStack,
  Heading,
  Text,
  Divider,
  ButtonGroup,
  Button,
  useDisclosure,
  Wrap,
  HStack,
  Center,
  IconButton,
  Tooltip,
} from '@chakra-ui/react'
import DialogCard from './dialog-card'
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai'
import { useState } from 'react'

type Props = {
  mediaSource: string
  prompt: string
}

const ThumbnailCard = (props: Props) => {
  let { isOpen, onOpen, onClose } = useDisclosure()
  const [isLiked, setIsLiked] = useState(false)
  const getIcon = () => {
    return (
      <Icon
        as={isLiked ? AiFillHeart : AiOutlineHeart}
        m={0}
        boxSize={6}
      ></Icon>
    )
  }
  return (
    <Card maxW="sm" variant="outline">
      <Box onClick={onOpen}>
        <Image
          src={props.mediaSource}
          alt="A laughing man"
          borderRadius="lg"
          objectFit="cover"
          boxSize={200}
          borderBottomRadius="0"
        />
        <CardBody px={1} py={2}>
          <Center>
            <Tooltip
              label={props.prompt}
              hasArrow
              bgColor="gray.700"
              color="gray.300"
            >
              <Text color="" fontSize="md" maxWidth={180} noOfLines={2}>
                {props.prompt}
              </Text>
            </Tooltip>
          </Center>
        </CardBody>
      </Box>
      <Divider />
      <CardFooter justifyContent="space-around" p={2} alignItems="center">
        <DialogCard
          isOpen={isOpen}
          onClose={onClose}
          onOpen={onOpen}
        ></DialogCard>
        <Text color="gray.400">@Clarive</Text>
        <Text color="gray.400">300 view</Text>
        <IconButton
          aria-label="Like"
          icon={getIcon()}
          variant="ghost"
          color={isLiked ? 'pink.400' : ''}
          onClick={() => {
            setIsLiked(!isLiked)
            console.log(isLiked)
          }}
          size="xs"
        ></IconButton>
      </CardFooter>
    </Card>
  )
}

export default ThumbnailCard
