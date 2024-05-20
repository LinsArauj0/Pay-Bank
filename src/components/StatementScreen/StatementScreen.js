import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const StatementScreen = ({ navigation }) => {
  const [showBalance, setShowBalance] = useState(true);
  const [balanceOpacity] = useState(new Animated.Value(1));

  const handleShowBalance = ({ route }) => {
    Animated.timing(balanceOpacity, {
      toValue: showBalance ? 0 : 1,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setShowBalance(!showBalance);
    });
  };

  const transactions = [
    { date: '2023-10-26', description: 'Depósito', value: 'R$ 500,00', type: 'Crédito', category: 'Salário' },
    { date: '2023-10-25', description: 'Pagamento de conta', value: 'R$ 150,00', type: 'Débito', category: 'Contas' },
    { date: '2023-10-24', description: 'Transferência', value: 'R$ 200,00', type: 'Débito', category: 'Transferências' },
    { date: '2023-10-23', description: 'Pagamento de boleto', value: 'R$ 80,00', type: 'Débito', category: 'Contas' },
    { date: '2023-10-22', description: 'Salário', value: 'R$ 2.500,00', type: 'Crédito', category: 'Salário' },
    { date: '2023-10-21', description: 'Compra online', value: 'R$ 120,00', type: 'Débito', category: 'Compras' },
    { date: '2023-10-20', description: 'Jantar', value: 'R$ 75,00', type: 'Débito', category: 'Alimentação' },
  ];

  const renderItem = ({ item }) => (
    <View style={styles.transaction}>
      <View>
        <Text style={styles.transactionDate}>{item.date}</Text>
        <Text style={styles.transactionDescription}>{item.description}</Text>
        <Text style={styles.transactionCategory}>{item.category}</Text>
      </View>
      <Text style={[styles.transactionValue, item.type === 'Débito' && styles.transactionValueDebit]}>
        {item.type === 'Débito' ? `-${item.value}` : item.value}
      </Text>
    </View>
  );

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleShowBalance}>
          <Icon name={showBalance ? 'visibility' : 'visibility-off'} size={28} color="#000" style={{ marginRight: 15 }} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, showBalance]);

  return (
    <View style={styles.container}>

      <View style={styles.balanceContainer}>
        <Text style={styles.subtitle}>Saldo disponível</Text>
        <Animated.View style={{ opacity: balanceOpacity }}>
          {showBalance ? (
            <Text style={styles.balance}>R$ 1.234,56</Text>
          ) : (
            <Text style={styles.hiddenBalance}>R$ *****,**</Text>
          )}
        </Animated.View>
      </View>

      <FlatList
        data={transactions}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        style={styles.transactions}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
    marginBottom: 5,
  },
  balanceContainer: {
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '100%',
    //shadowColor: '#000',
   // shadowOffset: { width: 0, height: 2 },
   // shadowOpacity: 0.1,
   // shadowRadius: 4,
  //  elevation: 3,
  },
  balance: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF',
  },
  hiddenBalance: {
    fontSize: 24,
    color: '#999',
  },
  transactions: {
    flex: 1,
    marginTop: 10,
  },
  transaction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionDate: {
    fontSize: 14,
    color: '#999',
  },
  transactionDescription: {
    fontSize: 16,
    color: '#333',
  },
  transactionCategory: {
    fontSize: 14,
    color: '#777',
  },
  transactionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  transactionValueDebit: {
    color: '#ff0000',
  },
});

export default StatementScreen;
