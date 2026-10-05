import React, { useState } from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const { Navigator, Screen } = createStackNavigator();

import Login from '../pages/Login';
import EventsMap from '../pages/EventsMap';
import EventDetails from '../pages/EventDetails';
import { AuthenticationContext, AuthenticationContextObject } from '../context/AuthenticationContext';
import { User } from '../types/User';

export default function Routes() {
    const [authenticatedUser, setAuthenticatedUser] = useState<User>();

    const authenticationContextObj: AuthenticationContextObject = {
        value: authenticatedUser as User,
        setValue: setAuthenticatedUser,
    };

    return (
        <AuthenticationContext.Provider value={authenticationContextObj}>
            <NavigationContainer>
                <Navigator
                    screenOptions={{
                        headerShown: false,
                        cardStyle: { backgroundColor: '#F2F3F5' },
                    }}
                >
                    <Screen name="Login" component={Login} />

                    <Screen name="EventsMap" component={EventsMap} />

                    <Screen
                        name="EventDetails"
                        component={EventDetails}
                        options={{
                            headerShown: true,
                            title: 'Event',
                            headerTintColor: '#00A3FF',
                            headerTitleAlign: 'center',
                            headerTitleStyle: { fontFamily: 'Nunito_600SemiBold', fontSize: 15, color: '#8fa7b3' },
                            headerStyle: { backgroundColor: '#F9FAFC' },
                            headerBackButtonDisplayMode: 'minimal',
                        }}
                    />
                </Navigator>
            </NavigationContainer>
        </AuthenticationContext.Provider>
    );
}
