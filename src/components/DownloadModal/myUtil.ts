// by samas3
import settingState from '@/store/setting/state'
import { getMusicUrl } from '../../utils/data';
import { existsFile, mkdir, downloadFile, externalStorageDirectoryPath } from '../../utils/fs';


// todo: download lrc + pic
const downloadMusic = async (musicInfo: LX.Music.MusicInfo, quality: LX.Quality) => {
    let filename = getMusicName(musicInfo);
    let ret;
    await getMusicUrl(musicInfo, quality).then(async (url: string) => {
        console.log(url);
        if (url) {
            filename += url.substring(url.lastIndexOf('.'));
            console.log(filename);
            
            const downloadDir = `${externalStorageDirectoryPath}/Download/LXMusic`;
            if (!await existsFile(downloadDir)) {
                await mkdir(downloadDir);
            }
            
            const filePath = `${downloadDir}/${filename}`;
            await downloadFile(url, filePath).promise.then((res) => {
                console.log(res)
                if (res.statusCode === 200) {
                    console.log('Download success:', filePath);
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

export { downloadMusic, getMusicName };