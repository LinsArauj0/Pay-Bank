import React, { useState, useEffect } from "react";
import { View, TextInput, StyleSheet, Text } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { db } from "../../Service/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc
} from "firebase/firestore";
import { Button } from "react-native-elements";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CreateAccountScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [cpf, setCPF] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [errorName, setErrorName] = useState("");
  const [errorCPF, setErrorCPF] = useState("");
  const [errorPassword, setErrorPassword] = useState("");
  const [errorEmail, setErrorEmail] = useState("");

  const route = useRoute();

  const generateBankDetails = () => {
    // Simples exemplo de geração de dados bancários
    const agency = "0001";
    const accountNumber = (Math.floor(Math.random() * 1000000) + 1)
      .toString()
      .padStart(6, "0");
    const accountType = ["Corrente", "Poupança"][Math.floor(Math.random() * 2)];
    return { agency, accountNumber, accountType };
  };

  const cpfFromVerification = route.params?.cpf || "";

  useEffect(() => {
    // Preenchendo automaticamente o campo CPF com o valor recebido como parâmetro
    setCPF(cpfFromVerification);
  }, [cpfFromVerification]);

  const handleCreateAccount = async () => {
    // Validar campos obrigatórios
    if (!name) {
      setErrorName("Por favor, insira seu Nome Completo.");
      return;
    }
  
    if (!cpf) {
      setErrorCPF("Por favor, insira seu CPF.");
      return;
    }
  
    if (!password) {
      setErrorPassword("Por favor, insira uma senha.");
      return;
    }
  
    if (!email) {
      setErrorEmail("Por favor, insira seu e-mail.");
      return;
    }
  
    try {
      // Verificar se já existe um usuário com o mesmo e-mail
      const emailQuery = query(
        collection(db, "users"),
        where("email", "==", email)
      );
      const emailSnapshot = await getDocs(emailQuery);
      if (!emailSnapshot.empty) {
        setErrorEmail("Já existe um usuário cadastrado com este e-mail.");
        return;
      }
  
      // Verificar se já existe um usuário com o mesmo CPF
      const cpfQuery = query(collection(db, "users"), where("cpf", "==", cpf));
      const cpfSnapshot = await getDocs(cpfQuery);
      if (!cpfSnapshot.empty) {
        setErrorCPF("Já existe um usuário cadastrado com este CPF.");
        return;
      }
  
      const bankDetails = generateBankDetails();

      // Adiciona um novo documento com os dados do usuário à coleção 'users'
      const userRef = await addDoc(collection(db, "users"), {
        usuario: {
          cpf: cpf,
          email: email,
          name: name,
          phone: phone,
          password: password,
          conta: { // Objeto de contas bancárias
              saldo: 0,
              agencia: bankDetails.agency,
              numeroConta: bankDetails.accountNumber,
              tipo: bankDetails.accountType,
              extrato: [],
            },
        }
      });


      // Salva o userId em AsyncStorage
      await AsyncStorage.setItem("userId", userRef.id);

      alert("Conta criada! Faça o login para acessar.");
      // Navega para a tela inicial após o cadastro ser concluído
      navigation.navigate("LoginScreen");
    } catch (error) {
      console.error("Erro ao criar conta:", error);
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

  const handlePhoneFormat = (inputPhone) => {
    // Remove caracteres não numéricos
    let formattedPhone = inputPhone.replace(/\D/g, "");

    // Adiciona o DDD (apenas se tiver 2 dígitos)
    if (formattedPhone.length > 2) {
      formattedPhone = `(${formattedPhone.substring(
        0,
        2
      )}) ${formattedPhone.substring(2)}`;
    }

    // Adiciona o hífen após o nono dígito (se houver)
    if (formattedPhone.length > 10) {
      formattedPhone = `${formattedPhone.substring(
        0,
        10
      )}-${formattedPhone.substring(10)}`;
    }

    // Limita o número de caracteres
    setPhone(formattedPhone.substring(0, 15)); // (DDD) + 9 dígitos + hífen
  };

  return (
    <View style={styles.container}>
      <View style={styles.subContainer}>
        <Text style={styles.textInput}>Nome Completo:</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite seu Nome Completo"
          value={name}
          onChangeText={setName}
        />
        {errorName ? <Text style={styles.error}>{errorName}</Text> : null}

        <Text style={styles.textInput}>CPF:</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite o seu CPF"
          value={cpf}
          onChangeText={handleCPFFormat}
          keyboardType="numeric"
          maxLength={14}
          editable={!cpfFromVerification}
        />
        {errorCPF ? <Text style={styles.error}>{errorCPF}</Text> : null}

        <Text style={styles.textInput}>E-mail:</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite um email"
          value={email}
          onChangeText={setEmail}
        />
        {errorEmail ? <Text style={styles.error}>{errorEmail}</Text> : null}

        <Text style={styles.textInput}>Telefone:</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite seu numero de telefone"
          value={phone}
          onChangeText={handlePhoneFormat} // Chama a função de formatação
          keyboardType="phone-pad"
          maxLength={15} // Limita o tamanho
        />

        <Text style={styles.textInput}>Password:</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite uma senha"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        {errorPassword ? (
          <Text style={styles.error}>{errorPassword}</Text>
        ) : null}
      </View>
      <View style={styles.btnContainer}>
        <Button
          styles={styles.btn}
          title="Criar Conta"
          onPress={handleCreateAccount}
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
    justifyContent: "space-between", // Alinha os elementos ao topo
    alignItems: "center", // Centraliza horizontalmente
    padding: 20, // Adiciona espaçamento interno
    backgroundColor: "#ffffff",
  },
  subContainer: {
    width: "100%",
    flex: 1,
  },
  input: {
    width: "100%",
    paddingHorizontal: 25,
    marginBottom: 20, // Adiciona espaçamento entre o input e o botão
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
  btnContainer: {
    width: "100%",
    height: 60,
  },
  btn: {
    width: "100%",
    height: 40,
    borderRadius: 15,
    fontSize: 18,
  },
  error: {
    color: "red",
    marginBottom: 5,
  },
});

export default CreateAccountScreen;
