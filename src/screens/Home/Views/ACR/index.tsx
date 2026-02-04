import React, { useRef, useEffect, useState } from 'react'
import { type LayoutChangeEvent, View, Image, PermissionsAndroid, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native'
import { useTheme } from '@/store/theme/hook'
import Text from '@/components/common/Text'
import { toast, clipboardWriteText, tipDialog, createStyle } from '@/utils/tools'
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import CryptoJS from 'crypto-js';
import { hosts, keys } from './data'
import { Message, Separator } from '../CustomComponent'
const audioRecorderPlayer = new AudioRecorderPlayer();
export default () => {
    const layoutHeightRef = useRef<number>(0)
    const theme = useTheme()
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [results, setResults] = useState([]);
    const [length, setLength] = useState(0);
    const [status, setStatus] = useState('等待录音');
    const timeoutToast = (msg: string) => setTimeout(() => toast(msg), 1);
    const audioFile = `${RNFS.DocumentDirectoryPath}/recording.mp3`;
    useEffect(() => {
        audioRecorderPlayer.removeRecordBackListener();
        audioRecorderPlayer.stopPlayer();
    }, []);
    const handleLayout = (e: LayoutChangeEvent) => {
        layoutHeightRef.current = e.nativeEvent.layout.height;
    }
    const requestPermission = async () => {
        try {
            /*const granted = await PermissionsAndroid.requestMultiple([PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
            ]);*/
            const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, {
                title: '录音权限',
                message: '应用需要访问您的麦克风以进行录音，请授予相关权限后再试',
                buttonNeutral: '稍后',
                buttonNegative: '取消',
                buttonPositive: '确定',
            });
            return granted === PermissionsAndroid.RESULTS.GRANTED;
            /*return granted['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED &&
                granted['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED &&
                granted['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED*/;
        } catch (err) {
            console.error('权限请求失败:', err);
            return false;
        }
    };
    const startRecording = async () => {
        setResults([]);
        const hasPermission = await requestPermission();
        if (!hasPermission) {
            tipDialog({
                title: '权限请求失败',
                message: '应用需要访问您的麦克风以进行录音，请授予相关权限后再试',
                btnText: '确定',
                bgClose: false,
            });
            return;
        }
        setLength(0);
        await audioRecorderPlayer.startRecorder(audioFile);
        audioRecorderPlayer.addRecordBackListener(async (e) => {
            setLength(e.currentPosition);
            if(e.currentPosition > 11000){
                stopRecording(e.currentPosition);
            }
        });
        setIsRecording(true);
    };
    const processAudio = async () => {
        let result = [];
        const endpoint = "/v1/identify";
        const signature_version = "1";
        let host = hosts[Math.floor(Math.random() * hosts.length)];
        let index = Math.floor(Math.random() * Object.keys(keys).length);
        let access_key = Object.keys(keys)[index];
        let access_secret = keys[access_key];
        const data_type = "audio";
        const buildStringToSign = (method: string, uri: string, accessKey: string, dataType: string, signatureVersion: string, timestamp: number) => {
                return [method, uri, accessKey, dataType, signatureVersion, timestamp].join("\n");
        };
        const sign = (string: string, access_secret: string) => {
                return CryptoJS.HmacSHA1(string, access_secret).toString(CryptoJS.enc.Base64);
        };
        const generateFormData = (object: any) => {
            var form = new FormData();
            Object.keys(object).forEach(function (key) {
                form.append(key, object[key]);
            });
            return form;
        };
        let base64 = await RNFS.readFile(audioFile, 'base64');
        const buffer = Buffer.from(base64, 'base64');
        var current_date = new Date();
        var timestamp = current_date.getTime() / 1000;
        var stringToSign = buildStringToSign("POST", endpoint, access_key, data_type, signature_version, timestamp);
        var signature = sign(stringToSign, access_secret);
        var formData = {
            access_key: access_key,
            data_type: data_type,
            signature_version: signature_version,
            signature: signature,
            sample_bytes: buffer.length.toString(),
            timestamp: timestamp.toString()
        };
        const data = generateFormData(formData);
        data.append("sample", {
            uri: "file://" + audioFile,
            type: "audio/mp3",
            name: "recording.mp3"
        });
        let url = "https://" + host + endpoint;
        let res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "multipart/form-data"
            },
            body: data
        });
        res = await res.json();
        if(res.status.code != 0){
            if(res.status.code == 1001){
                setStatus("无结果");
                return;
            }
            console.log(res.status.msg);
            setStatus("识别失败: " + res.status.msg);
            return;
        }
        res = res.metadata.music;
        res.forEach((val: any, idx: number) => {
            result.push({
                id: idx + 1,
                title: val.title,
                artist: val.artists.map((artist: any) => artist.name).join('、'),
                album: val.album.name,
                score: val.score,
            })
        });
        setStatus("等待录音");
        setResults(result);
    }
    const stopRecording = async (len) => {
        if(len < 2000){
            setStatus("录音时间过短");
            return;
        }
        const result = await audioRecorderPlayer.stopRecorder();
        audioRecorderPlayer.removeRecordBackListener();
        setResults([]);
        setIsRecording(false);
        setIsProcessing(true); 
        await processAudio();
        setIsProcessing(false);
    };
    const handleRecordPress = () => {
        if (!isRecording) {
            startRecording();
        } else {
            stopRecording();
        }
    };
    return (
        <View style={styles.container}>
            <View style={styles.content} onLayout={handleLayout}>
                <TouchableOpacity
                    style={[
                        styles.recordButton,
                        isRecording && {backgroundColor: theme['c-button-background-selected']},
                        !isRecording && {backgroundColor: theme['c-button-background']}
                    ]}
                    onPress={handleRecordPress}>
                    {!isProcessing ? (
                        <View>
                            <Image source={require('./img/music.png')} style={[{ ...styles.buttonItem }, {tintColor: theme['c-button-font']}]} />
                            <Text style={[{ ...styles.button, ...styles.buttonItem }, {color: theme['c-button-font']}]} color={theme['c-button-font']}>
                                {isRecording ? '正在录音...' : '点击开始识别'}
                            </Text>
                            <Text style={[{ ...styles.button, ...styles.buttonItem }, {color: theme['c-button-font']}]} color={theme['c-button-font']}>
                                {isRecording ? (length > 0 ? `${Math.floor(length / 1000)}s` : '') : ''}
                            </Text>
                        </View>
                    ) : (
                        <ActivityIndicator size="large" color={theme['c-primary']} />
                        )}
                </TouchableOpacity>
                <Separator />
                <FlatList
                    data={results}
                    keyExtractor={(item: any) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.resultItem}>
                            <Text style={[ styles.id, {color: theme['c-500']} ]}>{`${item.id}\n${item.score}%`}</Text>
                            <View style={{ ...styles.button }}>
                                <TouchableOpacity onLongPress={() => {
                                    clipboardWriteText(item.title);
                                    timeoutToast('标题已复制到剪贴板');
                                }}>
                                    <Text style={[styles.title, {color: theme['c-primary']}]}>{item.title}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onLongPress={() => {
                                    clipboardWriteText(item.artist);
                                    timeoutToast('歌手已复制到剪贴板');
                                }}>
                                    <Text style={[styles.artist, {color: theme['c-primary-alpha-600']}]}>{item.artist}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onLongPress={() => {
                                    clipboardWriteText(item.album);
                                    timeoutToast('专辑已复制到剪贴板');
                                }}>
                                    <Text style={[styles.album, {color: theme['c-primary-alpha-300']}]}>{item.album}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={<Message msg={status} />}
                />
            </View>
        </View>
    )
}
const styles = createStyle({
    container: {
        width: '100%',
        flex: 1,
    },
    content: {
        flex: 1,
    },
    button: {
        paddingLeft: 10,
        paddingRight: 10,
        borderRadius: 4,
        marginRight: 10,
        fontSize: 20,
    },
    buttonItem: {
        alignSelf: 'center',
    },
    recordingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    recordButton: {
        padding: 30,
        borderRadius: 100,
    },
    statusText: {
        fontSize: 18,
    },
    resultItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        display: 'flex',
        flexDirection: 'row',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    artist: {
        fontSize: 14,
    },
    album: {
        fontSize: 14,
    },
    id: {
        fontSize: 12,
        alignSelf: 'center',
        textAlign: 'center',
    }
})
