import React, { useState } from "react";
import { View, TextInput, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { db } from "../../Service/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import NextButton from "../../components/NextButton/NextButton";

const AccountVerification = () => {
  const navigation = useNavigation();
  const [cpf, setCPF] = useState("");

  const handleCheckCPF = async () => {
    try {
      const cpfExists = await checkCPFExists(cpf);
      if (cpfExists) {
        navigation.navigate("LoginScreen", { cpf: cpf });
      } else {
        navigation.navigate("CreateAccountScreen", { cpf: cpf });
      }
    } catch (error) {
      console.error("Erro ao verificar CPF:", error);
    }
  };

  const checkCPFExists = async (cpf) => {
    try {
      const usersRef = collection(db, "users");
      const querySnapshot = await getDocs(usersRef);

      let cpfExists = false;

      querySnapshot.forEach((doc) => {
        const userData = doc.data().usuario;
        if (userData && userData.cpf === cpf) {
          cpfExists = true;
        }
      });

      return cpfExists;
    } catch (error) {
      console.error("Erro na Verificação do CPF:", error);
      throw error;
    }
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
          style={styles.inputLogin}
          placeholder="Digite seu CPF"
          value={cpf}
          onChangeText={handleCPFFormat}
          keyboardType="numeric"
          maxLength={14}
        />
      </View>
      <View style={styles.buttonContainer}>
        {/* <Button title="Continuar" onPress={handleCheckCPF} /> */}
        <NextButton scrollTo={handleCheckCPF} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flex: 1,
    justifyContent: "flex-start", // Alinha os elementos ao topo
    alignItems: "center", // Centraliza horizontalmente
    padding: 20, // Adiciona espaçamento interno
    backgroundColor: "#ffffff",
  },
  inputLogin: {
    width: "100%",
    paddingHorizontal: 20,
    marginBottom: 20, // Adiciona espaçamento entre o input e o botão
    fontSize: 18,
    height: 55,
    backgroundColor: "#EDF0F2",
    borderRadius: 15,
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
  subContainer: {
    width: "100%",
    flex: 1,
  },
  buttonContainer: {
    width: "100%",
    position: "absolute",
    bottom: 30,
  },
});
export default AccountVerification;
