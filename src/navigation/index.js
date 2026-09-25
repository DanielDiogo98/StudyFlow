import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import SubjectsScreen from '../screens/SubjectsScreen';
import SubjectFormScreen from '../screens/SubjectFormScreen';
import ExamsScreen from '../screens/ExamsScreen';
import ExamFormScreen from '../screens/ExamFormScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AvailabilityScreen from '../screens/AvailabilityScreen';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();
const SubjectsStack = createNativeStackNavigator();
const ExamsStack = createNativeStackNavigator();
const SettingsStack = createNativeStackNavigator();

const stackScreenOptions = {
  headerStyle: { backgroundColor: colors.card },
  headerTintColor: colors.text,
  headerTitleStyle: { fontWeight: '700' },
};

function SubjectsStackNavigator() {
  return (
    <SubjectsStack.Navigator screenOptions={stackScreenOptions}>
      <SubjectsStack.Screen
        name="SubjectsList"
        component={SubjectsScreen}
        options={{ title: 'Matérias' }}
      />
      <SubjectsStack.Screen
        name="SubjectForm"
        component={SubjectFormScreen}
        options={{ title: 'Nova matéria' }}
      />
    </SubjectsStack.Navigator>
  );
}

function ExamsStackNavigator() {
  return (
    <ExamsStack.Navigator screenOptions={stackScreenOptions}>
      <ExamsStack.Screen
        name="ExamsList"
        component={ExamsScreen}
        options={{ title: 'Provas e trabalhos' }}
      />
      <ExamsStack.Screen
        name="ExamForm"
        component={ExamFormScreen}
        options={{ title: 'Nova prova/trabalho' }}
      />
    </ExamsStack.Navigator>
  );
}

function SettingsStackNavigator() {
  return (
    <SettingsStack.Navigator screenOptions={stackScreenOptions}>
      <SettingsStack.Screen
        name="SettingsHome"
        component={SettingsScreen}
        options={{ title: 'Ajustes' }}
      />
      <SettingsStack.Screen
        name="Availability"
        component={AvailabilityScreen}
        options={{ title: 'Disponibilidade' }}
      />
    </SettingsStack.Navigator>
  );
}

const ICONS = {
  Hoje: 'today-outline',
  Cronograma: 'calendar-outline',
  Materias: 'book-outline',
  Provas: 'document-text-outline',
  Ajustes: 'settings-outline',
};

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '700' },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={ICONS[route.name]} size={size} color={color} />
          ),
        })}
      >
        <Tab.Screen name="Hoje" component={HomeScreen} options={{ title: 'Hoje' }} />
        <Tab.Screen
          name="Cronograma"
          component={ScheduleScreen}
          options={{ title: 'Cronograma' }}
        />
        <Tab.Screen
          name="Materias"
          component={SubjectsStackNavigator}
          options={{ title: 'Matérias', headerShown: false }}
        />
        <Tab.Screen
          name="Provas"
          component={ExamsStackNavigator}
          options={{ title: 'Provas', headerShown: false }}
        />
        <Tab.Screen
          name="Ajustes"
          component={SettingsStackNavigator}
          options={{ title: 'Ajustes', headerShown: false }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
