// app/api/create-pix-payment/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { identifier, amount, phone, document, tickets } = body;

    // Validação básica
    if (!identifier || !amount || !phone || !document) {
      return NextResponse.json(
        { message: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      );
    }

    // Fazer a requisição para a API da Bolt Pagamentos do backend (servidor)
    const response = await fetch('https://api.boltpagamentos.com.br/api/v1/gateway/pix/receive', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-public-key': 'amandaoliveira2025amanda_1756696279052',
        'x-secret-key': 'd99a9f09-c420-4ae2-a457-34c4633a0d75'
      },
      body: JSON.stringify({
        identifier: identifier,
        amount: amount,
        client: {
          name: "Cliente Rifa",
          email: "cliente@rifa.com",
          document: document
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Erro da API Bolt:', errorData);
      
      return NextResponse.json(
        { 
          message: 'Erro ao processar pagamento na API externa',
          error: `Status: ${response.status}`,
          details: errorData
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Aqui você pode salvar os dados no banco de dados se necessário
    // Exemplo de dados que você pode querer salvar:
    /*
    const orderData = {
      transaction_id: data.transaction_id || identifier,
      phone: phone,
      document: document,
      tickets: tickets,
      amount: amount,
      pix_code: data.pix_code,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    
    // Salvar no banco de dados
    // await saveOrderToDatabase(orderData);
    */
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Erro ao processar pagamento:', error);
    
    return NextResponse.json(
      { 
        message: 'Erro interno do servidor',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

// Método GET opcional para verificar se a API está funcionando
export async function GET() {
  return NextResponse.json(
    { 
      message: 'API de pagamento PIX funcionando',
      timestamp: new Date().toISOString()
    },
    { status: 200 }
  );
}