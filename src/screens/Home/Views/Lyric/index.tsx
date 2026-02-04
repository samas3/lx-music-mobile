import React, { useEffect, useRef, useState } from 'react'
import { type LayoutChangeEvent, View, ActivityIndicator, TouchableOpacity, FlatList, TextInput } from 'react-native'
import { useTheme } from '@/store/theme/hook'
import Text from '@/components/common/Text'
import { toast, clipboardWriteText, createStyle } from '@/utils/tools'
import { Message, Separator } from '../CustomComponent'
import RenderHTML from 'react-native-render-html'
export default () => {
    const layoutHeightRef = useRef<number>(0)
    const theme = useTheme()
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [status, setStatus] = useState('等待查询');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isOnResult, setIsOnResult] = useState(false);
    const [page, setPage] = useState(1);
    const timeoutToast = (msg: string) => setTimeout(() => toast(msg), 1);
    const handleLayout = (e: LayoutChangeEvent) => {
        layoutHeightRef.current = e.nativeEvent.layout.height;
    };
    const onChange = (query: string) => {
        setSearchQuery(query);
    };
    useEffect(() => {
        if (searchQuery.length > 0) {
            handlePress();
        }
    }, [page]);
    const handleSearch = async () => {
        setSearchResults([]);
        let params = {
            pagesize: 20,
            page: page,
            keyword: searchQuery
        };
        let url = 'http://mobileservice.kugou.com/api/v3/lyric/search';
        let result = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(params)
        });
        let res = await result.json();
        if(res.status != 1){
            setStatus(res.error);
            return;
        }
        res = res.data.info;
        if(res.length == 0){
            setStatus('无结果');
            return;
        }
        let resList = [];
        let idx = 0;
        res.forEach(val => {
            if(val.lyric.includes('<em>')){
                resList.push({
                    id: idx + 1,
                    title: val.filename,
                    lyric: val.lyric.replace('<em>', '<b>').replace('</em>', '</b>'),
                });
                idx++;
            }
        });
        setSearchResults(resList);
    };
    const handlePress = async () => {
        setIsProcessing(true);
        setIsOnResult(false);
        await handleSearch();
        setIsProcessing(false);
        setIsOnResult(true);
    };
    const frontPage = () => {
        setPage(Math.max(page - 1, 1));
    };
    const nextPage = () => {
        setPage(page + 1);
    };
    return (
        <View style={styles.container}>
            <View style={styles.content} onLayout={handleLayout}>
                <View style={styles.searchContainer}>
                    <TextInput style={[styles.input, {backgroundColor: theme['c-button-background'], color: theme['c-primary']}]}
                        placeholder='输入部分歌词'
                        value={searchQuery}
                        placeholderTextColor={theme['c-primary-alpha-500']}
                        onChangeText={onChange}/>
                    <TouchableOpacity onPress={() => {setPage(1);handlePress()}} style={[ styles.searchButton, {backgroundColor: theme['c-button-background']} ]}>
                        <Text style={{color: theme['c-button-font']}}>搜索</Text>
                    </TouchableOpacity>
                </View>
                <Separator />
                {isProcessing ? (<ActivityIndicator size="large" color={theme['c-primary']} />) : 
                ([isOnResult && <View>
                    <View style={styles.flexBox}>
                        <TouchableOpacity onPress={() => frontPage()} style={[ styles.pageButton, {backgroundColor: theme['c-button-background']} ]}>
                            <Text style={{color: theme['c-button-font']}}>上一页</Text>
                        </TouchableOpacity>
                        <Text style={[styles.pageText, {color: theme['c-primary']}]}>{page}</Text>
                        <TouchableOpacity onPress={() => nextPage()} style={[ styles.pageButton, {backgroundColor: theme['c-button-background']} ]}>
                            <Text style={{color: theme['c-button-font']}}>下一页</Text>
                        </TouchableOpacity>
                    </View><Separator /></View>,
                    <FlatList
                        data={searchResults}
                        keyExtractor={(item: any) => item.id}
                        renderItem={({ item }) => (
                            <View style={styles.resultItem}>
                                <Text style={[ styles.id, {color: theme['c-500'] } ]}>{item.id}</Text>
                                <View style={{ ...styles.button }}>
                                    <TouchableOpacity onLongPress={() => {
                                        clipboardWriteText(item.title);
                                        timeoutToast('标题已复制到剪贴板');
                                    }}>
                                        <Text style={[styles.title, {color: theme['c-primary']}]}>{item.title}</Text>
                                    </TouchableOpacity>
                                    <RenderHTML source={{ html: `<span style="font-size: 10px;color: ${theme['c-primary-alpha-500']}">${item.lyric}</span>` }} contentWidth={0}/>
                                </View>
                            </View>
                        )}
                        ListEmptyComponent={<Message msg={status} />} />])
                }
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    searchButton: {
        marginLeft: 8,
        width: 40,
        height: 40,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
    },
    pageButton: {
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 12,
        width: '40%',
    },
    pageText: {
        marginLeft: 'auto',
        marginRight: 'auto',
        fontSize: 18,
        borderRadius: 5,
        height: 30,
    },
    flexBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    button: {
        paddingLeft: 10,
        paddingRight: 10,
        borderRadius: 4,
        marginRight: 10,
        fontSize: 20,
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
    id: {
        fontSize: 12,
        alignSelf: 'center',
        textAlign: 'center',
    }
})
