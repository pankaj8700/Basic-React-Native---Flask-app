import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import api from '../services/api';
import { ChevronLeft } from 'lucide-react-native';

export default function VideoPlayerScreen({ route, navigation }) {
    const { videoId } = route.params;
    const [streamUrl, setStreamUrl] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStream();
    }, []);

    const fetchStream = async () => {
        try {
            // Step 1: Request a signed playback token
            const response = await api.get(`/video/${videoId}/stream`);
            const { playback_token } = response.data;

            // Step 2: Construct the secure backend URL for the WebView
            // We use the base URL from the api service
            const backendBaseUrl = api.defaults.baseURL;
            const secureUrl = `${backendBaseUrl}/video/${videoId}/play?token=${playback_token}`;

            setStreamUrl(secureUrl);
        } catch (error) {
            console.error('Failed to fetch stream', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ChevronLeft color="#f8fafc" size={28} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Playing Video</Text>
                <View style={{ width: 28 }} />
            </View>
            <View style={styles.playerContainer}>
                {streamUrl ? (
                    <WebView
                        source={{ uri: streamUrl }}
                        style={styles.webview}
                        allowsFullscreenVideo={true}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                    />
                ) : (
                    <Text style={styles.errorText}>Unable to load stream</Text>
                )}
            </View>
            <View style={styles.content}>
                <Text style={styles.info}>
                    The application is playing a secured stream from our backend.
                    No direct YouTube URLs are exposed to the client.
                </Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingTop: 40,
        paddingBottom: 20,
        backgroundColor: '#0f172a',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#f8fafc',
    },
    playerContainer: {
        width: '100%',
        aspectRatio: 16 / 9,
        backgroundColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    webview: {
        flex: 1,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0f172a',
    },
    content: {
        padding: 30,
        flex: 1,
    },
    info: {
        fontSize: 15,
        color: '#94a3b8',
        textAlign: 'center',
        lineHeight: 24,
        fontStyle: 'italic',
        backgroundColor: '#1e293b',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#334155',
    },
    errorText: {
        color: '#ef4444',
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        fontWeight: '600',
    }
});
