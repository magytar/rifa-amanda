'use client'

import { useState } from 'react';

export default function RifaPage() {
  const [formData, setFormData] = useState({
    phone: '',
    document: '',
    tickets: 1
  });
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState(null);
  const [error, setError] = useState('');
  const [base64, setBase64] = useState("")
  const [codepix, setCodepix] = useState("")
  const TICKET_PRICE = 3.49;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

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

    try {
      const totalAmount = Math.round(formData.tickets * TICKET_PRICE * 100); // Converter para centavos
      const identifier = generateIdentifier();

      // Simulação da resposta da API para demonstração
      // Em produção, esta chamada deve ser feita no backend para evitar problemas de CORS
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simula delay da API

      // Simulação da resposta da API Bolt Pagamentos
      const mockData = {
        success: true,
        transaction_id: identifier,
        amount: totalAmount,
        pix_code: "00020126580014br.gov.bcb.pix013636c8ac70-c0eb-4cb2-86c5-ad5e50c9f3345204000053039865802BR5925Cliente Rifa6009SAO PAULO61080540900062070503***630445C6",
        qr_code: "iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAYAAAB5fY51AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAADh0RVh0U29mdHdhcmUAbWF0cGxvdGxpYiB2ZXJzaW9uMy4yLjIsIGh0dHA6Ly9tYXRwbG90bGliLm9yZy+WH4yJAAANdElEQVR4nO3dT6hcdxnG8eepJkEtKhqNpSZxoVZwISJeRBeCCLpQQRdCF4KCuBBcuHAhiCJuXBUXggsXLlyICC5ciBtBXQgu2oULwZULEVy4EFy4EBeuBBcuBBeuBBcuBBeuBBcuBBeuBBcuBBeuBBcuBBeuBBeuBBeuBBcuBBeuBBcuBBeuBBcuBBeuBBeuBBeuBBeuBBeuBBcuBBeuBBcuBBeuBBcuBBeuBBeuBBeuBBeuBBcuBBeuBBeuBBeuBBeuBBeuBBeuBBeuBBeuBBeuBBeuBBeuBBcuBBeuBBeuBBeuBBcuBBeuBBcuBBeuBBeuBBeuBBeuBBcuBBeuBBeuBBeuBBcuBBeuBBeu",
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutos
      };

      const valor = totalAmount/100
       
      //Código real para produção - descomente estas linhas e comente a simulação acima:
      const response = await fetch('/api/create-pix-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: identifier,
          amount: valor,
          phone: formData.phone,
          document: formData.document.replace(/\D/g, ''),
          tickets: formData.tickets
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao processar pagamento');
      }

      const data = await response.json();
      console.log(data)
      setPixData(data);
      setBase64(data.pix.base64)
      setCodepix(data.pix.code)

      setPixData(mockData);
    } catch (err) {
      setError('Erro ao processar pagamento. Tente novamente.');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyPixCode = () => {
    if (pixData?.pix_code) {
      navigator.clipboard.writeText(pixData.pix_code);
      alert('Código PIX copiado!');
    }
  };

  const validateForm = () => {
    return formData.phone && formData.document && formData.tickets > 0;
  };

  return (
    <div className="h-[100dvh] bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 p-4 flex items-center justify-center overflow-y-auto">
      <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-2xl border border-white/20">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            🎲 SUPER RIFA
          </h1>
          <p className="text-xl text-gray-600 font-medium">
            Cada bilhete por apenas {formatCurrency(TICKET_PRICE)}
          </p>
        </div>

        {!pixData ? (
          <div className="space-y-6">
            {/* Telefone */}
            <div className="space-y-2">
              <label className="block text-lg font-semibold text-gray-700">
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
                className="w-full p-4 text-lg border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="(11) 99999-9999"
              />
            </div>

            {/* CPF */}
            <div className="space-y-2">
              <label className="block text-lg font-semibold text-gray-700">
                CPF *
              </label>
              <input
                type="text"
                name="document"
                value={formData.document}
                onChange={(e) => {
                  const formatted = formatDocument(e.target.value);
                  setFormData(prev => ({ ...prev, document: formatted }));
                }}
                maxLength="14"
                className="w-full p-4 text-lg border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="000.000.000-00"
              />
            </div>

            {/* Quantidade de Tickets */}
            <div className="space-y-2">
              <label className="block text-lg font-semibold text-gray-700">
                Quantidade de Bilhetes *
              </label>
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ 
                    ...prev, 
                    tickets: Math.max(1, prev.tickets - 1) 
                  }))}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-4 rounded-xl text-xl transition-colors"
                >
                  −
                </button>
                <input
                  type="number"
                  name="tickets"
                  value={formData.tickets}
                  onChange={handleInputChange}
                  min="1"
                  className="flex-1 p-4 text-xl font-bold text-center border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ 
                    ...prev, 
                    tickets: prev.tickets + 1 
                  }))}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-4 rounded-xl text-xl transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Total */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200">
              <div className="text-center">
                <p className="text-lg text-gray-600 mb-2">Total a pagar:</p>
                <p className="text-4xl font-bold text-green-600">
                  {formatCurrency(formData.tickets * TICKET_PRICE)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {formData.tickets} bilhete{formData.tickets > 1 ? 's' : ''} × {formatCurrency(TICKET_PRICE)}
                </p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl text-center">
                {error}
              </div>
            )}

            {/* Botão de Comprar */}
            <button
              onClick={handleSubmit}
              disabled={loading || !validateForm()}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-6 px-8 rounded-xl text-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span>Processando...</span>
                </div>
              ) : (
                `💳 Comprar ${formData.tickets} Bilhete${formData.tickets > 1 ? 's' : ''}`
              )}
            </button>
          </div>
        ) : (
          /* Tela PIX */
          <div className="text-center space-y-6">
            <div className="inline-block p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4">
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            
            <h2 className="text-3xl font-bold text-green-600 mb-4">
              🎉 Pagamento Gerado!
            </h2>
            
            <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200 mb-6">
              <p className="text-lg text-gray-700 mb-4">
                <strong>Total:</strong> {formatCurrency(formData.tickets * TICKET_PRICE)}
              </p>
              <p className="text-sm text-gray-600">
                {formData.tickets} bilhete{formData.tickets > 1 ? 's' : ''} para <strong>Cliente</strong>
              </p>
            </div>

            {pixData.qr_code && (
              <div className="bg-white p-6 rounded-xl border-2 border-gray-200 mb-6">
                <p className="text-lg font-semibold text-gray-700 mb-4">
                  📱 Escaneie o QR Code:
                </p>
                <img 
                  src={`data:image/png;base64,${base64}`} 
                  alt="QR Code PIX" 
                  className="mx-auto max-w-full h-auto rounded-lg shadow-md"
                />
              </div>
            )}

            {pixData.pix_code && (
              <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200">
                <p className="text-lg font-semibold text-gray-700 mb-4">
                  💻 Ou copie o código PIX:
                </p>
                <div className="bg-white p-4 rounded-lg border text-sm font-mono break-all text-gray-800 mb-4">
                  {codepix}
                </div>
                <button
                  onClick={copyPixCode}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  📋 Copiar Código PIX
                </button>
              </div>
            )}

            <div className="bg-yellow-50 border-2 border-yellow-200 text-yellow-800 px-6 py-4 rounded-xl">
              <p className="text-sm">
                ⏱️ <strong>Importante:</strong> Realize o pagamento em até 30 minutos para garantir sua participação!
              </p>
            </div>

            <button
              onClick={() => {
                setPixData(null);
                setFormData({
                  phone: '',
                  document: '',
                  tickets: 1
                });
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              🔄 Nova Compra
            </button>
          </div>
        )}
      </div>
    </div>
  );
}