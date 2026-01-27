import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signup } from '../services/auth';

export default function SignupScreen({ navigation }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        if (!name || !email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        setLoading(true);
        try {
            console.log("Sending signup request...", { name, email });
            const result = await signup(name, email, password);
            console.log("Signup success:", result);
            navigation.replace('Main');
        } catch (error) {
            console.error('Signup error detail:', error);
            let errorMsg = 'Something went wrong';

            if (error.code === 'ECONNABORTED') {
                errorMsg = 'Server taking too long to respond. Check if your backend is running and reachable.';
            } else if (!error.response) {
                errorMsg = 'Network error. Check your Wi-Fi or API IP address.';
            } else {
                errorMsg = error.response?.data?.msg || error.message;
            }

            Alert.alert('Signup Failed', errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <Text style={styles.brand}>Video<Text style={{ color: '#38bdf8' }}>Base</Text></Text>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Join our community of learners</Text>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="John Doe"
                            placeholderTextColor="#64748b"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email Address</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="your@email.com"
                            placeholderTextColor="#64748b"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="••••••••"
                            placeholderTextColor="#64748b"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={true}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.button, loading ? styles.buttonDisabled : null]}
                        onPress={handleSignup}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>{loading ? 'Creating Account...' : 'Sign Up'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? <Text style={styles.linkText}>Sign In</Text></Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    form: {
        flexGrow: 1,
        padding: 30,
        justifyContent: 'center',
    },
    header: {
        marginBottom: 30,
        alignItems: 'center',
    },
    brand: {
        fontSize: 32,
        fontWeight: '900',
        color: '#f8fafc',
        marginBottom: 12,
        letterSpacing: -1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#f8fafc',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#94a3b8',
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#94a3b8',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        height: 56,
        backgroundColor: '#1e293b',
        borderWidth: 1,
        borderColor: '#334155',
        borderRadius: 16,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#f8fafc',
    },
    button: {
        height: 56,
        backgroundColor: '#38bdf8',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#38bdf8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonDisabled: {
        backgroundColor: '#075985',
        opacity: 0.6,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    footer: {
        marginTop: 20,
    },
    footerText: {
        color: '#94a3b8',
        textAlign: 'center',
        fontSize: 15,
    },
    linkText: {
        color: '#38bdf8',
        fontWeight: '700',
    },
});
