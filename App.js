import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Onboarding from "./src/components/OnboardingScreen/Onboarding";
import AccountVerification from "./src/Pages/AccountVerificationScreen/AccountVerification";
import LoginScreen from "./src/components/LoginScreen/LoginScreen";
import CreateAccountScreen from "./src/components/CreateAnAccount/CreateAccountScreen";
import HomeScreen from "./src/Pages/Home/HomeScreen";
import ChavesPixRegistradas from "./src/Pages/ChavesPixRegistradas/ChavesPixRegistradas";
import TelaTransferencia from "./src/components/TelaTransferencia/TelaTransferencia";
import ConfirmacaoTransferencia from "./src/components/ConfirmacaoTransferencia/ConfirmacaoTransferencia";
import ComprovanteTransferencia from "./src/components/ComprovanteTransferencia/ComprovanteTransferencia";
import StatementScreen from "./src/components/StatementScreen/StatementScreen";

import React, { useEffect } from "react";
import { setPersistence } from "firebase/auth";
import {
  auth,
  persistence,
} from "./src/Service/firebaseConfig";

const Stack = createStackNavigator();

export default App = () => {
  useEffect(() => {
    const initializePersistence = async () => {
      try {
        await setPersistence(auth, persistence);
        console.log("Persistência com AsyncStorage configurada com sucesso!");
      } catch (error) {
        console.error("Erro ao configurar a persistência:", error);
      }
    };

    initializePersistence();
  }, []);

  return (
    <SafeAreaProvider>

      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name=" " component={Onboarding} />
          <Stack.Screen
            name="AccountVerification"
            component={AccountVerification}
            options={{ title: "Verificação de Conta" }}
          />
          <Stack.Screen
            name="LoginScreen"
            component={LoginScreen}
            options={{ title: "Login" }}
          />
          <Stack.Screen
            name="CreateAccountScreen"
            component={CreateAccountScreen}
            options={{ title: "Criar conta" }}
          />
          <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ title: " Home " }}/>
          <Stack.Screen
            name="ChavesPixRegistradas"
            component={ChavesPixRegistradas}
            options={{ title: "Área Pix" }}
          />
          <Stack.Screen
            name="TelaTransferencia"
            component={TelaTransferencia}
            options={{ title: " " }}
          />
          <Stack.Screen
            name="ConfirmacaoTransferencia"
            component={ConfirmacaoTransferencia}
            options={{ title: "Confirmar Transferencia" }}
          />
          <Stack.Screen
            name="ComprovanteTransferencia"
            component={ComprovanteTransferencia}
            options={{ title: "Comprovante de Transferencia" }}
          />
          <Stack.Screen
            name="StatementScreen"
            component={StatementScreen}
            options={{ title: "Extrato" }}
          />
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};
