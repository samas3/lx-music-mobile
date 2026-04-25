// by samas3
import settingState from '@/store/setting/state'
import { getMusicUrl } from '../../utils/data';
import { NativeModules, PermissionsAndroid, Platform } from 'react-native';
import { downloadFile, ExternalDirectoryPath, unlink } from 'react-native-fs';


// todo: download lrc + pic
const downloadMusic = async (musicInfo: LX.Music.MusicInfo, quality: LX.Quality) => {
    let filename = getMusicName(musicInfo);
    let ret;
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
        console.warn('存储权限未授予，下载中止');
        return 3;
    }
    await getMusicUrl(musicInfo, quality).then(async (url: string) => {
        console.log(url);
        if (url) {
            filename += url.substring(url.lastIndexOf('.'));
            console.log(filename);
            const filePath = `${ExternalDirectoryPath}/${filename}`;
            await downloadFile({fromUrl: url, toFile: filePath}).promise.then(async (res) => {
                if (res.statusCode === 200) {
                    console.log('Download success:', filePath);
                    await moveToPublicMusic(filePath, filename);
                    await unlink(filePath);
                    ret = 0;
                } else {
                    console.log('Download failed:', res.statusCode);
                    ret = res.statusCode;
                }
            }).catch((err) => {
                console.log(err)
                ret = 2;
            });
        } else {
            ret = 1;
        }
    });
    return ret;
}

const getMusicName = (musicInfo: LX.Music.MusicInfo) => {
    const downloadFileName = settingState.setting['download.fileName']
    const name = musicInfo.name;
    const singer = musicInfo.singer;
    let filename = downloadFileName.replace('歌名', name).replace('歌手', singer);
    return filename;
}

const requestStoragePermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;

  const sdk = parseInt(Platform.Version as string);
  
  // 安卓 13+：优先请求媒体权限
  if (sdk >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  
  // 安卓 6.0~12：请求传统存储权限
  if (sdk >= 23) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  
  // 安卓 5.1 及以下：安装时已授权
  return true;
};
const { MusicSaver } = NativeModules;

const moveToPublicMusic = async (
  privatePath: string,
  title: string
): Promise<string> => {
  return MusicSaver.saveToMusic(privatePath, title);
};
export { downloadMusic, getMusicName, requestStoragePermission, moveToPublicMusic };