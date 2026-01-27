import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';

export default function DashboardScreen({ navigation }) {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            const response = await api.get('/dashboard');
            setVideos(response.data);
        } catch (error) {
            console.error('Failed to fetch videos', error);
        } finally {
            setLoading(false);
        }
    };

    const renderVideoItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('VideoPlayer', { videoId: item.id })}
        >
            <Image source={{ uri: item.thumbnail_url }} style={styles.thumbnail} />
            <View style={styles.cardContent}>
                <Text style={styles.videoTitle}>{item.title}</Text>
                <Text style={styles.videoDesc} numberOfLines={2}>{item.description}</Text>
            </View>
        </TouchableOpacity>
    );

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
                <Text style={styles.headerTitle}>Discover</Text>
                <Text style={styles.headerSubtitle}>Curated for you</Text>
            </View>
            <FlatList
                data={videos}
                keyExtractor={(item) => item.id}
                renderItem={renderVideoItem}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a', // Deep slate background
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0f172a',
    },
    header: {
        padding: 24,
        paddingTop: 40,
    },
    headerTitle: {
        fontSize: 34,
        fontWeight: '800',
        color: '#f8fafc',
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#94a3b8',
        marginTop: 4,
    },
    list: {
        padding: 20,
        paddingTop: 0,
    },
    card: {
        backgroundColor: '#1e293b', // Slightly lighter slate
        borderRadius: 24,
        marginBottom: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#334155',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 8,
    },
    thumbnail: {
        width: '100%',
        height: 220,
    },
    cardContent: {
        padding: 20,
    },
    videoTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#f8fafc',
        lineHeight: 28,
    },
    videoDesc: {
        fontSize: 15,
        color: '#94a3b8',
        lineHeight: 22,
    },
});
