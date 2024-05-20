import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Clipboard
} from "react-native";

import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import {
  getDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../../Service/firebaseConfig";
import RegistroChavePIX from "../../components/RegistroChavePix/RegistroChavePIX";
import { useNavigation } from "@react-navigation/native";

const ChavesPixRegistradas = ({ route }) => {
  const [chavesPix, setChavesPix] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const carregarChavesPix = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) {
          console.error("Usuário não autenticado");
          return;
        }
  
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
          throw new Error("Usuário não encontrado no banco de dados.");
        }
  
        const userData = userDoc.data();
       // console.log("Dados do usuário:", userData); // Log para verificar os dados do usuário
  
        const chavesPixObj = userData.usuario?.conta?.chavePix || {};
      //  console.log("Chaves PIX objeto:", chavesPixObj); // Log para verificar as chaves PIX objeto
  
        // Transformar o objeto chavesPix em um array
        const chavesPix = Object.entries(chavesPixObj).map(([tipo, valor]) => ({
          tipo,
          valor,
        }));
        //console.log("Chaves PIX array:", chavesPix); // Log para verificar as chaves PIX array
  
        if (chavesPix.length > 0) {
          setChavesPix(chavesPix);
        } else {
          console.warn("Usuário não possui chaves PIX associadas.");
        }
      } catch (error) {
        console.error("Erro ao carregar chaves PIX:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    carregarChavesPix();
  }, []);
  

  const copiarChavePix = async (chave) => {
    try {
      await Clipboard.setString(chave);
      Alert.alert(
        "Sucesso!",
        "Chave PIX copiada para a área de transferência."
      );
    } catch (error) {
      console.error("Erro ao copiar chave PIX:", error);
      Alert.alert("Erro!", "Não foi possível copiar a chave PIX.");
    }
  };

  const excluirChavePix = async (chave) => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        throw new Error("ID do usuário não encontrado.");
      }
  
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);
  
      if (!userDoc.exists()) {
        throw new Error("Usuário não encontrado no banco de dados.");
      }
  
      const userData = userDoc.data();
     // console.log("Dados do usuário:", userData); // Log para verificar os dados do usuário
  
      const chavesPixObj = userData.usuario?.conta?.chavePix || {};
    
      // Remover a chave do objeto
      const { [chave]: _, ...chavesPixAtualizadas } = chavesPixObj;
  
      await updateDoc(userRef, {
        "usuario.conta.chavePix": chavesPixAtualizadas,
      });
  
      // Transformar o objeto atualizado em um array
      const chavesPixArrayAtualizadas = Object.entries(chavesPixAtualizadas).map(([tipo, valor]) => ({
        tipo,
        valor,
      }));
  
      setChavesPix(chavesPixArrayAtualizadas);
      
      Alert.alert("Sucesso", "Chave PIX excluída com sucesso.");
    } catch (error) {
      console.error("Erro ao excluir chave PIX:", error);
      Alert.alert("Erro", "Não foi possível excluir a chave PIX.");
    }
  };  

  const renderItem = ({ item }) => {
    let iconName = "";
    let IconComponent = MaterialIcons;
    switch (item.tipo) {
      case "cpf":
        iconName = "person";
        break;
      case "email":
        iconName = "mail";
        IconComponent = FontAwesome5;
        break;
      case "telefone":
        iconName = "smartphone";
        break;
      case "aleatoria":
        iconName = "key";
        IconComponent = FontAwesome5;
        break;
      default:
        iconName = "questioncircle";
    }
    return (
      <View style={styles.chavePixItem}>
        <View style={styles.iconContainer}>
          {item.tipo === "aleatoria" ? (
            <FontAwesome5 name={iconName} size={20} color="black" />
          ) : (
            <MaterialIcons name={iconName} size={20} color="black" />
          )}
        </View>
        <Text style={styles.chavePixTipo}>{item.tipo}:</Text>
        <Text style={styles.chavePixValor}>{item.valor}</Text>
        <TouchableOpacity
          style={styles.copyButton}
          onPress={() => copiarChavePix(item.valor)}
        >
          <FontAwesome5 name="copy" size={18} color="#2d3142" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => excluirChavePix(item.valor)}
        >
          <FontAwesome5 name="trash" size={18} color="#2d3142" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          <Text style={styles.enviarReceberText}>Enviar ou Receber</Text>
          <View style={styles.actionsSubContainer}>
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate("TelaTransferencia")}
              >
                <FontAwesome5
                  name="exchange-alt"
                  size={24}
                  color="black"
                  style={styles.icon}
                />
                <Text style={styles.actionButtonText}>Transferir</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <FontAwesome5
                  name="qrcode"
                  size={24}
                  color="black"
                  style={styles.icon}
                />
                <Text style={styles.actionButtonText}>QR Code</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <MaterialIcons
                  name="content-copy"
                  size={24}
                  color="black"
                  style={styles.icon}
                />
                <Text style={styles.actionButtonText}>Copiar e Colar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <FontAwesome5
                  name="money-bill-wave"
                  size={24}
                  color="black"
                  style={styles.icon}
                />
                <Text style={styles.actionButtonText}>Cobrar com Pix</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.titulo}>Minhas Chaves PIX</Text>
          <FlatList
            data={chavesPix}
            renderItem={renderItem}
            keyExtractor={(item) => item.valor}
          />
          <RegistroChavePIX />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    flex: 1,
    padding: 20,
  },
  titulo: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  chavePixItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flex: 1,
  },
  chavePixTipo: {
    fontWeight: "bold",
    marginRight: 10,
    fontSize: 16,
  },
  chavePixValor: {
    flex: 1,
    fontSize: 14,
  },
  iconContainer: {
    marginRight: 10,
  },
  actionButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  enviarReceberText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "left",
  },
  actionsSubContainer: {
    flex: 5,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  actionButton: {
    alignItems: "center",
    padding: 10,
    borderRadius: 5,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  icon: {
    marginBottom: 10,
  },
  copyButton: {
    padding: 10,
    borderRadius: 15,
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    padding: 10,
    borderRadius: 15,
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ChavesPixRegistradas;