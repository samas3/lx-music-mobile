import { View } from 'react-native'
import Button from '@/components/common/Button'
import Text from '@/components/common/Text'
import { BorderWidths } from '@/theme'
import { createStyle } from '@/utils/tools'
import { useTheme } from '@/store/theme/hook'

export default ({ type, size, onPress, width }: {
  type: LX.Quality
  size: string
  onPress: (quality: LX.Quality) => void
  width: number
}) => {
  const theme = useTheme()

  const handlePress = () => {
    onPress(type)
  }

  return (
    <View style={{ ...styles.listItem, width }}>
      <Button
        style={{ ...styles.button, backgroundColor: theme['c-button-background'], borderColor: theme['c-primary-light-400-alpha-300']}}
        onPress={handlePress}
      >
        <Text numberOfLines={1} size={14} color={theme['c-button-font']}>{type} {size}</Text>
      </Button>
    </View>
  )
}

export const styles = createStyle({
  listItem: {
    // width: '50%',
    paddingRight: 13,
    // backgroundColor: 'rgba(0,0,0,0.2)',
  },
  button: {
    height: 36,
    paddingLeft: 10,
    paddingRight: 10,
    marginRight: 10,
    marginBottom: 10,
    borderRadius: 4,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: BorderWidths.normal1,
  },
})
