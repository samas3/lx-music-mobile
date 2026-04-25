import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import Dialog, { type DialogType } from '@/components/common/Dialog'
import Title from './Title'
import List from './List'
import { useI18n } from '@/lang'
import { downloadMusic } from './myUtil'
import { toast } from '@/utils/tools'

export interface SelectInfo {
  musicInfo: LX.Music.MusicInfo | null
  qualityId: LX.Quality
}
const initSelectInfo = {}

export interface DownloadModalProps {
  onDownloaded?: () => void
}
export interface DownloadModalType {
  show: (info: SelectInfo) => void
}
export default forwardRef<DownloadModalType, DownloadModalProps>(({}, ref) => {
  const t = useI18n()
  const dialogRef = useRef<DialogType>(null)
  const [selectInfo, setSelectInfo] = useState<SelectInfo>(initSelectInfo as SelectInfo)

  useImperativeHandle(ref, () => ({
    show(selectInfo) {
      setSelectInfo(selectInfo)

      requestAnimationFrame(() => {
        dialogRef.current?.setVisible(true)
      })
    },
  }))

  const handleHide = () => {
    requestAnimationFrame(() => {
      setSelectInfo({ ...selectInfo, musicInfo: null })
    })
  }

  const handleSelect = (qualityId: LX.Quality) => {
    dialogRef.current?.setVisible(false)
    downloadMusic(selectInfo.musicInfo, qualityId).then((res) => {
        switch (res) {
            case 0:
                toast(t('download.success'))
                break;
            case 1:
                toast(t('download.no_url'));
                break;
            case 2:
                toast(t('download.failed'));
                break;
            case 3:
                toast(t('download.no_permission'));
                break;
            default:
                toast(t('download.error') + ": " + res);
        }
    }).catch((e) => {
        console.log(e.message);
        toast(e.message);
    });
  }
  
  const qualities = selectInfo.musicInfo?.meta.qualitys;

  return (
    <Dialog ref={dialogRef} onHide={handleHide}>
      {
        selectInfo.musicInfo
          ? (<>
              <Title musicInfo={selectInfo.musicInfo} />
              <List qualities={qualities} onPress={handleSelect} />
            </>)
          : null
      }
    </Dialog>
  )
})