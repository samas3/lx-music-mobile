import { useMemo } from 'react'
import { ScrollView, View } from 'react-native'

import { useMyList } from '@/store/list/hook'
import ListItem, { styles as listStyles } from './ListItem'
import { useWindowSize } from '@/utils/hooks'
import { useTheme } from '@/store/theme/hook'
import { useI18n } from '@/lang'
import { createStyle } from '@/utils/tools'
import { scaleSizeW } from '@/utils/pixelRatio'

const styles = createStyle({
  list: {
    paddingLeft: 15,
    paddingRight: 2,
    paddingBottom: 5,
    flexDirection: 'row',
    flexWrap: 'wrap',
    // backgroundColor: 'rgba(0,0,0,0.2)'
    // justifyContent: 'center',
  },
})
const MIN_WIDTH = scaleSizeW(150)
const PADDING = styles.list.paddingLeft + styles.list.paddingRight


const EditListItem = ({ itemWidth }: {
  itemWidth: number
}) => {
  const theme = useTheme()
  const t = useI18n()

  return (
    <View style={{ ...listStyles.listItem, width: itemWidth }}>
    </View>
  )
}

export default ({ qualities, onPress }: {
  qualities
  onPress: (quality: LX.Quality) => void
}) => {
  const windowSize = useWindowSize()
  const itemWidth = useMemo(() => {
    let w = Math.floor(windowSize.width * 0.9 - PADDING)
    let n = Math.floor(w / MIN_WIDTH)
    if (n > 10) n = 10
    return Math.floor((w - 1) / n)
  }, [windowSize])

  return (
    <ScrollView style={{ flexGrow: 0 }}>
      <View style={styles.list} onStartShouldSetResponder={() => true}>
        { qualities.map(info => <ListItem type={info.type} size={info.size} onPress={onPress} width={itemWidth} />) }
        <EditListItem itemWidth={itemWidth} />
      </View>
    </ScrollView>
  )
}
