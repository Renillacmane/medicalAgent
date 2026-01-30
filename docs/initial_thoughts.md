Projeto AI Medical Agent

Desenvolver um agente médico que com base em dados clínicos existentes de um paciente (idade, peso, altura, histórico médico, medicação) gera recomendações diárias de melhoria (nutrição, estilo de vida, alertas não críticos). Poderá ser integrado numa plataforma externa (via widget ou connector) ou numa app ou pwa.
Plataforma Médica Externa
|
|
Backend
|
|
Frontend
 ├─ PWA
 └─ App iOS / Android (Capacitor)
Tech stack
Backend:
 NestJS (com fastify)
 MongoDB ( extra -> mongo vector search ou pinecone ou open search para contexto)
 OpenAI ( ou gemini )
Frontend:
 Next.js
 Capacitor

Plano

1ª Fase - Setup inicial backend
	•	Setup NestJS
	•	Setup DB
	•	Testes iniciais

2ª Fase - Integração
	•	Autenticação
	•	Definir endpoints da api e db
	•	Ingestão de dados fictícios de pacientes
	•	Normalização dos dados
	•	Interpretação dos dados

3ª Fase - Agente
	•	Criação de system prompts com regras a definir (linguagem, contexto, limites, etc…)
	•	Injeção de contexto externo (contexto específico de uma área específica ex. cardiologia ou nutrição - pode ser ou não definido pelo cliente)
	•	Criar orquestrador para sugestões ou melhorias diárias com base nos dados atuais
	•	Criação de testes unitários

4ª fase - Widget
	•	Criação de um widget
	•	Deverá consumir a informação do paciente “atual”
	•	Deverá dar sugestões (como plano nutricional, plano de ginásio, etc…)

5ª fase - Criação PWA inicial + App
	•	Setup inicial (Next.js + Capacitor)
	•	Fase de registo e login + recolha de alguns dados de utilizador (idade, altura, peso, etc…)
	•	Criação de página inicial simples - resumo diário + recomendações
	•	Edição de dados de paciente (altura, idade, etc)
	•	Ingestão de dados de paciente via pdf (ex: um relatório médico ou uma receita médica)
	•	Sugestões + histórico

6ª fase
	•	Bug fixes
	•	Testes

- Caching
- Talvez vector search para medications
