import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  collection,
  getDoc,
  doc,
  getDocs,
  where,
  query,
} from "firebase/firestore";
import { db } from "../../Service/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { orderByChild } from "firebase/database";

const TelaTransferencia = () => {
  const navigation = useNavigation();

  const [chavePix, setChavePix] = useState("");
  const [ultimaChavePix, setUltimaChavePix] = useState(null);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const carregarChavePix = async () => {
      try {
        const chavePixSalva = await AsyncStorage.getItem("chavePix");
        if (chavePixSalva !== null) {
          setUltimaChavePix(chavePixSalva);
        }
      } catch (error) {
        console.error("Erro ao carregar chave PIX:", error);
      }
    };

    const getUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          setUserId(storedUserId);
          console.log("UserId obtido do AsyncStorage:", storedUserId);
        }
      } catch (error) {
        console.error("Erro ao obter userId do AsyncStorage:", error);
      }
    };

    carregarChavePix();
    getUserId();
  }, []);

  // Função para formatar CPF
  const formatarCPF = (chave) => {
    return chave.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  // Função para formatar telefone
  const formatarTelefone = (chave) => {
    return chave.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  };

  // Função para lidar com a mudança na chave PIX
  const handleChavePixChange = (text) => {
    // Detectar o tipo de chave PIX e aplicar a formatação apropriada
    let chaveFormatada = text;
    if (/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(text)) {
      chaveFormatada = formatarCPF(text);
    } else if (/^\(\d{2}\) \d{5}-\d{4}$/.test(text)) {
      chaveFormatada = formatarTelefone(text);
    }
    setChavePix(chaveFormatada);
  };
  

  const handleTransferencia = async () => {
    try {
      // Verifica se há uma chave PIX inserida
      if (!chavePix) {
        Alert.alert("Erro", "Por favor, insira uma chave PIX.");
        return;
      }

      // Obtém a referência do usuário
      const userRef = doc(db, "users", userId);
      const userDataSnapshot = await getDoc(userRef);
      const userData = userDataSnapshot.data();

      const q = query(
        collection(db, "users"),
        where("usuario.conta.chavePix.valor", "==", chavePix)
      );

      const querySnapshot = await getDocs(q);
      var contaEncontrada;
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, " => ", doc.data());
        contaEncontrada = doc.data();
      });

      if (contaEncontrada) {
        // Se a conta for encontrada, navega para a próxima tela
        navigation.navigate("ConfirmacaoTransferencia", {
          contaData: contaEncontrada,
          userData: userData,
        });
      } else {
        // Se a chave PIX não for encontrada em nenhuma conta, exibe uma mensagem de erro
        Alert.alert(
          "Conta não encontrada",
          "Não foi encontrada uma conta associada à chave PIX inserida."
        );
      }
    } catch (error) {
      console.error("Erro ao buscar conta por chave PIX:", error);
      Alert.alert(
        "Erro",
        "Não foi possível buscar a conta associada à chave PIX."
      );
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.titulo}>Inserir chave Pix:</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite sua Chave PIX"
          value={chavePix}
          onChangeText={handleChavePixChange}
          keyboardType="default"
        />
      </View>
      {ultimaChavePix && (
        <TouchableOpacity
          style={styles.lastKeyButton}
          onPress={() => handleTransferencia(ultimaChavePix)}
        >
          <Text style={styles.lastKeyText}>
            Última Chave Usada: {ultimaChavePix}
          </Text>
        </TouchableOpacity>
      )}
      <View>
        <TouchableOpacity
          style={styles.button}
          onPress={handleTransferencia}
          disabled={!chavePix}
        >
          <Text style={styles.buttonText}>Transferir</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.closeButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    justifyContent: "space-between",
  },
  titulo: {
    fontSize: 21,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "left",
  },
  input: {
    borderBottomWidth: 1,
    borderColor: "#000",
    borderRadius: 15,
    paddingTop: 20,
    paddingLeft: 20,
    marginBottom: 10,
    height: 60,
    fontSize: 18,
  },
  button: {
    backgroundColor: "#45B5E4",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },
  closeButton: {
    backgroundColor: "#d62828",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },
  lastKeyButton: {
    backgroundColor: "#ccc",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  lastKeyText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 16,
  },
});

export default TelaTransferencia;