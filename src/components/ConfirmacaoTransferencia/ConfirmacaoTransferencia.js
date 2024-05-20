import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../Service/firebaseConfig';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const ConfirmacaoTransferencia = ({ route, navigation }) => {
  const { contaData } = route.params;
  const [valorTransferencia, setValorTransferencia] = useState("");
  const [loading, setLoading] = useState(false);

  // Função para formatar o valor como dinheiro
  const formatarDinheiro = (valor) => {
    return parseFloat(valor).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const handleTransferencia = async () => {
    if (!valorTransferencia || parseFloat(valorTransferencia) <= 0) {
      Alert.alert("Valor Inválido", "Por favor, insira um valor válido para a transferência.");
      return;
    }

    setLoading(true);
    // Obtém o userId do usuário
    const userId = await AsyncStorage.getItem('userId');

    try {
      // Simulação da operação de transferência
      setTimeout(() => {
        setLoading(false);
        navigation.navigate("ComprovanteTransferencia", {
          contaData,
          valorTransferencia,
          dataTransferencia: new Date().toLocaleString(),
          remetente: userId, 
        });
      }, 2000); // Simula uma operação de 2 segundos
    } catch (error) {
      console.error("Erro ao concluir a transferência:", error);
      Alert.alert("Erro", "Não foi possível concluir a transferência.");
      setLoading(false); 
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topContent}>
        <Text style={styles.titulo}>Confirme a Transferência</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Valor</Text>
          <View style={styles.inputContainer}>
            <FontAwesome5 name="pencil-alt" size={24} color="#45B5E4" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="0,00"
              keyboardType="numeric"
              value={valorTransferencia}
              onChangeText={setValorTransferencia}
            />
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>Transferência Para</Text>
            <Text style={styles.nomeConta}>{contaData.usuario.name}</Text>
            <Text style={styles.infoConta}>Agência: {contaData.usuario.conta.agencia}</Text>
            <Text style={styles.infoConta}>Conta: {contaData.usuario.conta.numeroConta}</Text>
          </View>
        </View>
      </View>
      <View style={styles.bottomContent}>
        {loading ? (
          <ActivityIndicator size="large" color="#45B5E4" />
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleTransferencia}>
            <FontAwesome5 name="money-check-alt" size={24} color="#FFF" />
            <Text style={styles.buttonText}>Confirmar Transferência</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
  },
  topContent: {
    flex: 1,
  },
  bottomContent: {
    justifyContent: "flex-end",
    paddingBottom: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  nomeConta: {
    fontSize: 20,
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  infoConta: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  inputIcon: {
    position: "absolute",
    left: 15,
    top: 12,
    zIndex: 1,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 45,
    fontSize: 24,
    color: "#333",
    textAlign: "center",
  },
  infoContainer: {
    alignItems: "center",
  },
  button: {
    backgroundColor: "#45B5E4",
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 18,
    marginLeft: 10,
  },
});

export default ConfirmacaoTransferencia;
