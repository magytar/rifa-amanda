// app/api/create-pix-payment/route.js
import { NextResponse } from 'next/server';

// Configurações da API
const BOLT_API_URL = 'https://api.boltpagamentos.com.br/api/v1/gateway/pix/receive';
const PUBLIC_KEY = 'amandaoliveira2025amanda_1756696279052';
const SECRET_KEY = 'd99a9f09-c420-4ae2-a457-34c4633a0d75';

export async function POST(request) {
  try {
    const body = await request.json();
    const { identifier, amount, phone, document, tickets } = body;

    console.log('📥 Dados recebidos:', JSON.stringify(body, null, 2));
    // Validações obrigatórias
    if (!identifier || !amount || !phone || !tickets) {
      console.error('❌ Dados obrigatórios ausentes');
      return NextResponse.json(
        { message: 'Dados obrigatórios: identifier, amount, phone, tickets' },
        { status: 400 }
      );
    }

    // Validar se o valor é positivo
    if (amount <= 0) {
      console.error('❌ Valor inválido:', amount);
      return NextResponse.json(
        { message: 'Valor deve ser maior que zero' },
        { status: 400 }
      );
    }

    // Validar telefone (deve ter pelo menos 10 dígitos)
    const cleanPhone = phone.toString().replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      console.error('❌ Telefone inválido:', cleanPhone);
      return NextResponse.json(
        { message: 'Telefone deve ter pelo menos 10 dígitos' },
        { status: 400 }
      );
    }

    // Preparar dados do cliente
    const clientData = {
      name: "Cliente Rifa Amanda",
      email: "cliente@rifaamanda.com",
      phone: cleanPhone
    };

    // Só adicionar documento se foi fornecido e é válido (11 dígitos para CPF)
    const cleanDocument = document ? document.toString().replace(/\D/g, '') : '';
    if (cleanDocument.length === 11) {
      clientData.document = cleanDocument;
      console.log('📄 CPF incluído nos dados');
    } else {
      console.log('📄 CPF não fornecido ou inválido, prosseguindo sem documento');
    }

    // Preparar payload para a API Bolt
    const payload = {
      identifier: identifier,
      amount: parseFloat(amount.toFixed(2)), // Garantir 2 casas decimais
      client: clientData
    };

    console.log('🚀 Enviando para Bolt API:', JSON.stringify(payload, null, 2));

    // Fazer a requisição para a API da Bolt
    const response = await fetch(BOLT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-public-key': PUBLIC_KEY,
        'x-secret-key': SECRET_KEY,
        'User-Agent': 'RifaAmanda/1.0'
      },
      body: JSON.stringify(payload)
    });

    console.log('📡 Status da resposta Bolt:', response.status);
    console.log('📡 Headers da resposta:', Object.fromEntries(response.headers.entries()));

    // Tentar ler a resposta
    let responseData;
    const contentType = response.headers.get('content-type');
    
    try {
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        const textData = await response.text();
        console.log('📄 Resposta em texto:', textData);
        responseData = { rawResponse: textData };
      }
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse da resposta:', parseError);
      responseData = { error: 'Erro ao processar resposta da API' };
    }

    if (!response.ok) {
      console.error('❌ Erro da API Bolt:', {
        status: response.status,
        statusText: response.statusText,
        data: responseData
      });
      
      // Retornar erro detalhado para debug
      return NextResponse.json(
        { 
          message: 'Erro ao processar pagamento na API externa',
          details: {
            status: response.status,
            statusText: response.statusText,
            error: responseData,
            payload_sent: payload
          }
        },
        { status: 400 }
      );
    }

    console.log('✅ Resposta da Bolt API:', responseData);

    // Verificar se a resposta tem os dados esperados
    if (!responseData.pix && !responseData.code && !responseData.base64) {
      console.warn('⚠️ Resposta não contém dados PIX esperados');
      
      // Tentar encontrar os dados em estruturas alternativas
      const pixData = {
        pix: {
          code: responseData.pix_code || responseData.code || responseData.pix?.code,
          base64: responseData.pix_base64 || responseData.base64 || responseData.pix?.base64
        },
        transaction_id: responseData.transaction_id || responseData.id || identifier,
        status: responseData.status || 'pending'
      };

      console.log('🔄 Dados PIX formatados:', pixData);
      return NextResponse.json(pixData);
    }

    // Retornar dados conforme recebidos
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('💥 Erro crítico:', error);
    
    return NextResponse.json(
      { 
        message: 'Erro interno do servidor',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Método GET para verificar se a API está funcionando
export async function GET() {
  return NextResponse.json(
    { 
      message: 'API de pagamento PIX funcionando',
      timestamp: new Date().toISOString(),
      version: '2.0'
    },
    { status: 200 }
  );
}