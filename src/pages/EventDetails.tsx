import { Feather } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useContext, useEffect, useState } from 'react';
import { Image, Linking, Platform, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';
import customMapStyle from '../../map-style.json';
import BigButton from '../components/BigButton';
import * as MapSettings from '../constants/MapSettings';
import { AuthenticationContext } from '../context/AuthenticationContext';
import mapMarkerImg from '../images/map-marker.png';
import * as api from '../services/api';
import { Event } from '../types/Event';
import { User } from '../types/User';
import { formatAMPM, getMapsUrl } from '../utils';

export default function EventDetails({ route }: StackScreenProps<any>) {
    const authenticationContext = useContext(AuthenticationContext);
    // dateTime is passed as an ISO string to keep the navigation params serializable
    const [event] = useState<Event>({
        ...route.params?.event,
        dateTime: new Date(route.params?.event.dateTime),
    });
    const [organizer, setOrganizer] = useState<User>();
    const currentUserId = authenticationContext?.value?.id;
    const hasVolunteered = !!currentUserId && event.volunteersIds.includes(currentUserId);
    const isTeamFull = event.volunteersIds.length >= event.volunteersNeeded;
    const formattedDate = event.dateTime.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
    const formattedTime = formatAMPM(event.dateTime).toUpperCase();

    useEffect(() => {
        api.getUser(event.organizerId)
            .then((response) => setOrganizer(response.data))
            .catch((error) => console.log(error));
    }, [event.organizerId]);

    const handleCall = () => {
        if (organizer) Linking.openURL(`tel:${organizer.mobile.replace(/\D/g, '')}`);
    };

    const handleText = () => {
        if (organizer) Linking.openURL(`sms:${organizer.mobile.replace(/\D/g, '')}`);
    };

    const handleVolunteer = () => {};

    const handleShare = () => {
        Share.share({
            message: `${event.name} - ${formattedDate} at ${formattedTime}\n\n${event.description}\n\nJoin me as a volunteer on Volunteam!`,
        });
    };

    const handleGetDirections = () => {
        Linking.openURL(getMapsUrl(event.position, event.name));
    };

    const renderStatus = () => {
        if (hasVolunteered) {
            return (
                <View style={[styles.infoBox, styles.infoBoxBlue]}>
                    <Feather name="check" size={36} color="#00A3FF" />
                    <Text style={[styles.infoText, { color: '#00A3FF' }]}>Volunteered</Text>
                </View>
            );
        }
        if (isTeamFull) {
            return (
                <View style={[styles.infoBox, styles.infoBoxGrey]}>
                    <Feather name="slash" size={36} color="#8fa7b3" />
                    <Text style={[styles.infoText, { color: '#8fa7b3' }]}>Team is full</Text>
                </View>
            );
        }
        return (
            <View style={[styles.infoBox, styles.infoBoxOrange]}>
                <Text style={styles.volunteersCount}>
                    {event.volunteersIds.length}
                    <Text style={styles.volunteersCountOf}> of </Text>
                    {event.volunteersNeeded}
                </Text>
                <Text style={[styles.infoText, { color: '#FF8700' }]}>Volunteer(s) needed</Text>
            </View>
        );
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {event.imageUrl ? (
                <Image style={styles.image} resizeMode="cover" source={{ uri: event.imageUrl }} />
            ) : (
                <View style={[styles.image, styles.imagePlaceholder]}>
                    <Feather name="image" size={48} color="#8fa7b3" />
                </View>
            )}

            <View style={styles.details}>
                <Text style={styles.title}>{event.name}</Text>
                {organizer && (
                    <Text style={styles.organizer}>
                        organized by {organizer.name.first} {organizer.name.last}
                    </Text>
                )}
                <Text style={styles.description}>{event.description}</Text>

                <View style={styles.row}>
                    <View style={[styles.infoBox, styles.infoBoxBlue]}>
                        <Feather name="calendar" size={36} color="#00A3FF" />
                        <Text style={[styles.infoText, { color: '#00A3FF' }]}>
                            {formattedDate}
                            {'\n'}
                            {formattedTime}
                        </Text>
                    </View>
                    {renderStatus()}
                </View>

                {(!isTeamFull || hasVolunteered) && (
                    <View style={styles.row}>
                        <BigButton
                            label="Share"
                            color="#00A3FF"
                            featherIconName="share-2"
                            style={styles.button}
                            onPress={handleShare}
                        />
                        {hasVolunteered ? (
                            <>
                                <BigButton
                                    label="Call"
                                    color="#00A3FF"
                                    featherIconName="phone"
                                    style={styles.button}
                                    disabled={!organizer}
                                    onPress={handleCall}
                                />
                                <BigButton
                                    label="Text"
                                    color="#00A3FF"
                                    featherIconName="message-circle"
                                    style={styles.button}
                                    disabled={!organizer}
                                    onPress={handleText}
                                />
                            </>
                        ) : (
                            <BigButton
                                label="Volunteer"
                                color="#FF8700"
                                featherIconName="plus"
                                style={styles.button}
                                onPress={handleVolunteer}
                            />
                        )}
                    </View>
                )}

                <View style={styles.divider} />

                <View style={styles.mapContainer}>
                    <MapView
                        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
                        initialRegion={{ ...event.position, ...MapSettings.DEFAULT_DELTA }}
                        style={styles.map}
                        customMapStyle={customMapStyle}
                        liteMode={true}
                        scrollEnabled={false}
                        zoomEnabled={false}
                        rotateEnabled={false}
                        pitchEnabled={false}
                        toolbarEnabled={false}
                    >
                        <Marker coordinate={event.position}>
                            <Image resizeMode="contain" style={{ width: 48, height: 54 }} source={mapMarkerImg} />
                        </Marker>
                    </MapView>
                </View>

                <BigButton
                    label="Get Directions to Event"
                    color="#4D6F80"
                    featherIconName="map-pin"
                    style={styles.directionsButton}
                    onPress={handleGetDirections}
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EBF2F5',
    },

    content: {
        paddingBottom: 40,
    },

    image: {
        width: '100%',
        height: 220,
    },

    imagePlaceholder: {
        backgroundColor: '#DDE3F0',
        justifyContent: 'center',
        alignItems: 'center',
    },

    details: {
        paddingHorizontal: 24,
        paddingTop: 20,
    },

    title: {
        fontFamily: 'Nunito_700Bold',
        fontSize: 24,
        color: '#4D6F80',
    },

    organizer: {
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 13,
        color: '#8fa7b3',
    },

    description: {
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 15,
        lineHeight: 20,
        color: '#5c8599',
        marginTop: 12,
    },

    row: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 16,
    },

    infoBox: {
        flex: 1,
        height: 112,
        borderWidth: 1,
        borderRadius: 16,
        padding: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },

    infoBoxBlue: {
        backgroundColor: '#E6F7FB',
        borderColor: '#00A3FF',
    },

    infoBoxOrange: {
        backgroundColor: '#FCF0E4',
        borderColor: '#FF8700',
    },

    infoBoxGrey: {
        backgroundColor: '#DDE3E8',
        borderColor: '#A1B2BA',
    },

    infoText: {
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 13,
        textAlign: 'center',
        marginTop: 8,
    },

    volunteersCount: {
        fontFamily: 'Nunito_800ExtraBold',
        fontSize: 30,
        color: '#FF8700',
    },

    volunteersCountOf: {
        fontSize: 18,
    },

    button: {
        paddingHorizontal: 8,
    },

    divider: {
        height: 1,
        backgroundColor: '#D3E2E6',
        marginVertical: 16,
    },

    mapContainer: {
        height: 200,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#B3DAE2',
    },

    map: {
        flex: 1,
    },

    directionsButton: {
        marginTop: 16,
    },
});
