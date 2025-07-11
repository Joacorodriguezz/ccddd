// ✅ ARCHIVO COMPLETO MODIFICADO - App.jsx

import React, { useState, useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Componente para visualizar el árbol de Huffman con pan y zoom
const HuffmanTreeVisualization = ({ tree, codes }) => {
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const svgRef = useRef(null);
    const internalNodeCounter = useRef(1); // Contador para nodos internos

    if (!tree) return null;

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    };
    const handleMouseMove = (e) => {
        if (isDragging) {
            setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
        }
    };
    const handleMouseUp = () => setIsDragging(false);
    const handleWheel = (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.max(0.4, Math.min(2.5, zoom * delta));
        setZoom(newZoom);
    };
    const handleDoubleClick = () => {
        setPan({ x: 0, y: 0 });
        setZoom(1);
    };

    // Construye un árbol completo para asegurar ramas simétricas
    const completeTree = (node, depth = 0) => {
        if (!node) return null;
        const newNode = { ...node };
        if (!newNode.left && !newNode.right && newNode.char === null) return null;
        if (newNode.char !== null) return newNode;
        newNode.left = newNode.left || { char: null, freq: 0, left: null, right: null };
        newNode.right = newNode.right || { char: null, freq: 0, left: null, right: null };
        newNode.left = completeTree(newNode.left, depth + 1);
        newNode.right = completeTree(newNode.right, depth + 1);
        return newNode;
    };

    const completedTree = completeTree(tree);

    // Modificado: agrega un contador para los nodos internos
    const renderTree = (node, x, y, spacing, level = 0, internalCounter = { value: 1 }) => {
        if (!node) return null;

        const nodeWidth = 45;
        const nodeHeight = 30;
        const verticalSpacing = 70;

        const nodeColor = node.char !== null ? '#3B82F6' : '#10B981';
        const textColor = node.char !== null ? 'white' : 'black';
        let displayText;
        if (node.char !== null) {
            displayText = node.char === ' ' ? 'Space' : node.char === '\n' ? '\\n' : node.char;
        } else {
            displayText = `nodo ${internalCounter.value++}`;
        }

        const leftX = x - spacing / 2;
        const rightX = x + spacing / 2;
        const nextY = y + verticalSpacing;

        return (
            <g key={`${x}-${y}-${level}`}>
                {node.left && (
                    <>
                        <line x1={x} y1={y + nodeHeight} x2={leftX} y2={nextY} stroke="#6B7280" strokeWidth="2" />
                        <text x={(x + leftX) / 2 - 5} y={(y + nextY) / 2} fontSize="10" fill="#6B7280">0</text>
                        {renderTree(node.left, leftX, nextY, spacing / 2, level + 1, internalCounter)}
                    </>
                )}
                {node.right && (
                    <>
                        <line x1={x} y1={y + nodeHeight} x2={rightX} y2={nextY} stroke="#6B7280" strokeWidth="2" />
                        <text x={(x + rightX) / 2 + 5} y={(y + nextY) / 2} fontSize="10" fill="#6B7280">1</text>
                        {renderTree(node.right, rightX, nextY, spacing / 2, level + 1, internalCounter)}
                    </>
                )}
                <rect
                    x={x - nodeWidth / 2}
                    y={y}
                    width={nodeWidth}
                    height={nodeHeight}
                    rx="8"
                    fill={nodeColor}
                    stroke="#1F2937"
                    strokeWidth="2"
                />
                <text
                    x={x}
                    y={y + nodeHeight / 2 + 4}
                    textAnchor="middle"
                    fill={textColor}
                    fontSize="10"
                    fontWeight="bold"
                >
                    {displayText}
                </text>
                {node.char !== null && codes[node.char] && (
                    <text
                        x={x}
                        y={y + nodeHeight + 12}
                        textAnchor="middle"
                        fill="#6B7280"
                        fontSize="8"
                        fontFamily="monospace"
                    >
                        {codes[node.char]}
                    </text>
                )}
            </g>
        );
    };

    const svgWidth = 900;
    const svgHeight = 500;
    const centerX = svgWidth / 2;
    const startY = 20;

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-blue-200">
            <h3 className="text-xl font-semibold text-blue-600 mb-4">Árbol de Huffman Interactivo</h3>
            <p className="text-sm text-gray-600 mb-4">
                Arrastra con el mouse para mover el diagrama, usa la rueda del mouse para hacer zoom. 
                Doble clic para centrar y resetear zoom.
            </p>
            <div
                className="huffman-tree-container w-full"
                style={{ height: '500px' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
                onDoubleClick={handleDoubleClick}
            >
                <svg
                    ref={svgRef}
                    width="100%"
                    height="100%"
                    style={{ cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none' }}
                >
                    <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                        {renderTree(completedTree, centerX, startY, svgWidth / 2, 0, { value: 1 })}
                    </g>
                </svg>
            </div>
        </div>
    );
};


const App = () => {
    const [inputText, setInputText] = useState("aaaaabcde");
    const [originalBytes, setOriginalBytes] = useState(0);
    const [encodedHuffman, setEncodedHuffman] = useState('');
    const [decodedHuffman, setDecodedHuffman] = useState('');
    const [huffmanTable, setHuffmanTable] = useState([]);
    const [huffmanAvgLength, setHuffmanAvgLength] = useState(0);
    const [huffmanCompressionRatio, setHuffmanCompressionRatio] = useState(0);
    const [huffmanEfficiency, setHuffmanEfficiency] = useState(0);
    const [huffmanTree, setHuffmanTree] = useState(null);
    const [huffmanCodes, setHuffmanCodes] = useState({});

    const [encodedShannonFano, setEncodedShannonFano] = useState('');
    const [decodedShannonFano, setDecodedShannonFano] = useState('');
    const [shannonFanoTable, setShannonFanoTable] = useState([]);
    const [shannonFanoAvgLength, setShannonFanoAvgLength] = useState(0);
    const [shannonFanoCompressionRatio, setShannonFanoCompressionRatio] = useState(0);
    const [shannonFanoEfficiency, setShannonFanoEfficiency] = useState(0);

    const [message, setMessage] = useState('');
    const [entropy, setEntropy] = useState(0);

    const compressionChartRef = useRef(null);
    const efficiencyChartRef = useRef(null);

    class HuffmanNode {
        constructor(char, freq, left = null, right = null) {
            this.char = char;
            this.freq = freq;
            this.left = left;
            this.right = right;
        }
    }

    // NUEVO: función para agrupar en bigramas
    const toBigrams = (text) => {
        const bigrams = [];
        for (let i = 0; i < text.length; i += 2) {
            bigrams.push(text.slice(i, i + 2));
        }
        return bigrams;
    };

    const getFrequencies = (text, useBigrams = false) => {
        const frequencies = {};
        const units = useBigrams ? toBigrams(text) : text.split('');
        for (let unit of units) {
            frequencies[unit] = (frequencies[unit] || 0) + 1;
        }
        return frequencies;
    };

    const buildHuffmanTree = (frequencies) => {
        let nodes = Object.keys(frequencies).map(char => new HuffmanNode(char, frequencies[char]));
        nodes.sort((a, b) => a.freq - b.freq);
        while (nodes.length > 1) {
            const left = nodes.shift();
            const right = nodes.shift();
            const newNode = new HuffmanNode(null, left.freq + right.freq, left, right);
            nodes.push(newNode);
            nodes.sort((a, b) => a.freq - b.freq);
        }
        return nodes[0];
    };

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

    const encodeHuffman = (text, codes) => text.split('').map(char => codes[char]).join('');

    const decodeHuffman = (encodedText, tree) => {
        let decodedText = '';
        let currentNode = tree;
        for (let bit of encodedText) {
            currentNode = bit === '0' ? currentNode.left : currentNode.right;
            if (currentNode.char !== null) {
                decodedText += currentNode.char;
                currentNode = tree;
            }
        }
        return decodedText;
    };

    // Corregido: Shannon-Fano para bigramas y división correcta
    const generateShannonFanoCodes = (frequencies) => {
        let symbols = Object.keys(frequencies).map(char => ({ char, freq: frequencies[char], code: '' }));
        // Ordenar por probabilidad descendente
        symbols.sort((a, b) => b.freq - a.freq);

        const divide = (arr) => {
            if (arr.length <= 1) return;
            // Ordenar por probabilidad descendente en cada división
            arr.sort((a, b) => b.freq - a.freq);
            let total = arr.reduce((sum, s) => sum + s.freq, 0);
            let acc = 0, splitIndex = -1, minDiff = Infinity;
            for (let i = 0; i < arr.length - 1; i++) {
                acc += arr[i].freq;
                let diff = Math.abs(total / 2 - acc);
                if (diff < minDiff) {
                    minDiff = diff;
                    splitIndex = i;
                }
            }
            const group1 = arr.slice(0, splitIndex + 1);
            const group2 = arr.slice(splitIndex + 1);
            group1.forEach(s => s.code += '0');
            group2.forEach(s => s.code += '1');
            divide(group1);
            divide(group2);
        };

        divide(symbols);
        // Ordenar por probabilidad descendente para la tabla
        symbols.sort((a, b) => b.freq - a.freq);
        return symbols;
    };

    // Construye el árbol de Shannon-Fano y devuelve la raíz
    function buildShannonFanoTree(symbols) {
        if (symbols.length === 1) {
            return { char: symbols[0].char, freq: symbols[0].freq, left: null, right: null };
        }
        // Ordenar por frecuencia descendente
        symbols.sort((a, b) => b.freq - a.freq);
        let total = symbols.reduce((sum, s) => sum + s.freq, 0);
        let acc = 0, splitIndex = -1, minDiff = Infinity;
        for (let i = 0; i < symbols.length - 1; i++) {
            acc += symbols[i].freq;
            let diff = Math.abs(total / 2 - acc);
            if (diff < minDiff) {
                minDiff = diff;
                splitIndex = i;
            }
        }
        const leftGroup = symbols.slice(0, splitIndex + 1);
        const rightGroup = symbols.slice(splitIndex + 1);
        return {
            char: null,
            freq: total,
            left: buildShannonFanoTree(leftGroup),
            right: buildShannonFanoTree(rightGroup)
        };
    }

    const encodeShannonFano = (text, codesMap) => text.split('').map(char => codesMap[char]).join('');

    const decodeShannonFano = (encodedText, codesMap) => {
        let decoded = '', buffer = '';
        const reverseMap = Object.fromEntries(Object.entries(codesMap).map(([k, v]) => [v, k]));
        for (let bit of encodedText) {
            buffer += bit;
            if (reverseMap[buffer]) {
                decoded += reverseMap[buffer];
                buffer = '';
            }
        }
        return decoded;
    };

    const calculateEntropy = (frequencies, total) => {
        return Object.values(frequencies).reduce((sum, f) => {
            let p = f / total;
            return p > 0 ? sum - p * Math.log2(p) : sum;
        }, 0);
    };

    const calculateAverageCodeLength = (frequencies, codes, total) => {
        return Object.keys(frequencies).reduce((sum, char) => {
            const p = frequencies[char] / total;
            return sum + p * codes[char].length;
        }, 0);
    };

    const calculateCompressionRatio = (originalBits, compressedBits) => originalBits === 0 ? 0 : (1 - (compressedBits / originalBits)) * 100;
    const calculateEfficiency = (avgLength, entropy) => avgLength === 0 ? 0 : (entropy / avgLength) * 100;

    const handleCompress = () => {
        if (!inputText) return setMessage('Ingrese texto.');
        setMessage('');

        // --- CAMBIO: usar bigramas ---
        const useBigrams = true; // Cambia a false si quieres volver a símbolos individuales
        const frequencies = getFrequencies(inputText, useBigrams);
        const totalSymbols = useBigrams ? Math.ceil(inputText.length / 2) : inputText.length;
        const originalTextBytes = new TextEncoder().encode(inputText).length;
        setOriginalBytes(originalTextBytes);

        const calculatedEntropy = calculateEntropy(frequencies, totalSymbols);
        setEntropy(calculatedEntropy);

        // HUFFMAN
        const tree = buildHuffmanTree(frequencies);
        const codes = generateHuffmanCodes(tree);
        // --- Codificar usando bigramas ---
        const units = useBigrams ? toBigrams(inputText) : inputText.split('');
        const encoded = units.map(char => codes[char]).join('');
        // Decodificar
        let decoded = '';
        if (useBigrams) {
            let currentNode = tree;
            let buffer = '';
            for (let bit of encoded) {
                currentNode = bit === '0' ? currentNode.left : currentNode.right;
                if (currentNode.char !== null) {
                    decoded += currentNode.char;
                    currentNode = tree;
                }
            }
        } else {
            decoded = decodeHuffman(encoded, tree);
        }

        setHuffmanTable(Object.keys(codes).map(char => {
            const freq = frequencies[char];
            const prob = freq / totalSymbols;
            const code = codes[char];
            const len = code.length;
            return {
                symbol: char,
                frequency: freq,
                probability: prob,
                code,
                length: len,
                weightedLength: parseFloat((prob * len).toFixed(4))
            };
        }));

        const avgLen = calculateAverageCodeLength(frequencies, codes, totalSymbols);
        setHuffmanAvgLength(avgLen);
        const compressedBits = encoded.length;
        const originalBits = originalTextBytes * 8;
        setHuffmanCompressionRatio(calculateCompressionRatio(originalBits, compressedBits));
        setHuffmanEfficiency(calculateEfficiency(avgLen, calculatedEntropy));
        setEncodedHuffman(encoded);
        setDecodedHuffman(decoded);
        setHuffmanTree(tree);
        setHuffmanCodes(codes);

        // SHANNON-FANO (corregido para bigramas y división correcta)
        const symbols = generateShannonFanoCodes(frequencies);
        const map = symbols.reduce((acc, s) => ({ ...acc, [s.char]: s.code }), {});
        // Codificar usando bigramas
        const unitsSF = useBigrams ? toBigrams(inputText) : inputText.split('');
        const encodedSF = unitsSF.map(char => map[char]).join('');
        // Decodificar
        let decodedSF = '';
        if (useBigrams) {
            let buffer = '';
            const reverseMap = Object.fromEntries(Object.entries(map).map(([k, v]) => [v, k]));
            for (let bit of encodedSF) {
                buffer += bit;
                if (reverseMap[buffer]) {
                    decodedSF += reverseMap[buffer];
                    buffer = '';
                }
            }
        } else {
            decodedSF = decodeShannonFano(encodedSF, map);
        }

        setShannonFanoTable(symbols.map(s => {
            const freq = frequencies[s.char];
            const prob = freq / totalSymbols;
            const len = s.code.length;
            return {
                symbol: s.char,
                frequency: freq,
                probability: prob,
                code: s.code,
                length: len,
                weightedLength: parseFloat((prob * len).toFixed(4))
            };
        }));
        const avgSF = calculateAverageCodeLength(frequencies, map, totalSymbols);
        setShannonFanoAvgLength(avgSF);
        setShannonFanoCompressionRatio(calculateCompressionRatio(originalBits, encodedSF.length));
        setShannonFanoEfficiency(calculateEfficiency(avgSF, calculatedEntropy));
        setEncodedShannonFano(encodedSF);
        setDecodedShannonFano(decodedSF);
        const shannonFanoTree = buildShannonFanoTree(symbols);
        setHuffmanTree(shannonFanoTree); // Esto hará que el árbol visualizado sea el de Shannon-Fano
        setHuffmanCodes(map); // Y los códigos también serán los de Shannon-Fano
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => setInputText(e.target.result);
        reader.readAsText(file);
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
                data: [ huffmanAvgLength.toFixed(4), shannonFanoAvgLength.toFixed(4), entropy.toFixed(4)],
                backgroundColor: ['rgba(200, 200, 50, 0.6)', 'rgba(100, 100, 250, 0.6)', 'rgba(2, 2, 2, 0.6)'],
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

    function decodeHuffmanCode(code, tree) {
      let node = tree;
      for (let bit of code) {
        if (bit === "0") {
          node = node.left;
        } else if (bit === "1") {
          node = node.right;
        } else {
          return null; // bit inválido
        }
        if (!node) return null; // código inválido
      }
      return node.char || null;
    }


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
                    
                    {/* Visualización del Árbol de Huffman */}
                    <div className="mb-8">
                        <HuffmanTreeVisualization tree={huffmanTree} codes={huffmanCodes} />
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
                            <div className="overflow-x-auto rounded-xl border-2 border-green-400 shadow-md">
                                <table className="min-w-full divide-y divide-green-200 bg-white text-center" style={{ borderCollapse: 'collapse' }}>
                                    <thead className="bg-green-50">
                                        <tr>
                                            <th className="px-6 py-3 text-xs font-bold text-green-700 uppercase tracking-wider border border-green-300">Símbolo</th>
                                            <th className="px-6 py-3 text-xs font-bold text-green-700 uppercase tracking-wider border border-green-300">Probabilidad</th>
                                            <th className="px-6 py-3 text-xs font-bold text-green-700 uppercase tracking-wider border border-green-300">Codificación</th>
                                            <th className="px-6 py-3 text-xs font-bold text-green-700 uppercase tracking-wider border border-green-300">Longitud palabra</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-green-100">
                                        {shannonFanoTable
                                            .slice()
                                            .sort((a, b) => b.probability - a.probability)
                                            .map((row, index) => (
                                                <tr key={index} className="hover:bg-green-50">
                                                    <td className="px-6 py-3 border border-green-200 font-mono">{row.symbol}</td>
                                                    <td className="px-6 py-3 border border-green-200">{row.probability.toFixed(3)}</td>
                                                    <td className="px-6 py-3 border border-green-200 font-mono">{row.code}</td>
                                                    <td className="px-6 py-3 border border-green-200">{(row.probability * row.length).toFixed(3)}</td>
                                                </tr>
                                        ))}
                                        <tr className="bg-green-100 font-bold">
                                            <td colSpan={3} className="px-6 py-3 border border-green-300 text-right">Σ L =</td>
                                            <td className="px-6 py-3 border border-green-300">{shannonFanoTable.reduce((acc, row) => acc + row.probability * row.length, 0).toFixed(3)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl text-left">
                                <div className="mb-2 font-semibold text-green-700">Cálculo de la eficiencia</div>
                                <div className="font-mono text-sm text-gray-700">
                                    <div>H = {shannonFanoTable.map(row => `(${row.probability.toFixed(3)}·${row.length})`).join(' + ')} = {shannonFanoAvgLength.toFixed(3)} bits/símbolo</div>
                                    <div className="mt-2">Entropía (H): <span className="font-bold">{entropy.toFixed(3)}</span> bits/símbolo</div>
                                    <div>Eficiencia: <span className="font-bold">{((entropy / shannonFanoAvgLength) * 100).toFixed(1)}%</span></div>
                                </div>
                            </div>
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
                        <p>Longitud Huffman Comprimido: <span className="font-bold text-blue-600">{encodedHuffman.length.toFixed(4)}</span> bits</p>
                        <p>Longitud Shannon-Fano Comprimido: <span className="font-bold text-green-600">{encodedShannonFano.length.toFixed(4)}</span> bits</p>
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