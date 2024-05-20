import React, { useState, useEffect } from "react";
import { View, TextInput, Text, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import firebaseApp from "../../Service/firebaseConfig";
import { useRoute } from "@react-navigation/native";
import { Button } from "react-native-elements";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Importe AsyncStorage

const db = getFirestore(firebaseApp);

const LoginScreen = () => {
  const navigation = useNavigation();
  const [cpf, setCPF] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const route = useRoute();
  const cpfFromVerification = route.params?.cpf || "";

  useEffect(() => {
    setCPF(cpfFromVerification);
  }, [cpfFromVerification]);

  const handleLogin = async () => {
    try {
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("usuario.cpf", "==", cpf),
        where("usuario.password", "==", password)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error("CPF ou senha incorretos.");
      } else {
        const usuarioLogado = querySnapshot.docs[0];

        console.log("Usuário logado:", usuarioLogado.data()); // Verifique se os dados do usuário estão corretos
        const userId = usuarioLogado.id;

        // Armazenar o userId em AsyncStorage
        await AsyncStorage.setItem("userId", userId);

        // Recuperar o userId do AsyncStorage para verificar se foi armazenado corretamente
        const storedUserId = await AsyncStorage.getItem("userId");
        console.log("ID do usuário armazenado:", storedUserId);

        navigation.navigate("HomeScreen");
      }
    } catch (error) {
      Alert.alert("Erro", error.message);
      console.error("Erro ao fazer login:", error);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleCPFFormat = (inputCPF) => {
    // Remove caracteres não numéricos
    const formattedCPF = inputCPF.replace(/\D/g, "");

    // Formata o CPF adicionando pontos e traço
    const formattedCPFWithMask = formattedCPF.replace(
      /^(\d{3})(\d{3})(\d{3})(\d{2}).*/,
      "$1.$2.$3-$4"
    );

    // Limita o número de caracteres para 11 dígitos
    setCPF(formattedCPFWithMask.substring(0, 14)); // Considerando o formato com pontos e traço
  };

  return (
    <View style={styles.container}>
      <View style={styles.subContainer}>
        <Text style={styles.textInput}>CPF:</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite o seu cpf"
          value={cpf}
          onChangeText={handleCPFFormat}
          keyboardType="numeric"
          maxLength={14}
        />
        <Text style={styles.textInput}>Senha:</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Digite sua senha"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <Ionicons
            name={showPassword ? "eye-off" : "eye"}
            size={24}
            color="black"
            onPress={handleTogglePasswordVisibility}
            style={styles.icon}
          />
        </View>
      </View>
      <View style={styles.btnContainer}>
        <Button
          title="Login"
          onPress={handleLogin}
          buttonStyle={{ backgroundColor: "#45B5E4", borderRadius: 15 }}
          titleStyle={{ fontWeight: "700", fontSize: 20 }}
          containerStyle={{ width: "100%", height: 60 }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#ffffff",
  },
  subContainer: {
    width: "100%",
    flex: 1,
  },
  input: {
    paddingHorizontal: 25,
    marginBottom: 20,
    fontSize: 16,
    height: 50,
    backgroundColor: "#EDF0F2",
    borderRadius: 8,
    borderWidth: 0.4,
  },
  textInput: {
    width: "100%",
    color: "#3A3B3C",
    alignItems: "flex-start",
    paddingHorizontal: 5,
    marginBottom: 7,
    fontSize: 18,
    fontWeight: "bold",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "gray",
    borderBottomWidth: 1,
    marginBottom: 10,
    position: "relative",
  },
  icon: {
    position: "absolute",
    right: 10,
    top: 12,
  },
  btnContainer: {
    width: "100%",
    height: 40,
  },
});

export default LoginScreen;
