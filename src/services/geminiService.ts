const API_KEY = "AIzaSyAEE-0IgWA48sAioGVvEzQcvga52XncAvw";

export const generateProject = async (request: any) => {
  // Lista de modelos disponíveis na sua chave, do mais leve para o mais pesado
  const models = [
    "gemini-2.0-flash-lite", 
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash"
  ];

  let lastError = "";

  // Tenta cada modelo disponível caso um esteja sem cota (Erro 429)
  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${API_KEY}`;

      const payload = {
        contents: [{
          parts: [{
            text: `Aja como um arquiteto sênior e especialista em design de interiores. 
            Crie um projeto arquitetônico detalhado para:
            - Estilo: ${request.style}
            - Área Total: ${request.size}m²
            - Quantidade de Quartos: ${request.rooms}
            - Pavimentos: ${request.floors || 1}
            - Notas Adicionais: ${request.additionalNotes || 'Nenhuma'}

            Retorne uma descrição organizada com: Setorização, Sugestão de Materiais e Fluxo de Circulação.`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 64,
          maxOutputTokens: 2048,
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        return data.candidates[0].content.parts[0].text;
      } 
      
      if (response.status === 429) {
        console.warn(`Modelo ${model} está sem cota, tentando o próximo...`);
        lastError = "Limite de requisições atingido. Tente novamente em 1 minuto.";
        continue; // Pula para o próximo modelo da lista
      }

      throw new Error(data.error?.message || "Erro desconhecido");

    } catch (error: any) {
      console.error(`Erro com o modelo ${model}:`, error);
      lastError = error.message;
    }
  }

  throw new Error(lastError || "Não foi possível gerar o projeto com nenhum modelo disponível.");
};