import { memo, useMemo } from 'react'

import { StyleSheet, View } from 'react-native'

import Section from '../../components/Section'
import CheckBox from '@/components/common/CheckBox'
import { useSettingValue } from '@/store/setting/hook'
import { useI18n } from '@/lang'
import { updateSetting } from '@/core/common'

const setDownloadFileName = (type: LX.downloadFileNameType) => {
  updateSetting({ 'download.fileName': type })
}

const useActive = (id: LX.downloadFileNameType) => {
  const downloadFileName = useSettingValue('download.fileName')
  const isActive = useMemo(() => downloadFileName == id, [downloadFileName, id])
  return isActive
}

const Item = ({ id, name }: {
  id: LX.downloadFileNameType
  name: string
}) => {
  const isActive = useActive(id)
  // const [toggleCheckBox, setToggleCheckBox] = useState(false)
  return <CheckBox marginRight={8} check={isActive} label={name} onChange={() => { setDownloadFileName(id) }} need />
}


export default memo(() => {
  const t = useI18n()

  return (
    <Section title={t('setting_download')}>
      <View style={styles.list}>
        <Item id="歌名 - 歌手" name={t('download.type1')} />
        <Item id="歌手 - 歌名" name={t('download.type2')} />
        <Item id="歌名" name={t('download.type3')} />
      </View>
    </Section>
  )
})

const styles = StyleSheet.create({
  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
    marginBottom: 15,
  },
})
