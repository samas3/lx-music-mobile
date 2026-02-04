import Text from '@/components/common/Text'
import { createStyle } from '@/utils/tools'
import { useTheme } from '@/store/theme/hook'
import { useI18n } from '@/lang'
import { getMusicName } from './myUtil'

export default ({ musicInfo }: {
  musicInfo: LX.Music.MusicInfo
}) => {
  const theme = useTheme()
  const t = useI18n()
  return (
    <Text style={styles.title}>
      {t('download')} <Text color={theme['c-primary-font']}>{getMusicName(musicInfo)}</Text>
    </Text>
  )
}

const styles = createStyle({
  title: {
    textAlign: 'center',
    paddingTop: 15,
    paddingBottom: 15,
  },
})
