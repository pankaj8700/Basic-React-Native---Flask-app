import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { logout, getCurrentUser } from '../services/auth';
import { User, LogOut } from 'lucide-react-native';

export default function SettingsScreen({ navigation }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        const userData = await getCurrentUser();
        setUser(userData);
    };

    const handleLogout = async () => {
        await logout();
        navigation.replace('Auth');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Settings</Text>
            </View>

            <View style={styles.profileSection}>
                <View style={styles.avatar}>
                    <User color="#fff" size={40} />
                </View>
                <Text style={styles.name}>{user?.name || 'User'}</Text>
                <Text style={styles.email}>{user?.email || ''}</Text>
            </View>

            <View style={styles.menu}>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <LogOut color="#FF3B30" size={20} />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
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
        padding: 24,
        paddingTop: 40,
    },
    headerTitle: {
        fontSize: 34,
        fontWeight: '800',
        color: '#f8fafc',
    },
    profileSection: {
        alignItems: 'center',
        padding: 40,
        backgroundColor: '#1e293b',
        margin: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#334155',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#38bdf8',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#38bdf8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 10,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#f8fafc',
    },
    email: {
        fontSize: 16,
        color: '#94a3b8',
        marginTop: 6,
    },
    menu: {
        marginHorizontal: 20,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#1e293b',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#ef4444',
        justifyContent: 'center',
    },
    logoutText: {
        fontSize: 16,
        color: '#ef4444',
        fontWeight: '700',
        marginLeft: 10,
    },
});
