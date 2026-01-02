// src/services/geminiService.ts

const API_KEY = "AIzaSyAEE-0IgWA48sAioGVvEzQcvga52XncAvw";

export const generateProject = async (request: any) => {
  // Modelos ordenados por estabilidade e maior cota na Free Tier
  const models = [
    "gemini-1.5-flash",      
    "gemini-1.5-flash-8b", 
    "gemini-2.0-flash-exp"   
  ];

  let lastError = "";
  let atingiuLimite = false;

  for (const modelName of models) {
    try {
      console.log(`Tentando modelo: ${modelName}...`);
      
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`;

      const payload = {
        contents: [{
          parts: [{
            text: `Aja como um arquiteto sênior. Crie um projeto detalhado para:
            - Estilo: ${request.style}
            - Área: ${request.size}m²
            - Quartos: ${request.rooms}
            - Pavimentos: ${request.floors || 1}
            - Notas: ${request.additionalNotes || 'Nenhuma'}

            Retorne: Setorização, Materiais e Fluxo de Circulação.`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          maxOutputTokens: 1000, // Reduzido levemente para economizar cota
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok && data.candidates && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      } 
      
      // Se o erro for de cota (Quota Exceeded)
      if (response.status === 429 || (data.error?.message && data.error.message.includes("quota"))) {
        console.warn(`Modelo ${modelName} atingiu o limite.`);
        atingiuLimite = true;
        continue; // Tenta o próximo modelo
      }

      lastError = data.error?.message || "Erro desconhecido";

    } catch (error: any) {
      console.error(`Erro técnico no modelo ${modelName}:`, error);
      lastError = "Falha na conexão com o serviço de IA.";
    }
  }

  // Se sair do loop sem retornar, lança o erro amigável
  if (atingiuLimite) {
    throw new Error("Você atingiu o limite diario da criação de plantas");
  }

  throw new Error(lastError || "Não foi possível gerar o projeto.");
};