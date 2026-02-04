import { useRef, useImperativeHandle, forwardRef, useState } from 'react'
import Modal, { type DownloadModalType as ModalType, type SelectInfo } from './DownloadModal'

export interface DownloadModalType {
  show: (info: SelectInfo) => void
}

export default forwardRef<DownloadModalType>(({}, ref) => {
  const downloadModalRef = useRef<ModalType>(null)
  const [visible, setVisible] = useState(false)

  useImperativeHandle(ref, () => ({
    show(listInfo) {
      if (visible) downloadModalRef.current?.show(listInfo)
      else {
        setVisible(true)
        requestAnimationFrame(() => {
          downloadModalRef.current?.show(listInfo)
        })
      }
    },
  }))

  return (
    visible
      ? <Modal ref={downloadModalRef} />
      : null
  )
})
