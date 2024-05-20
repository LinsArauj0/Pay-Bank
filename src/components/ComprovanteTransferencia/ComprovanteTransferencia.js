import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { FontAwesome } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../Service/firebaseConfig';

const ComprovanteTransferencia = ({ route, navigation }) => {
  const { contaData, valorTransferencia, dataTransferencia, remetente } = route.params;
  const [remetenteData, setRemetenteData] = useState(null);

  useEffect(() => {
    const fetchRemetenteData = async () => {
      try {
        const remetenteDocRef = doc(db, "users", remetente);
        const remetenteDocSnap = await getDoc(remetenteDocRef);
        if (remetenteDocSnap.exists()) {
          setRemetenteData(remetenteDocSnap.data());
        }
      } catch (error) {
        console.error("Erro ao buscar dados do remetente:", error);
      }
    };

    fetchRemetenteData();
  }, [remetente]); 

  // Função para formatar o valor como dinheiro
  const formatarDinheiro = (valor) => {
    return parseFloat(valor).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.comprovante}>
        <Text style={styles.titulo}>Comprovante de Transferência</Text>
        <View style={styles.divisor}></View>
        <View style={styles.dadosContainer}>
          <View style={styles.dadosOrigem}>
            <Text style={styles.label}>Origem:</Text>
            {remetenteData ? (
              <>
                <Text style={styles.valor}>Nome: {remetenteData.usuario.name}</Text>
                <Text style={styles.infoConta}>
                  Valor: {formatarDinheiro(valorTransferencia)} 
                </Text>
              </>
            ) : (
              <Text style={styles.valor}>Carregando...</Text>
            )}
          </View>
          <View style={styles.dadosDestino}>
            <Text style={styles.label}>Destino:</Text>
            <Text style={styles.valor}>Nome: {contaData.usuario.name}</Text>
            <Text style={styles.infoConta}>Agência: {contaData.usuario.conta.agencia}</Text>
            <Text style={styles.infoConta}>Conta: {contaData.usuario.conta.numeroConta}</Text>
          </View>
          <View style={styles.divisor}></View>
          <View style={styles.dadosTransferencia}>
            <Text style={styles.label}>Valor:</Text>
            <Text style={styles.valor}>{formatarDinheiro(valorTransferencia)}</Text>
            <Text style={styles.label}>Data:</Text>
            <Text style={styles.valor}>{dataTransferencia}</Text>
          </View>
        </View>
      </View>
      
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("TelaTransferencia")}>
        <Text style={styles.buttonText}>Nova Transferência</Text>
      </TouchableOpacity>
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
  comprovante: {
    borderWidth: 2,
    borderColor: "#000",
    borderRadius: 10,
    padding: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "500",
    marginBottom: 20,
    textAlign: "center",
  },
  divisor: {
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    marginBottom: 20,
  },
  dadosContainer: {
    marginBottom: 20,
  },
  dadosOrigem: {
    marginBottom: 10,
    fontWeight: 'bold',
  },
  dadosDestino: {
    marginBottom: 10,
    fontWeight: 'bold',

  },
  dadosTransferencia: {
    marginBottom: 10,
  },
  label: {
    fontSize: 20,
    marginBottom: 5,
    color: "#333",
  },
  valor: {
    fontSize: 18,
    color: "#333",
    fontWeight: "700",
  },
  infoConta: {
    fontSize: 16,
    color: "#666666",
  },
  button: {
    backgroundColor: "#45B5E4",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});

export default ComprovanteTransferencia;