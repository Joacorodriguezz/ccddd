import React, { useState, useEffect, useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

// --- Componente principal de la aplicación ---
const App = () => {
    // Estados para el texto de entrada y salida
    const [inputText, setInputText] = useState('');
    const [originalBytes, setOriginalBytes] = useState(0);
    const [encodedHuffman, setEncodedHuffman] = useState('');
    const [decodedHuffman, setDecodedHuffman] = useState('');
    const [huffmanTable, setHuffmanTable] = useState([]);
    const [huffmanAvgLength, setHuffmanAvgLength] = useState(0);
    const [huffmanCompressionRatio, setHuffmanCompressionRatio] = useState(0);
    const [huffmanEfficiency, setHuffmanEfficiency] = useState(0);

    const [encodedShannonFano, setEncodedShannonFano] = useState('');
    const [decodedShannonFano, setDecodedShannonFano] = useState('');
    const [shannonFanoTable, setShannonFanoTable] = useState([]);
    const [shannonFanoAvgLength, setShannonFanoAvgLength] = useState(0);
    const [shannonFanoCompressionRatio, setShannonFanoCompressionRatio] = useState(0);
    const [shannonFanoEfficiency, setShannonFanoEfficiency] = useState(0);

    const [message, setMessage] = useState(''); // Mensajes de validación o error
    const [entropy, setEntropy] = useState(0); // Entropía teórica del texto

    // Referencias para los canvas de Chart.js
    const compressionChartRef = useRef(null);
    const efficiencyChartRef = useRef(null);

    // --- Algoritmo de Huffman ---

    // Clase para nodos del árbol de Huffman
    class HuffmanNode {
        constructor(char, freq, left = null, right = null) {
            this.char = char;
            this.freq = freq;
            this.left = left;
            this.right = right;
        }
    }

    // Calcular frecuencias de caracteres
    const getFrequencies = (text) => {
        const frequencies = {};
        for (let char of text) {
            frequencies[char] = (frequencies[char] || 0) + 1;
        }
        return frequencies;
    };

    // Construir el árbol de Huffman
    const buildHuffmanTree = (frequencies) => {
        let nodes = Object.keys(frequencies).map(char => new HuffmanNode(char, frequencies[char]));

        // Ordenar nodos por frecuencia (simula una cola de prioridad)
        nodes.sort((a, b) => a.freq - b.freq);

        while (nodes.length > 1) {
            // Tomar los dos nodos de menor frecuencia
            const left = nodes.shift();
            const right = nodes.shift();

            // Crear un nuevo nodo padre
            const newNode = new HuffmanNode(null, left.freq + right.freq, left, right);
            nodes.push(newNode);
            nodes.sort((a, b) => a.freq - b.freq);
        }
        return nodes[0]; // La raíz del árbol
    };

    // Generar códigos de Huffman recorriendo el árbol
    const generateHuffmanCodes = (node, currentCode = '', codes = {}) => {
        if (node === null) return;

        if (node.char !== null) {
            codes[node.char] = currentCode;
            return;
        }

        generateHuffmanCodes(node.left, currentCode + '0', codes);
        generateHuffmanCodes(node.right, currentCode + '1', codes);
        return codes;
    };

    // Codificar texto con Huffman
    const encodeHuffman = (text, codes) => {
        let encodedText = '';
        for (let char of text) {
            encodedText += codes[char];
        }
        return encodedText;
    };

    // Decodificar texto con Huffman
    const decodeHuffman = (encodedText, tree) => {
        let decodedText = '';
        let currentNode = tree;

        for (let bit of encodedText) {
            if (bit === '0') {
                currentNode = currentNode.left;
            } else {
                currentNode = currentNode.right;
            }

            if (currentNode.char !== null) { // Es un nodo hoja
                decodedText += currentNode.char;
                currentNode = tree; // Reiniciar al nodo raíz
            }
        }
        return decodedText;
    };

    // --- Algoritmo de Shannon-Fano ---

    // Función para generar códigos Shannon-Fano
    const generateShannonFanoCodes = (frequencies) => {
        // Convertir frecuencias a un array de objetos y ordenar por frecuencia descendente
        let symbols = Object.keys(frequencies).map(char => ({ char, freq: frequencies[char], code: '' }));
        symbols.sort((a, b) => b.freq - a.freq);

        // Función recursiva para dividir los símbolos y asignar códigos
        const shannonFanoDivide = (arr) => {
            if (arr.length <= 1) return;

            let totalFreq = arr.reduce((sum, s) => sum + s.freq, 0);
            let currentSum = 0;
            let splitIndex = -1;

            // Encontrar el punto de división óptimo
            for (let i = 0; i < arr.length - 1; i++) {
                currentSum += arr[i].freq;
                if (currentSum >= totalFreq / 2) {
                    splitIndex = i;
                    break;
                }
            }

            // Si no se encuentra un punto de división claro, asignar a partes iguales o como sea posible
            if (splitIndex === -1) {
                // Fallback: dividir lo más equitativamente posible
                splitIndex = Math.floor(arr.length / 2) - 1;
                if (splitIndex < 0) splitIndex = 0; // Asegurarse de que al menos un elemento esté en la primera parte
            }

            const group1 = arr.slice(0, splitIndex + 1);
            const group2 = arr.slice(splitIndex + 1);

            // Asignar '0' al primer grupo y '1' al segundo
            group1.forEach(s => s.code += '0');
            group2.forEach(s => s.code += '1');

            // Recursivamente aplicar a los subgrupos
            shannonFanoDivide(group1);
            shannonFanoDivide(group2);
        };

        shannonFanoDivide(symbols);
        return symbols;
    };

    // Codificar texto con Shannon-Fano
    const encodeShannonFano = (text, codesMap) => {
        let encodedText = '';
        for (let char of text) {
            encodedText += codesMap[char];
        }
        return encodedText;
    };

    // Decodificar texto con Shannon-Fano
    const decodeShannonFano = (encodedText, codesMap) => {
        let decodedText = '';
        let currentCode = '';
        const reverseCodesMap = Object.fromEntries(Object.entries(codesMap).map(([key, value]) => [value, key]));

        for (let bit of encodedText) {
            currentCode += bit;
            if (reverseCodesMap[currentCode]) {
                decodedText += reverseCodesMap[currentCode];
                currentCode = '';
            }
        }
        return decodedText;
    };


    // --- Funciones auxiliares para métricas ---

    // Calcular tamaño en bits
    const stringToBits = (str) => {
        return str.length * 8; // Suponiendo ASCII o UTF-8 de 8 bits por carácter
    };

    // Calcular la entropía (bits por símbolo)
    const calculateEntropy = (frequencies, totalSymbols) => {
        let entropy = 0;
        for (let char in frequencies) {
            const prob = frequencies[char] / totalSymbols;
            if (prob > 0) {
                entropy -= prob * Math.log2(prob);
            }
        }
        return entropy;
    };

    // Calcular longitud promedio del código
    const calculateAverageCodeLength = (frequencies, codes, totalSymbols) => {
        let avgLength = 0;
        for (let char in frequencies) {
            const prob = frequencies[char] / totalSymbols;
            if (codes[char]) {
                avgLength += prob * codes[char].length;
            }
        }
        return avgLength;
    };

    // Calcular tasa de compresión
    const calculateCompressionRatio = (originalBits, compressedBits) => {
        if (originalBits === 0) return 0;
        return (1 - (compressedBits / originalBits)) * 100;
    };

    // Calcular eficiencia
    const calculateEfficiency = (averageCodeLength, entropy) => {
        if (averageCodeLength === 0) return 0;
        return (entropy / averageCodeLength) * 100;
    };

    // --- Manejo de la lógica principal de compresión/descompresión ---
    const handleCompress = () => {
        if (!inputText) {
            setMessage('Por favor, ingrese o cargue un texto antes de comprimir.');
            return;
        }
        setMessage(''); // Limpia el mensaje al inicio de cada nueva compresión

        const frequencies = getFrequencies(inputText);
        const totalSymbols = inputText.length;
        const originalTextBytes = new TextEncoder().encode(inputText).length;
        setOriginalBytes(originalTextBytes);

        // Calcular Entropía
        const calculatedEntropy = calculateEntropy(frequencies, totalSymbols);
        setEntropy(calculatedEntropy);

        // --- Huffman ---
        const huffmanTree = buildHuffmanTree(frequencies);
        const huffmanCodes = generateHuffmanCodes(huffmanTree);
        const encodedHuffmanText = encodeHuffman(inputText, huffmanCodes);
        const decodedHuffmanText = decodeHuffman(encodedHuffmanText, huffmanTree);

        const huffmanTableData = Object.keys(huffmanCodes).map(char => ({
            symbol: char === '\n' ? '\\n' : char === ' ' ? 'Space' : char, // Representar saltos de línea y espacios
            frequency: frequencies[char],
            code: huffmanCodes[char],
            length: huffmanCodes[char].length
        }));
        setHuffmanTable(huffmanTableData);

        const avgLengthHuffman = calculateAverageCodeLength(frequencies, huffmanCodes, totalSymbols);
        setHuffmanAvgLength(avgLengthHuffman);

        const compressedHuffmanBits = encodedHuffmanText.length;
        const originalTextBits = originalTextBytes * 8; // Convertir bytes a bits
        setHuffmanCompressionRatio(calculateCompressionRatio(originalTextBits, compressedHuffmanBits));
        setHuffmanEfficiency(calculateEfficiency(avgLengthHuffman, calculatedEntropy));

        setEncodedHuffman(encodedHuffmanText);
        setDecodedHuffman(decodedHuffmanText);

        // --- Shannon-Fano ---
        const shannonFanoSymbols = generateShannonFanoCodes(frequencies);
        const shannonFanoCodesMap = shannonFanoSymbols.reduce((acc, s) => ({ ...acc, [s.char]: s.code }), {});
        const encodedShannonFanoText = encodeShannonFano(inputText, shannonFanoCodesMap);
        const decodedShannonFanoText = decodeShannonFano(encodedShannonFanoText, shannonFanoCodesMap);

        const shannonFanoTableData = shannonFanoSymbols.map(s => ({
            symbol: s.char === '\n' ? '\\n' : s.char === ' ' ? 'Space' : s.char,
            frequency: frequencies[s.char],
            code: s.code,
            length: s.code.length
        }));
        setShannonFanoTable(shannonFanoTableData);

        const avgLengthShannonFano = calculateAverageCodeLength(frequencies, shannonFanoCodesMap, totalSymbols);
        setShannonFanoAvgLength(avgLengthShannonFano);

        const compressedShannonFanoBits = encodedShannonFanoText.length;
        setShannonFanoCompressionRatio(calculateCompressionRatio(originalTextBits, compressedShannonFanoBits));
        setShannonFanoEfficiency(calculateEfficiency(avgLengthShannonFano, calculatedEntropy));

        setEncodedShannonFano(encodedShannonFanoText);
        setDecodedShannonFano(decodedShannonFanoText);
    };


    // --- Manejo de la carga de archivos ---
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.type !== 'text/plain') {
                setMessage('Por favor, cargue solo archivos .txt.');
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                setInputText(e.target.result);
                setMessage('');
            };
            reader.onerror = () => {
                setMessage('Error al leer el archivo.');
            };
            reader.readAsText(file);
        }
    };

    // --- Datos para los gráficos de Chart.js ---

    const compressionData = {
        labels: ['Huffman', 'Shannon-Fano'],
        datasets: [
            {
                label: 'Tasa de Compresión (%)',
                data: [huffmanCompressionRatio.toFixed(2), shannonFanoCompressionRatio.toFixed(2)],
                backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)'],
                borderColor: ['rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)'],
                borderWidth: 1,
            },
        ],
    };

    const efficiencyData = {
        labels: ['Huffman', 'Shannon-Fano', 'Teórico (Entropía)'],
        datasets: [
            {
                label: 'Eficiencia (%)',
                data: [huffmanEfficiency.toFixed(2), shannonFanoEfficiency.toFixed(2), (entropy > 0 ? 100 : 0)], // Entropía como 100% de eficiencia teórica
                backgroundColor: ['rgba(255, 159, 64, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 99, 132, 0.6)'],
                borderColor: ['rgba(255, 159, 64, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)'],
                borderWidth: 1,
            },
        ],
    };

    const avgLengthData = {
        labels: ['Huffman', 'Shannon-Fano', 'Entropía (bits/símbolo)'],
        datasets: [
            {
                label: 'Longitud Promedio del Código (bits/símbolo)',
                data: [huffmanAvgLength.toFixed(2), shannonFanoAvgLength.toFixed(2), entropy.toFixed(2)],
                backgroundColor: ['rgba(200, 200, 50, 0.6)', 'rgba(100, 100, 250, 0.6)', 'rgba(250, 50, 200, 0.6)'],
                borderColor: ['rgba(200, 200, 50, 1)', 'rgba(100, 100, 250, 1)', 'rgba(250, 50, 200, 1)'],
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    font: {
                        size: 14,
                        family: 'Inter, sans-serif'
                    }
                }
            },
            tooltip: {
                titleFont: {
                    family: 'Inter, sans-serif'
                },
                bodyFont: {
                    family: 'Inter, sans-serif'
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    font: {
                        family: 'Inter, sans-serif'
                    }
                }
            },
            y: {
                ticks: {
                    font: {
                        family: 'Inter, sans-serif'
                    }
                }
            }
        }
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-8 font-inter text-gray-800">
            <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl p-8 space-y-12">
                {/* Encabezado */}
                <header className="text-center">
                    <h1 className="text-5xl font-extrabold text-indigo-700 mb-4">
                        Compresor de Datos 
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
                             ✨
                        </span>
                    </h1>
                    <p className="text-xl text-gray-600">
                        Algoritmos de Huffman y Shannon-Fano
                    </p>
                </header>

                {/* Sección de entrada de texto */}
                <section className="bg-indigo-50 p-6 rounded-2xl shadow-inner border border-indigo-200">
                    <h2 className="text-3xl font-bold text-indigo-700 mb-6 flex items-center">
                        <svg className="w-8 h-8 mr-3 text-indigo-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M9 2a1 1 0 00-1 1v1H5a2 2 0 00-2 2v8a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2h-3V3a1 1 0 10-2 0v1H9zM5 9h10v7H5V9z" clipRule="evenodd"></path></svg>
                        Carga de Texto
                    </h2>
                    <div className="flex flex-col md:flex-row gap-6">
                        <textarea
                            className="flex-1 p-4 rounded-xl border-2 border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 resize-y min-h-[150px] text-gray-800 text-lg shadow-sm transition-all duration-300"
                            placeholder="Ingrese su texto aquí para comprimir..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                        ></textarea>
                        <div className="flex flex-col justify-center items-center md:items-start gap-4">
                            <label className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl cursor-pointer shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                                <input type="file" accept=".txt" onChange={handleFileUpload} className="hidden" />
                                Cargar archivo .txt
                                <svg className="inline-block w-5 h-5 ml-2 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                            </label>
                            <button
                                onClick={handleCompress}
                                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center"
                            >
                                Comprimir {/* Icono eliminado aquí */}
                            </button>
                        </div>
                    </div>
                    {message && (
                        <p className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm whitespace-pre-wrap break-words">
                            {message}
                        </p>
                    )}
                </section>

                {/* Sección de resultados de Huffman */}
                <section className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                        <span className="inline-block bg-blue-200 text-blue-700 rounded-full p-2 mr-3">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        </span>
                        Algoritmo de Huffman
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-2xl font-semibold text-blue-600 mb-4">Tabla de Codificación</h3>
                            <div className="overflow-x-auto rounded-xl border border-blue-200 shadow-md">
                                <table className="min-w-full divide-y divide-blue-200 bg-white">
                                    <thead className="bg-blue-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider rounded-tl-xl">Símbolo</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Frecuencia</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Código Binario</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Longitud</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-blue-100">
                                        {huffmanTable.map((row, index) => (
                                            <tr key={index} className="hover:bg-blue-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.symbol}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{row.frequency}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono break-all">{row.code}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{row.length}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <p className="mt-4 text-gray-700 text-lg">
                                Longitud promedio del código: <span className="font-semibold text-blue-600">{huffmanAvgLength.toFixed(4)}</span> bits/símbolo
                            </p>
                        </div>
                        <div>
                            <h3 className="text-2xl font-semibold text-blue-600 mb-4">Texto Comprimido</h3>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 overflow-auto max-h-40 text-sm font-mono text-gray-800 shadow-inner">
                                <p className="break-all">{encodedHuffman}</p>
                            </div>

                            <h3 className="text-2xl font-semibold text-blue-600 mt-6 mb-4">Texto Decodificado</h3>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 overflow-auto max-h-40 text-base text-gray-800 shadow-inner">
                                <p>{decodedHuffman}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Sección de resultados de Shannon-Fano */}
                <section className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                        <span className="inline-block bg-green-200 text-green-700 rounded-full p-2 mr-3">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                        </span>
                        Algoritmo de Shannon-Fano
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-2xl font-semibold text-green-600 mb-4">Tabla de Codificación</h3>
                            <div className="overflow-x-auto rounded-xl border border-green-200 shadow-md">
                                <table className="min-w-full divide-y divide-green-200 bg-white">
                                    <thead className="bg-green-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider rounded-tl-xl">Símbolo</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Frecuencia</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Código Binario</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Longitud</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-green-100">
                                        {shannonFanoTable.map((row, index) => (
                                            <tr key={index} className="hover:bg-green-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.symbol}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{row.frequency}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono break-all">{row.code}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{row.length}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <p className="mt-4 text-gray-700 text-lg">
                                Longitud promedio del código: <span className="font-semibold text-green-600">{shannonFanoAvgLength.toFixed(4)}</span> bits/símbolo
                            </p>
                        </div>
                        <div>
                            <h3 className="text-2xl font-semibold text-green-600 mb-4">Texto Comprimido</h3>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 overflow-auto max-h-40 text-sm font-mono text-gray-800 shadow-inner">
                                <p className="break-all">{encodedShannonFano}</p>
                            </div>

                            <h3 className="text-2xl font-semibold text-green-600 mt-6 mb-4">Texto Decodificado</h3>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 overflow-auto max-h-40 text-base text-gray-800 shadow-inner">
                                <p>{decodedShannonFano}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Sección de Comparación de Resultados */}
                <section className="bg-indigo-50 p-8 rounded-2xl shadow-xl border border-indigo-200">
                    <h2 className="text-3xl font-bold text-indigo-700 mb-8 text-center flex items-center justify-center">
                        <svg className="w-8 h-8 mr-3 text-indigo-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l3 3a1 1 0 001.414-1.414L11 9.586V6z" clipRule="evenodd"></path></svg>
                        Comparación de Resultados
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Gráfico de Tasa de Compresión */}
                        <div className="bg-white p-6 rounded-xl shadow-md border border-indigo-100 flex flex-col items-center">
                            <h3 className="text-xl font-semibold text-indigo-700 mb-4">Tasa de Compresión</h3>
                            <div className="relative w-full h-64">
                                <Bar ref={compressionChartRef} data={compressionData} options={chartOptions} />
                            </div>
                            <p className="mt-4 text-sm text-gray-600 text-center">
                                Cuanto mayor sea el porcentaje, mejor la compresión.
                            </p>
                        </div>

                        {/* Gráfico de Eficiencia */}
                        <div className="bg-white p-6 rounded-xl shadow-md border border-indigo-100 flex flex-col items-center">
                            <h3 className="text-xl font-semibold text-indigo-700 mb-4">Eficiencia del Código</h3>
                            <div className="relative w-full h-64">
                                <Bar ref={efficiencyChartRef} data={efficiencyData} options={chartOptions} />
                            </div>
                            <p className="mt-4 text-sm text-gray-600 text-center">
                                Comparación con la eficiencia teórica (entropía).
                            </p>
                        </div>

                        {/* Gráfico de Longitud Promedio del Código */}
                        <div className="bg-white p-6 rounded-xl shadow-md border border-indigo-100 flex flex-col items-center">
                            <h3 className="text-xl font-semibold text-indigo-700 mb-4">Longitud Promedio del Código</h3>
                            <div className="relative w-full h-64">
                                <Bar data={avgLengthData} options={chartOptions} />
                            </div>
                            <p className="mt-4 text-sm text-gray-600 text-center">
                                Cuanto menor, más eficiente el código en promedio.
                            </p>
                        </div>
                    </div>

                    <div className="mt-10 text-center text-lg text-gray-700">
                        <p className="font-semibold mb-2">Resumen de Métricas:</p>
                        <p>Tamaño Original del Texto: <span className="font-bold text-indigo-600">{originalBytes}</span> bytes</p>
                        <p>Entropía Teórica (Límite de Shannon): <span className="font-bold text-indigo-600">{entropy.toFixed(4)}</span> bits/símbolo</p>
                        <p>Longitud Huffman Comprimido: <span className="font-bold text-blue-600">{encodedHuffman.length}</span> bits</p>
                        <p>Longitud Shannon-Fano Comprimido: <span className="font-bold text-green-600">{encodedShannonFano.length}</span> bits</p>
                    </div>
                </section>

                {/* Pie de página */}
                <footer className="text-center text-gray-500 text-sm mt-12">
                    Desarrollado con React, Chart.js y Tailwind CSS.
                </footer>
            </div>
        </div>
    );
};

export default App;