import React, { useState } from 'react';
import { View, Text, Button, TextInput, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ChancePage = () => {
    const [result, setResult] = useState('');
    const [sides, setSides] = useState('');

    const flipCoin = () => {
        const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
        setResult(`Coin Flip: ${result}`);
    };

    const rollDice = (sides) => {
        const result = Math.floor(Math.random() * sides) + 1;
        setResult(`You rolled a ${result} on a ${sides}-sided dice.`);
    };

    const rollXDice = () => {
        const sidesNumber = parseInt(sides, 10);

        if (isNaN(sidesNumber) || sidesNumber < 1) {
            Alert.alert('Invalid Input', 'Please enter a valid number of sides (greater than 0).');
            return;
        }

        const result = Math.floor(Math.random() * sidesNumber) + 1;
        setResult(`You rolled a ${result} on a ${sidesNumber}-sided dice.`);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Chance Page</Text>

            <Button title="Flip a Coin" onPress={flipCoin} />
            <Button title="Roll a 6-sided Dice" onPress={() => rollDice(6)} />
            <Button title="Roll an 8-sided Dice" onPress={() => rollDice(8)} />
            <Button title="Roll a 4-sided Dice" onPress={() => rollDice(4)} />
            <Button title="Roll a 20-sided Dice" onPress={() => rollDice(20)} />
            <Button title="Roll a 12-sided Dice" onPress={() => rollDice(12)} />

            <Text>Enter the number of sides for a unique dice:</Text>
            <TextInput
                style={styles.input}
                value={sides}
                onChangeText={setSides}
                keyboardType="numeric"
                placeholder="Sides"
            />
            <Button title="Roll your Dice" onPress={rollXDice} />

            <Text style={styles.results}>{result}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 20,
        width: 200,
        textAlign: 'center',
    },
    results: {
        marginTop: 20,
        fontSize: 20,
        fontWeight: 'bold',
    },
});

export default ChancePage;
