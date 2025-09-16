'use client'

import { useState } from 'react';
import Image from 'next/image';

export default function RifaPage() {
  const [formData, setFormData] = useState({
    phone: '',
    document: '',
    tickets: 1
  });
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState(null);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const TICKET_PRICE = 3.49;

  const formatCurrency = (value) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const formatDocument = (value) => {
    return value.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (value) => {
    return value.replace(/\D/g, '').replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const generateIdentifier = () => {
    return `rifa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setPixData(null);
    setDebugInfo('');

    try {
      const identifier = generateIdentifier();
      const cleanPhone = formData.phone.replace(/\D/g, '');
      const cleanDocument = formData.document.replace(/\D/g, '');
      const valor = Number((formData.tickets * TICKET_PRICE).toFixed(2));

      // Validações no frontend
      if (cleanPhone.length < 10) {
        throw new Error('Telefone deve ter pelo menos 10 dígitos');
      }

      if (formData.tickets <= 0) {
        throw new Error('Quantidade de bilhetes deve ser maior que zero');
      }

      // Preparar dados para envio
      const requestBody = {
        identifier: identifier,
        amount: valor,
        phone: cleanPhone,
        document: "70530854147",
        tickets: formData.tickets
      };

      // Só incluir documento se for válido (11 dígitos)
      if (cleanDocument.length === 11) {
        requestBody.document = cleanDocument;
      }

      console.log('Dados enviados:', requestBody);
      setDebugInfo(`Enviando dados: ${JSON.stringify(requestBody, null, 2)}`);

      const response = await fetch('/api/create-pix-payment/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('Erro da API:', responseData);
        setDebugInfo(`Erro da API: ${JSON.stringify(responseData, null, 2)}`);
        throw new Error(responseData.message || `Erro ${response.status}: ${response.statusText}`);
      }

      console.log('Resposta da API:', responseData);
      setPixData(responseData);

    } catch (err) {
      console.error('Erro completo:', err);
      setError(err.message || 'Erro ao processar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const copyPixCode = () => {
    const code = pixData?.pix?.code || pixData?.code;
    if (code) {
      navigator.clipboard.writeText(code);
      // Toast visual
      const toast = document.createElement('div');
      toast.innerHTML = '✅ Código PIX copiado!';
      toast.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full font-semibold z-50 animate-bounce';
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 3000);
    }
  };

  const validateForm = () => {
    const cleanPhone = formData.phone.replace(/\D/g, '');
    return cleanPhone.length >= 10 && formData.tickets > 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 p-3 flex items-center justify-center">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl w-full max-w-md mx-auto border border-white/20 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="inline-block p-3 bg-white/20 backdrop-blur-sm rounded-full mb-4">
              <span className="text-4xl">🎯</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              🌟 RIFA DA AMANDA 🌟
            </h1>
            <p className="text-white/90 text-lg font-medium">
              Bilhetes por apenas {formatCurrency(TICKET_PRICE)}
            </p>
            <p className="text-white/90 text-lg font-medium">
              @amandaolveiraa2a
            </p>
          </div>
          {/* Elementos decorativos */}
          <div className="absolute top-2 left-2 w-4 h-4 bg-white/20 rounded-full animate-pulse"></div>
          <div className="absolute bottom-4 right-4 w-3 h-3 bg-white/30 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute top-8 right-8 w-2 h-2 bg-white/25 rounded-full animate-pulse delay-500"></div>
        </div>

        <div className="p-6">
          {!pixData ? (
            <div className="space-y-5">
              {/* Telefone */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700">
                  <span className="mr-2">📱</span>
                  Telefone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => {
                    const formatted = formatPhone(e.target.value);
                    setFormData(prev => ({ ...prev, phone: formatted }));
                  }}
                  maxLength="15"
                  className="w-full p-4 text-base border-2 border-gray-200 rounded-2xl focus:border-pink-400 focus:outline-none transition-all duration-300 focus:shadow-lg focus:shadow-pink-100"
                  placeholder="(11) 99999-9999"
                />
              </div>

              {/* CPF - OPCIONAL */}

              {/* Quantidade de Tickets */}
              <div className="space-y-3">
                <label className="flex items-center text-sm font-semibold text-gray-700">
                  <span className="mr-2">🎫</span>
                  Quantidade de Bilhetes *
                </label>
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-2xl border-2 border-gray-200">
                  <div className="flex items-center justify-center space-x-4 mb-3">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        tickets: Math.max(1, prev.tickets - 1) 
                      }))}
                      className="bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-bold w-12 h-12 rounded-full text-xl transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg"
                    >
                      −
                    </button>
                    <div className="flex-1 text-center">
                      <div className="text-3xl font-bold text-gray-800 bg-white rounded-xl py-3 border-2 border-gray-200 shadow-inner">
                        {formData.tickets}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        tickets: Math.min(50,prev.tickets + 1) 
                      }))}
                      className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-bold w-12 h-12 rounded-full text-xl transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-center text-sm text-gray-600">
                    {formData.tickets} bilhete{formData.tickets > 1 ? 's' : ''} (Minimo 1 | Maximo 50)
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="bg-gradient-to-r from-emerald-400 to-green-500 p-5 rounded-2xl shadow-lg">
                <div className="text-center text-white">
                  <p className="text-sm font-medium mb-1 opacity-90">💰 Total a pagar</p>
                  <p className="text-3xl sm:text-4xl font-bold mb-1">
                    {formatCurrency(formData.tickets * TICKET_PRICE)}
                  </p>
                  <p className="text-xs opacity-90">
                    {formData.tickets} × {formatCurrency(TICKET_PRICE)}
                  </p>
                </div>
              </div>

              {/* Erro */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-xl">
                  <div className="flex items-start">
                    <span className="mr-2 mt-1">⚠️</span>
                    <div className="text-sm">{error}</div>
                  </div>
                </div>
              )}

              {/* Botão de Comprar */}
              <button
                onClick={handleSubmit}
                disabled={loading || !validateForm()}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-5 px-6 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:transform-none shadow-lg disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span>Processando...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>🛒</span>
                    <span>Comprar {formData.tickets} Bilhete{formData.tickets > 1 ? 's' : ''}</span>
                  </div>
                )}
              </button>
            </div>
          ) : (
            /* Tela PIX */
            <div className="text-center space-y-5">
              <div className="inline-block p-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mb-4 animate-bounce">
                <span className="text-4xl">🎉</span>
              </div>
              
              <h2 className="text-2xl font-bold text-green-600 mb-4">
                Pagamento Gerado!
              </h2>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-2xl border-2 border-blue-200 mb-4">
                <p className="text-lg text-gray-700 mb-2">
                  <strong>💰 Total:</strong> {formatCurrency(formData.tickets * TICKET_PRICE)}
                </p>
                <p className="text-sm text-gray-600">
                  🎫 {formData.tickets} bilhete{formData.tickets > 1 ? 's' : ''} para <strong>Amanda</strong>
                </p>
              </div>

              {/* QR Code */}
              {(pixData.pix?.base64 || pixData.base64) && (
                <div className="bg-white p-5 rounded-2xl border-2 border-gray-200 mb-5 shadow-lg">
                  <p className="text-base font-semibold text-gray-700 mb-4">
                    📱 Escaneie o QR Code:
                  </p>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <Image
                      src={`data:image/png;base64,${pixData.pix?.base64 || pixData.base64}`}
                      alt="QR Code PIX"
                      className="mx-auto max-w-full h-auto rounded-lg shadow-md"
                      width={300}
                      height={300}
                      unoptimized
                    />
                  </div>
                </div>
              )}

              {/* Código PIX */}
              {(pixData.pix?.code || pixData.code) && (
                <div className="bg-gray-50 p-5 rounded-2xl border-2 border-gray-200">
                  <p className="text-base font-semibold text-gray-700 mb-4">
                    💻 Ou copie o código PIX:
                  </p>
                  <div className="bg-white p-4 rounded-xl border text-xs font-mono break-all text-gray-800 mb-4 max-h-20 overflow-y-auto">
                    {pixData.pix?.code || pixData.code}
                  </div>
                  <button
                    onClick={copyPixCode}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
                  >
                    📋 Copiar Código PIX
                  </button>
                </div>
              )}

              <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded-xl">
                <div className="flex items-start space-x-2">
                  <span className="text-lg">⏱️</span>
                  <div className="text-sm">
                    <strong>Importante:</strong> Realize o pagamento em até 15 minutos!
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setPixData(null);
                  setError('');
                  setDebugInfo('');
                  setFormData({
                    phone: '',
                    document: '',
                    tickets: 1
                  });
                }}
                className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                🔄 Nova Compra
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}